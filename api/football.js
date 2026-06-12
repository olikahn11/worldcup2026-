// api/football.js
export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: '只允许 GET 请求' });
  }

  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API_FOOTBALL_KEY 未配置',
      });
    }

    // 使用新的 WHATWG URL API，避免 url.parse() 弃用警告
    const requestUrl = new URL(
      req.url,
      `https://${req.headers.host || 'localhost'}`
    );

    const endpoint = requestUrl.searchParams.get('endpoint') || 'fixtures';

    // 防止 endpoint 被用于构造危险地址
    if (!/^[a-zA-Z0-9_-]+$/.test(endpoint)) {
      return res.status(400).json({
        error: '无效的 endpoint',
      });
    }

    const apiUrl = new URL(
      `https://v3.football.api-sports.io/${endpoint}`
    );

    // 将除 endpoint 外的参数转发给 API-Football
    requestUrl.searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        apiUrl.searchParams.append(key, value);
      }
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API-Football 请求失败:', response.status, data);

      return res.status(response.status).json({
        error: 'API-Football 请求失败',
        details: data,
      });
    }

    // 计算北京时间
    const now = new Date();
    const beijingHour = (now.getUTCHours() + 8) % 24;
    const beijingMinute = now.getUTCMinutes();
    const timeDecimal = beijingHour + beijingMinute / 60;

    // 比赛活跃期：北京时间 23:30 至次日 14:00
    const isMatchTime = timeDecimal >= 23.5 || timeDecimal <= 14;
    const cacheTime = isMatchTime ? 540 : 34200;

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${cacheTime}, stale-while-revalidate=59`
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error('抓取数据出错:', error);

    return res.status(500).json({
      error: '数据抓取失败',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
