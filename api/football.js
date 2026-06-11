{\rtf1\ansi\ansicpg936\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // api/football.js\
export default async function handler(req, res) \{\
  // 1. \uc0\u35774 \u32622 \u20801 \u35768 \u36328 \u22495 \u35831 \u27714  (CORS)\u65292 \u36825 \u26679 \u20320 \u30340 \u21069 \u31471 \u32593 \u39029 \u25165 \u33021 \u35775 \u38382 \u36825 \u20010 \u25509 \u21475 \
  res.setHeader('Access-Control-Allow-Credentials', true);\
  res.setHeader('Access-Control-Allow-Origin', '*');\
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');\
  res.setHeader(\
    'Access-Control-Allow-Headers',\
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'\
  );\
\
  // \uc0\u22914 \u26524 \u26159 \u39044 \u26816 \u35831 \u27714 \u65292 \u30452 \u25509 \u36820 \u22238 \
  if (req.method === 'OPTIONS') \{\
    res.status(200).end();\
    return;\
  \}\
\
  try \{\
    // 2. \uc0\u20174  Vercel \u30340 \u29615 \u22659 \u21464 \u37327 \u20445 \u38505 \u31665 \u37324 \u25343 \u20986 \u20320 \u30340  API Key\
    const apiKey = process.env.API_FOOTBALL_KEY;\
\
    if (!apiKey) \{\
      return res.status(500).json(\{ error: 'API Key \uc0\u26410 \u37197 \u32622 ' \});\
    \}\
\
    // 3. \uc0\u20915 \u23450 \u35201 \u35831 \u27714 \u20160 \u20040 \u25968 \u25454 \u65288 \u36825 \u37324 \u20197 \u35831 \u27714  fixtures/\u36187 \u31243  \u20026 \u20363 \u65289 \
    // \uc0\u21069 \u31471 \u32593 \u39029 \u21487 \u20197 \u36890 \u36807  /api/football?endpoint=fixtures \u26469 \u25351 \u23450 \
    const \{ endpoint = 'fixtures', ...queryParams \} = req.query;\
    \
    // \uc0\u26500 \u36896 \u35831 \u27714  API-Sports \u30340  URL \u21644 \u21442 \u25968 \
    const url = new URL(`https://v3.football.api-sports.io/$\{endpoint\}`);\
    // \uc0\u27604 \u22914 \u25105 \u20204 \u40664 \u35748 \u35831 \u27714  2026 \u24180 \u30340 \u27604 \u36187 \
    url.searchParams.append('league', '1'); // 1 \uc0\u20195 \u34920 \u19990 \u30028 \u26479 \
    url.searchParams.append('season', '2026');\
\
    // \uc0\u25226 \u21069 \u31471 \u20256 \u36807 \u26469 \u30340 \u20854 \u20182 \u21442 \u25968 \u20063 \u21152 \u19978 \
    Object.keys(queryParams).forEach(key => \{\
        url.searchParams.append(key, queryParams[key]);\
    \});\
\
    // 4. \uc0\u24102 \u30528 \u38544 \u34255 \u30340  API Key \u21521 \u23448 \u26041 \u21457 \u36215 \u35831 \u27714 \
    const response = await fetch(url.toString(), \{\
      method: 'GET',\
      headers: \{\
        'x-apisports-key': apiKey, // \uc0\u36825 \u37324 \u29992 \u30340 \u26159 \u20320 \u34255 \u36215 \u26469 \u30340  Key\
      \},\
    \});\
\
    const data = await response.json();\
\
    // 5. \uc0\u35774 \u32622 \u25968 \u25454 \u32531 \u23384 \u65288 \u38750 \u24120 \u20851 \u38190 \u65281 \u65289 \
    // s-maxage=900 \uc0\u34920 \u31034 \u35753  Vercel \u30340 \u36793 \u32536 \u33410 \u28857 \u32531 \u23384 \u36825 \u20010 \u25968 \u25454  900 \u31186 \u65288 15\u20998 \u38047 \u65289 \
    // stale-while-revalidate=59 \uc0\u34920 \u31034 \u22914 \u26524 \u36807 \u26399 \u20102 \u65292 \u20808 \u36820 \u22238 \u26087 \u25968 \u25454 \u65292 \u24182 \u22312 \u21518 \u21488 \u21435 \u25343 \u26032 \u25968 \u25454 \
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=59');\
\
    // 6. \uc0\u25226 \u25968 \u25454 \u36820 \u22238 \u32473 \u20320 \u30340 \u29699 \u36855 \u27983 \u35272 \u22120 \
    res.status(200).json(data);\
\
  \} catch (error) \{\
    console.error('\uc0\u25235 \u21462 \u25968 \u25454 \u20986 \u38169 :', error);\
    res.status(500).json(\{ error: '\uc0\u25968 \u25454 \u25235 \u21462 \u22833 \u36133 ' \});\
  \}\
\}}