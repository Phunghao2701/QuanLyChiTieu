require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log('--- ĐANG CHỜ TIN NHẮN TỪ BẠN ---');
console.log('Hãy mở Telegram và gửi một tin nhắn cho Bot của bạn...');

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  console.log('\n--- ĐÃ TÌM THẤY BẠN! ---');
  console.log(`Họ tên: ${firstName}`);
  console.log(`CHAT_ID CỦA BẠN: ${chatId}`);
  console.log('Hãy copy số CHAT_ID này và gửi cho tôi nhé.');
  console.log('------------------------');
  
  bot.sendMessage(chatId, `Chào ${firstName}! Tôi đã nhận được ID của bạn: ${chatId}. Hãy gửi số này cho Antigravity nhé!`);
  
  // Dừng bot sau khi lấy được ID
  setTimeout(() => {
    process.exit(0);
  }, 2000);
});
