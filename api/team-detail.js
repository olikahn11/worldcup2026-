const API_BASE = 'https://v3.football.api-sports.io';
const LEAGUE_ID = '1';
const SEASON = '2026';
const teamDetailCache = globalThis.__worldCupTeamDetailCache || new Map();

globalThis.__worldCupTeamDetailCache = teamDetailCache;

const TEAM_NAME_EN = {
  '阿尔及利亚': 'Algeria',
  '阿根廷': 'Argentina',
  '澳大利亚': 'Australia',
  '奥地利': 'Austria',
  '比利时': 'Belgium',
  '波黑': 'Bosnia & Herzegovina',
  '巴西': 'Brazil',
  '加拿大': 'Canada',
  '佛得角': 'Cape Verde Islands',
  '哥伦比亚': 'Colombia',
  '刚果(金)': 'Congo DR',
  '克罗地亚': 'Croatia',
  '库拉索': 'Curaçao',
  '捷克': 'Czech Republic',
  '厄瓜多尔': 'Ecuador',
  '埃及': 'Egypt',
  '英格兰': 'England',
  '法国': 'France',
  '德国': 'Germany',
  '加纳': 'Ghana',
  '海地': 'Haiti',
  '伊朗': 'Iran',
  '伊拉克': 'Iraq',
  '科特迪瓦': 'Ivory Coast',
  '日本': 'Japan',
  '约旦': 'Jordan',
  '墨西哥': 'Mexico',
  '摩洛哥': 'Morocco',
  '荷兰': 'Netherlands',
  '新西兰': 'New Zealand',
  '挪威': 'Norway',
  '巴拿马': 'Panama',
  '巴拉圭': 'Paraguay',
  '葡萄牙': 'Portugal',
  '卡塔尔': 'Qatar',
  '沙特阿拉伯': 'Saudi Arabia',
  '苏格兰': 'Scotland',
  '塞内加尔': 'Senegal',
  '南非': 'South Africa',
  '韩国': 'South Korea',
  '西班牙': 'Spain',
  '瑞典': 'Sweden',
  '瑞士': 'Switzerland',
  '突尼斯': 'Tunisia',
  '土耳其': 'Türkiye',
  '美国': 'USA',
  '乌拉圭': 'Uruguay',
  '乌兹别克斯坦': 'Uzbekistan',
};

const withTimeout = async (promise, ms = 7000) => {
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

async function fetchJson(url, headers = {}, timeoutMs = 5500) {
  const response = await withTimeout(fetch(url, { headers }), timeoutMs);
  const data = await withTimeout(response.json(), 2500);
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

async function fetchEndpoint(endpoint, params, apiKey, timeoutMs) {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  return fetchJson(url, {
    'x-apisports-key': apiKey,
    Accept: 'application/json',
  }, timeoutMs);
}

async function resolveTeamId({ teamId, teamName, apiKey }) {
  if (/^\d{1,12}$/.test(teamId || '')) {
    return { teamId, teamInfo: null };
  }
  const search = TEAM_NAME_EN[teamName] || teamName;
  if (!search) return { teamId: '', teamInfo: null };
  const teams = await fetchEndpoint('teams', { search }, apiKey);
  const candidates = teams?.response || [];
  const normalizedSearch = String(search).toLowerCase();
  const exact = candidates.find(item => String(item.team?.name || '').toLowerCase() === normalizedSearch);
  const selected = exact || candidates[0];
  return {
    teamId: selected?.team?.id ? String(selected.team.id) : '',
    teamInfo: selected || null,
  };
}

const safeData = (result, fallback = { response: [] }) => (
  result.status === 'fulfilled' ? result.value : fallback
);

const hasPublishedLineup = (lineup) => (
  Array.isArray(lineup?.startXI) && lineup.startXI.some(item => item?.player?.grid)
);

async function fetchRecentLineup({ fixtures = [], teamId, apiKey }) {
  const finishedOrStarted = new Set(['FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT']);
  const candidates = fixtures
    .filter(item => item?.fixture?.id)
    .filter(item => finishedOrStarted.has(item.fixture?.status?.short) || new Date(item.fixture?.date || 0).getTime() <= Date.now() + 3 * 60 * 60 * 1000)
    .sort((a, b) => new Date(b.fixture?.date || 0).getTime() - new Date(a.fixture?.date || 0).getTime())
    .slice(0, 4);

  const results = await Promise.allSettled(candidates.map(async (fixture) => {
    const lineups = await fetchEndpoint('fixtures/lineups', { fixture: fixture.fixture.id }, apiKey, 3000);
    const lineup = (lineups?.response || []).find(item => String(item?.team?.id || '') === String(teamId));
    return { fixture, lineup };
  }));

  for (const result of results) {
    if (result.status === 'fulfilled' && hasPublishedLineup(result.value.lineup)) {
      return result.value;
    }
    if (result.status === 'rejected') {
      console.warn('球队阵型图加载跳过:', result.reason?.message || result.reason);
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  const requestUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const teamId = requestUrl.searchParams.get('team') || '';
  const teamName = requestUrl.searchParams.get('name') || '';
  if (!/^\d{1,12}$/.test(teamId) && !teamName.trim()) return res.status(400).json({ error: '球队详情暂时无法加载' });

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '球队详情暂时无法加载' });
  }

  const cacheKey = teamId || `name:${teamName}`;
  const cached = teamDetailCache.get(cacheKey);
  if (cached?.data && cached.expiresAt > Date.now()) {
    res.setHeader('X-WorldCup-Cache', 'MEMORY-HIT');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json(cached.data);
  }

  try {
    const resolved = await resolveTeamId({ teamId, teamName, apiKey });
    if (!resolved.teamId) return res.status(404).json({ error: '球队详情暂时无法加载' });
    const [teamInfo, squad, coaches, statistics, fixtures, injuries, players] = await Promise.allSettled([
      resolved.teamInfo ? Promise.resolve({ response: [resolved.teamInfo] }) : fetchEndpoint('teams', { id: resolved.teamId }, apiKey),
      fetchTeamEndpoint('players/squads', resolved.teamId, apiKey),
      fetchTeamEndpoint('coachs', resolved.teamId, apiKey),
      fetchEndpoint('teams/statistics', { league: LEAGUE_ID, season: SEASON, team: resolved.teamId }, apiKey),
      fetchEndpoint('fixtures', { league: LEAGUE_ID, season: SEASON, team: resolved.teamId }, apiKey),
      fetchEndpoint('injuries', { league: LEAGUE_ID, season: SEASON, team: resolved.teamId }, apiKey),
      fetchEndpoint('players', { league: LEAGUE_ID, season: SEASON, team: resolved.teamId }, apiKey),
    ]);
    const fixtureRows = safeData(fixtures).response || [];
    const recentLineup = await fetchRecentLineup({ fixtures: fixtureRows, teamId: resolved.teamId, apiKey });
    const data = {
      teamInfo: safeData(teamInfo),
      squad: safeData(squad),
      coaches: safeData(coaches),
      statistics: safeData(statistics, { response: null }),
      fixtures: { response: fixtureRows },
      injuries: safeData(injuries),
      players: safeData(players),
      recentLineup,
      resolvedTeamId: resolved.teamId,
      updatedAt: new Date().toISOString()
    };
    teamDetailCache.set(cacheKey, { data, expiresAt: Date.now() + 6 * 60 * 60 * 1000 });

    res.setHeader('X-WorldCup-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    console.error('世界杯球队详情加载失败:', error);
    if (cached?.data) return res.status(200).json({ ...cached.data, stale: true });
    return res.status(502).json({ error: '球队详情暂时无法加载' });
  }
}
