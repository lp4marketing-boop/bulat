// lib/orchestrator.ts — мозг системы
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './lib_supabase'
import { runAgent, DEPARTMENTS, DeptId } from './lib_agents'
import { sendTelegram } from './lib_notify'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Режимы работы оркестратора ───────────────────────────────────────────────
type RunMode =
  | 'daily_briefing'    // каждое утро — сводка по всем отделам
  | 'weekly_growth'     // пятница — полный анализ роста
  | 'on_demand'         // по команде из Gemini
  | 'single_dept'       // один отдел по запросу

interface OrchestrationConfig {
  mode: RunMode
  trigger: 'cron' | 'webhook' | 'manual'
  deptIds?: DeptId[]    // если не указано — все
  geminiCommand?: string // оригинальная команда от пользователя
  extraContext?: string
}

// ── Главная функция ──────────────────────────────────────────────────────────
export async function orchestrate(config: OrchestrationConfig) {
  const runId = `run_${Date.now()}`

  // 1. Логируем старт
  await supabase.from('tasks_log').insert({
    run_id: runId,
    trigger: config.trigger,
    status: 'running'
  })

  try {
    // 2. Получаем активный бриф
    const { data: briefRow } = await supabase
      .from('briefs')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!briefRow) throw new Error('Нет активного брифа. Создайте бриф через /api/brief')

    const brief = {
      product: briefRow.product,
      audience: briefRow.audience,
      budget: briefRow.budget,
      goal: briefRow.goal
    }

    // 3. Загружаем историю предыдущих результатов (контекст)
    const { data: prevResults } = await supabase
      .from('agent_results')
      .select('department_id, result_text')
      .eq('brief_id', briefRow.id)
      .eq('approved', true)
      .order('created_at', { ascending: false })

    const history: Record<number, string> = {}
    prevResults?.forEach(r => {
      if (!history[r.department_id]) history[r.department_id] = r.result_text
    })

    // 4. Определяем какие отделы запускать
    let deptIds: DeptId[] = config.deptIds || [1, 2, 3, 4, 5, 6, 7]

    // Если пришла команда от Gemini — спрашиваем оркестратора что запустить
    if (config.geminiCommand) {
      deptIds = await parseGeminiCommand(config.geminiCommand, deptIds)
    }

    // 5. Запускаем агентов (последовательно для сохранения контекста)
    const results: Record<number, string> = {}
    for (const deptId of deptIds) {
      console.log(`[orchestrator] running dept ${deptId}...`)
      const result = await runAgent(deptId, brief, { ...history, ...results }, config.extraContext)
      results[deptId] = result

      // Сохраняем каждый результат сразу
      await supabase.from('agent_results').insert({
        brief_id: briefRow.id,
        department_id: deptId,
        department_name: DEPARTMENTS[deptId].name,
        result_text: result,
        approved: false,
        run_id: runId
      })
    }

    // 6. Синтез — оркестратор делает CEO-сводку
    const summary = await synthesize(brief, results, config.mode, config.geminiCommand)

    // 7. Отправляем сводку в Telegram
    await sendTelegram(formatForTelegram(summary, runId, config.mode))

    // 8. Обновляем лог
    await supabase
      .from('tasks_log')
      .update({ status: 'done', summary: summary.slice(0, 500) })
      .eq('run_id', runId)

    return { runId, summary, results }

  } catch (error: any) {
    await supabase
      .from('tasks_log')
      .update({ status: 'error', summary: error.message })
      .eq('run_id', runId)
    throw error
  }
}

// ── Оркестратор парсит команду от Gemini ────────────────────────────────────
async function parseGeminiCommand(command: string, allDepts: DeptId[]): Promise<DeptId[]> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 100,
    system: `Ты — парсер команд для мультиагентной системы.
Определи какие отделы нужно запустить.
Отделы: 1=Исследования, 2=Продукт, 3=Дизайн, 4=Маркетинг, 5=Продажи, 6=Процессы, 7=Рост.
Ответь ТОЛЬКО JSON массивом чисел. Примеры:
"полный анализ" → [1,2,3,4,5,6,7]
"маркетинг и продажи" → [4,5]
"как дела с ростом" → [7]
"утренний брифинг" → [4,5,6,7]`,
    messages: [{ role: 'user', content: command }]
  })

  try {
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '[1,2,3,4,5,6,7]'
    const parsed = JSON.parse(text.match(/\[[\d,\s]+\]/)?.[0] || '[1,2,3,4,5,6,7]')
    return parsed.filter((n: number) => allDepts.includes(n as DeptId)) as DeptId[]
  } catch {
    return allDepts
  }
}

// ── Синтез результатов в CEO-сводку ─────────────────────────────────────────
async function synthesize(
  brief: Record<string, string>,
  results: Record<number, string>,
  mode: RunMode,
  command?: string
): Promise<string> {
  const resultsText = Object.entries(results)
    .map(([id, text]) => `## ${DEPARTMENTS[+id as DeptId].icon} ${DEPARTMENTS[+id as DeptId].name}\n${text}`)
    .join('\n\n---\n\n')

  const modeInstructions: Record<RunMode, string> = {
    daily_briefing: 'Это утренний брифинг. Выдели топ-3 действия на сегодня.',
    weekly_growth: 'Это недельный обзор. Проанализируй динамику и дай прогноз на следующую неделю.',
    on_demand: `Пользователь спросил: "${command}". Ответь конкретно на его вопрос, используя данные отделов.`,
    single_dept: 'Кратко резюмируй ключевые выводы и нужные действия CEO.'
  }

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: `Ты — исполнительный директор (COO), который синтезирует отчёты отделов для CEO.
Продукт: «${brief.product}», цель: ${brief.goal}.
${modeInstructions[mode]}

Формат ответа:
**Ситуация** (1-2 предложения): что происходит прямо сейчас
**Топ-3 действия для CEO**:
1. [конкретное действие] — почему важно
2. [конкретное действие] — почему важно  
3. [конкретное действие] — почему важно
**Требует одобрения**: перечисли все [ПРОВЕРИТЬ] пункты из отчётов
**Нужно предоставить**: перечисли все [НУЖНЫ ДАННЫЕ] пункты

Будь конкретным. Не больше 300 слов. Русский язык.`,
    messages: [{
      role: 'user',
      content: `Отчёты отделов:\n\n${resultsText}`
    }]
  })

  return msg.content[0].type === 'text' ? msg.content[0].text : ''
}

// ── Форматирование для Telegram ───────────────────────────────────────────────
function formatForTelegram(summary: string, runId: string, mode: RunMode): string {
  const modeEmoji: Record<RunMode, string> = {
    daily_briefing: '🌅',
    weekly_growth: '📊',
    on_demand: '🤖',
    single_dept: '📋'
  }
  const modeLabel: Record<RunMode, string> = {
    daily_briefing: 'Утренний брифинг',
    weekly_growth: 'Недельный обзор',
    on_demand: 'Ответ на запрос',
    single_dept: 'Отчёт отдела'
  }

  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
  return `${modeEmoji[mode]} *AI CEO · ${modeLabel[mode]}*\n${time}\n\n${summary}\n\n🔗 run: \`${runId}\``
}
