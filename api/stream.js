const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your GitHub Pages frontend can call this backend
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// This endpoint acts as the unblocked routing tunnel
app.get('/api/stream', (req, res) => {
    const { id, ep = 1, track = 'sub' } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    // Build the video player link that the school block normally stops
    const targetEmbedUrl = `https://zokoanime.video{id}/${ep}/${track}`;

    // Send the correct player link down to your watch.html frame
    res.json({
        success: true,
        embedUrl: targetEmbedUrl
    });
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
