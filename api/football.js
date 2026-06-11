// api/football.js
export default async function handler(req, res) {
  // 1. 设置允许跨域请求 (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. 获取隐藏的密码
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key 未配置' });
    }

    const { endpoint = 'fixtures', ...queryParams } = req.query;
    const url = new URL(`https://v3.football.api-sports.io/${endpoint}`);
    
    Object.keys(queryParams).forEach(key => {
        url.searchParams.append(key, queryParams[key]);
    });

    // 3. 去官方拿数据
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
      },
    });

    const data = await response.json();

    // 4. 核心：计算北京时间，判断是否在 23:30 - 14:00 之间
    const now = new Date();
    const beijingHour = (now.getUTCHours() + 8) % 24;
    const beijingMinute = now.getUTCMinutes();
    const timeDecimal = beijingHour + (beijingMinute / 60); // 把时间转换成小数，比如 23:30 就是 23.5
    
    // 如果大于等于 23.5 (23:30) 或者 小于等于 14.0 (14:00)，则属于比赛活跃期
    const isMatchTime = timeDecimal >= 23.5 || timeDecimal <= 14.0;

    // 5. 设置智能动态缓存
    // 活跃期：让全球 CDN 缓存 540 秒（9分钟）
    // 休眠期：强行锁定缓存 34200 秒（9.5个小时），期间无论谁访问都绝对不扣你的额度！
    const cacheTime = isMatchTime ? 540 : 34200;

    res.setHeader('Cache-Control', `s-maxage=${cacheTime}, stale-while-revalidate=59`);
    res.status(200).json(data);

  } catch (error) {
    console.error('抓取数据出错:', error);
    res.status(500).json({ error: '数据抓取失败' });
  }
}