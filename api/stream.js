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

    try {
        // Fetch official anime details from Jikan API to verify it exists and get metadata
        const jikanRes = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        
        if (!jikanRes.ok) {
            return res.status(404).json({ error: 'Anime not found on MyAnimeList database.' });
        }

        const jikanData = await jikanRes.json();
        const animeInfo = jikanData.data;

        // Return structured metadata and a clean stream response
        return res.status(200).json({
            success: true,
            animeId: id,
            title: animeInfo.title,
            episode: ep,
            track: track,
            // Provide a stable placeholder or direct stream source structure
            streamUrl: `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd`, // Fallback test stream or clean source
            subtitles: []
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server failed to process metadata stream request.',
            details: error.message
        });
    }
}
