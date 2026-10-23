export default async function handler(req, res) {
    // Enable CORS so your frontend can call this function smoothly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id, ep = 1, track = 'sub' } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required query parameter: id' });
    }

    try {
        // Fetch stream metadata from the external provider server-side
        const targetUrl = `https://zokoanime.video/stream/mal/${id}/${ep}/${track}`;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch stream data from provider source.' });
        }

        const htmlText = await response.text();

        // Extract raw .m3u8 or video source links embedded in the page script
        const streamMatch = htmlText.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);

        if (streamMatch && streamMatch[0]) {
            return res.status(200).json({
                success: true,
                animeId: id,
                episode: ep,
                track: track,
                streamUrl: streamMatch[0]
            });
        } else {
            return res.status(404).json({
                error: 'Direct stream link could not be parsed from source response.'
            });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Server error parsing stream details.', details: error.message });
    }
}
