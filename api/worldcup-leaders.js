const API_BASE = 'https://v3.football.api-sports.io';
const LEAGUE_ID = '1';
const SEASON = '2026';
const leadersCache = globalThis.__worldCupLeadersCache || { data: null, expiresAt: 0 };

globalThis.__worldCupLeadersCache = leadersCache;

const getBeijingHour = () => Number(new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  hour: '2-digit',
  hourCycle: 'h23'
}).format(new Date()));

const getCacheSeconds = () => {
  const hour = getBeijingHour();
  return hour >= 0 && hour < 14 ? 60 : 300;
};

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
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
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

const safeValue = (result, fallback = { response: [] }) => (
  result.status === 'fulfilled' ? result.value : fallback
);

const playerName = (item) => item?.player?.name || '球员待定';
const teamName = (item) => item?.statistics?.[0]?.team?.name || '';
const teamLogo = (item) => item?.statistics?.[0]?.team?.logo || '';
const stat = (item, path, fallback = 0) => path.reduce((value, key) => value?.[key], item?.statistics?.[0]) ?? fallback;

const mapSimple = (rows, path, limit = 20) => rows.slice(0, limit).map((item, index) => ({
  rank: index + 1,
  player: playerName(item),
  team: teamName(item),
  teamLogo: teamLogo(item),
  value: stat(item, path),
  photo: item?.player?.photo || ''
}));

const rankFromPlayers = (players, path, limit = 20) => players
  .map(item => ({
    player: playerName(item),
    team: teamName(item),
    teamLogo: teamLogo(item),
    value: stat(item, path),
    photo: item?.player?.photo || ''
  }))
  .filter(item => Number(item.value) > 0)
  .sort((a, b) => Number(b.value) - Number(a.value))
  .slice(0, limit)
  .map((item, index) => ({ ...item, rank: index + 1 }));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  const cacheSeconds = getCacheSeconds();
  if (!apiKey) {
    if (leadersCache.data) return res.status(200).json({ ...leadersCache.data, stale: true });
    return res.status(500).json({ error: '英雄榜暂时无法加载' });
  }

  if (leadersCache.data && leadersCache.expiresAt > Date.now()) {
    res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=600`);
    return res.status(200).json(leadersCache.data);
  }

  try {
    const [scorers, assists, yellowCards, redCards, playersPage1, playersPage2] = await Promise.allSettled([
      fetchApi('players/topscorers', { league: LEAGUE_ID, season: SEASON }, apiKey),
      fetchApi('players/topassists', { league: LEAGUE_ID, season: SEASON }, apiKey),
      fetchApi('players/topyellowcards', { league: LEAGUE_ID, season: SEASON }, apiKey),
      fetchApi('players/topredcards', { league: LEAGUE_ID, season: SEASON }, apiKey),
      fetchApi('players', { league: LEAGUE_ID, season: SEASON, page: 1 }, apiKey),
      fetchApi('players', { league: LEAGUE_ID, season: SEASON, page: 2 }, apiKey),
    ]);

    const playerRows = [
      ...(safeValue(playersPage1).response || []),
      ...(safeValue(playersPage2).response || []),
    ];

    const data = {
      updatedAt: new Date().toISOString(),
      stale: false,
      boards: {
        scorers: mapSimple(safeValue(scorers).response || [], ['goals', 'total']),
        assists: mapSimple(safeValue(assists).response || [], ['goals', 'assists']),
        yellowCards: mapSimple(safeValue(yellowCards).response || [], ['cards', 'yellow']),
        redCards: mapSimple(safeValue(redCards).response || [], ['cards', 'red']),
        tackles: rankFromPlayers(playerRows, ['tackles', 'total']),
        interceptions: rankFromPlayers(playerRows, ['tackles', 'interceptions']),
        keyPasses: rankFromPlayers(playerRows, ['passes', 'key']),
        shotsOn: rankFromPlayers(playerRows, ['shots', 'on']),
        duelsWon: rankFromPlayers(playerRows, ['duels', 'won']),
        ratings: rankFromPlayers(playerRows, ['games', 'rating']).map(item => ({ ...item, value: Number(item.value).toFixed(2) })),
      }
    };

    leadersCache.data = data;
    leadersCache.expiresAt = Date.now() + cacheSeconds * 1000;
    res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=600`);
    return res.status(200).json(data);
  } catch (error) {
    console.error('世界杯英雄榜加载失败:', error);
    if (leadersCache.data) return res.status(200).json({ ...leadersCache.data, stale: true });
    return res.status(502).json({ error: '英雄榜暂时无法加载' });
  }
}
