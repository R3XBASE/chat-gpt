const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });
const openaiApiKey = process.env.OPENAI_API_KEY;

app.use(express.json());

// Endpoint untuk webhook
app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.status(200).json({ ok: true });
});

// Root endpoint untuk verifikasi
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bot is running' });
});

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
    console.error('Error calling OpenAI:', error.message);
    bot.sendMessage(chatId, 'Maaf, ada kesalahan. Coba lagi nanti.');
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
