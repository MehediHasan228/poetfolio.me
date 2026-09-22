/**
 * Serverless API Endpoint for Arena AI Leaderboard
 * Compatible with Vercel, Netlify, and Node.js serverless runtimes.
 * Route: /api/arena?category=agent&subcategory=agent
 */

const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  // Set CORS headers so any client can fetch it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let data = null;
    const localDataPath = path.join(process.cwd(), 'docs', 'data', 'arena_leaderboard.json');

    if (fs.existsSync(localDataPath)) {
      data = JSON.parse(fs.readFileSync(localDataPath, 'utf8'));
    } else {
      // Fallback: Fetch directly from GitHub CDN
      const remoteRes = await fetch('https://raw.githubusercontent.com/MehediHasan228/poetfolio.me/main/docs/data/arena_leaderboard.json');
      if (remoteRes.ok) {
        data = await remoteRes.json();
      }
    }

    if (!data) {
      return res.status(404).json({ error: 'Leaderboard data not found' });
    }

    const { category, subcategory } = req.query || {};

    if (category && data.categories && data.categories[category]) {
      const catObj = data.categories[category];
      if (subcategory && catObj.subcategories && catObj.subcategories[subcategory]) {
        return res.status(200).json({
          updated_at: data.updated_at,
          category,
          subcategory,
          ...catObj.subcategories[subcategory]
        });
      }
      return res.status(200).json({
        updated_at: data.updated_at,
        category,
        ...catObj
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve arena data', message: err.message });
  }
}
