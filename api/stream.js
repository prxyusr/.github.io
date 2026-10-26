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

    // Your live Render backend URL
    const BACKEND_URL = 'https://animeapi-u2dm.onrender.com';

    try {
        // Adjust the endpoint paths below to match the specific routes your backend repository expects
        const response = await fetch(`${BACKEND_URL}/api/anime/sources?id=${id}&ep=${ep}&track=${track}`);

        if (!response.ok) {
            return res.status(404).json({ error: 'Failed to fetch stream from backend.' });
        }

        const data = await response.json();

        // Pass the direct stream URL back to your hls.js frontend player
        return res.status(200).json({
            success: true,
            streamUrl: data.streamUrl || data.url,
            subtitles: data.subtitles || []
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server failed to process stream request.',
            details: error.message
        });
    }
}
