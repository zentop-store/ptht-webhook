const https = require('https');

// Handler untuk endpoint webhook
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    console.log('Received data:', body); // Log data yang diterima

    // Parsing data dari POST request
    const params = new URLSearchParams(body);
    const statusMessage = params.get('status');

    if (!statusMessage) {
      res.status(400).json({ status: 'failure', error: 'No status data received' });
      return;
    }

    // URL webhook Discord (pastikan ini diatur di environment variables Vercel)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // Payload untuk dikirim ke Discord
    const payload = JSON.stringify({
      content: '',
      embeds: [
        {
          title: 'PTHT BOTHAX PREMIUM By MasD',
          description: statusMessage,
          color: 0x00FF00 // Warna hijau
        }
      ]
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const webhookReq = https.request(discordWebhookUrl, options, (response) => {
      let responseData = '';
      response.on('data', (chunk) => {
        responseData += chunk;
      });

      response.on('end', () => {
        console.log('Response from Discord:', responseData); // Log response dari Discord

        if (response.statusCode === 204) {
          res.status(200).json({ status: 'success' });
        } else {
          res.status(500).json({ status: 'failure', error: 'Failed to send data to Discord' });
        }
      });
    });

    webhookReq.on('error', (e) => {
      console.error('Error sending request:', e);
      res.status(500).json({ status: 'failure', error: 'Internal Server Error' });
    });

    webhookReq.write(payload);
    webhookReq.end();
  });
};
