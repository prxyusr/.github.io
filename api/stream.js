export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Content-Type', 'application/json');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id, ep = 1, track = 'sub' } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required query parameter: id (MAL/Anilist ID)' });
    }

    try {
        // Step 1: Map MAL/Anilist ID to Gogoanime / Zoro episode stream using public Consumet API
        const searchRes = await fetch(`https://YOUR-RENDER-URL.onrender.com/anime/anilist/info/${id}`);
        
        if (!searchRes.ok) {
            return res.status(404).json({ error: 'Anime media info not found.' });
        }

        const animeInfo = await searchRes.json();
        
        // Find matching episode ID
        const targetEpNumber = parseInt(ep, 10);
        const episodeData = animeInfo.episodes?.find(e => e.number === targetEpNumber) || animeInfo.episodes?.[targetEpNumber - 1];

        if (!episodeData || !episodeData.id) {
            return res.status(404).json({ error: `Episode ${ep} not found for this anime.` });
        }

        // Step 2: Fetch stream source data (M3U8 HLS playlists & tracks)
        const streamRes = await fetch(`https://api.consumet.org/anime/anilist/watch/${episodeData.id}?dub=${track === 'dub'}`);
        
        if (!streamRes.ok) {
            return res.status(streamRes.status).json({ error: 'Failed to retrieve video stream playlist.' });
        }

        const streamData = await streamRes.json();

        // Extract default or highest quality m3u8 stream link
        const defaultSource = streamData.sources?.find(s => s.quality === 'default' || s.quality === 'auto' || s.quality === '1080p') || streamData.sources?.[0];

        if (!defaultSource || !defaultSource.url) {
            return res.status(404).json({ error: 'No playable video stream found.' });
        }

        return res.status(200).json({
            success: true,
            animeId: id,
            episode: ep,
            track: track,
            streamUrl: defaultSource.url,
            isM3U8: defaultSource.isM3U8 || defaultSource.url.includes('.m3u8'),
            sources: streamData.sources || [],
            subtitles: streamData.subtitles || []
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to process stream response.', 
            details: error.message 
        });
    }
}
