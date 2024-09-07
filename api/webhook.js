// file: api/webhook.js
const https = require('https');

module.exports = async (req, res) => {
  // Cek metode request
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Ambil data dari body request (yang dikirim dari Lua)
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Parsing data dari Lua
    const params = new URLSearchParams(body);
    const statusMessage = params.get('status');

    if (!statusMessage) {
      res.status(400).send('Bad Request: Missing status message');
      return;
    }

    // URL webhook Discord (pastikan URL ini tidak ditampilkan secara publik)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // Data untuk dikirim ke Discord
    const payload = JSON.stringify({
      content: statusMessage
    });

    // Kirim data ke Discord menggunakan webhook
    const webhookReq = https.request(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    });

    webhookReq.write(payload);
    webhookReq.end();

    // Berikan respons ke Lua bahwa pesan telah dikirim
    res.status(200).send('Webhook sent to Discord');
  });
};
