export default async function handler(req, res) {
    // Enable CORS so your GitHub Pages frontend can call this API without errors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extract the parameters sent by your frontend catalog
    const { id, ep = 1, track = 'sub' } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing required query parameter: id' });
    }

    // Construct the canonical URL for the player player layout
    const targetEmbedUrl = `https://zokoanime.video{id}/${ep}/${track}`;

    // Send the correct path back down to your watch.html
    return res.status(200).json({
        success: true,
        animeId: id,
        episode: ep,
        track: track,
        embedUrl: targetEmbedUrl
    });
}
