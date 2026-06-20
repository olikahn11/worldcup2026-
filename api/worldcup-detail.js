const API_BASE = 'https://v3.football.api-sports.io';
const detailCache = globalThis.__worldCupFixtureDetailCache || new Map();

globalThis.__worldCupFixtureDetailCache = detailCache;

const withTimeout = async (promise, ms = 6500) => {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error('request timeout')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timerId);
  }
};

const fetchApi = async (endpoint, params, apiKey) => {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await withTimeout(fetch(url, {
    headers: {
      'x-apisports-key': apiKey,
      Accept: 'application/json'
    }
  }));
  const data = await withTimeout(response.json(), 2500);
  if (!response.ok) throw new Error(data?.message || `API request failed: ${endpoint}`);
  return data;
};

const safeData = (result, fallback = { response: [] }) => (
  result.status === 'fulfilled' ? result.value : fallback
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  const requestUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const fixtureId = requestUrl.searchParams.get('fixture');
  if (!/^\d+$/.test(fixtureId || '')) return res.status(400).json({ error: '比赛暂时无法加载' });

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return res.status(500).json({ error: '比赛暂时无法加载' });

  const cached = detailCache.get(fixtureId);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(cached.data);
  }

  try {
    const [fixture, lineups, events, statistics, players] = await Promise.allSettled([
      fetchApi('fixtures', { id: fixtureId }, apiKey),
      fetchApi('fixtures/lineups', { fixture: fixtureId }, apiKey),
      fetchApi('fixtures/events', { fixture: fixtureId }, apiKey),
      fetchApi('fixtures/statistics', { fixture: fixtureId }, apiKey),
      fetchApi('fixtures/players', { fixture: fixtureId }, apiKey)
    ]);
    const data = {
      fixture: safeData(fixture),
      lineups: safeData(lineups),
      events: safeData(events),
      statistics: safeData(statistics),
      players: safeData(players),
      updatedAt: new Date().toISOString()
    };
    detailCache.set(fixtureId, { data, expiresAt: Date.now() + 5 * 60 * 1000 });
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (error) {
    console.error('世界杯比赛详情加载失败:', error);
    return res.status(502).json({ error: '比赛暂时无法加载' });
  }
}
