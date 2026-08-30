/**
 * بوت تيليجرام التلقائي لبث ازدحامات وسيطرات العراق
 * يعمل على رصيد DigitalOcean المجاني من حزمة الطلاب
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID; // e.g. @DarbakSalikIQ

if (!token) {
  console.log('ℹ️ يرجى وضع TELEGRAM_BOT_TOKEN في ملف .env لتشغيل البوت');
  process.exit(0);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 بوت دربك سالك تيليجرام يعمل الآن بنجاح...');

// Bot Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🚗 أهلاً بك في بوت *دربك سالك* العراقي!\n\nأرسل موقعك أو اسم السيطرة لمعرفة حالتها لحظياً.\nأو زر موقعنا الرسمي: https://darbak-salik.me`, {
    parse_mode: 'Markdown'
  });
});

// Helper function to broadcast new alerts to channel
function broadcastToTelegram(report) {
  if (!channelId) return;

  const typeEmojis = {
    checkpoint: '🚨 سيطرة أمنية',
    radar: '📷 رادار سرعة جديد',
    block: '⛔ قطع مروري',
    traffic: '🚗 زحام خانق',
    fuel: '⛽ توفر بنزين'
  };

  const message = `
📢 *تنبيه مروري عاجل - ${report.city === 'baghdad' ? 'بغداد' : report.city}*

📍 *الموقع:* ${report.title}
🏷️ *النوع:* ${typeEmojis[report.type] || 'بلاغ'}
📝 *التفاصيل:* ${report.desc || 'طريق سالك'}
⏰ *التوقيت:* ${new Date().toLocaleTimeString('ar-IQ')}

🔗 تابع الخريطة الحية: https://darbak-salik.me
  `;

  bot.sendMessage(channelId, message, { parse_mode: 'Markdown' });
}

module.exports = { broadcastToTelegram };
