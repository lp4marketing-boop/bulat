# AI CEO Orchestrator — 24/7

Мультиагентная система: Gemini Mobile → Webhook → Оркестратор Claude → 7 агентов → Supabase → Telegram/Email

## Стек
- **Next.js 14** (App Router) — деплой на Vercel бесплатно
- **Supabase** — база данных + realtime (бесплатный tier)
- **Vercel Cron Jobs** — расписание (бесплатно)
- **Telegram Bot API** — уведомления на телефон
- **Claude API** — оркестратор + агенты
- **Gemini** — голосовой/текстовый командный интерфейс через webhook

## Быстрый старт (15 минут)

```bash
npx create-next-app@latest ai-ceo --typescript --app
cd ai-ceo
npm install @supabase/supabase-js @anthropic-ai/sdk
```

Создай `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
WEBHOOK_SECRET=your-random-secret-32chars
```

## Деплой
1. `git push` → Vercel автоматически деплоит
2. В Vercel Dashboard → Settings → Cron Jobs → добавь расписание
3. Настрой Gemini Gem (инструкция в GEMINI_SETUP.md)
