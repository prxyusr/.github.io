const express = require("express");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for frontend and local testing
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Health check and root endpoints
app.get("/", (req, res) => {
  res.json({ status: "online", service: "ProxyUser Gemini backend" });
});

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// Chat endpoint for Gemini AI integration
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing required message parameter." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the backend server." });
    }

    // Build conversation contents array for Gemini API
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Call Gemini 2.5 Flash API via REST
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      throw new Error(data.error?.message || `Gemini API returned status ${geminiRes.status}`);
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error("Received empty response from Gemini API.");
    }

    return res.status(200).json({ success: true, text: replyText });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message || "Internal server error connecting to Gemini." });
  }
});

const port = process.env.PORT || 10000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
