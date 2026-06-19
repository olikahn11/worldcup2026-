const API_BASE = 'https://v3.football.api-sports.io';
const LEAGUE_ID = '1';
const SEASON = '2026';
const cache = globalThis.__worldCupLiveCache || { data: null, expiresAt: 0 };

globalThis.__worldCupLiveCache = cache;

const fetchApi = async (endpoint, params, apiKey) => {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': apiKey,
      Accept: 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `API request failed: ${endpoint}`);
  return data;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  const canonicalPath = '/api/worldcup';
  if (req.url && !req.url.startsWith(canonicalPath)) {
    res.setHeader('Location', canonicalPath);
    return res.status(308).end();
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    if (cache.data) return res.status(200).json({ ...cache.data, stale: true });
    return res.status(500).json({ error: '赛程暂时无法加载' });
  }

  if (cache.data && cache.expiresAt > Date.now()) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(cache.data);
  }

  try {
    const [fixtures, standings] = await Promise.all([
      fetchApi('fixtures', { league: LEAGUE_ID, season: SEASON }, apiKey),
      fetchApi('standings', { league: LEAGUE_ID, season: SEASON }, apiKey)
    ]);
    const payload = {
      fixtures,
      standings,
      updatedAt: new Date().toISOString(),
      stale: false
    };
    cache.data = payload;
    cache.expiresAt = Date.now() + 60 * 1000;
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('世界杯赛程加载失败:', error);
    if (cache.data) return res.status(200).json({ ...cache.data, stale: true });
    return res.status(502).json({ error: '赛程暂时无法加载' });
  }
}
