export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id, ep = 1, track = 'sub' } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required query parameter: id (AniList/MAL ID)' });
    }

    try {
        // Step 1: Query HiAnime Mapper using the AniList ID
        const infoRes = await fetch(`https://hianime-mapper.vercel.app/anime/info/${id}`);
        
        if (!infoRes.ok) {
            return res.status(404).json({ error: 'Anime media info not found.' });
        }

        const infoData = await infoRes.json();
        const animeData = infoData.data || infoData;

        // Find matching episode ID
        const targetEpNumber = parseInt(ep, 10);
        const episodes = animeData.episodes || [];
        const episodeObj = episodes.find(e => e.number === targetEpNumber) || episodes[targetEpNumber - 1];

        if (!episodeObj || !episodeObj.id) {
            return res.status(404).json({ error: `Episode ${ep} not found for this anime.` });
        }

        // Step 2: Fetch available video servers for this episode
        const serversRes = await fetch(`https://hianime-mapper.vercel.app/anime/servers/${episodeObj.id}`);
        if (!serversRes.ok) {
            return res.status(404).json({ error: 'Failed to retrieve streaming servers.' });
        }

        const serversData = await serversRes.json();
        const serverList = serversData.data?.[track] || serversData.data?.sub || [];

        if (!serverList.length) {
            return res.status(404).json({ error: `No ${track} servers available for this episode.` });
        }

        const targetServer = serverList[0]; // Select default primary server

        // Step 3: Extract direct M3U8 video sources
        const sourcesRes = await fetch(
            `https://hianime-mapper.vercel.app/anime/sources?serverId=${targetServer.serverId}&episodeId=${episodeObj.id}`
        );

        if (!sourcesRes.ok) {
            return res.status(404).json({ error: 'Failed to extract video stream sources.' });
        }

        const sourcesData = await sourcesRes.json();
        const sources = sourcesData.data?.sources || [];

        const primarySource = sources.find(s => s.isM3U8 || s.url.includes('.m3u8')) || sources[0];

        if (!primarySource || !primarySource.url) {
            return res.status(404).json({ error: 'No playable M3U8 link found.' });
        }

        // Step 4: Return direct clean HLS URL to frontend player
        return res.status(200).json({
            success: true,
            animeId: id,
            episode: ep,
            track: track,
            streamUrl: primarySource.url,
            subtitles: sourcesData.data?.tracks || []
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Server failed to process stream request.',
            details: error.message
        });
    }
}
