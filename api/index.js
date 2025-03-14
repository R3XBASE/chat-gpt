const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });
const openaiApiKey = process.env.OPENAI_API_KEY;

// Handler untuk Vercel
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      bot.processUpdate(req.body);
      res.status(200).json({ message: 'OK' });
    } catch (error) {
      console.error('Error processing update:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(200).json({ message: 'Bot is running' });
  }
};

// Logika bot
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('Error:', error.message);
    bot.sendMessage(chatId, 'Maaf, ada kesalahan. Coba lagi nanti.');
  }
});

// Set webhook saat deploy (opsional, kita lakukan manual)
const vercelUrl = process.env.VERCEL_URL || 'https://chat-gpt-<hash>.vercel.app';
bot.setWebHook(`${vercelUrl}/api`).then(() => {
  console.log(`Webhook set to ${vercelUrl}/api`);
}).catch(err => {
  console.error('Failed to set webhook:', err.message);
});
