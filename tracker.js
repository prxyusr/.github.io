async function logVisitorToDiscord() {
  try {
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_NEW_WEBHOOK_ID/YOUR_NEW_WEBHOOK_TOKEN";

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 30;
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60"; ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069"; ctx.fillText("proxyuser.dev", 2, 15);
    
    let hash = 0;
    const dataUrl = canvas.toDataURL();
    for (let i = 0; i < dataUrl.length; i++) {
      hash = ((hash << 5) - hash) + dataUrl.charCodeAt(i);
      hash |= 0;
    }
    const hwid = btoa(`${hash}-${navigator.hardwareConcurrency || 0}-${screen.width}x${screen.height}`);

    const ua = navigator.userAgent;
    let deviceType = /mobile/i.test(ua) ? "Mobile" : /ipad|tablet/i.test(ua) ? "Tablet" : "Desktop";
    let browser = "Unknown";
    if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Google Chrome";
    else if (ua.includes("Safari")) browser = "Apple Safari";

    const ipRes = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipRes.json();

    const payload = {
      embeds: [
        {
          title: "🌐 New Visitor Detected",
          color: 0x5865F2,
          fields: [
            { name: "📱 Device Type", value: deviceType, inline: true },
            { name: "🌐 Browser", value: browser, inline: true },
            { name: "🔑 HWID (Fingerprint)", value: `\`${hwid}\``, inline: false },
            { name: "🌐 IP Address", value: `\`${ip}\``, inline: true },
            { name: "⏰ Timestamp", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          ],
          footer: { text: "proxyuser.dev • GitHub Pages Direct" }
        }
      ]
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

  } catch (err) {
    console.error("Telemetry error:", err);
  }
}

window.addEventListener('DOMContentLoaded', logVisitorToDiscord);
