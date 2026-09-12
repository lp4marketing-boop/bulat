// lib/supabase.ts — клиент и типы базы данных
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export type Brief = {
  id: string
  product: string
  audience: string
  budget: string
  goal: string
  active: boolean
  created_at: string
}

export type AgentResult = {
  id: string
  brief_id: string
  department_id: number
  department_name: string
  result_text: string
  approved: boolean
  run_id: string
  created_at: string
}

export type TaskLog = {
  id: string
  run_id: string
  trigger: 'cron' | 'webhook' | 'manual'
  status: 'running' | 'done' | 'error'
  summary: string | null
  created_at: string
}

// ── SQL для создания таблиц (выполни в Supabase SQL Editor) ──────────────────
// 
// create table briefs (
//   id uuid primary key default gen_random_uuid(),
//   product text not null,
//   audience text,
//   budget text,
//   goal text not null,
//   active boolean default true,
//   created_at timestamptz default now()
// );
//
// create table agent_results (
//   id uuid primary key default gen_random_uuid(),
//   brief_id uuid references briefs(id),
//   department_id int not null,
//   department_name text not null,
//   result_text text not null,
//   approved boolean default false,
//   run_id text not null,
//   created_at timestamptz default now()
// );
//
// create table tasks_log (
//   id uuid primary key default gen_random_uuid(),
//   run_id text not null,
//   trigger text not null,
//   status text default 'running',
//   summary text,
//   created_at timestamptz default now()
// );
