const API_BASE = 'https://v3.football.api-sports.io';
const cache = globalThis.__worldCupOddsCache || new Map();

globalThis.__worldCupOddsCache = cache;

const toOption = (value, label = value?.value) => {
  const odd = Number(value?.odd);
  if (!Number.isFinite(odd) || odd <= 1) return null;
  return { key: String(value.value), label: String(label), odd };
};

const findBet = (bookmaker, patterns) => bookmaker?.bets?.find(bet =>
  patterns.some(pattern => pattern.test(String(bet?.name || '')))
);

const parseThreeWay = (bet) => {
  const valueMap = Object.fromEntries((bet?.values || []).map(value => [String(value.value).toLowerCase(), value]));
  const rows = [
    ['home', '主胜', valueMap.home || valueMap['1']],
    ['draw', '平', valueMap.draw || valueMap['x']],
    ['away', '客胜', valueMap.away || valueMap['2']]
  ];
  const options = rows.map(([key, label, value]) => {
    const option = toOption(value, label);
    return option ? { ...option, key } : null;
  }).filter(Boolean);
  return options.length === 3 ? options : [];
};

export const parseHandicap = (bookmaker) => {
  const bet = findBet(bookmaker, [/^Handicap Result$/i, /3 Way Handicap/i]);
  if (!bet) return [];
  const grouped = new Map();
  (bet.values || []).forEach(value => {
    const raw = String(value.value || '');
    const side = /home/i.test(raw) ? 'home' : /draw/i.test(raw) ? 'draw' : /away/i.test(raw) ? 'away' : null;
    const rawLine = raw.match(/[+-]\d+(?:\.\d+)?/)?.[0];
    const lineValue = Number(rawLine);
    if (!side || !Number.isInteger(lineValue) || lineValue === 0) return;
    const line = lineValue > 0 ? `+${lineValue}` : String(lineValue);
    if (!grouped.has(line)) grouped.set(line, {});
    grouped.get(line)[side] = value;
  });
  return [...grouped.entries()]
    .map(([line, values]) => {
      if (!values.home || !values.draw || !values.away) return null;
      const options = [
        ['home', '主胜', values.home],
        ['draw', '平', values.draw],
        ['away', '客胜', values.away]
      ].map(([key, label, value]) => {
        const option = toOption(value, label);
        return option ? { ...option, key } : null;
      }).filter(Boolean);
      if (options.length !== 3) return null;
      const homeAdjustment = Number(line);
      const goals = Math.abs(homeAdjustment);
      return {
        key: line,
        line,
        homeAdjustment,
        givingSide: homeAdjustment < 0 ? 'home' : 'away',
        goals,
        label: homeAdjustment < 0 ? `主队让${goals}球` : `客队让${goals}球`,
        options
      };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(a.homeAdjustment) - Math.abs(b.homeAdjustment) || a.homeAdjustment - b.homeAdjustment);
};

const parseCorrectScore = (bookmaker) => {
  const bet = findBet(bookmaker, [/Correct Score/i, /Exact Score/i]);
  const sportteryScores = new Set([
    '1:0', '2:0', '2:1', '3:0', '3:1', '3:2', '4:0', '4:1', '4:2', '5:0', '5:1', '5:2',
    '0:0', '1:1', '2:2', '3:3',
    '0:1', '0:2', '1:2', '0:3', '1:3', '2:3', '0:4', '1:4', '2:4', '0:5', '1:5', '2:5'
  ]);
  return (bet?.values || [])
    .filter(value => sportteryScores.has(String(value.value || '').trim()))
    .map(value => toOption(value))
    .filter(Boolean);
};

const parseExactGoals = (bookmaker) => {
  const candidateBets = (bookmaker?.bets || []).filter(bet => {
    const name = String(bet?.name || '');
    return !/Home|Away|Half/i.test(name) && [
      /How many goals.*score/i,
      /Number of Goals in Match/i,
      /Exact Goals Number/i,
      /Exact.*Goals/i,
      /^Total Goals$/i
    ].some(pattern => pattern.test(name));
  });
  for (const bet of candidateBets) {
    const options = (bet.values || []).map(value => {
      const raw = String(value.value ?? '').trim();
      const exact = raw.match(/^(?:exactly\s*)?([0-6])(?:\s*goals?)?$/i)?.[1];
      const isSevenPlus = /^(?:7\+|7 or more|more 7|7 and over)$/i.test(raw);
      const label = exact || (isSevenPlus ? '7+' : null);
      if (!label) return null;
      const option = toOption(value, label);
      return option ? { ...option, key: label } : null;
    }).filter(Boolean);
    const keys = new Set(options.map(option => option.key));
    if (['0', '1', '2', '3', '4', '5', '6', '7+'].every(key => keys.has(key))) return options;
  }
  return [];
};

const parseHalfFull = (bookmaker) => {
  const bet = findBet(bookmaker, [/Half.*Full/i, /HT\s*\/\s*FT/i]);
  const labelMap = {
    'Home/Home': '胜胜', 'Home/Draw': '胜平', 'Home/Away': '胜负',
    'Draw/Home': '平胜', 'Draw/Draw': '平平', 'Draw/Away': '平负',
    'Away/Home': '负胜', 'Away/Draw': '负平', 'Away/Away': '负负'
  };
  return (bet?.values || []).map(value => {
    const raw = String(value.value || '').trim();
    const compact = raw.replace(/\s*-\s*/g, '/');
    const label = labelMap[compact] || raw;
    const option = toOption(value, label);
    return option ? { ...option, key: label } : null;
  }).filter(Boolean).slice(0, 9);
};

const parseFootballOdds = (payload, fixtureId) => {
  const row = payload?.response?.[0];
  const bookmaker = row?.bookmakers?.find(item => parseThreeWay(findBet(item, [/^Match Winner$/i, /^1x2$/i])).length === 3)
    || row?.bookmakers?.[0];
  if (!bookmaker) return null;
  const matchWinner = parseThreeWay(findBet(bookmaker, [/^Match Winner$/i, /^1x2$/i]));
  const handicapLines = parseHandicap(bookmaker);
  const defaultHandicap = handicapLines[0];
  const markets = {
    spf: { key: 'spf', label: '胜平负', maxPass: 8, options: matchWinner },
    rqspf: {
      key: 'rqspf',
      label: '让球胜平负',
      maxPass: 8,
      lines: handicapLines,
      line: defaultHandicap?.line || null,
      options: defaultHandicap?.options || []
    },
    score: { key: 'score', label: '比分', maxPass: 4, options: parseCorrectScore(bookmaker) },
    goals: { key: 'goals', label: '总进球', maxPass: 6, options: parseExactGoals(bookmaker) },
    halfFull: { key: 'halfFull', label: '半全场', maxPass: 4, options: parseHalfFull(bookmaker) }
  };
  return {
    fixtureId: String(fixtureId),
    bookmaker: bookmaker.name || '市场赔率',
    markets,
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
  const parsed = parseFootballOdds(data, fixtureId);
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
