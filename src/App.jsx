import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, Clock, CalendarDays, GitBranch, ListOrdered, Wand2, Crown, 
  RotateCcw, X, Shield, MapPin, UserCircle2, Users, Download, PlusCircle, 
  RefreshCw, CheckCircle2, BookOpen, ImageIcon, Share, MessageCircle, 
  Gift, ArrowRight, Dices, Swords, Search, ChevronRight 
} from 'lucide-react';

// ==========================================
// 1. 全局基础组件与长图截取
// ==========================================

const RealTrophy = ({ className }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError) return <span className={`inline-block drop-shadow-md text-yellow-500 ${className}`} style={{fontSize: '1.25em'}}>🏆</span>;
  return <img src="/trophy.png" alt="Trophy" onError={() => setImgError(true)} className={`object-contain drop-shadow-[0_10px_15px_rgba(234,179,8,0.4)] ${className}`} />;
};

const setupViewport = () => {
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
  document.body.style.overscrollBehavior = 'none';
};

function TeamFlag({ flag, sizeClass = "w-6 h-6 sm:w-8 sm:h-8" }) {
  if (!flag || flag === '❔' || flag === '🏳️') return <span className="opacity-50 text-[1em]">❔</span>;
  if (flag.startsWith('http')) return <img src={flag} alt="flag" crossOrigin="anonymous" className={`${sizeClass} object-contain inline-block drop-shadow-md`} />;
  return <span className="drop-shadow-sm text-[1em] leading-none inline-block flex-shrink-0">{flag}</span>;
}

const GlobalQRLogo = () => (
  <div className="flex bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-2xl items-center w-full max-w-sm mx-auto mt-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-bl-lg font-bold">限时福利</div>
    <div className="w-16 h-16 bg-white p-1 rounded shrink-0 flex items-center justify-center">
       <img src="/website-qr.png" alt="QR" className="w-full h-full object-contain" />
    </div>
    <div className="ml-3 flex flex-col justify-center flex-1">
      <span className="text-sm font-black text-yellow-400">扫码看全景直播</span>
      <span className="text-[10px] text-slate-300 mt-1">2026世界杯一手数据掌握</span>
      <span className="text-[9px] text-slate-500 mt-1 font-mono">xiaohuang365.com</span>
    </div>
  </div>
);

// ==========================================
// 2. 静态数据字典与核心逻辑 (含真实2026对阵映射)
// ==========================================

const teamsData = {
  A: [{ id: 'a1', name: '墨西哥', flag: '🇲🇽' }, { id: 'a2', name: '南非', flag: '🇿🇦' }, { id: 'a3', name: '韩国', flag: '🇰🇷' }, { id: 'a4', name: '捷克', flag: '🇨🇿' }],
  B: [{ id: 'b1', name: '加拿大', flag: '🇨🇦' }, { id: 'b2', name: '波黑', flag: '🇧🇦' }, { id: 'b3', name: '卡塔尔', flag: '🇶🇦' }, { id: 'b4', name: '瑞士', flag: '🇨🇭' }],
  C: [{ id: 'c1', name: '巴西', flag: '🇧🇷' }, { id: 'c2', name: '摩洛哥', flag: '🇲🇦' }, { id: 'c3', name: '海地', flag: '🇭🇹' }, { id: 'c4', name: '苏格兰', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }],
  D: [{ id: 'd1', name: '美国', flag: '🇺🇸' }, { id: 'd2', name: '巴拉圭', flag: '🇵🇾' }, { id: 'd3', name: '澳大利亚', flag: '🇦🇺' }, { id: 'd4', name: '土耳其', flag: '🇹🇷' }],
  E: [{ id: 'e1', name: '德国', flag: '🇩🇪' }, { id: 'e2', name: '库拉索', flag: '🇨🇼' }, { id: 'e3', name: '科特迪瓦', flag: '🇨🇮' }, { id: 'e4', name: '厄瓜多尔', flag: '🇪🇨' }],
  F: [{ id: 'f1', name: '荷兰', flag: '🇳🇱' }, { id: 'f2', name: '日本', flag: '🇯🇵' }, { id: 'f3', name: '瑞典', flag: '🇸🇪' }, { id: 'f4', name: '突尼斯', flag: '🇹🇳' }],
  G: [{ id: 'g1', name: '比利时', flag: '🇧🇪' }, { id: 'g2', name: '埃及', flag: '🇪🇬' }, { id: 'g3', name: '伊朗', flag: '🇮🇷' }, { id: 'g4', name: '新西兰', flag: '🇳🇿' }],
  H: [{ id: 'h1', name: '西班牙', flag: '🇪🇸' }, { id: 'h2', name: '佛得角', flag: '🇨🇻' }, { id: 'h3', name: '沙特阿拉伯', flag: '🇸🇦' }, { id: 'h4', name: '乌拉圭', flag: '🇺🇾' }],
  I: [{ id: 'i1', name: '法国', flag: '🇫🇷' }, { id: 'i2', name: '塞内加尔', flag: '🇸🇳' }, { id: 'i3', name: '伊拉克', flag: '🇮🇶' }, { id: 'i4', name: '挪威', flag: '🇳🇴' }],
  J: [{ id: 'j1', name: '阿根廷', flag: '🇦🇷' }, { id: 'j2', name: '阿尔及利亚', flag: '🇩🇿' }, { id: 'j3', name: '奥地利', flag: '🇦🇹' }, { id: 'j4', name: '约旦', flag: '🇯🇴' }],
  K: [{ id: 'k1', name: '葡萄牙', flag: '🇵🇹' }, { id: 'k2', name: '刚果(金)', flag: '🇨🇩' }, { id: 'k3', name: '乌兹别克斯坦', flag: '🇺🇿' }, { id: 'k4', name: '哥伦比亚', flag: '🇨🇴' }],
  L: [{ id: 'l1', name: '英格兰', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, { id: 'l2', name: '克罗地亚', flag: '🇭🇷' }, { id: 'l3', name: '加纳', flag: '🇬🇭' }, { id: 'l4', name: '巴拿马', flag: '🇵🇦' }]
};

const groupStageSchedule = {
  "墨西哥 vs 南非": "6月12日 03:00", "韩国 vs 捷克": "6月12日 10:00",
  "加拿大 vs 波黑": "6月13日 03:00", "美国 vs 巴拉圭": "6月13日 09:00",
  "卡塔尔 vs 瑞士": "6月14日 03:00", "巴西 vs 摩洛哥": "6月14日 06:00", "海地 vs 苏格兰": "6月14日 09:00", "澳大利亚 vs 土耳其": "6月14日 12:00",
  "德国 vs 库拉索": "6月15日 01:00", "荷兰 vs 日本": "6月15日 04:00", "科特迪瓦 vs 厄瓜多尔": "6月15日 07:00", "瑞典 vs 突尼斯": "6月15日 10:00",
  "西班牙 vs 佛得角": "6月16日 00:00", "比利时 vs 埃及": "6月16日 03:00", "沙特阿拉伯 vs 乌拉圭": "6月16日 06:00", "伊朗 vs 新西兰": "6月16日 09:00",
  "法国 vs 塞内加尔": "6月17日 03:00", "伊拉克 vs 挪威": "6月17日 06:00", "阿根廷 vs 阿尔及利亚": "6月17日 09:00", "奥地利 vs 约旦": "6月17日 12:00",
  "葡萄牙 vs 刚果民主共和国": "6月18日 01:00", "英格兰 vs 克罗地亚": "6月18日 04:00", "加纳 vs 巴拿马": "6月18日 07:00", "乌兹别克斯坦 vs 哥伦比亚": "6月18日 10:00",
  "捷克 vs 南非": "6月19日 00:00", "瑞士 vs 波黑": "6月19日 03:00", "加拿大 vs 卡塔尔": "6月19日 06:00", "墨西哥 vs 韩国": "6月19日 09:00",
  "美国 vs 澳大利亚": "6月20日 03:00", "苏格兰 vs 摩洛哥": "6月20日 06:00", "巴西 vs 海地": "6月20日 08:30", "土耳其 vs 巴拉圭": "6月20日 11:00",
  "荷兰 vs 瑞典": "6月21日 01:00", "德国 vs 科特迪瓦": "6月21日 04:00", "厄瓜多尔 vs 库拉索": "6月21日 08:00", "突尼斯 vs 日本": "6月21日 12:00",
  "西班牙 vs 沙特阿拉伯": "6月22日 00:00", "比利时 vs 伊朗": "6月22日 03:00", "乌拉圭 vs 佛得角": "6月22日 06:00", "新西兰 vs 埃及": "6月22日 09:00",
  "阿根廷 vs 奥地利": "6月23日 01:00", "法国 vs 伊拉克": "6月23日 05:00", "挪威 vs 塞内加尔": "6月23日 08:00", "约旦 vs 阿尔及利亚": "6月23日 11:00",
  "葡萄牙 vs 乌兹别克斯坦": "6月24日 01:00", "英格兰 vs 加纳": "6月24日 04:00", "巴拿马 vs 克罗地亚": "6月24日 07:00", "哥伦比亚 vs 刚果民主共和国": "6月24日 10:00",
  "瑞士 vs 加拿大": "6月25日 03:00", "波黑 vs 卡塔尔": "6月25日 03:00", "苏格兰 vs 巴西": "6月25日 06:00", "摩洛哥 vs 海地": "6月25日 06:00", "捷克 vs 墨西哥": "6月25日 09:00", "南非 vs 韩国": "6月25日 09:00",
  "厄瓜多尔 vs 德国": "6月26日 04:00", "库拉索 vs 科特迪瓦": "6月26日 04:00", "突尼斯 vs 荷兰": "6月26日 07:00", "日本 vs 瑞典": "6月26日 07:00", "土耳其 vs 美国": "6月26日 10:00", "巴拉圭 vs 澳大利亚": "6月26日 10:00",
  "挪威 vs 法国": "6月27日 03:00", "塞内加尔 vs 伊拉克": "6月27日 03:00", "乌拉圭 vs 西班牙": "6月27日 08:00", "佛得角 vs 沙特阿拉伯": "6月27日 08:00", "新西兰 vs 比利时": "6月27日 11:00", "埃及 vs 伊朗": "6月27日 11:00",
  "巴拿马 vs 英格兰": "6月28日 05:00", "克罗地亚 vs 加纳": "6月28日 05:00", "哥伦比亚 vs 葡萄牙": "6月28日 07:30", "刚果民主共和国 vs 乌兹别克斯坦": "6月28日 07:30", "约旦 vs 阿根廷": "6月28日 10:00", "阿尔及利亚 vs 奥地利": "6月28日 10:00"
};

const getExactMatchTime = (t1, t2) => {
  const n1 = t1.name === '刚果(金)' ? '刚果民主共和国' : t1.name;
  const n2 = t2.name === '刚果(金)' ? '刚果民主共和国' : t2.name;
  return groupStageSchedule[`${n1} vs ${n2}`] || groupStageSchedule[`${n2} vs ${n1}`] || '时间待定';
};

const initialGroups = Object.keys(teamsData).reduce((acc, group) => {
  const teams = teamsData[group].map(t => ({ ...t, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 }));
  const pairings = [[0, 1], [2, 3], [3, 1], [0, 2], [3, 0], [1, 2]];
  const matches = pairings.map((pair, index) => ({
    id: `m_${group}_${index + 1}`, home: teams[pair[0]], away: teams[pair[1]], 
    homeScore: null, awayScore: null, status: 'UPCOMING', 
    timeStr: getExactMatchTime(teams[pair[0]], teams[pair[1]])
  }));
  acc[group] = { teams, matches };
  return acc;
}, {});

const baseMatchProps = { status: 'UPCOMING', homeScore: null, awayScore: null, venue: '美加墨赛区' };

// 严谨依照 2026 世界杯真实规则设定的 32 强对决结构
const officialKnockoutRounds = {
  r32: [
    { id: 'ko_73', homeStr: 'A2', awayStr: 'B2', timeStr: '6月28日 00:00', ...baseMatchProps, round: '1/16决赛' }, 
    { id: 'ko_74', homeStr: 'E1', awayStr: 'A3/B3/C3/D3/F3', timeStr: '6月28日 04:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_75', homeStr: 'F1', awayStr: 'C2', timeStr: '6月28日 08:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_76', homeStr: 'C1', awayStr: 'F2', timeStr: '6月29日 00:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_77', homeStr: 'I1', awayStr: 'C3/D3/F3/G3/H3', timeStr: '6月29日 04:00', ...baseMatchProps, round: '1/16决赛' }, 
    { id: 'ko_78', homeStr: 'E2', awayStr: 'I2', timeStr: '6月29日 08:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_79', homeStr: 'A1', awayStr: 'C3/E3/F3/H3/I3', timeStr: '6月30日 00:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_80', homeStr: 'L1', awayStr: 'E3/H3/I3/J3/K3', timeStr: '6月30日 04:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_81', homeStr: 'D1', awayStr: 'B3/E3/F3/I3/J3', timeStr: '6月30日 08:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_82', homeStr: 'G1', awayStr: 'A3/E3/H3/I3/J3', timeStr: '7月1日 00:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_83', homeStr: 'K2', awayStr: 'L2', timeStr: '7月1日 04:00', ...baseMatchProps, round: '1/16决赛' }, 
    { id: 'ko_84', homeStr: 'H1', awayStr: 'J2', timeStr: '7月1日 08:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_85', homeStr: 'B1', awayStr: 'E3/F3/G3/I3/J3', timeStr: '7月2日 00:00', ...baseMatchProps, round: '1/16决赛' }, 
    { id: 'ko_86', homeStr: 'J1', awayStr: 'H2', timeStr: '7月2日 04:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_87', homeStr: 'K1', awayStr: 'D3/E3/I3/J3/L3', timeStr: '7月2日 08:00', ...baseMatchProps, round: '1/16决赛' },
    { id: 'ko_88', homeStr: 'D2', awayStr: 'G2', timeStr: '7月3日 04:00', ...baseMatchProps, round: '1/16决赛' }
  ],
  r16: [
    { id: 'ko_89', homeStr: 'W73', awayStr: 'W75', timeStr: '7月4日 01:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_90', homeStr: 'W74', awayStr: 'W77', timeStr: '7月4日 05:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_91', homeStr: 'W76', awayStr: 'W78', timeStr: '7月5日 01:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_92', homeStr: 'W79', awayStr: 'W80', timeStr: '7月5日 05:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_93', homeStr: 'W83', awayStr: 'W84', timeStr: '7月6日 01:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_94', homeStr: 'W81', awayStr: 'W82', timeStr: '7月6日 05:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_95', homeStr: 'W86', awayStr: 'W88', timeStr: '7月7日 01:00', ...baseMatchProps, round: '1/8决赛' }, 
    { id: 'ko_96', homeStr: 'W85', awayStr: 'W87', timeStr: '7月7日 05:00', ...baseMatchProps, round: '1/8决赛' }  
  ],
  qf: [
    { id: 'ko_97', homeStr: 'W89', awayStr: 'W90', timeStr: '7月9日 04:00', ...baseMatchProps, round: '1/4决赛' }, 
    { id: 'ko_98', homeStr: 'W93', awayStr: 'W94', timeStr: '7月10日 04:00', ...baseMatchProps, round: '1/4决赛' }, 
    { id: 'ko_99', homeStr: 'W91', awayStr: 'W92', timeStr: '7月11日 04:00', ...baseMatchProps, round: '1/4决赛' }, 
    { id: 'ko_100', homeStr: 'W95', awayStr: 'W96', timeStr: '7月11日 08:00', ...baseMatchProps, round: '1/4决赛' } 
  ],
  sf: [
    { id: 'ko_101', homeStr: 'W97', awayStr: 'W98', timeStr: '7月14日 04:00', ...baseMatchProps, round: '半决赛' }, 
    { id: 'ko_102', homeStr: 'W99', awayStr: 'W100', timeStr: '7月15日 04:00', ...baseMatchProps, round: '半决赛' }  
  ],
  third: [
    { id: 'ko_103', homeStr: 'L101', awayStr: 'L102', timeStr: '7月18日 05:00', isThirdPlace: true, ...baseMatchProps, round: '季军战' } 
  ],
  final: [
    { id: 'ko_104', homeStr: 'W101', awayStr: 'W102', timeStr: '7月19日 03:00', isFinal: true, ...baseMatchProps, round: '决赛' } 
  ]
};

const officialKnockoutRoundsFlat = Object.values(officialKnockoutRounds).flat();

const groupByDate = (matches) => {
  const grouped = {};
  matches.forEach(m => {
    const date = m.timeStr.split(' ')[0]; 
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });
  return grouped;
};

// 真实的 104 场二叉树映射，严格遵循上下半区法则
const REAL_BRACKET_PARENT_MAP = {
  73: 89, 75: 89, 74: 90, 77: 90,
  76: 91, 78: 91, 79: 92, 80: 92,
  83: 93, 84: 93, 81: 94, 82: 94,
  86: 95, 88: 95, 85: 96, 87: 96,
  89: 97, 90: 97, 93: 98, 94: 98,
  91: 99, 92: 99, 95: 100, 96: 100,
  97: 101, 98: 101, 99: 102, 100: 102,
  101: 104, 102: 104
};

const getMeetingRound = (matchIdA, matchIdB) => {
    if (matchIdA === matchIdB) return '1/16决赛';
    const pathA = [matchIdA];
    let currA = matchIdA;
    while(REAL_BRACKET_PARENT_MAP[currA]) {
        currA = REAL_BRACKET_PARENT_MAP[currA];
        pathA.push(currA);
    }
    let currB = matchIdB;
    if (pathA.includes(currB)) return officialKnockoutRoundsFlat.find(m => m.id === `ko_${currB}`)?.round;
    while(REAL_BRACKET_PARENT_MAP[currB]) {
        currB = REAL_BRACKET_PARENT_MAP[currB];
        if (pathA.includes(currB)) return officialKnockoutRoundsFlat.find(m => m.id === `ko_${currB}`)?.round;
    }
    return '决赛';
};

const SLOT_TO_MATCH = {
  'A1': [79], 'A2': [73], 'A3': [74, 82],
  'B1': [85], 'B2': [73], 'B3': [74, 81],
  'C1': [76], 'C2': [75], 'C3': [74, 77, 79],
  'D1': [81], 'D2': [88], 'D3': [74, 77, 87],
  'E1': [74], 'E2': [78], 'E3': [79, 80, 81, 82, 85],
  'F1': [75], 'F2': [76], 'F3': [74, 77, 79, 81, 85],
  'G1': [82], 'G2': [88], 'G3': [77, 85],
  'H1': [84], 'H2': [86], 'H3': [77, 79, 80, 82],
  'I1': [77], 'I2': [78], 'I3': [79, 80, 81, 82, 85, 87],
  'J1': [86], 'J2': [84], 'J3': [80, 81, 82, 85, 87],
  'K1': [87], 'K2': [83], 'K3': [80],
  'L1': [80], 'L2': [83], 'L3': [87]
};

// ==========================================
// 3. 全景大树引擎 (极致自适应)
// ==========================================

const FullScreenBracket = ({ mode, r32Selections = {}, thirdPlaceAssignments = {}, predictions = {}, setPrediction, getTeamFromSlot, onMatchClick }) => {
    const [isPortrait, setIsPortrait] = useState(true);

    useEffect(() => {
        const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const resolveMatch = useCallback((matchId) => {
        const baseMatch = officialKnockoutRoundsFlat.find(m => m.id === matchId);
        if (!baseMatch) return null;

        if (mode === 'live') {
            return { ...baseMatch, home: getTeamFromSlot(baseMatch.homeStr), away: getTeamFromSlot(baseMatch.awayStr) };
        }

        const resolveSlot = (slotStr) => {
            if (!slotStr || slotStr === '?') return { id: `tbd_${Math.random()}`, name: '待定', flag: '❔', isPlaceholder: true };

            if (slotStr.startsWith('W')) {
                const prevMatch = resolveMatch(`ko_${slotStr.slice(1)}`);
                return prevMatch?.predictedWinner || { id: slotStr, name: `待决出`, flag: '❔', isPlaceholder: true };
            }
            if (slotStr.startsWith('L')) {
                const prevMatch = resolveMatch(`ko_${slotStr.slice(1)}`);
                if (prevMatch?.predictedWinner) return prevMatch.predictedWinner.id === prevMatch.home.id ? prevMatch.away : prevMatch.home;
                return { id: slotStr, name: `待决出`, flag: '❔', isPlaceholder: true };
            }

            if (mode === 'sandbox' && Object.keys(r32Selections).length > 0) {
                if (slotStr.length === 2 && /[A-L][1-4]/.test(slotStr)) {
                    if (r32Selections[slotStr]) return { ...r32Selections[slotStr], isPlaceholder: false };
                } else if (slotStr.includes('/')) {
                    const groupAssigned = thirdPlaceAssignments[matchId];
                    if (groupAssigned && r32Selections[`${groupAssigned}3`]) {
                        return { ...r32Selections[`${groupAssigned}3`], isPlaceholder: false };
                    }
                }
            }
            return getTeamFromSlot(slotStr);
        };

        const homeTeam = resolveSlot(baseMatch.homeStr);
        const awayTeam = resolveSlot(baseMatch.awayStr);

        let winner = predictions[matchId];
        if (winner && homeTeam && awayTeam && winner.id !== homeTeam.id && winner.id !== awayTeam.id) winner = null; 
        return { ...baseMatch, home: homeTeam, away: awayTeam, predictedWinner: winner };
    }, [mode, r32Selections, thirdPlaceAssignments, predictions, getTeamFromSlot]);

    const bracketMatrix = {
        top: [ 
            ['ko_73', 'ko_75', 'ko_74', 'ko_77', 'ko_83', 'ko_84', 'ko_81', 'ko_82'],
            ['ko_89', 'ko_90', 'ko_93', 'ko_94'],
            ['ko_97', 'ko_98'],
            ['ko_101']
        ],
        bottom: [ 
            ['ko_76', 'ko_78', 'ko_79', 'ko_80', 'ko_86', 'ko_88', 'ko_85', 'ko_87'],
            ['ko_91', 'ko_92', 'ko_95', 'ko_96'],
            ['ko_99', 'ko_100'],
            ['ko_102']
        ]
    };

    const getPos = (half, depth, index) => {
        const mainAxes = isPortrait ? [6, 18, 30, 42] : [8, 21, 34, 44]; 
        let main = mainAxes[depth];
        if (half === 'bottom') main = 100 - main;
        
        const crossAxes = [ 
            [6.25, 18.75, 31.25, 43.75, 56.25, 68.75, 81.25, 93.75], 
            [12.5, 37.5, 62.5, 87.5], 
            [25, 75], 
            [50] 
        ];
        let cross = crossAxes[depth][index];
        return isPortrait ? { x: cross, y: main } : { x: main, y: cross };
    };

    const nodes = [];
    const lines = [];
    const sw = isPortrait ? 0.3 : 0.2; 

    ['top', 'bottom'].forEach(half => {
        [0, 1, 2, 3].forEach(depth => {
            const matchIds = bracketMatrix[half][depth];
            matchIds.forEach((mId, index) => {
                const pos = getPos(half, depth, index);
                nodes.push( <BracketNode key={mId} match={resolveMatch(mId)} x={pos.x} y={pos.y} isPortrait={isPortrait} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} /> );
            });
        });

        [0, 1, 2].forEach(depth => {
            const numPairs = 4 / Math.pow(2, depth);
            for (let i = 0; i < numPairs; i++) {
                const A = getPos(half, depth, i * 2);
                const B = getPos(half, depth, i * 2 + 1);
                const Next = getPos(half, depth + 1, i);

                const matchA = resolveMatch(bracketMatrix[half][depth][i * 2]);
                const matchB = resolveMatch(bracketMatrix[half][depth][i * 2 + 1]);

                const winA = mode === 'sandbox' ? !!matchA?.predictedWinner : (matchA?.status === 'FINISHED' && matchA?.homeScore !== matchA?.awayScore);
                const winB = mode === 'sandbox' ? !!matchB?.predictedWinner : (matchB?.status === 'FINISHED' && matchB?.homeScore !== matchB?.awayScore);

                const colorA = winA ? '#eab308' : '#334155'; 
                const colorB = winB ? '#eab308' : '#334155';
                const colorNext = (winA || winB) ? '#eab308' : '#334155';

                if (isPortrait) {
                    const midY = (A.y + Next.y) / 2;
                    lines.push(<path key={`L-${half}-${depth}-${i}-A`} d={`M ${A.x} ${A.y} L ${A.x} ${midY} L ${Next.x} ${midY}`} stroke={colorA} strokeWidth={sw} fill="none" className="transition-all duration-500" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-B`} d={`M ${B.x} ${B.y} L ${B.x} ${midY} L ${Next.x} ${midY}`} stroke={colorB} strokeWidth={sw} fill="none" className="transition-all duration-500" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-N`} d={`M ${Next.x} ${midY} L ${Next.x} ${Next.y}`} stroke={colorNext} strokeWidth={sw} fill="none" className="transition-all duration-500" />);
                } else {
                    const midX = (A.x + Next.x) / 2;
                    lines.push(<path key={`L-${half}-${depth}-${i}-A`} d={`M ${A.x} ${A.y} L ${midX} ${A.y} L ${midX} ${Next.y}`} stroke={colorA} strokeWidth={sw} fill="none" className="transition-all duration-500" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-B`} d={`M ${B.x} ${B.y} L ${midX} ${B.y} L ${midX} ${Next.y}`} stroke={colorB} strokeWidth={sw} fill="none" className="transition-all duration-500" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-N`} d={`M ${midX} ${Next.y} L ${Next.x} ${Next.y}`} stroke={colorNext} strokeWidth={sw} fill="none" className="transition-all duration-500" />);
                }
            }
        });
    });

    const finalPos = { x: 50, y: 50 };
    const topSemi = getPos('top', 3, 0);
    const bottomSemi = getPos('bottom', 3, 0);
    
    const matchTopSemi = resolveMatch(bracketMatrix.top[3][0]);
    const matchBotSemi = resolveMatch(bracketMatrix.bottom[3][0]);
    
    const winTopSF = mode === 'sandbox' ? !!matchTopSemi?.predictedWinner : (matchTopSemi?.status === 'FINISHED' && matchTopSemi?.homeScore !== matchTopSemi?.awayScore);
    const winBotSF = mode === 'sandbox' ? !!matchBotSemi?.predictedWinner : (matchBotSemi?.status === 'FINISHED' && matchBotSemi?.homeScore !== matchBotSemi?.awayScore);

    lines.push(<line key="L-final-top" x1={topSemi.x} y1={topSemi.y} x2={finalPos.x} y2={finalPos.y} stroke={winTopSF ? '#eab308' : '#334155'} strokeWidth={sw} className="transition-all duration-500" />);
    lines.push(<line key="L-final-bot" x1={bottomSemi.x} y1={bottomSemi.y} x2={finalPos.x} y2={finalPos.y} stroke={winBotSF ? '#eab308' : '#334155'} strokeWidth={sw} className="transition-all duration-500" />);

    const finalMatch = resolveMatch('ko_104');
    const thirdPlaceMatch = resolveMatch('ko_103');
    const thirdPos = isPortrait ? { x: 84, y: 50 } : { x: 50, y: 84 };

    nodes.push(<BracketNode key="ko_104" match={finalMatch} x={finalPos.x} y={finalPos.y} isPortrait={isPortrait} mode={mode} isFinal setPrediction={setPrediction} onMatchClick={onMatchClick} />);
    nodes.push(<BracketNode key="ko_103" match={thirdPlaceMatch} x={thirdPos.x} y={thirdPos.y} isPortrait={isPortrait} mode={mode} isThirdPlace setPrediction={setPrediction} onMatchClick={onMatchClick} />);

    return (
        <div className="flex flex-col w-full h-[calc(100dvh-120px)] sm:h-[calc(100dvh-100px)] bg-slate-950 overflow-hidden relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {lines}
            </svg>
            {nodes}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-20">
                <RealTrophy className="w-32 h-32 lg:w-48 lg:h-48 grayscale opacity-40" />
            </div>
        </div>
    )
}

const BracketNode = ({ match, x, y, isPortrait, mode, isFinal, isThirdPlace, setPrediction, onMatchClick }) => {
    if (!match) return null;
    const isSandbox = mode === 'sandbox';
    const isLive = mode === 'live';
    const homeWinner = isSandbox ? match.predictedWinner?.id === match.home?.id : (isLive && match.status === 'FINISHED' && match.homeScore > match.awayScore);
    const awayWinner = isSandbox ? match.predictedWinner?.id === match.away?.id : (isLive && match.status === 'FINISHED' && match.awayScore > match.homeScore);

    const handleHomeClick = () => {
        if (isLive) { onMatchClick && onMatchClick(match); }
        if (isSandbox && !match.home.isPlaceholder) setPrediction(match.id, match.home);
    }
    const handleAwayClick = () => {
        if (isLive) { onMatchClick && onMatchClick(match); }
        if (isSandbox && !match.away.isPlaceholder) setPrediction(match.id, match.away);
    }

    const isChampionGenerated = isFinal && match.predictedWinner;

    return (
        <div 
            className={`absolute flex flex-col justify-center bg-slate-900 border ${isChampionGenerated ? 'border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.8)] scale-125 z-50' : isSandbox && match.predictedWinner ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : isFinal ? 'border-yellow-600/80 shadow-[0_0_15px_rgba(234,179,8,0.3)] z-40' : 'border-slate-700'} rounded overflow-hidden z-10 hover:z-50 hover:scale-150 transition-all duration-300`}
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', width: isPortrait ? '11.5vw' : '10vw', height: isPortrait ? '4.5vh' : '7vh', maxWidth: '100px', minWidth: '40px', minHeight: '26px' }}
        >
            {isFinal && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[6px] text-yellow-500 font-bold whitespace-nowrap bg-yellow-500/20 px-1 rounded flex items-center gap-0.5">
                {isChampionGenerated && <span>👑</span>} 王座
            </div>}
            {isThirdPlace && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[6px] text-slate-400 font-bold whitespace-nowrap bg-slate-800 px-1 rounded">季军战</div>}

            <div className={`flex flex-1 items-center justify-between px-0.5 border-b border-slate-800/80 cursor-pointer 
                ${isSandbox && !match.home.isPlaceholder && !homeWinner ? 'hover:bg-yellow-500/20' : ''} 
                ${!isSandbox && !match.home.isPlaceholder ? 'hover:bg-slate-800' : ''} 
                ${homeWinner ? 'bg-emerald-900/60 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}
                onClick={handleHomeClick}>
                <TeamFlag flag={match.home.flag} sizeClass="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                <span className={`text-[6px] lg:text-[8px] truncate ml-0.5 flex-1 leading-none ${homeWinner ? 'font-bold text-yellow-400' : match.home.isPlaceholder ? 'text-slate-500' : 'text-slate-200'}`} title={match.home.name}>{match.home.name}</span>
                {isLive && <span className={`text-[6px] lg:text-[8px] ml-0.5 leading-none ${homeWinner ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? match.homeScore : '-'}</span>}
            </div>

            <div className={`flex flex-1 items-center justify-between px-0.5 cursor-pointer 
                ${isSandbox && !match.away.isPlaceholder && !awayWinner ? 'hover:bg-yellow-500/20' : ''} 
                ${!isSandbox && !match.away.isPlaceholder ? 'hover:bg-slate-800' : ''} 
                ${awayWinner ? 'bg-emerald-900/60 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}
                onClick={handleAwayClick}>
                <TeamFlag flag={match.away.flag} sizeClass="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                <span className={`text-[6px] lg:text-[8px] truncate ml-0.5 flex-1 leading-none ${awayWinner ? 'font-bold text-yellow-400' : match.away.isPlaceholder ? 'text-slate-500' : 'text-slate-200'}`} title={match.away.name}>{match.away.name}</span>
                {isLive && <span className={`text-[6px] lg:text-[8px] ml-0.5 leading-none ${awayWinner ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? match.awayScore : '-'}</span>}
            </div>
        </div>
    )
}

// ==========================================
// 4. 交互模块：推演与宿命 
// ==========================================

const TeamSearchInput = ({ value, onChange, onSelect, selectedTeam, placeholder, allTeams }) => {
    const filtered = value ? allTeams.filter(t => t.name.includes(value) || t.id.includes(value.toLowerCase())).slice(0, 5) : [];
    
    if (selectedTeam) {
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-800 border-2 border-emerald-500/50 rounded-2xl relative w-full h-24 shadow-lg">
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(null); }} className="absolute top-2 right-2 text-slate-400 hover:text-white bg-slate-900 rounded-full p-1 transition-colors z-10"><X className="w-4 h-4"/></button>
                <TeamFlag flag={selectedTeam.flag} sizeClass="w-8 h-8 mb-2" />
                <span className="font-bold text-white text-sm">{selectedTeam.name}</span>
                <span className="text-[10px] text-emerald-400 absolute bottom-2 left-3 font-mono">{selectedTeam.group}组</span>
            </div>
        )
    }

    return (
        <div className="relative w-full h-24 flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input 
                type="text" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {filtered.length > 0 && (
                <div className="absolute top-[calc(50%+30px)] left-0 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50">
                    {filtered.map(t => (
                        <button type="button" key={t.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(t); onChange(''); }} className="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center transition-all border-b border-slate-700/50 last:border-0">
                            <TeamFlag flag={t.flag} sizeClass="w-5 h-5 mr-3" />
                            <span className="text-slate-200 text-sm font-bold">{t.name}</span>
                            <span className="ml-auto text-xs text-slate-500 font-mono">{t.group}组</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
};

const GroupRankingGame = ({ groups, onComplete }) => {
    const groupLetters = Object.keys(groups);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentGroup = groupLetters[currentIndex];
    const originalTeams = groups[currentGroup].teams.map(t => ({...t, isPlaceholder: false}));
    
    const [slots, setSlots] = useState([null, null, null, null]);
    const [allRankings, setAllRankings] = useState({});

    const handleTeamClick = (team) => {
        if (slots.find(t => t?.id === team.id)) return;
        const emptyIdx = slots.indexOf(null);
        if (emptyIdx !== -1) {
            const newSlots = [...slots];
            newSlots[emptyIdx] = team;
            setSlots(newSlots);
        }
    };

    const handleSlotClick = (idx) => {
        const newSlots = [...slots];
        newSlots[idx] = null;
        setSlots(newSlots);
    };

    const handleRandomize = () => {
        const shuffled = [...originalTeams].sort(() => 0.5 - Math.random());
        setSlots(shuffled);
    };

    const handleNext = () => {
        const newRankings = { ...allRankings, [currentGroup]: slots };
        setAllRankings(newRankings);
        if (currentIndex < groupLetters.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSlots([null, null, null, null]);
        } else {
            onComplete(newRankings);
        }
    }

    return (
        <div className="flex flex-col items-center max-w-lg mx-auto w-full animate-fade-in px-4 pt-4 sm:pt-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-wider flex items-center"><GitBranch className="w-6 h-6 mr-2 text-emerald-400"/>排兵布阵阶段</h2>
            <p className="text-slate-400 text-sm mb-6 text-center">你的选择将直接决定104场鏖战的大树格局！</p>
            
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(currentIndex / groupLetters.length) * 100}%` }}></div>
                </div>

                <div className="flex justify-between items-center mb-6 mt-2">
                    <h3 className="text-xl font-bold text-emerald-400">决战 {currentGroup} 组</h3>
                    <button onClick={handleRandomize} className="text-xs text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-full flex items-center hover:bg-blue-600 hover:text-white transition-all"><Dices className="w-3.5 h-3.5 mr-1" /> 一键随机</button>
                </div>

                <div className="space-y-3 mb-8">
                    {[0, 1, 2, 3].map(i => {
                        const t = slots[i];
                        return (
                            <div key={`slot-${i}`} onClick={() => t && handleSlotClick(i)} className={`flex items-center p-3 rounded-lg border-2 transition-all ${t ? 'border-emerald-500/50 bg-emerald-900/20 cursor-pointer hover:border-red-500/50' : 'border-dashed border-slate-700 bg-slate-950/50'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs mr-3 shrink-0 ${i < 2 ? 'bg-emerald-500 text-emerald-950' : i === 2 ? 'bg-yellow-500 text-yellow-950' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</div>
                                {t ? (
                                    <div className="flex items-center flex-1 animate-fade-in">
                                        <TeamFlag flag={t.flag} sizeClass="w-6 h-6 mr-2" />
                                        <span className="font-bold text-white text-sm">{t.name}</span>
                                        <span className="ml-auto text-[10px] text-slate-500">点击撤回</span>
                                    </div>
                                ) : (
                                    <span className="text-slate-600 text-sm font-bold flex-1">点击下方球队进入席位...</span>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {originalTeams.map(t => {
                        const isSelected = slots.find(s => s?.id === t.id);
                        return (
                            <button key={t.id} disabled={isSelected} onClick={() => handleTeamClick(t)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-slate-800 bg-slate-950 opacity-30 grayscale cursor-not-allowed' : 'border-slate-600 bg-slate-800 hover:border-blue-400 hover:bg-slate-700 hover:-translate-y-1 shadow-lg'}`}>
                                <TeamFlag flag={t.flag} sizeClass="w-8 h-8 mb-2 drop-shadow-lg" />
                                <span className="font-bold text-slate-200 text-xs">{t.name}</span>
                            </button>
                        )
                    })}
                </div>

                {slots.every(s => s !== null) && (
                    <button onClick={handleNext} className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-fade-in flex items-center justify-center text-sm transition-all active:scale-95">
                        确认 {currentGroup} 组排名 <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                )}
            </div>
        </div>
    )
}

const thirdPlaceConstraints = {
  'ko_74': ['A', 'B', 'C', 'D', 'F'],
  'ko_77': ['C', 'D', 'F', 'G', 'H'],
  'ko_79': ['C', 'E', 'F', 'H', 'I'],
  'ko_80': ['E', 'H', 'I', 'J', 'K'],
  'ko_81': ['B', 'E', 'F', 'I', 'J'],
  'ko_82': ['A', 'E', 'H', 'I', 'J'],
  'ko_85': ['E', 'F', 'G', 'I', 'J'],
  'ko_87': ['D', 'E', 'I', 'J', 'L']
};

function assignThirdPlaceTeams(selectedGroups) {
   const slots = Object.keys(thirdPlaceConstraints);
   let assignment = {};
   let found = false;
   
   function backtrack(slotIndex) {
       if (slotIndex === slots.length) { found = true; return true; }
       const slot = slots[slotIndex];
       const allowed = thirdPlaceConstraints[slot];
       
       for (let i = 0; i < selectedGroups.length; i++) {
           const g = selectedGroups[i];
           if (allowed.includes(g) && !Object.values(assignment).includes(g)) {
               assignment[slot] = g;
               if (backtrack(slotIndex + 1)) return true;
               delete assignment[slot];
           }
       }
       return false;
   }
   
   backtrack(0);
   if (!found) {
       let unassigned = [...selectedGroups];
       slots.forEach(slot => {
           if (!assignment[slot]) assignment[slot] = unassigned.pop();
       });
   }
   return assignment;
}

function PredictionSandbox({ getTeamFromSlot, groups, setGeneratedImage }) {
  const [phase, setPhase] = useState('intro'); // intro -> ranking -> select_thirds -> generating -> bracket
  const [sandboxRankings, setSandboxRankings] = useState({});
  const [selectedThirds, setSelectedThirds] = useState([]);
  const [thirdPlaceAssignments, setThirdPlaceAssignments] = useState({});
  const [predictions, setPredictions] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleStart = () => setPhase('ranking');

  const handleRankingComplete = (groupRankings) => {
      const absoluteRankings = {};
      Object.keys(groupRankings).forEach(group => {
          groupRankings[group].forEach((team, index) => {
              if (team) absoluteRankings[`${group}${index + 1}`] = team;
          });
      });
      setSandboxRankings(absoluteRankings);
      setPhase('select_thirds');
  };

  const finalizeThirds = () => {
      setThirdPlaceAssignments(assignThirdPlaceTeams(selectedThirds));
      setPhase('generating');
      setTimeout(() => setPhase('bracket'), 1500);
  };

  const handleReset = () => {
     if (window.confirm("确定要清空推演记录，重新排兵布阵吗？")) {
         setPredictions({}); setSandboxRankings({}); setSelectedThirds([]); setThirdPlaceAssignments({});
         setPhase('intro'); setShowCompletionModal(false);
     }
  };

  const finalMatchWinner = predictions['ko_104']; 

  useEffect(() => {
      if (finalMatchWinner) {
          const timer = setTimeout(() => setShowCompletionModal(true), 1000);
          return () => clearTimeout(timer);
      }
  }, [finalMatchWinner, predictions]);

  const handleGenerateImage = async () => {
      try {
        const watermark = document.getElementById('watermark-capture-prediction');
        if (watermark) watermark.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 200));
        const element = document.getElementById('capture-prediction');
        const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617', useCORS: true });
        if (watermark) watermark.style.display = 'none';
        setGeneratedImage(canvas.toDataURL('image/png'));
        setShowCompletionModal(false);
      } catch (e) { alert("生成长图失败，请重试！"); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
        {phase === 'bracket' && (
            <div className="flex justify-between items-center bg-slate-900/80 px-4 py-2 border-b border-slate-800 z-50 shrink-0 shadow-lg">
                <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                    <span className="font-bold text-white text-xs sm:text-base">神杯之路推演板</span>
                </div>
                <button onClick={handleReset} className="text-[10px] sm:text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-full flex items-center transition-all"><RotateCcw className="w-3 h-3 mr-1" /> 清空重推</button>
            </div>
        )}

        <div className="flex-1 w-full h-full relative overflow-y-auto">
            {phase === 'intro' && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in pt-10 pb-20">
                    <RealTrophy className="w-32 h-32 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-bounce" />
                    <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-widest mb-4">冠军推演沙盘</h2>
                    <p className="text-slate-400 text-sm sm:text-base mb-10 max-w-md leading-relaxed">首创沉浸式推演小游戏！先为 12 个小组排兵布阵并选拔最佳第三名，然后自由点击晋级，决出2026世界之王！</p>
                    <button onClick={handleStart} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-lg px-10 py-4 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center">
                        开始排兵布阵 <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            )}

            {phase === 'ranking' && (
                <div className="h-full overflow-y-auto pb-20"><GroupRankingGame groups={groups} onComplete={handleRankingComplete} /></div>
            )}

            {phase === 'select_thirds' && (
                <div className="flex flex-col items-center max-w-2xl mx-auto w-full animate-fade-in px-4 pt-4 sm:pt-10 h-full pb-20">
                    <h2 className="text-xl sm:text-3xl font-black text-white mb-2 flex items-center"><Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-400"/>选取8支晋级第三名</h2>
                    <p className="text-slate-400 text-xs sm:text-sm mb-6 text-center">48强扩军特有规则：12个小组的第三名中，成绩最好的 8 支球队将晋级 32 强。</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full mb-8">
                        {Object.keys(groups).map(g => {
                            const team = sandboxRankings[`${g}3`];
                            if (!team) return null;
                            const isSelected = selectedThirds.includes(g);
                            return (
                                <button key={g} onClick={() => {
                                    if (isSelected) setSelectedThirds(selectedThirds.filter(x => x !== g));
                                    else if (selectedThirds.length < 8) setSelectedThirds([...selectedThirds, g]);
                                }} className={`p-2 sm:p-3 rounded-xl border-2 flex flex-col items-center transition-all ${isSelected ? 'border-yellow-500 bg-yellow-900/30 shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-105' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <TeamFlag flag={team.flag} sizeClass="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                                    <span className="font-bold text-[10px] sm:text-xs text-white truncate w-full text-center">{team.name}</span>
                                    <span className="text-[9px] text-slate-400 mt-1">{g}组第三</span>
                                    {isSelected && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-yellow-500" />}
                                </button>
                            )
                        })}
                    </div>
                    <button disabled={selectedThirds.length !== 8} onClick={finalizeThirds} className={`w-full py-3.5 rounded-xl font-black transition-all ${selectedThirds.length === 8 ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                        {selectedThirds.length === 8 ? '生成最终 32 强对阵树' : `已选 ${selectedThirds.length} / 8 支球队`}
                    </button>
                </div>
            )}

            {phase === 'generating' && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in pb-20">
                    <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">正在将 32 强名单导入国际足联落位图...</h3>
                </div>
            )}

            {phase === 'bracket' && (
                <div id="capture-prediction" className="w-full h-full flex flex-col relative bg-slate-950 px-1 sm:px-2 pt-2 sm:pt-4 overflow-hidden">
                    <div className="text-center mb-1 shrink-0 z-20 pointer-events-none bg-slate-950/80 backdrop-blur-md rounded-b-2xl pb-2 border-b border-slate-800 sticky top-0 left-0 right-0 max-w-[600px] mx-auto">
                        <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-wider">我的2026冠军预测卷</h2>
                    </div>
                    <div className="flex-1 w-full relative mx-auto"><FullScreenBracket mode="sandbox" r32Selections={sandboxRankings} thirdPlaceAssignments={thirdPlaceAssignments} predictions={predictions} setPrediction={(mId, team) => setPredictions(p => ({...p, [mId]: team}))} getTeamFromSlot={getTeamFromSlot} /></div>
                    <div id="watermark-capture-prediction" className="hidden w-full justify-center pb-6 z-[100] bg-slate-900 mt-10"><GlobalQRLogo /></div>
                </div>
            )}
        </div>

        {phase === 'bracket' && !finalMatchWinner && (
            <button onClick={handleGenerateImage} className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] text-white px-6 py-3 rounded-full font-black text-xs sm:text-sm flex items-center transition-all bg-gradient-to-r from-yellow-600 to-orange-500 shadow-[0_0_25px_rgba(234,179,8,0.5)] whitespace-nowrap`}>
                <ImageIcon className="w-4 h-4 mr-2" /> <span>随时生成并保存推演长图</span>
            </button>
        )}

        {showCompletionModal && finalMatchWinner && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCompletionModal(false)}>
                <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-6 sm:p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowCompletionModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-5 h-5"/></button>
                    <RealTrophy className="w-24 h-24 mb-4 drop-shadow-2xl animate-bounce" />
                    <h3 className="text-2xl font-black text-white mb-2">神杯易主，推演完成！</h3>
                    <p className="text-sm text-slate-400 mb-6">你预测 <span className="font-bold text-yellow-400">{finalMatchWinner.name}</span> 将捧起2026年大力神杯。</p>
                    <button onClick={handleGenerateImage} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-950 font-black text-lg py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center mb-3">
                        <ImageIcon className="w-5 h-5 mr-2" /> 生成并保存带二维码长图
                    </button>
                    <button onClick={() => setShowCompletionModal(false)} className="text-xs text-slate-500 hover:text-slate-300">返回查看大树</button>
                </div>
            </div>
        )}
    </div>
  );
}

function TeamMeetingPredictor({ groups, setGeneratedImage }) {
    const [teamA, setTeamA] = useState(null);
    const [teamB, setTeamB] = useState(null);
    const [searchA, setSearchA] = useState('');
    const [searchB, setSearchB] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState(null);

    const allTeams = useMemo(() => {
        let teams = [];
        Object.keys(groups).forEach(g => { groups[g].teams.forEach(t => teams.push({...t, group: g})); });
        return teams;
    }, [groups]);

    const calculateMeetings = () => {
        if (!teamA || !teamB) return;
        setIsCalculating(true);
        
        setTimeout(() => {
            const ranks = [1, 2, 3];
            let scenarios = [];

            ranks.forEach(rankA => {
                ranks.forEach(rankB => {
                    if (teamA.group === teamB.group && rankA === rankB) return;
                    
                    const slotsA = SLOT_TO_MATCH[`${teamA.group}${rankA}`] || [];
                    const slotsB = SLOT_TO_MATCH[`${teamB.group}${rankB}`] || [];
                    
                    let possibleRounds = new Set();
                    
                    slotsA.forEach(m1 => {
                        slotsB.forEach(m2 => {
                            const meetRound = getMeetingRound(m1, m2);
                            if (meetRound) possibleRounds.add(meetRound);
                        });
                    });

                    const roundOrder = { '1/16决赛':1, '1/8决赛':2, '1/4决赛':3, '半决赛':4, '决赛':5 };
                    const sortedRounds = Array.from(possibleRounds).sort((a,b) => roundOrder[a] - roundOrder[b]);

                    if (sortedRounds.length > 0) {
                        const earliest = sortedRounds[0];
                        let meetAtStr = earliest;
                        if (earliest === '决赛') {
                            meetAtStr = '分属不同半区，最早只能在决赛相逢';
                        } else if (sortedRounds.length > 1) {
                            meetAtStr = sortedRounds.join(' 或 ');
                        }
                        scenarios.push({
                            rankA, rankB, 
                            meetAt: meetAtStr,
                            earliestRound: earliest
                        });
                    }
                });
            });
            setResults(scenarios); setIsCalculating(false);
        }, 800); 
    };

    const handleClear = () => { setTeamA(null); setTeamB(null); setSearchA(''); setSearchB(''); setResults(null); };

    const handleGenerateImage = async () => {
      try {
        const watermark = document.getElementById('watermark-capture-meeting');
        if (watermark) watermark.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 200));
        const element = document.getElementById('capture-meeting');
        const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617', useCORS: true });
        if (watermark) watermark.style.display = 'none';
        setGeneratedImage(canvas.toDataURL('image/png'));
      } catch (e) { alert("生成长图失败，请重试！"); }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 relative overflow-y-auto custom-scrollbar pb-24">
            <div className="text-center pt-6 pb-4 px-4 shrink-0">
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 tracking-wider flex items-center justify-center mb-2">
                    <Swords className="w-6 h-6 mr-2 text-red-500"/>宿命对决：相遇推演
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">精准计算两支主队在104场鏖战中，最早可能发生遭遇战的轮次。严格依据国际足联 2026 最新上下半区分区法则计算。</p>
            </div>

            <div className="px-4 max-w-2xl mx-auto w-full z-20 flex-shrink-0">
                <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="w-full sm:w-1/2">
                        <TeamSearchInput value={searchA} onChange={setSearchA} onSelect={setTeamA} selectedTeam={teamA} placeholder="输入第一支球队名..." allTeams={allTeams} />
                    </div>
                    <div className="shrink-0 hidden sm:flex text-slate-600 font-black italic text-2xl">VS</div>
                    <div className="w-full sm:w-1/2">
                        <TeamSearchInput value={searchB} onChange={setSearchB} onSelect={setTeamB} selectedTeam={teamB} placeholder="输入第二支球队名..." allTeams={allTeams} />
                    </div>
                </form>

                <div className="flex gap-3">
                    <button onClick={calculateMeetings} disabled={!teamA || !teamB || isCalculating} className={`flex-1 py-4 rounded-xl font-black text-lg flex items-center justify-center transition-all shadow-lg ${teamA && teamB ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                        {isCalculating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Swords className="w-5 h-5 mr-2" />}
                        {isCalculating ? '正在穷举二叉树...' : '开始推演宿命相遇点'}
                    </button>
                    {results && <button onClick={handleClear} className="px-6 bg-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-all font-bold">重置</button>}
                </div>
            </div>

            {results && !isCalculating && (
                <div className="mt-8 px-2 sm:px-4 max-w-2xl mx-auto w-full animate-fade-in relative z-10">
                    <div id="capture-meeting" className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden relative shadow-2xl pb-4">
                        <div className="bg-slate-800/80 p-6 text-center border-b border-slate-700">
                            <h3 className="text-xl font-black text-white mb-4">宿命相遇可能性报告</h3>
                            <div className="flex items-center justify-center space-x-6">
                                <div className="flex flex-col items-center">
                                    <TeamFlag flag={teamA.flag} sizeClass="w-10 h-10 mb-1 shadow-lg" />
                                    <span className="text-sm font-bold text-slate-300">{teamA.name}</span>
                                </div>
                                <span className="text-2xl font-black text-red-500 italic">VS</span>
                                <div className="flex flex-col items-center">
                                    <TeamFlag flag={teamB.flag} sizeClass="w-10 h-10 mb-1 shadow-lg" />
                                    <span className="text-sm font-bold text-slate-300">{teamB.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-4 bg-slate-950">
                            <div className="grid grid-cols-1 gap-2">
                                {results.map((res, idx) => {
                                    const isFinal = res.earliestRound === '决赛';
                                    const isEarly = res.meetAt.includes('1/16') || res.meetAt.includes('1/8');
                                    return (
                                    <div key={idx} className={`flex items-center p-3 rounded-xl border ${isFinal ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-slate-900 border-slate-800'} transition-all`}>
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center text-[10px] sm:text-sm font-bold text-slate-300">
                                            <div className="flex items-center">
                                                <span className="w-14 sm:w-16 truncate">{teamA.name}</span>
                                                <span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 mx-1 sm:mx-2 text-[9px] sm:text-[10px]">第{res.rankA}名晋级</span>
                                            </div>
                                            <span className="hidden sm:inline text-slate-600 mx-2">+</span>
                                            <div className="flex items-center mt-2 sm:mt-0">
                                                <span className="w-14 sm:w-16 truncate">{teamB.name}</span>
                                                <span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 mx-1 sm:mx-2 text-[9px] sm:text-[10px]">第{res.rankB}名晋级</span>
                                            </div>
                                        </div>
                                        <div className={`ml-auto shrink-0 flex items-center justify-end w-32 sm:w-48 font-black text-[10px] sm:text-sm ${isFinal ? 'text-yellow-400' : isEarly ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isFinal ? '🏆 ' : isEarly ? '⚔️ ' : '🎯 '} {res.meetAt}
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                        <div id="watermark-capture-meeting" className="hidden w-full bg-slate-900 justify-center py-6 border-t border-slate-800 mt-4">
                            <GlobalQRLogo />
                        </div>
                    </div>
                </div>
            )}
            
            {results && !isCalculating && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
                   <button onClick={handleGenerateImage} className="w-full bg-gradient-to-r from-yellow-600 to-orange-500 text-white font-black py-3.5 rounded-full shadow-[0_0_25px_rgba(234,179,8,0.5)] hover:scale-[1.01] transition-all flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 mr-2" /> 生成并保存带二维码的长图
                    </button>
                </div>
            )}
        </div>
    )
}

// ==========================================
// 5. 视图模块：规则与淘汰赛列表
// ==========================================

function RulesView({ groups, knockouts, getTeamFromSlot, setGeneratedImage }) {
  const [subTab, setSubTab] = useState('rules');

  const grouped104 = useMemo(() => {
    const allGroupMatches = [];
    Object.keys(groups).forEach(g => { groups[g].matches.forEach(m => { allGroupMatches.push({ ...m, groupName: g }); }); });
    const allKnockoutMatches = ['r32', 'r16', 'qf', 'sf', 'third', 'final'].flatMap(round => 
      (knockouts[round] || []).map(m => ({ ...m, home: getTeamFromSlot(m.homeStr), away: getTeamFromSlot(m.awayStr) }))
    );
    const all104 = [...allGroupMatches, ...allKnockoutMatches].sort((a,b) => a.timeStr.localeCompare(b.timeStr));
    return groupByDate(all104);
  }, [groups, knockouts, getTeamFromSlot]);

  const handleGenerateImage = async () => {
    try {
      const watermark = document.getElementById('watermark-capture-rules');
      if (watermark) watermark.style.display = 'block';
      await new Promise(resolve => setTimeout(resolve, 200));
      const element = document.getElementById('capture-rules');
      const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617', useCORS: true });
      if (watermark) watermark.style.display = 'none';
      setGeneratedImage(canvas.toDataURL('image/png'));
    } catch (e) { alert("生成长图失败，请重试！"); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative">
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex justify-center z-10 shrink-0">
        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button onClick={() => setSubTab('rules')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ${subTab === 'rules' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}><BookOpen className="w-4 h-4 mr-1.5" /> 赛事规则说明</button>
          <button onClick={() => setSubTab('schedule')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${subTab === 'schedule' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}><CalendarDays className="w-4 h-4 mr-1.5" /> 104场全赛程长图</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar pb-24">
        <div id="capture-rules" className="max-w-4xl lg:max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in bg-slate-950 pb-6">
          {subTab === 'rules' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 flex items-center"><Shield className="w-8 h-8 mr-3 text-emerald-500" /> 2026 美加墨世界杯规则</h2>
              <div className="space-y-6 relative z-10">
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
                  <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center"><Users className="w-5 h-5 mr-2" /> 48强与12大分组</h3>
                  <p className="text-slate-400">首次扩军至 48 支队伍，分为 12 个小组，赛事总计 104 场对决。</p>
                </div>
                <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20">
                  <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center"><ListOrdered className="w-5 h-5 mr-2" /> 晋级 32 强区规则</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/40 p-4 rounded-lg border-l-4 border-emerald-500"><h4 className="font-bold text-white mb-2">✅ 前两名直通</h4><p className="text-sm text-slate-400">12个小组的前两名直接晋级 32 强。</p></div>
                    <div className="bg-yellow-950/40 p-4 rounded-lg border-l-4 border-yellow-500"><h4 className="font-bold text-white mb-2">⚠️ 小组第三待定</h4><p className="text-sm text-slate-400">成绩最好的 8 个小组第三获得复活晋级资格。</p></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 sm:p-8 shadow-2xl">
              <h2 className="text-xl sm:text-3xl font-black text-blue-400 mb-8 text-center tracking-wider">2026 世界杯 104场 赛程总览</h2>
              <div className="space-y-6">
                {Object.keys(grouped104).map((date, idx) => (
                   <div key={`all-${date}`} className={`p-4 rounded-xl border border-slate-800/60 ${idx % 2 === 0 ? 'bg-slate-900/80' : 'bg-slate-800/40'}`}>
                      <h4 className="text-emerald-400 font-bold mb-4 flex items-center text-sm sm:text-base border-b border-slate-700/50 pb-2"><CalendarDays className="w-4 h-4 mr-2" /> {date}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {grouped104[date].map(m => (
                            <div key={`all-m-${m.id}`} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center text-xs sm:text-sm">
                               <div className="flex items-center space-x-1.5 w-[42%] justify-end"><span className={`truncate ${m.home?.isPlaceholder ? 'text-slate-500' : 'text-slate-200 font-bold'}`}>{m.home?.name || m.homeStr}</span><TeamFlag flag={m.home?.flag} sizeClass="w-4 h-4" /></div>
                               <div className="flex flex-col items-center w-[16%]"><span className="text-[9px] font-mono text-slate-500 mb-0.5">{m.timeStr.split(' ')[1]}</span><span className="text-[10px] font-black text-slate-600 bg-slate-900 px-1 rounded">VS</span></div>
                               <div className="flex items-center space-x-1.5 w-[42%] justify-start"><TeamFlag flag={m.away?.flag} sizeClass="w-4 h-4" /><span className={`truncate ${m.away?.isPlaceholder ? 'text-slate-500' : 'text-slate-200 font-bold'}`}>{m.away?.name || m.awayStr}</span></div>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
              </div>
            </div>
          )}
          <div id="watermark-capture-rules" className="hidden mt-8 w-full"><GlobalQRLogo /></div>
        </div>
      </div>
      <button onClick={handleGenerateImage} className="absolute bottom-6 right-4 sm:right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 sm:px-6 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center transition-all active:scale-95">
        <ImageIcon className="w-4 h-4 mr-1.5" /> <span>生成并保存长图</span>
      </button>
    </div>
  );
}

function KnockoutScheduleView({ knockouts, getTeamFromSlot, onMatchClick, setGeneratedImage }) {
  const [viewMode, setViewMode] = useState('tree'); 
  const roundTabs = ['1/16决赛', '1/8决赛', '1/4决赛', '半决赛', '季军战', '决赛'];
  const [activeRound, setActiveRound] = useState('1/16决赛');
  const currentMatches = knockouts.filter(m => m.round === activeRound);

  const handleGenerateImage = async () => {
    try {
      const watermark = document.getElementById('watermark-capture-ko');
      if (watermark) watermark.style.display = 'block';
      await new Promise(resolve => setTimeout(resolve, 200));
      const element = document.getElementById('capture-ko');
      const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617', useCORS: true });
      if (watermark) watermark.style.display = 'none';
      setGeneratedImage(canvas.toDataURL('image/png'));
    } catch (e) { alert("生成长图失败，请重试！"); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 pb-0 sm:pb-0 relative overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex justify-center z-20 shrink-0">
        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button onClick={() => setViewMode('tree')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-8 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ${viewMode === 'tree' ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
            <GitBranch className="w-4 h-4 mr-1.5" /> 全景对阵树
          </button>
          <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-8 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${viewMode === 'list' ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
            <ListOrdered className="w-4 h-4 mr-1.5" /> 实时对阵列表
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative overflow-hidden">
        {viewMode === 'tree' ? (
           <FullScreenBracket mode="live" getTeamFromSlot={getTeamFromSlot} onMatchClick={onMatchClick} />
        ) : (
           <div className="h-full flex flex-col">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-800 shrink-0 bg-slate-900 px-2 py-3 gap-2 sticky top-0 z-10">
                {roundTabs.map(r => (
                  <button key={r} onClick={() => setActiveRound(r)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeRound === r ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 animate-fade-in custom-scrollbar pb-20">
                <div id="capture-ko" className="max-w-3xl mx-auto bg-slate-950 pb-10">
                  <div className="text-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-purple-400 mt-4 tracking-wider">{activeRound} 实况对阵表</h2>
                    <p className="text-xs text-slate-500 mt-1">根据底层 API 实时生成对决名单</p>
                  </div>
                  <div className="space-y-4">
                    {currentMatches.map((match) => {
                      const homeTeam = getTeamFromSlot(match.homeStr);
                      const awayTeam = getTeamFromSlot(match.awayStr);
                      return (
                        <div key={match.id} onClick={() => onMatchClick({ ...match, homeTeam, awayTeam })} className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 cursor-pointer transition-colors shadow-sm overflow-hidden group">
                          <div className="bg-slate-800/50 px-4 py-1.5 border-b border-slate-700 flex justify-between items-center">
                             <span className="text-[10px] text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1 opacity-70"/> {match.timeStr}</span>
                             <span className="text-[9px] text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20 font-bold">第 {match.id.replace('ko_', '')} 场</span>
                          </div>
                          <div className="flex items-center justify-between p-4 gap-3">
                            <div className="flex flex-col items-center w-[40%] gap-2">
                               <TeamFlag flag={homeTeam.flag} sizeClass="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                               <div className="text-sm font-bold text-center group-hover:text-purple-300">{homeTeam.isPlaceholder ? homeTeam.placeholderName : homeTeam.name}</div>
                            </div>
                            <div className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg font-black min-w-[50px] text-center text-slate-300 text-lg">VS</div>
                            <div className="flex flex-col items-center w-[40%] gap-2">
                               <TeamFlag flag={awayTeam.flag} sizeClass="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
                               <div className="text-sm font-bold text-center group-hover:text-purple-300">{awayTeam.isPlaceholder ? awayTeam.placeholderName : awayTeam.name}</div>
                            </div>
                          </div>
                          <div className="bg-slate-950 text-[10px] text-center py-1 text-slate-500 group-hover:text-purple-400 transition-colors">点击查看两队近期战绩与历史交锋 &gt;</div>
                        </div>
                      );
                    })}
                    {currentMatches.length === 0 && <div className="text-center text-slate-500 py-10 text-sm">此阶段对阵生成中...</div>}
                  </div>
                  <div id="watermark-capture-ko" className="hidden w-full bg-slate-900 justify-center py-6 border-t border-slate-800 mt-6"><GlobalQRLogo /></div>
                </div>
              </div>
           </div>
        )}
      </div>
      
      {viewMode === 'list' && (
          <button onClick={handleGenerateImage} className="absolute bottom-6 right-4 sm:right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center transition-all active:scale-95">
            <ImageIcon className="w-4 h-4 mr-1.5" /> <span>保存对阵图</span>
          </button>
      )}
    </div>
  );
}

// ==========================================
// 6. 抽屉与 API 数据展示层 
// ==========================================

function MatchDetailDrawer({ match, onClose, onTeamClick, isTop }) {
  if (!match) return null;
  const zIndex = isTop ? 'z-[100]' : 'z-[90]';
  const hTeam = match.homeTeam || match.home;
  const aTeam = match.awayTeam || match.away;
  
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${zIndex}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 sm:p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${zIndex} max-h-[85vh] overflow-y-auto custom-scrollbar`}>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 opacity-50" />
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-5 h-5"/></button>
        
        <div className="text-center mb-6">
          <p className="text-emerald-400 font-bold text-sm bg-emerald-900/20 inline-block px-3 py-1 rounded-full border border-emerald-500/30">{match.round || '比赛数据中心'}</p>
          <p className="text-slate-400 text-xs mt-3 flex items-center justify-center"><Clock className="w-3.5 h-3.5 mr-1" /> {match.timeStr} • {match.venue || '美加墨赛区'}</p>
        </div>

        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-inner">
           <div className="flex flex-col items-center gap-2 w-1/3 cursor-pointer hover:scale-105 transition-transform" onClick={() => onTeamClick(hTeam)}>
              <TeamFlag name={hTeam?.name} flag={hTeam?.flag} sizeClass="w-12 h-12 sm:w-16 sm:h-16" />
              <span className="font-bold text-sm sm:text-base text-center text-slate-200 mt-2">{hTeam?.isPlaceholder ? hTeam.placeholderName : hTeam?.name}</span>
              <span className="text-[10px] text-blue-400">点击看数据</span>
           </div>
           <div className="w-1/3 text-center">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-1">
                 {match.homeScore !== undefined && match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
              </div>
              <div className="text-[10px] text-slate-500">{match.status === 'FINISHED' ? '已结束' : match.status === 'LIVE' ? '进行中' : '未开赛'}</div>
           </div>
           <div className="flex flex-col items-center gap-2 w-1/3 cursor-pointer hover:scale-105 transition-transform" onClick={() => onTeamClick(aTeam)}>
              <TeamFlag name={aTeam?.name} flag={aTeam?.flag} sizeClass="w-12 h-12 sm:w-16 sm:h-16" />
              <span className="font-bold text-sm sm:text-base text-center text-slate-200 mt-2">{aTeam?.isPlaceholder ? aTeam.placeholderName : aTeam?.name}</span>
              <span className="text-[10px] text-blue-400">点击看数据</span>
           </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
           <h4 className="text-white font-bold mb-4 flex items-center border-b border-slate-700 pb-2"><Activity className="w-4 h-4 mr-2 text-red-400" /> 智能数据前瞻 (API加载区)</h4>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                 <span className="text-slate-400">历史交锋 (H2H)</span>
                 <span className="font-mono text-slate-300">胜 0 - 平 0 - 负 0 (模拟)</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                 <span className="text-slate-400">主队近期战绩</span>
                 <span className="font-mono text-emerald-400">W W D W L</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                 <span className="text-slate-400">客队近期战绩</span>
                 <span className="font-mono text-yellow-400">D W L W W</span>
              </div>
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-700/50 mt-2">详细比赛事件与阵容将在比赛开始前 1 小时经由 Football-API 动态抓取并在此处渲染。</div>
           </div>
        </div>
      </div>
    </>
  );
}

function TeamDetailDrawer({ team, onClose, isTop }) {
  if (!team || team.isPlaceholder) return null;
  const zIndex = isTop ? 'z-[100]' : 'z-[90]';
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'squad'
  
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${zIndex}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 sm:p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${zIndex} h-[90vh] flex flex-col`}>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 opacity-50" />
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 z-10"><X className="w-5 h-5"/></button>
        
        <div className="flex flex-col items-center text-center shrink-0">
           <TeamFlag name={team.name} flag={team.flag} sizeClass="w-20 h-20 shadow-lg drop-shadow-xl" />
           <h2 className="text-2xl sm:text-3xl font-black mt-3 text-white">{team.name}</h2>
           <span className="text-xs text-slate-400 font-mono mt-1 border border-slate-700 bg-slate-800 px-2 py-0.5 rounded">{team.group} 组</span>
        </div>

        <div className="flex mt-6 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 mx-4 sm:mx-10">
           <button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded transition-colors ${activeTab === 'stats' ? 'bg-emerald-600/30 text-emerald-400' : 'text-slate-400'}`}>本届赛事数据</button>
           <button onClick={() => setActiveTab('squad')} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded transition-colors ${activeTab === 'squad' ? 'bg-blue-600/30 text-blue-400' : 'text-slate-400'}`}>大名单与主帅 (API)</button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 px-2 sm:px-6 custom-scrollbar pb-6">
           {activeTab === 'stats' && (
             <div className="space-y-4 animate-fade-in">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center"><div className="text-[10px] text-slate-400 mb-1">当前积分</div><div className="text-2xl font-black text-emerald-400">{team.pts || 0}</div></div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center"><div className="text-[10px] text-slate-400 mb-1">净胜球</div><div className="text-2xl font-black text-blue-400">{team.gd || 0}</div></div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center"><div className="text-[10px] text-slate-400 mb-1">进球数</div><div className="text-2xl font-black text-white">{team.gf || 0}</div></div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center"><div className="text-[10px] text-slate-400 mb-1">失球数</div><div className="text-2xl font-black text-red-400">{team.ga || 0}</div></div>
               </div>
               <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">战绩记录</h4>
                  <div className="flex justify-around text-center">
                     <div><div className="text-xl font-black text-emerald-500">{team.w || 0}</div><div className="text-[10px] text-slate-500 mt-1">胜 (WIN)</div></div>
                     <div><div className="text-xl font-black text-yellow-500">{team.d || 0}</div><div className="text-[10px] text-slate-500 mt-1">平 (DRAW)</div></div>
                     <div><div className="text-xl font-black text-red-500">{team.l || 0}</div><div className="text-[10px] text-slate-500 mt-1">负 (LOSE)</div></div>
                  </div>
               </div>
             </div>
           )}
           {activeTab === 'squad' && (
             <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                   <div>
                      <div className="text-[10px] text-slate-400">国家队主教练</div>
                      <div className="text-sm font-bold text-white mt-1">待 API 更新获取</div>
                   </div>
                   <UserCircle2 className="w-8 h-8 text-slate-600" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                   <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <h4 className="text-sm font-bold text-slate-300">26 人首发与大名单</h4>
                      <span className="text-[9px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">API Loading...</span>
                   </div>
                   <div className="space-y-2">
                     <div className="text-xs text-slate-500 text-center py-8 bg-slate-900 rounded-lg border border-slate-800 border-dashed">
                        大名单数据、场上站位阵型、以及球员伤病情况，<br/>将在世界杯开赛前通过 Football-API 接口精准同步。
                     </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </>
  );
}

// ==========================================
// 7. 小组赛程视图
// ==========================================

function GroupScheduleView({ groups, onMatchClick, onTeamClick, setGeneratedImage }) {
  const [viewMode, setViewMode] = useState('by_time'); 
  
  const handleGenerateImage = async () => {
    try {
      const watermark = document.getElementById('watermark-capture-gs');
      if (watermark) watermark.style.display = 'block';
      await new Promise(resolve => setTimeout(resolve, 200));
      const element = document.getElementById('capture-gs');
      const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617', useCORS: true });
      if (watermark) watermark.style.display = 'none';
      setGeneratedImage(canvas.toDataURL('image/png'));
    } catch (e) { alert("生成长图失败，请重试！"); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative">
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex justify-center z-10 shrink-0">
        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button onClick={() => setViewMode('by_time')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ${viewMode === 'by_time' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> 观战时间轴
          </button>
          <button onClick={() => setViewMode('by_group')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${viewMode === 'by_group' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> 按小组全景
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar relative pb-20">
        <div id="capture-gs" className="bg-slate-950 relative pb-10">
          {viewMode === 'by_group' ? (
            <GroupScheduleByGroup groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
          ) : (
            <GroupScheduleByTime groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
          )}
          <div id="watermark-capture-gs" className="hidden mt-8 w-full"><GlobalQRLogo /></div>
        </div>
      </div>
      <button onClick={handleGenerateImage} className="absolute bottom-6 right-4 sm:right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center transition-all active:scale-95">
        <Share className="w-4 h-4 mr-1.5" /> <span>生成并保存长图</span>
      </button>
    </div>
  );
}

function GroupScheduleByGroup({ groups, onMatchClick, onTeamClick }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (g) => { setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] })); };

  const renderTeamRow = (team, type, gName, idx) => (
    <div key={`team-row-${gName}-${team.id || 'no-id'}-${idx}-${type}`} onClick={() => !team.isPlaceholder && onTeamClick && onTeamClick(team)} 
         className={`relative flex items-center text-xs px-2 py-2.5 transition-colors border-b border-slate-800/30 last:border-b-0
           ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''}
           ${type === 'top2' ? 'bg-emerald-900/40' : type === 'third' ? 'bg-yellow-900/40' : 'bg-transparent'}
         `}>
      <span className="flex-1 flex items-center truncate pr-2 font-medium z-10 mt-1">
        <TeamFlag flag={team.flag} sizeClass="w-5 h-5 mr-2" />
        <span className={type === 'top2' ? 'text-emerald-100 font-bold' : type === 'third' ? 'text-yellow-100 font-bold' : 'text-slate-400'}>{team.name}</span>
      </span>
      <span className="w-5 sm:w-6 text-center font-mono text-slate-400 z-10 mt-1">{team.w}</span>
      <span className="w-5 sm:w-6 text-center font-mono text-slate-400 z-10 mt-1">{team.d}</span>
      <span className="w-5 sm:w-6 text-center font-mono text-slate-400 z-10 mt-1">{team.l}</span>
      <span className="w-6 sm:w-8 text-center font-mono text-slate-300 z-10 mt-1">{team.gd > 0 ? `+${team.gd}` : team.gd}</span>
      <span className={`w-6 sm:w-8 text-center font-mono font-bold rounded z-10 mt-1 ${type === 'top2' ? 'text-emerald-400' : type === 'third' ? 'text-yellow-400' : 'text-slate-500'}`}>{team.pts}</span>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-start">
      {Object.keys(groups).map(g => {
        if (!groups[g].teams || groups[g].teams.length === 0) return null; 
        const isExpanded = expandedGroups[g];

        return (
          <div key={`group-board-${g}`} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col shadow-xl group">
            <button type="button" onClick={() => toggleGroup(g)} className="cursor-pointer flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 mb-3 hover:border-emerald-500/50 transition-all relative z-10 w-full text-left">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-b from-emerald-400 to-emerald-600 w-1.5 h-6 rounded-full"></div>
                <span className="font-black text-white text-lg tracking-wider">{g}组</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-900/30 rounded border border-emerald-500/30 flex items-center">
                {isExpanded ? '收起赛程 ▲' : '展开赛程 ▼'}
              </span>
            </button>
            
            <div className="bg-slate-950 rounded-lg pt-2 pb-0 border border-slate-800/80 overflow-hidden">
              <div className="flex text-[10px] text-slate-500 font-bold mb-1 px-2 border-b border-slate-800 pb-2">
                <span className="flex-1">球队</span>
                <span className="w-5 sm:w-6 text-center">胜</span>
                <span className="w-5 sm:w-6 text-center">平</span>
                <span className="w-5 sm:w-6 text-center">负</span>
                <span className="w-6 sm:w-8 text-center">净</span>
                <span className="w-6 sm:w-8 text-center text-emerald-400">分</span>
              </div>
              <div className="flex flex-col">
                 <div className="relative bg-emerald-900/20 border-t border-emerald-500/20 pt-4 pb-0.5 overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500/90 text-emerald-950 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-bl-xl shadow z-10">晋级32强区</div>
                    {groups[g].teams.slice(0, 2).map((team, idx) => renderTeamRow(team, 'top2', g, idx))}
                 </div>
                 <div className="relative bg-yellow-900/20 border-t border-yellow-500/20 pt-4 pb-0.5 overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-500/90 text-yellow-950 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-bl-xl shadow z-10">待定区</div>
                    {groups[g].teams.slice(2, 3).map((team, idx) => renderTeamRow(team, 'third', g, idx + 2))}
                 </div>
                 <div className="relative bg-slate-800/20 border-t border-slate-700/50 pt-0.5 pb-0.5 overflow-hidden">
                    {groups[g].teams.slice(3, 4).map((team, idx) => renderTeamRow(team, 'fourth', g, idx + 3))}
                 </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="space-y-2 mt-4 animate-fade-in border-t border-slate-800/80 pt-4">
                {groups[g].matches.length === 0 && <div className="text-center text-slate-600 text-xs py-2">等待数据同步中...</div>}
                {groups[g].matches.map((match, idx) => (
                  <div key={`group-match-${g}-${match.id || 'no-id'}-${idx}`} onClick={() => onMatchClick({ ...match, groupName: g })} className="relative flex flex-col p-2.5 rounded-md border text-sm transition-all border-slate-800/80 bg-slate-950/80 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 group/match">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-1.5">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-300 flex items-center bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">
                        <Clock className="w-3 h-3 mr-1 opacity-70" /> {match.timeStr}
                      </span>
                      <span className="text-[9px] text-slate-500 flex items-center"><MapPin className="w-2.5 h-2.5 mr-0.5 opacity-50" /> {match.venue}</span>
                    </div>
                    <div className="flex justify-center items-center w-full mt-1 gap-2">
                      <div className="flex items-center justify-end flex-1 max-w-[120px] gap-1.5">
                        <span className="truncate text-[10px] sm:text-xs font-bold text-slate-300 group-hover/match:text-emerald-100 text-right" title={match.home?.name || '待定'}>{match.home?.name || '待定'}</span>
                        <TeamFlag flag={match.home?.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
                      </div>
                      <div className="flex flex-col justify-center items-center w-[40px] sm:w-[60px] shrink-0 relative">
                        {match.status === 'LIVE' && <span className="absolute -top-3 text-[9px] text-emerald-400 font-bold animate-pulse">{match.liveMinute}</span>}
                        <span className={`font-mono text-[10px] sm:text-sm font-bold ${match.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-600 group-hover/match:text-emerald-500'}`}>
                           {match.status === 'FINISHED' || match.status === 'LIVE' ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                        </span>
                      </div>
                      <div className="flex items-center justify-start flex-1 max-w-[120px] gap-1.5">
                        <TeamFlag flag={match.away?.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                        <span className="truncate text-[10px] sm:text-xs font-bold text-slate-300 group-hover/match:text-emerald-100 text-left" title={match.away?.name || '待定'}>{match.away?.name || '待定'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GroupScheduleByTime({ groups, onMatchClick, onTeamClick }) {
  const allMatches = [];
  Object.keys(groups).forEach(groupName => { groups[groupName].matches.forEach(m => { allMatches.push({ ...m, groupName }); }); });
  allMatches.sort((a, b) => a.timeStr.localeCompare(b.timeStr));
  const groupedMatches = groupByDate(allMatches);

  const renderSidebarTeamRow = (team, type, idx, gName) => (
    <div key={`sb-team-${gName}-${team.id || 'no-id'}-${idx}-${type}`} onClick={() => !team.isPlaceholder && onTeamClick && onTeamClick(team)} 
         className={`relative flex items-center justify-between px-1 sm:px-2 py-1.5 sm:py-2 transition-colors border-b border-slate-800/30 last:border-b-0
           ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''} 
           ${type === 'top2' ? 'bg-emerald-900/40' : type === 'third' ? 'bg-yellow-900/40' : 'bg-transparent'}`}>
      <span className={`flex items-center flex-1 min-w-0 pr-1 z-10 mt-0.5 ${type === 'top2' ? 'font-bold text-emerald-100' : type === 'third' ? 'font-bold text-yellow-100' : 'text-slate-400'}`}>
        <TeamFlag flag={team.flag} sizeClass="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"/>
        <span className="truncate flex-1 text-[9px] sm:text-xs" title={team.name}>{team.name}</span>
      </span>
      <div className="flex items-center justify-end font-mono z-10 mt-0.5 gap-0.5 sm:gap-1.5 shrink-0 text-[8px] sm:text-xs">
        <span className="w-2.5 sm:w-4 text-center text-slate-500 hidden sm:block">{team.w}</span>
        <span className="w-2.5 sm:w-4 text-center text-slate-500 hidden sm:block">{team.d}</span>
        <span className="w-2.5 sm:w-4 text-center text-slate-500 hidden sm:block">{team.l}</span>
        <span className="w-3.5 sm:w-6 text-center text-slate-400" title="净胜球">{team.gd}</span>
        <span className={`w-3.5 sm:w-6 text-center font-bold ${type === 'top2' ? 'text-emerald-400' : type === 'third' ? 'text-yellow-400' : 'text-slate-500'}`} title="积分">{team.pts}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-2 gap-2 sm:gap-4 items-start w-full relative">
      <div className="col-span-1 relative pl-1 sm:pl-2 border-r border-slate-800/50 pr-1 sm:pr-2 shrink-0">
        <div className="absolute left-2 sm:left-3 top-4 bottom-0 w-px bg-gradient-to-b from-cyan-900 via-cyan-800/50 to-transparent z-0 hidden sm:block"></div>
        {Object.keys(groupedMatches).length === 0 && <div className="text-slate-500 py-10 text-xs">等待数据...</div>}
        <div className="space-y-6 sm:space-y-8">
          {Object.keys(groupedMatches).map((date, dIdx) => (
            <div key={`timeline-date-${date}-${dIdx}`} className="relative z-10">
              <div className="flex items-center mb-2 sm:mb-4">
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] border-2 border-slate-950 flex-shrink-0 hidden sm:block"></div>
                <div className="sm:ml-2 px-2 sm:px-4 py-1 sm:py-2 bg-cyan-900/40 rounded-lg border border-cyan-500/30 text-cyan-400 font-bold text-[9px] sm:text-sm shadow-lg">
                  {date}
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 sm:pl-8 sm:border-l-2 border-slate-800/50 sm:ml-2 pb-6">
                {groupedMatches[date].map((match, mIdx) => (
                  <div key={match.id} onClick={() => onMatchClick(match)} className="bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-4 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1 sm:pb-2">
                      <span className="text-[8px] sm:text-xs text-slate-400 font-mono flex items-center bg-slate-950 px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-800"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"/>{match.timeStr.split(' ')[1]}</span>
                      <span className="text-[8px] sm:text-[10px] text-cyan-400 font-bold bg-cyan-900/20 px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-cyan-500/20">{match.groupName} 组对决</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 sm:mt-2">
                      <div className="flex items-center gap-1 sm:gap-1.5 w-[42%] justify-end">
                        <span className="text-[9px] sm:text-sm font-bold text-slate-300 group-hover:text-cyan-100 truncate flex-1 text-right">{match.home?.name || '待定'}</span>
                        <TeamFlag flag={match.home?.flag} sizeClass="w-4 h-4 sm:w-6 sm:h-6 shrink-0" />
                      </div>
                      <div className="flex flex-col items-center justify-center w-[16%]">
                        <span className="text-[10px] sm:text-lg font-black text-slate-500 group-hover:text-cyan-400">VS</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5 w-[42%] justify-start">
                        <TeamFlag flag={match.away?.flag} sizeClass="w-4 h-4 sm:w-6 sm:h-6 shrink-0" />
                        <span className="text-[9px] sm:text-sm font-bold text-slate-300 group-hover:text-cyan-100 truncate flex-1 text-left">{match.away?.name || '待定'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="col-span-1 flex flex-col space-y-2 sm:space-y-4 pl-1 sm:pl-2">
        <h3 className="text-emerald-400 font-black text-xs sm:text-lg mb-1 sm:mb-2 flex items-center px-1 sm:px-2"><ListOrdered className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 实时总积分榜</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-4 pb-10">
            {Object.keys(groups).map(gName => (
               <div key={`sidebar-group-${gName}`} className="bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-xl">
                 <div className="text-emerald-400 font-bold text-[9px] sm:text-xs mb-1.5 sm:mb-2 border-b border-slate-800 pb-1 sm:pb-1.5 flex justify-between">
                   <span>{gName}组积分</span>
                   <span className="text-slate-500 font-normal hidden sm:block">胜 平 负 净 分</span>
                   <span className="text-slate-500 font-normal sm:hidden">净 分</span>
                 </div>
                 {groups[gName].teams.slice(0, 2).map((t, i) => renderSidebarTeamRow(t, 'top2', i, gName))}
                 {groups[gName].teams.slice(2, 3).map((t, i) => renderSidebarTeamRow(t, 'third', i+2, gName))}
                 {groups[gName].teams.slice(3, 4).map((t, i) => renderSidebarTeamRow(t, 'fourth', i+3, gName))}
               </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. 微信全屏保存图片预览组件
// ==========================================

const ImagePreviewModal = ({ dataUrl, onClose }) => {
  if (!dataUrl) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex flex-col items-center justify-center p-4 animate-fade-in">
       <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
          <div className="p-4 bg-slate-800/80 flex justify-between items-center shrink-0 border-b border-slate-700">
             <span className="font-bold text-emerald-400 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> 生成成功</span>
             <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-900 rounded-full p-1"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar text-center relative">
             <img src={dataUrl} alt="Generate" className="w-full rounded shadow border border-slate-800" />
          </div>
          <div className="p-4 bg-emerald-900/20 shrink-0 text-center border-t border-emerald-500/20">
             <p className="text-emerald-400 font-black mb-1 animate-pulse">↑ 请长按上方图片保存到相册 ↑</p>
             <p className="text-xs text-slate-400">已完美兼容微信，保存后随时分享</p>
          </div>
       </div>
    </div>
  );
};

// ==========================================
// 9. 主应用组件 
// ==========================================

export default function App() {
  useEffect(() => { setupViewport(); }, []);

  const [activeTab, setActiveTab] = useState('group_schedule'); 
  const [groups, setGroups] = useState(initialGroups);
  const [selectedMatch, setSelectedMatch] = useState(null); 
  const [selectedTeam, setSelectedTeam] = useState(null); 
  const [lastOpened, setLastOpened] = useState(null); 
  const [forceShowHeader, setForceShowHeader] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); 

  const [apiKey] = useState(
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_KEY) || 
    (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_KEY) || 
    '8c135d4da927727e57fbf81f6e011d02'
  );
  
  const [apiStatus, setApiStatus] = useState('LOCAL'); 
  const [apiErrorMsg, setApiErrorMsg] = useState('本地赛前模式 | 开赛后API自动同步');

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchRealData = async () => {
      if (!apiKey) return;
      setApiStatus('LOADING'); setApiErrorMsg('');
      try {
        const headers = { "x-apisports-key": apiKey };
        let [standingsRes, fixturesRes] = await Promise.all([
          fetch(`https://v3.football.api-sports.io/standings?league=1&season=2026`, { headers, signal }),
          fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=2026`, { headers, signal })
        ]);
        let standingsData = await standingsRes.json();
        let fixturesData = await fixturesRes.json();
        if (fixturesData.errors && Object.keys(fixturesData.errors).length > 0) {
          setGroups(initialGroups); setApiStatus('LOCAL'); setApiErrorMsg("本地模式运行中"); return;
        }
        setGroups(initialGroups); setApiStatus('SUCCESS');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setGroups(initialGroups); setApiErrorMsg("网络错误，本地运行"); setApiStatus('LOCAL');
      }
    };
    fetchRealData();
    return () => controller.abort();
  }, [apiKey]);

  const handleOpenMatch = (match) => { setSelectedMatch(match); setLastOpened('match'); };
  const handleOpenTeam = (team) => { setSelectedTeam(team); setLastOpened('team'); };
  const handleCloseMatch = () => { setSelectedMatch(null); if (selectedTeam) setLastOpened('team'); };
  const handleCloseTeam = () => { setSelectedTeam(null); if (selectedMatch) setLastOpened('match'); };

  const getTeamFromSlot = useCallback((slotStr) => {
    if (!slotStr || slotStr === '?') return { id: `tbd_${Math.random()}`, name: '待定', flag: '❔', isPlaceholder: true, placeholderName: '等待产生' };
    if (slotStr.startsWith('W')) return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: `第${slotStr.replace('W', '')}场胜者` };
    if (slotStr.startsWith('L')) return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: `第${slotStr.replace('L', '')}场负者` };
    if (slotStr.length > 2) return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: '最佳第三名' };
    
    const groupName = slotStr.charAt(0).toUpperCase(); 
    const rank = parseInt(slotStr.charAt(1)) - 1; 
    const groupData = groups[groupName];

    if (!groupData || !groupData.teams || groupData.teams.length === 0 || !groupData.teams[rank]) {
      return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: `${groupName}组第${rank + 1}` };
    }
    
    const team = groupData.teams[rank];
    if (groupData.status === 'FINISHED') return { ...team, isPlaceholder: false };
    
    return { 
      id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, 
      placeholderName: team.name.includes('档') ? `${groupName}组第${rank + 1}` : team.name 
    };
  }, [groups]);

  const isCanvasTab = activeTab === 'prediction';
  const headerClass = `bg-slate-900 border-b border-slate-800 flex flex-col z-20 shadow-xl relative transition-all duration-300 ${isCanvasTab && !forceShowHeader ? 'landscape:hidden' : ''}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col h-[100dvh] overflow-hidden selection:bg-emerald-500/30">
      
      <header className={`${headerClass} px-2 py-1.5 sm:px-4 sm:py-3 gap-1 sm:gap-3`}>
         <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center">
                <RealTrophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                2026 世界杯实况引擎
            </h1>
            <div className="text-[10px] sm:text-xs text-slate-500 flex items-center">
                <span className={`w-2 h-2 rounded-full mr-1.5 ${apiStatus === 'SUCCESS' ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                {apiStatus === 'SUCCESS' ? 'Football-API 实时同步' : apiErrorMsg}
            </div>
         </div>
         <nav className="flex space-x-1 overflow-x-auto hide-scrollbar pb-1 pt-1">
            <button onClick={() => setActiveTab('group_schedule')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'group_schedule' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>小组全景</button>
            <button onClick={() => setActiveTab('knockout_schedule')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'knockout_schedule' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>淘汰赛程</button>
            <button onClick={() => setActiveTab('prediction')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'prediction' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>夺冠推演</button>
            <button onClick={() => setActiveTab('meeting')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'meeting' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>宿命对决</button>
            <button onClick={() => setActiveTab('rules')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'rules' ? 'bg-slate-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>104场规程</button>
         </nav>
      </header>

      <div className="flex-1 overflow-hidden relative w-full h-full">
        {activeTab === 'group_schedule' && <GroupScheduleView groups={groups} onMatchClick={handleOpenMatch} onTeamClick={handleOpenTeam} setGeneratedImage={setGeneratedImage} />}
        {activeTab === 'knockout_schedule' && <KnockoutScheduleView knockouts={officialKnockoutRoundsFlat} getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} setGeneratedImage={setGeneratedImage} />}
        {activeTab === 'rules' && <RulesView groups={groups} knockouts={officialKnockoutRounds} getTeamFromSlot={getTeamFromSlot} setGeneratedImage={setGeneratedImage} />}
        {activeTab === 'prediction' && <PredictionSandbox getTeamFromSlot={getTeamFromSlot} groups={groups} setGeneratedImage={setGeneratedImage} />}
        {activeTab === 'meeting' && <TeamMeetingPredictor groups={groups} setGeneratedImage={setGeneratedImage} />}
      </div>

      <MatchDetailDrawer match={selectedMatch} onClose={handleCloseMatch} onTeamClick={handleOpenTeam} isTop={lastOpened === 'match'} />
      <TeamDetailDrawer team={selectedTeam} onClose={handleCloseTeam} isTop={lastOpened === 'team'} />
      
      <ImagePreviewModal dataUrl={generatedImage} onClose={() => setGeneratedImage(null)} />
    </div>
  );
}
