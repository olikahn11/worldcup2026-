const API_BASE = 'https://v3.football.api-sports.io';
const cache = globalThis.__worldCupOddsCache || new Map();

globalThis.__worldCupOddsCache = cache;

const parseMatchWinnerOdds = (payload, fixtureId) => {
  const row = payload?.response?.[0];
  const bookmaker = row?.bookmakers?.find(item =>
    item?.bets?.some(bet => ['Match Winner', '1x2'].includes(bet?.name))
  );
  const bet = bookmaker?.bets?.find(item => ['Match Winner', '1x2'].includes(item?.name));
  if (!bet?.values?.length) return null;
  const values = Object.fromEntries(bet.values.map(item => [String(item.value).toLowerCase(), Number(item.odd)]));
  const home = values.home || values['1'];
  const draw = values.draw || values['x'];
  const away = values.away || values['2'];
  if (![home, draw, away].every(value => Number.isFinite(value) && value > 1)) return null;
  return {
    fixtureId: String(fixtureId),
    bookmaker: bookmaker.name || '市场赔率',
    home,
    draw,
    away,
    updatedAt: row?.update || new Date().toISOString()
  };
};

const fetchFixtureOdds = async (fixtureId, apiKey) => {
  const cached = cache.get(fixtureId);
  if (cached?.expiresAt > Date.now()) return cached.data;
  const url = new URL(`${API_BASE}/odds`);
  url.searchParams.set('fixture', fixtureId);
  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey, Accept: 'application/json' }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || 'Odds request failed');
  const parsed = parseMatchWinnerOdds(data, fixtureId);
  cache.set(fixtureId, { data: parsed, expiresAt: Date.now() + 5 * 60 * 1000 });
  return parsed;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: '只允许 GET 请求' });

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return res.status(500).json({ error: '赔率暂时无法加载' });
  const rawIds = String(req.query?.fixtureIds || '');
  const fixtureIds = [...new Set(rawIds.split(',').map(id => id.trim()).filter(id => /^\d{1,12}$/.test(id)))].slice(0, 12);
  if (!fixtureIds.length) return res.status(200).json({ odds: [], updatedAt: new Date().toISOString() });

  try {
    const settled = await Promise.allSettled(fixtureIds.map(id => fetchFixtureOdds(id, apiKey)));
    const odds = settled.flatMap(result => result.status === 'fulfilled' && result.value ? [result.value] : []);
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ odds, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('世界杯赔率加载失败:', error);
    return res.status(502).json({ error: '赔率暂时无法加载' });
  }
}
