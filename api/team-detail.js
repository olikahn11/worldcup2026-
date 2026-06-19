const API_BASE = 'https://v3.football.api-sports.io';
const teamDetailCache = globalThis.__worldCupTeamDetailCache || new Map();

globalThis.__worldCupTeamDetailCache = teamDetailCache;

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  const data = await response.json();
  if (!response.ok || (data.errors && Object.keys(data.errors).length > 0)) {
    throw new Error(JSON.stringify(data.errors || data));
  }
  return data;
}

async function fetchTeamEndpoint(endpoint, teamId, apiKey) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('team', teamId);
  return fetchJson(url, {
    'x-apisports-key': apiKey,
    Accept: 'application/json',
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  const requestUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const teamId = requestUrl.searchParams.get('team') || '';
  if (!/^\d{1,12}$/.test(teamId)) {
    return res.status(400).json({ error: '无效的球队 ID' });
  }

  const canonicalPath = `/api/team-detail?team=${teamId}`;
  if (requestUrl.pathname + requestUrl.search !== canonicalPath) {
    return res.redirect(308, canonicalPath);
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_FOOTBALL_KEY 未配置' });
  }

  const cached = teamDetailCache.get(teamId);
  if (cached?.data && cached.expiresAt > Date.now()) {
    res.setHeader('X-WorldCup-Cache', 'MEMORY-HIT');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json(cached.data);
  }

  try {
    const [squad, coaches] = await Promise.all([
      fetchTeamEndpoint('players/squads', teamId, apiKey),
      fetchTeamEndpoint('coachs', teamId, apiKey),
    ]);
    const data = { squad, coaches, updatedAt: new Date().toISOString() };
    teamDetailCache.set(teamId, { data, expiresAt: Date.now() + 6 * 60 * 60 * 1000 });

    res.setHeader('X-WorldCup-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    console.error('世界杯球队详情同步失败:', error);
    if (cached?.data) return res.status(200).json({ ...cached.data, stale: true });
    return res.status(502).json({ error: '世界杯球队详情同步失败' });
  }
}
