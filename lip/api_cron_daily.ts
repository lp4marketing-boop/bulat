// app/api/cron/daily/route.ts — утренний брифинг каждый день в 09:00
// Добавь в vercel.json:
// "crons": [{"path": "/api/cron/daily", "schedule": "0 6 * * *"}]
// (6 UTC = 9 MSK)

import { NextResponse } from 'next/server'
import { orchestrate } from '../../../../lib_orchestrator'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 минуты

export async function GET(req: Request) {
  // Защита от случайных вызовов
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await orchestrate({
      mode: 'daily_briefing',
      trigger: 'cron',
      deptIds: [4, 5, 6, 7] // утром — только операционные отделы
    })
    return NextResponse.json({ ok: true, runId: result.runId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
