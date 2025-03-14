const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Inisialisasi Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false }); // Polling dimatikan, pakai webhook
const openaiApiKey = process.env.OPENAI_API_KEY;

// Middleware untuk parsing JSON
app.use(express.json());

// Endpoint untuk webhook Telegram
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Event saat pesan diterima
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    // Panggil OpenAI API untuk respons mirip ChatGPT
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

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
  // Set webhook saat server mulai (opsional, akan disesuaikan setelah deploy)
  const webhookUrl = `${process.env.APP_URL}/webhook`;
  bot.setWebHook(webhookUrl).then(() => {
    console.log(`Webhook diatur ke ${webhookUrl}`);
  }).catch(err => {
    console.error('Gagal mengatur webhook:', err.message);
  });
});
