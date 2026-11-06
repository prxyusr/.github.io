const express = require('express');
const app = express();
app.use(express.json());

// (Only for local testing — remember to hide this if you push to GitHub!)
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_NEW_WEBHOOK_ID/YOUR_NEW_WEBHOOK_TOKEN";

app.post('/api/log-visitor', async (req, res) => {
  const { deviceType, browser, timestamp, ip, hwid } = req.body;

  // Fallback to extract client IP from request headers if available
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ip;

  const discordEmbed = {
    embeds: [
      {
        title: "🌐 New Visitor Detected",
        color: 0x5865F2, // Discord Blurple
        fields: [
          { name: "📱 Device Type", value: deviceType || "Unknown", inline: true },
          { name: "🌐 Browser", value: browser || "Unknown", inline: true },
          { name: "🔑 HWID (Fingerprint)", value: `\`${hwid || "N/A"}\``, inline: false },
          { name: "🌐 IP Address", value: `\`${clientIp || "N/A"}\``, inline: true },
          { name: "⏰ Timestamp", value: `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:F>`, inline: true }
        ],
        footer: {
          text: "proxyuser.dev • Telemetry System"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordEmbed)
    });
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Error posting to Discord:', err);
    return res.status(500).json({ error: 'Failed to dispatch webhook' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
