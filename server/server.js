const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ROUTE 1: Fetch metadata and return a direct stream tunnel route
app.get('/api/stream', async (req, res) => {
    const { id, ep = 1, track = 'sub' } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    try {
        // We use a clean, alternative open API endpoint to grab stream links
        const metaUrl = `https://consumet.org{id}-episode-${ep}`;
        const response = await fetch(metaUrl);
        const data = await response.json();

        // Find the highest quality direct video file link (usually a .m3u8 or .mp4 file)
        const primarySource = data.sources?.find(src => src.quality === 'default' || src.quality === '1080p') || data.sources?.[0];

        if (!primarySource || !primarySource.url) {
            throw new Error('No raw stream sources found.');
        }

        // Send back a route that pipes the raw file through your unblocked Render URL
        res.json({
            success: true,
            streamUrl: `/api/video-tunnel?url=${encodeURIComponent(primarySource.url)}`,
            isRawFile: true
        });

    } catch (err) {
        // Fallback placeholder if the consumer API fails
        res.status(500).json({ error: err.message });
    }
});

// ROUTE 2: Raw Video Data Tunneling
app.get('/api/video-tunnel', async (req, res) => {
    const targetVideoUrl = req.query.url;
    if (!targetVideoUrl) return res.status(400).send('Missing video target URL');

    try {
        const response = await fetch(targetVideoUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/x-mpegURL');
        response.body.pipe(res);
    } catch (err) {
        res.status(500).send('Tunnel Error: ' + err.message);
    }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
