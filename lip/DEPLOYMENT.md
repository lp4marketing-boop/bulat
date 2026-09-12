# Деплой за 15 минут

## 1. Supabase (3 мин)
1. supabase.com → New project
2. SQL Editor → выполни SQL из комментариев в lib_supabase.ts
3. Settings → API → скопируй URL и service_role key

## 2. Telegram Bot (3 мин)
1. @BotFather в Telegram → /newbot → получи токен
2. Напиши что-нибудь своему боту
3. https://api.telegram.org/bot<TOKEN>/getUpdates → найди chat.id

## 3. Vercel (5 мин)
1. github.com → новый репо → залей файлы
2. vercel.com → Import → выбери репо
3. Environment Variables → добавь все из .env.local:
   - ANTHROPIC_API_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID
   - WEBHOOK_SECRET (придумай случайную строку)
   - CRON_SECRET (придумай случайную строку)
4. Deploy → готово!

## 4. Первый запуск (2 мин)
Создай первый бриф через API:
```bash
curl -X POST https://ВАШ-ДОМЕН.vercel.app/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "бриф: продукт=Выездная химчистка авто, цель=100 заказов за месяц, бюджет=50000",
    "secret": "ВАШ_WEBHOOK_SECRET"
  }'
```

Или запусти первый анализ:
```bash
curl -X POST https://ВАШ-ДОМЕН.vercel.app/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "полный анализ", "secret": "ВАШ_WEBHOOK_SECRET"}'
```

## 5. Настрой Gemini (2 мин)
Следуй инструкции в GEMINI_SETUP.md

## Расширения (опционально)
- **Email**: добавь Resend.com → npm install resend → отправляй недельный отчёт на почту
- **WhatsApp**: Twilio API — те же уведомления в WhatsApp
- **Notion**: @notionhq/client → автосохранение отчётов в базу знаний
- **Google Calendar**: добавляй задачи из отчётов прямо в календарь
- **n8n / Make**: визуальный no-code оркестратор поверх этих API
