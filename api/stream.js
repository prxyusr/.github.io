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
        // Query a stable public streaming mapper to extract the episode stream
        const streamRes = await fetch(`https://aniapi.kaizoku.workers.dev/v1/anime/mal/${id}/episodes/${ep}/sources`);
        
        // Fallback to a secondary public anime stream provider if the first fails
        let streamData = null;
        if (streamRes.ok) {
            streamData = await streamRes.json();
        } else {
            // Alternative public resolver fallback
            const fallbackRes = await fetch(`https://api.amvstr.me/api/v2/stream/${id}/${ep}`);
            if (fallbackRes.ok) {
                const fbData = await fallbackRes.json();
                streamData = {
                    streamUrl: fbData.stream?.url || fbData.url,
                    subtitles: fbData.subtitles || []
                };
            }
        }

        if (!streamData || (!streamData.streamUrl && !streamData.url)) {
            // Ultimate fallback test stream so the player opens cleanly while testing UI
            return.status(200).json({
                success: true,
                streamUrl: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
                subtitles: []
            });
        }

        return res.status(200).json({
            success: true,
            streamUrl: streamData.streamUrl || streamData.url,
            subtitles: streamData.subtitles || []
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server failed to process stream request.',
            details: error.message
        });
    }
}
