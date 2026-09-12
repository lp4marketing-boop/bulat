// lib/notify.ts — Telegram уведомления
export async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      // Кнопки под сообщением — нажимаешь → одобряешь или отклоняешь
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Одобряю все', callback_data: 'approve_all' },
          { text: '📋 Детали', callback_data: 'show_details' }
        ]]
      }
    })
  })
}
