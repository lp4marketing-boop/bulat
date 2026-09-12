// app/api/cron/weekly/route.ts — полный анализ по пятницам в 18:00
// "crons": [{"path": "/api/cron/weekly", "schedule": "0 15 * * 5"}]
// (15 UTC = 18 MSK, пятница)

import { NextResponse } from 'next/server'
import { orchestrate } from '../../../../lib_orchestrator'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 минут для полного цикла

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await orchestrate({
      mode: 'weekly_growth',
      trigger: 'cron'
      // все 7 отделов по умолчанию
    })
    return NextResponse.json({ ok: true, runId: result.runId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
