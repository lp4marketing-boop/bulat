// app/api/command/route.ts — приём команд от Gemini (и любого другого источника)
//
// Gemini Gem настроен так: при любом запросе он делает POST на этот URL
// с JSON: { "command": "текст команды", "secret": "..." }
//
// Примеры команд из Gemini:
// "как дела с продажами?"         → запускает агента Продажи
// "полный анализ"                 → все 7 отделов
// "утренний брифинг"              → оперативные отделы
// "обнови бриф: продукт = ..."    → обновляет бриф

import { NextResponse } from 'next/server'
import { orchestrate } from '../../../../lib_orchestrator'
import { supabase } from '../../../../lib_supabase'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: Request) {
  const body = await req.json()

  // Проверяем секрет (задай в настройках Gemini Gem как часть запроса)
  if (body.secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const command: string = body.command || ''
  if (!command) {
    return NextResponse.json({ error: 'command required' }, { status: 400 })
  }

  // Специальная команда: обновить бриф
  if (command.toLowerCase().startsWith('бриф:') || command.toLowerCase().startsWith('обнови бриф')) {
    return await handleBriefUpdate(command)
  }

  // Специальная команда: статус системы
  if (command.toLowerCase().includes('статус') || command.toLowerCase().includes('что работает')) {
    return await handleStatus()
  }

  // Обычная команда — запускаем оркестратор
  try {
    const result = await orchestrate({
      mode: 'on_demand',
      trigger: 'webhook',
      geminiCommand: command,
      extraContext: body.context // опциональный доп. контекст
    })

    // Возвращаем сводку — Gemini отобразит её пользователю
    return NextResponse.json({
      ok: true,
      runId: result.runId,
      summary: result.summary,
      // Для отображения в Gemini
      reply: result.summary
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
      reply: `Ошибка оркестратора: ${error.message}`
    }, { status: 500 })
  }
}

async function handleBriefUpdate(command: string) {
  // Простой парсинг: "Бриф: продукт=Химчистка, цель=100 клиентов, бюджет=50000"
  const extract = (key: string) => {
    const match = command.match(new RegExp(`${key}[=:]\\s*([^,\\n]+)`, 'i'))
    return match?.[1]?.trim()
  }

  const updates: Record<string, string> = {}
  if (extract('продукт')) updates.product = extract('продукт')!
  if (extract('цель')) updates.goal = extract('цель')!
  if (extract('бюджет')) updates.budget = extract('бюджет')!
  if (extract('аудитория')) updates.audience = extract('аудитория')!

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ reply: 'Не удалось распознать поля брифа. Формат: Бриф: продукт=..., цель=...' })
  }

  // Деактивируем старый бриф, создаём новый
  await supabase.from('briefs').update({ active: false }).eq('active', true)
  const { data } = await supabase.from('briefs').insert({
    product: updates.product || 'не указан',
    goal: updates.goal || 'не указана',
    budget: updates.budget || '',
    audience: updates.audience || '',
    active: true
  }).select().single()

  return NextResponse.json({
    ok: true,
    reply: `✅ Бриф обновлён! Продукт: ${data.product}, цель: ${data.goal}. Запускай команды для анализа.`
  })
}

async function handleStatus() {
  const { data: logs } = await supabase
    .from('tasks_log')
    .select('trigger, status, created_at, summary')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: brief } = await supabase
    .from('briefs')
    .select('product, goal')
    .eq('active', true)
    .single()

  const statusText = logs?.map(l =>
    `• ${new Date(l.created_at).toLocaleString('ru-RU')} [${l.trigger}] — ${l.status}`
  ).join('\n') || 'Нет запусков'

  return NextResponse.json({
    ok: true,
    reply: `📊 Статус системы\n\nАктивный бриф: ${brief?.product} / ${brief?.goal}\n\nПоследние запуски:\n${statusText}`
  })
}
