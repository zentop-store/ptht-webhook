const https = require('https');

// Handler untuk endpoint webhook
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
    console.log('Received data:', body); // Logging data yang diterima

    // Parsing data dari Lua
    const params = new URLSearchParams(body);
    const statusMessage = params.get('status');

    if (!statusMessage) {
      res.status(400).send('Bad Request: Missing status message');
      return;
    }

    // URL webhook Discord (pastikan URL ini diatur di environment variables Vercel)
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

    let responseData = '';
    webhookReq.on('response', (response) => {
      response.on('data', (chunk) => {
        responseData += chunk;
      });

      response.on('end', () => {
        console.log('Response from Discord:', responseData); // Logging response dari Discord
      });
    });

    webhookReq.on('error', (e) => {
      console.error('Error sending request:', e);
      res.status(500).send('Internal Server Error');
    });

    webhookReq.write(payload);
    webhookReq.end();

    // Berikan respons ke Lua bahwa pesan telah dikirim
    res.status(200).send('Webhook sent to Discord');
  });
};
