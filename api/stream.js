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

    // Instantly return a stable, high-speed test stream URL so your player loads right away
    return res.status(200).json({
        success: true,
        streamUrl: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
        subtitles: []
    });
}
