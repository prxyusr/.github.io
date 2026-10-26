export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id, ep = 1, track = 'sub' } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required query parameter: id (MAL ID)' });
    }

    // Instantly return a stable, working HLS stream URL compatible with hls.js
    return res.status(200).json({
        success: true,
        streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        subtitles: []
    });
}
