// Function to generate a hardware/device fingerprint (HWID proxy)
async function generateHWID() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const txt = 'proxyuser.dev_hwid_fingerprint_240hz';
  
  canvas.width = 200;
  canvas.height = 30;
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125,1,62,20);
  ctx.fillStyle = "#069";
  ctx.fillText(txt, 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(txt, 4, 17);

  // Extract canvas data URL and hash it
  const dataUrl = canvas.toDataURL();
  let hash = 0;
  for (let i = 0; i < dataUrl.length; i++) {
    const char = dataUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  
  // Combine canvas hash with platform specs
  const rawHwid = `${hash}-${navigator.hardwareConcurrency || 0}-${navigator.deviceMemory || 0}-${screen.width}x${screen.height}`;
  return btoa(rawHwid);
}

// Function to parse Browser and Device type
function getDeviceAndBrowser() {
  const ua = navigator.userAgent;
  let deviceType = "Desktop";
  if (/mobile/i.test(ua)) deviceType = "Mobile";
  if (/ipad|tablet/i.test(ua)) deviceType = "Tablet";

  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Mozilla Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident")) browser = "Internet Explorer";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Safari")) browser = "Apple Safari";

  return { deviceType, browser };
}

// Send visitor telemetry
async function logVisitorToDiscord() {
  try {
    const { deviceType, browser } = getDeviceAndBrowser();
    const hwid = await generateHWID();
    const timestamp = new Date().toISOString();

    // Fetch IP address from public API
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const { ip } = await ipResponse.json();

    // Payload to send to your API endpoint or direct Webhook
    const payload = {
      deviceType,
      browser,
      timestamp,
      ip,
      hwid
    };

    // Replace with your backend endpoint URL (or Webhook proxy)
    await fetch('/api/log-visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Telemetry failed:", err);
  }
}

// Run on page load
window.addEventListener('DOMContentLoaded', logVisitorToDiscord);
