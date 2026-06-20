/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability */
import { Component, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Activity, Clock, CalendarDays, GitBranch, ListOrdered, Wand2, Crown, 
  RotateCcw, X, Shield, MapPin, UserCircle2, Users,
  RefreshCw, CheckCircle2, BookOpen,
  ArrowRight, Dices, Swords, Search, Home, LayoutList,
  ChevronDown, Sparkles
} from 'lucide-react';

const RealTrophy = ({ className }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError) return <span className={`inline-block drop-shadow-md text-yellow-500 ${className}`} style={{fontSize: '1.25em'}}>🏆</span>;
  return <img src="/trophy.png" alt="Trophy" crossOrigin="anonymous" onError={() => setImgError(true)} className={`object-contain drop-shadow-[0_10px_15px_rgba(234,179,8,0.4)] ${className}`} />;
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

const SiteWatermark = ({ className = '' }) => (
  <div className={`pointer-events-none select-none text-center font-black tracking-[0.28em] text-[10px] sm:text-xs text-cyan-300/90 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)] ${className}`}>
    xiaohuang365.com
  </div>
);

// ==========================================
// 2. 静态数据字典与核心逻辑
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
  "葡萄牙 vs 刚果(金)": "6月18日 01:00", "英格兰 vs 克罗地亚": "6月18日 04:00", "加纳 vs 巴拿马": "6月18日 07:00", "乌兹别克斯坦 vs 哥伦比亚": "6月18日 10:00",
  "捷克 vs 南非": "6月19日 00:00", "瑞士 vs 波黑": "6月19日 03:00", "加拿大 vs 卡塔尔": "6月19日 06:00", "墨西哥 vs 韩国": "6月19日 09:00",
  "美国 vs 澳大利亚": "6月20日 03:00", "苏格兰 vs 摩洛哥": "6月20日 06:00", "巴西 vs 海地": "6月20日 08:30", "土耳其 vs 巴拉圭": "6月20日 11:00",
  "荷兰 vs 瑞典": "6月21日 01:00", "德国 vs 科特迪瓦": "6月21日 04:00", "厄瓜多尔 vs 库拉索": "6月21日 08:00", "突尼斯 vs 日本": "6月21日 12:00",
  "西班牙 vs 沙特阿拉伯": "6月22日 00:00", "比利时 vs 伊朗": "6月22日 03:00", "乌拉圭 vs 佛得角": "6月22日 06:00", "新西兰 vs 埃及": "6月22日 09:00",
  "阿根廷 vs 奥地利": "6月23日 01:00", "法国 vs 伊拉克": "6月23日 05:00", "挪威 vs 塞内加尔": "6月23日 08:00", "约旦 vs 阿尔及利亚": "6月23日 11:00",
  "葡萄牙 vs 乌兹别克斯坦": "6月24日 01:00", "英格兰 vs 加纳": "6月24日 04:00", "巴拿马 vs 克罗地亚": "6月24日 07:00", "哥伦比亚 vs 刚果(金)": "6月24日 10:00",
  "瑞士 vs 加拿大": "6月25日 03:00", "波黑 vs 卡塔尔": "6月25日 03:00", "苏格兰 vs 巴西": "6月25日 06:00", "摩洛哥 vs 海地": "6月25日 06:00", "捷克 vs 墨西哥": "6月25日 09:00", "南非 vs 韩国": "6月25日 09:00",
  "厄瓜多尔 vs 德国": "6月26日 04:00", "库拉索 vs 科特迪瓦": "6月26日 04:00", "突尼斯 vs 荷兰": "6月26日 07:00", "日本 vs 瑞典": "6月26日 07:00", "土耳其 vs 美国": "6月26日 10:00", "巴拉圭 vs 澳大利亚": "6月26日 10:00",
  "挪威 vs 法国": "6月27日 03:00", "塞内加尔 vs 伊拉克": "6月27日 03:00", "乌拉圭 vs 西班牙": "6月27日 08:00", "佛得角 vs 沙特阿拉伯": "6月27日 08:00", "新西兰 vs 比利时": "6月27日 11:00", "埃及 vs 伊朗": "6月27日 11:00",
  "巴拿马 vs 英格兰": "6月28日 05:00", "克罗地亚 vs 加纳": "6月28日 05:00", "哥伦比亚 vs 葡萄牙": "6月28日 07:30", "刚果(金) vs 乌兹别克斯坦": "6月28日 07:30", "约旦 vs 阿根廷": "6月28日 10:00", "阿尔及利亚 vs 奥地利": "6月28日 10:00"
};

const manualMatchAnalysis = {
  '瑞士 vs 波黑': {
    conclusion: '倾向瑞士不败，参考比分 2-1。',
    logic: {
      form: '瑞士整体稳定性更好，攻防转换节奏更清晰。',
      tactics: '瑞士阵地推进和边路压迫能限制波黑的中路出球。',
      attackDefense: '瑞士防线回收速度较稳，波黑更依赖定位球和反击质量。',
      venue: '比赛节奏更可能被瑞士控制，波黑需要先守住前30分钟。'
    },
    evidence: ['瑞士中后场出球稳定', '波黑防线横移速度一般', '瑞士边路传中质量更可靠', '波黑定位球仍有威胁'],
    news: ['瑞士主力框架相对完整', '波黑锋线状态需赛前确认', '市场倾向瑞士小胜但平局保护存在'],
    probabilities: { home: 48, draw: 29, away: 23 },
    risk: '存在爆冷点。若波黑率先进球，比赛会进入低节奏防守区，瑞士反超难度上升。',
    final: { tendency: '主胜倾向', score: '2-1', recommendation: '瑞士不败' }
  },
  '加拿大 vs 卡塔尔': {
    conclusion: '倾向平局防守，参考比分 1-1。',
    logic: {
      form: '加拿大冲击力强，但稳定控制比赛能力仍需观察。',
      tactics: '加拿大更依赖纵深速度，卡塔尔会尝试低位组织拖慢节奏。',
      attackDefense: '加拿大边路推进更直接，卡塔尔反击和定位球能制造波动。',
      venue: '双方都需要积分，比赛中段可能进入谨慎状态。'
    },
    evidence: ['加拿大边路速度优势明显', '卡塔尔大赛经验较足', '双方都不适合过早冒险', '平局赔率具备防范价值'],
    news: ['双方关键球员状态需赛前更新', '加拿大热度略高', '卡塔尔低位防守是主要变量'],
    probabilities: { home: 36, draw: 34, away: 30 },
    risk: '中高风险。若加拿大久攻不下，卡塔尔一次反击就可能改变比赛方向。',
    final: { tendency: '平局倾向', score: '1-1', recommendation: '防平 / 小球' }
  },
  '墨西哥 vs 韩国': {
    conclusion: '倾向均势对冲，参考比分 1-1。',
    logic: {
      form: '墨西哥主场氛围更强，韩国整体跑动和压迫能力稳定。',
      tactics: '墨西哥强调控球和边路推进，韩国会用高位逼抢切断第一传。',
      attackDefense: '两队都有前场速度，但终结效率可能决定上限。',
      venue: '墨西哥节奏优势明显，韩国若守住开局会提高拿分概率。'
    },
    evidence: ['墨西哥主场情绪加成明显', '韩国前场压迫强度高', '双方攻防转换速度都不慢', '均势局更容易出现小比分'],
    news: ['赛前阵容需手动更新', '伤病信息暂无重大确认', '市场分歧预计较大'],
    probabilities: { home: 35, draw: 33, away: 32 },
    risk: '有爆冷空间。若韩国抢到领先，墨西哥压上后身后空间会被放大。',
    final: { tendency: '平局倾向', score: '1-1', recommendation: '不败分散 / 小球' }
  },
  '美国 vs 澳大利亚': {
    conclusion: '明确看好美国胜，比赛更像美国主导节奏的控制型胜利。',
    logic: {
      form: '这场不是均势比赛，美国的问题不是强不强，而是能不能提前破局；一旦早进球，比赛会直接走向单边控制。',
      tactics: '美国主导节奏，澳大利亚被动防守反击，澳大利亚唯一机会是拖到60分钟后打反击。',
      attackDefense: '美国不会疯狂压比分，更可能通过持续控场压低风险；澳大利亚需要依赖反击爆点。',
      venue: '若美国久攻不下，比赛会进入焦虑阶段，平局窗口会被拉大。'
    },
    evidence: ['美国节奏主导权更强', '澳大利亚更依赖低位防守后的反击', '早进球会显著放大美国优势', '小2.5方向偏强'],
    news: ['主推比分 2-0', '次选比分 1-0', '美国胜 60%，平局 24%，澳大利亚胜 16%'],
    probabilities: { home: 60, draw: 24, away: 16 },
    risk: '中低风险（18%）。关键点在于美国若久攻不下，会进入焦虑阶段。',
    final: { tendency: '美国胜', score: '2-0', recommendation: '美国胜 / 小2.5' }
  },
  '苏格兰 vs 摩洛哥': {
    conclusion: '偏向平局，同时看好摩洛哥不败，参考比分 1-1。',
    logic: {
      form: '这是节奏对抗与中场拉锯，摩洛哥整体能力更完整，但进攻效率不稳定。',
      tactics: '摩洛哥技术和整体性更好，苏格兰依靠身体对抗与主动逼抢制造消耗。',
      attackDefense: '两队都不具备持续破防能力，比赛很容易陷入低节奏。',
      venue: '三项结果本身均衡，本场没有真正意义上的冷门。'
    },
    evidence: ['摩洛哥整体能力更完整', '苏格兰身体对抗和逼抢强度有优势', '双方持续破防能力都有限', '小2.5非常强'],
    news: ['主推比分 1-1', '次选比分 0-1', '苏格兰胜 30%，平局 35%，摩洛哥胜 35%'],
    probabilities: { home: 30, draw: 35, away: 35 },
    risk: '本场没有真正冷门，因为胜平负三项结果本身就均衡。',
    final: { tendency: '平局倾向', score: '1-1', recommendation: '摩洛哥不败 / 小2.5' }
  },
  '巴西 vs 海地': {
    conclusion: '巴西大胜方向明确，纯实力断层局，参考比分 3-0。',
    logic: {
      form: '这场不用复杂分析，巴西的问题不是能不能赢，而是赢几个球以及是否轮换。',
      tactics: '巴西高位压迫和进攻效率决定比赛上限，海地防线抗压能力偏弱。',
      attackDefense: '海地面对高位压迫容易崩盘，巴西只要正常发挥就能持续制造机会。',
      venue: '除非巴西轮换严重并且早期不进球，否则比赛很难偏离大胜方向。'
    },
    evidence: ['巴西整体实力断层领先', '海地防线抗压能力差', '巴西进攻效率决定上限', '大2.5方向强势'],
    news: ['主推比分 3-0', '次选比分 4-0', '巴西胜 85%，平局 10%，海地胜 5%'],
    probabilities: { home: 85, draw: 10, away: 5 },
    risk: '极低风险（6%）。除非巴西轮换严重并且早期不进球。',
    final: { tendency: '巴西胜', score: '3-0', recommendation: '巴西胜 / 大2.5' }
  },
  '土耳其 vs 巴拉圭': {
    conclusion: '平局优先，其次才是任意一方小胜，参考比分 1-1。',
    logic: {
      form: '这是四场里最复杂的一场，两队都没有绝对优势。',
      tactics: '土耳其控球更好但转化一般，巴拉圭防守更硬但进攻依赖反击。',
      attackDefense: '比赛大概率被拉慢，变成消耗战，双方都不具备持续爆破能力。',
      venue: '本场本质就是随机局，冷门不是异常，而是结构本身。'
    },
    evidence: ['土耳其控球质量略好', '巴拉圭防守硬度更高', '双方进攻都依赖阶段性效率', '小2.5优先'],
    news: ['主推比分 1-1', '次选比分 1-0 / 0-1', '土耳其胜 37%，平局 33%，巴拉圭胜 30%'],
    probabilities: { home: 37, draw: 33, away: 30 },
    risk: '本场本质就是随机局，冷门不是异常，而是结构本身。',
    final: { tendency: '平局优先', score: '1-1', recommendation: '小2.5 / 防任意一方小胜' }
  }
};

const getMatchAnalysisKeyFromTeams = (homeName, awayName) => `${homeName || ''} vs ${awayName || ''}`;

const getBeijingParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type) => Number(parts.find(part => part.type === type)?.value || 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second')
  };
};

const beijingLocalTimeToUtcMs = (year, month, day, hour, minute = 0, second = 0, ms = 0) => (
  Date.UTC(year, month - 1, day, hour - 8, minute, second, ms)
);

const getDailyPredictionWindow = (now = new Date()) => {
  const parts = getBeijingParts(now);
  const startDayOffset = parts.hour >= 14 ? 0 : -1;
  const endDayOffset = parts.hour >= 14 ? 1 : 0;
  return {
    startMs: beijingLocalTimeToUtcMs(parts.year, parts.month, parts.day + startDayOffset, 14),
    endMs: beijingLocalTimeToUtcMs(parts.year, parts.month, parts.day + endDayOffset, 13, 59, 59, 999)
  };
};

const getDailyWindowLabel = (now = new Date()) => {
  const { startMs, endMs } = getDailyPredictionWindow(now);
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  return `${formatter.format(new Date(startMs))} - ${formatter.format(new Date(endMs))}`;
};

const getTeamByName = (name) => (
  Object.values(teamsData).flat().find(team => team.name === name) || { name, flag: '❔' }
);

const parseScheduleTimeToMs = (timeStr) => {
  const match = String(timeStr || '').match(/(\d+)月(\d+)日\s+(\d{1,2}):(\d{2})/);
  if (!match) return Number.NaN;
  const [, month, day, hour, minute] = match.map(Number);
  return beijingLocalTimeToUtcMs(2026, month, day, hour, minute);
};

const toLocalPredictionMatch = ([matchName, timeStr], index) => {
  const [homeName, awayName] = matchName.split(' vs ');
  const home = getTeamByName(homeName);
  const away = getTeamByName(awayName);
  const analysis = manualMatchAnalysis[getMatchAnalysisKeyFromTeams(home.name, away.name)];
  return {
    id: `schedule_match_${index}_${homeName}_${awayName}`,
    time: timeStr,
    timestamp: parseScheduleTimeToMs(timeStr),
    homeTeam: { name: home.name || homeName || '未知球队', flag: home.flag || '❔' },
    awayTeam: { name: away.name || awayName || '未知球队', flag: away.flag || '❔' },
    predictedScore: analysis?.final?.score || null,
    probabilities: analysis?.probabilities || null
  };
};

const getSchedulePredictionMatches = (startMs, endMs) => (
  Object.entries(groupStageSchedule)
    .map(toLocalPredictionMatch)
    .filter(match => Number.isFinite(match.timestamp) && match.timestamp >= startMs && match.timestamp <= endMs)
    .sort((a, b) => a.timestamp - b.timestamp)
);

const getFallbackPredictionMatches = () => {
  const { startMs, endMs } = getDailyPredictionWindow();
  return getSchedulePredictionMatches(startMs, endMs);
};

const toPredictionMatch = (fixture, index) => {
  const home = normalizeTeam(fixture?.teams?.home);
  const away = normalizeTeam(fixture?.teams?.away);
  const analysis = manualMatchAnalysis[getMatchAnalysisKeyFromTeams(home.name, away.name)];
  return {
    id: fixture?.fixture?.id ? `api_match_${fixture.fixture.id}` : `api_match_${index}`,
    time: formatBeijingTime(fixture?.fixture?.date),
    timestamp: new Date(fixture?.fixture?.date).getTime(),
    homeTeam: { name: home.name || '未知球队', flag: home.flag || '❔' },
    awayTeam: { name: away.name || '未知球队', flag: away.flag || '❔' },
    predictedScore: analysis?.final?.score || null,
    probabilities: analysis?.probabilities || null
  };
};

const getTodayPredictionMatches = (fixturesPayload) => {
  const { startMs, endMs } = getDailyPredictionWindow();
  const localRows = getSchedulePredictionMatches(startMs, endMs);
  const rows = fixturesPayload?.response || [];
  if (!Array.isArray(rows) || rows.length === 0) return localRows;
  const endedStatuses = new Set(['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO']);
  const normalizedRows = rows
    .filter(row => row?.fixture?.date && row?.teams?.home && row?.teams?.away)
    .sort((a, b) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0));
  const windowRows = normalizedRows.filter(row => {
    const matchMs = new Date(row.fixture.date).getTime();
    const status = row.fixture?.status?.short;
    return matchMs >= startMs && matchMs <= endMs && !endedStatuses.has(status);
  });
  const apiRows = windowRows.map(toPredictionMatch);
  const mergedByMatch = new Map();
  [...apiRows, ...localRows].forEach(match => {
    const key = getMatchAnalysisKey(match);
    if (!mergedByMatch.has(key)) mergedByMatch.set(key, match);
  });
  return Array.from(mergedByMatch.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
};

const getMatchAnalysisKey = (match) => getMatchAnalysisKeyFromTeams(match?.homeTeam?.name, match?.awayTeam?.name);

const getAnalysisForMatch = (match) => {
  const configured = manualMatchAnalysis[getMatchAnalysisKey(match)];
  if (configured) return configured;
  return null;
};

const getPredictionAdvice = (analysis) => {
  if (!analysis) return '待更新';
  const recommendation = String(analysis.final?.recommendation || '').split('/')[0].trim();
  return recommendation || analysis.final?.tendency || '待更新';
};

const getExactMatchTime = (t1, t2) => {
  return groupStageSchedule[`${t1.name} vs ${t2.name}`] || groupStageSchedule[`${t2.name} vs ${t1.name}`] || '时间待定 00:00';
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

const TEAM_NAME_ZH = {
  'Algeria':'阿尔及利亚','Argentina':'阿根廷','Australia':'澳大利亚','Austria':'奥地利',
  'Belgium':'比利时','Bosnia & Herzegovina':'波黑','Brazil':'巴西','Canada':'加拿大',
  'Cape Verde Islands':'佛得角','Colombia':'哥伦比亚','Congo DR':'刚果(金)','Croatia':'克罗地亚',
  'Curaçao':'库拉索','Czech Republic':'捷克','Ecuador':'厄瓜多尔','Egypt':'埃及',
  'England':'英格兰','France':'法国','Germany':'德国','Ghana':'加纳','Haiti':'海地',
  'Iran':'伊朗','Iraq':'伊拉克','Ivory Coast':'科特迪瓦','Japan':'日本','Jordan':'约旦',
  'Mexico':'墨西哥','Morocco':'摩洛哥','Netherlands':'荷兰','New Zealand':'新西兰',
  'Norway':'挪威','Panama':'巴拿马','Paraguay':'巴拉圭','Portugal':'葡萄牙','Qatar':'卡塔尔',
  'Saudi Arabia':'沙特阿拉伯','Scotland':'苏格兰','Senegal':'塞内加尔','South Africa':'南非',
  'South Korea':'韩国','Spain':'西班牙','Sweden':'瑞典','Switzerland':'瑞士','Tunisia':'突尼斯',
  'Türkiye':'土耳其','USA':'美国','Uruguay':'乌拉圭','Uzbekistan':'乌兹别克斯坦'
};

const formatBeijingTime = (dateString) => {
  if (!dateString) return '时间待定 00:00';
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(dateString));
  const get = (type) => parts.find(p => p.type === type)?.value || '';
  return `${Number(get('month'))}月${Number(get('day'))}日 ${get('hour')}:${get('minute')}`;
};

const normalizeTeam = (team, group) => ({
  id: String(team?.id || `unknown_${team?.name || 'team'}`),
  apiId: team?.id,
  name: TEAM_NAME_ZH[team?.name] || team?.name || '待定',
  apiName: team?.name,
  flag: team?.logo || '❔',
  winner: team?.winner,
  group
});

const normalizeStatus = (status = {}) => {
  if (['FT', 'AET', 'PEN'].includes(status.short)) return 'FINISHED';
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'].includes(status.short)) return 'LIVE';
  return 'UPCOMING';
};

const normalizeFixture = (item, matchNumber, groupByTeamId = {}) => {
  const group = groupByTeamId[item.teams?.home?.id] || groupByTeamId[item.teams?.away?.id];
  return {
    id: matchNumber > 72 ? `ko_${matchNumber}` : `api_${item.fixture.id}`,
    apiFixtureId: item.fixture.id,
    matchNumber,
    home: normalizeTeam(item.teams?.home, group),
    away: normalizeTeam(item.teams?.away, group),
    homeScore: item.goals?.home,
    awayScore: item.goals?.away,
    score: item.score,
    status: normalizeStatus(item.fixture?.status),
    liveMinute: item.fixture?.status?.elapsed,
    statusText: item.fixture?.status?.long,
    timeStr: formatBeijingTime(item.fixture?.date),
    timestamp: item.fixture?.timestamp,
    venue: item.fixture?.venue?.name || item.fixture?.venue?.city || '美加墨赛区',
    roundApi: item.league?.round,
    groupName: group
  };
};

const cloneInitialGroups = () => Object.fromEntries(
  Object.entries(initialGroups).map(([groupName, group]) => [
    groupName,
    {
      teams: group.teams.map(team => ({ ...team })),
      matches: group.matches.map(match => ({
        ...match,
        home: { ...match.home },
        away: { ...match.away }
      }))
    }
  ])
);

const getMatchupKey = (homeName, awayName) => [homeName || '待定', awayName || '待定'].sort().join('__');

const buildInitialMatchLookup = (groups) => {
  const lookup = new Map();
  Object.entries(groups).forEach(([groupName, group]) => {
    group.matches.forEach((match, index) => {
      lookup.set(getMatchupKey(match.home?.name, match.away?.name), { groupName, match, index });
    });
  });
  return lookup;
};

const mergeGroupMatchesWithLive = (baseGroups, liveMatches) => {
  const lookup = buildInitialMatchLookup(baseGroups);
  liveMatches.forEach(liveMatch => {
    const record = lookup.get(getMatchupKey(liveMatch.home?.name, liveMatch.away?.name));
    if (!record || !baseGroups[record.groupName]) return;
    const original = record.match;
    const originalHomeName = original.home?.name;
    const liveHomeMatchesOriginalHome = liveMatch.home?.name === originalHomeName;
    const homeScore = liveHomeMatchesOriginalHome ? liveMatch.homeScore : liveMatch.awayScore;
    const awayScore = liveHomeMatchesOriginalHome ? liveMatch.awayScore : liveMatch.homeScore;
    const homeTeam = liveHomeMatchesOriginalHome ? liveMatch.home : liveMatch.away;
    const awayTeam = liveHomeMatchesOriginalHome ? liveMatch.away : liveMatch.home;
    baseGroups[record.groupName].matches[record.index] = {
      ...original,
      ...liveMatch,
      id: original.id,
      apiFixtureId: liveMatch.apiFixtureId,
      matchNumber: original.matchNumber,
      home: { ...original.home, ...homeTeam, name: original.home?.name || homeTeam?.name },
      away: { ...original.away, ...awayTeam, name: original.away?.name || awayTeam?.name },
      homeScore,
      awayScore,
      groupName: record.groupName,
      timeStr: original.timeStr || liveMatch.timeStr
    };
  });
  return baseGroups;
};

const recalculateGroupTable = (group) => {
  const stats = new Map(group.teams.map(team => [team.name, {
    ...team, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0, played: 0
  }]));
  group.matches.filter(match => match.status === 'FINISHED').forEach(match => {
    const home = stats.get(match.home?.name);
    const away = stats.get(match.away?.name);
    if (!home || !away || match.homeScore == null || match.awayScore == null) return;
    home.played += 1; away.played += 1;
    home.gf += match.homeScore; home.ga += match.awayScore;
    away.gf += match.awayScore; away.ga += match.homeScore;
    if (match.homeScore > match.awayScore) {
      home.w += 1; home.pts += 3; away.l += 1;
    } else if (match.homeScore < match.awayScore) {
      away.w += 1; away.pts += 3; home.l += 1;
    } else {
      home.d += 1; away.d += 1; home.pts += 1; away.pts += 1;
    }
    home.gd = home.gf - home.ga;
    away.gd = away.gf - away.ga;
  });
  group.teams = [...stats.values()].sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || String(a.id).localeCompare(String(b.id))
  );
  return group;
};

const buildLiveTournament = (fixturesPayload, standingsPayload) => {
  const standingGroups = standingsPayload?.response?.[0]?.league?.standings || [];
  const groupByTeamId = {};
  const groups = {};

  standingGroups.forEach(rows => {
    const group = rows?.[0]?.group?.match(/Group ([A-L])$/)?.[1];
    if (!group) return;
    groups[group] = {
      teams: rows.map(row => {
        groupByTeamId[row.team.id] = group;
        return {
          ...normalizeTeam(row.team, group),
          rank: row.rank,
          pts: row.points || 0,
          gd: row.goalsDiff || 0,
          gf: row.all?.goals?.for || 0,
          ga: row.all?.goals?.against || 0,
          w: row.all?.win || 0,
          d: row.all?.draw || 0,
          l: row.all?.lose || 0,
          played: row.all?.played || 0
        };
      }),
      matches: []
    };
  });

  const sortedFixtures = [...(fixturesPayload?.response || [])].sort(
    (a, b) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0)
  );
  const normalized = sortedFixtures.map((item, index) => normalizeFixture(item, index + 1, groupByTeamId));
  const liveGroupMatches = normalized.filter(match => {
    const record = buildInitialMatchLookup(initialGroups).get(getMatchupKey(match.home?.name, match.away?.name));
    return !!record;
  });

  normalized.filter(m => m.matchNumber <= 72).forEach(match => {
    const group = match.groupName;
    if (group && groups[group]) groups[group].matches.push(match);
  });

  Object.values(groups).forEach(group => {
    const stats = new Map(group.teams.map(team => [team.apiId, {
      ...team, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0, played: 0
    }]));
    group.matches.filter(match => match.status === 'FINISHED').forEach(match => {
      const home = stats.get(match.home.apiId);
      const away = stats.get(match.away.apiId);
      if (!home || !away) return;
      home.played += 1; away.played += 1;
      home.gf += match.homeScore || 0; home.ga += match.awayScore || 0;
      away.gf += match.awayScore || 0; away.ga += match.homeScore || 0;
      if (match.homeScore > match.awayScore) {
        home.w += 1; home.pts += 3; away.l += 1;
      } else if (match.homeScore < match.awayScore) {
        away.w += 1; away.pts += 3; home.l += 1;
      } else {
        home.d += 1; away.d += 1; home.pts += 1; away.pts += 1;
      }
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    });
    group.teams = [...stats.values()].sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.rank - b.rank
    );
  });

  Object.keys(initialGroups).forEach(group => {
    if (!groups[group]) groups[group] = cloneInitialGroups()[group];
    else if (groups[group].matches.length === 0) groups[group].matches = cloneInitialGroups()[group].matches;
  });

  if (liveGroupMatches.length > 0) {
    mergeGroupMatchesWithLive(groups, liveGroupMatches);
    Object.values(groups).forEach(group => recalculateGroupTable(group));
  }

  const liveById = new Map(normalized.filter(m => m.matchNumber > 72).map(m => [m.id, m]));
  const knockoutFlat = officialKnockoutRoundsFlat.map(base => {
    const live = liveById.get(base.id);
    return live ? { ...base, ...live, round: base.round, homeStr: base.homeStr, awayStr: base.awayStr } : base;
  });
  const knockoutRounds = Object.fromEntries(
    Object.entries(officialKnockoutRounds).map(([key, matches]) => [
      key, matches.map(match => knockoutFlat.find(item => item.id === match.id) || match)
    ])
  );

  return { groups, knockoutFlat, knockoutRounds };
};

const getMatchWinner = (match) => {
  if (!match || match.status !== 'FINISHED') return null;
  if (match.home?.winner === true) return match.home;
  if (match.away?.winner === true) return match.away;
  if (match.score?.penalty?.home !== null && match.score?.penalty?.home !== undefined) {
    return match.score.penalty.home > match.score.penalty.away ? match.home : match.away;
  }
  if (match.homeScore === match.awayScore) return null;
  return match.homeScore > match.awayScore ? match.home : match.away;
};

const getSlotPlaceholder = (slotStr) => {
  if (!slotStr || slotStr === '?') {
    return { id: 'tbd', name: '待定', placeholderName: '待定', flag: '❔', isPlaceholder: true };
  }
  if (/^[A-L][1-4]$/.test(slotStr)) {
    const group = slotStr.charAt(0);
    const rank = slotStr.charAt(1);
    return {
      id: `slot_${slotStr}`,
      name: `${group}组第${rank}名`,
      placeholderName: `${group}组第${rank}名`,
      flag: '❔',
      isPlaceholder: true
    };
  }
  if (/^W\d{2,}$/.test(slotStr)) {
    return { id: slotStr, name: `第${slotStr.slice(1)}场胜者`, placeholderName: `第${slotStr.slice(1)}场胜者`, flag: '❔', isPlaceholder: true };
  }
  if (/^L\d{2,}$/.test(slotStr)) {
    return { id: slotStr, name: `第${slotStr.slice(1)}场负者`, placeholderName: `第${slotStr.slice(1)}场负者`, flag: '❔', isPlaceholder: true };
  }
  if (slotStr.includes('/')) {
    return { id: `slot_${slotStr}`, name: '最佳第三名', placeholderName: `最佳第三名（${slotStr}）`, flag: '❔', isPlaceholder: true };
  }
  return { id: `slot_${slotStr}`, name: slotStr, placeholderName: slotStr, flag: '❔', isPlaceholder: true };
};

const REAL_BRACKET_PARENT_MAP = {
  73: 89, 75: 89, 74: 90, 77: 90, 76: 91, 78: 91, 79: 92, 80: 92,
  83: 93, 84: 93, 81: 94, 82: 94, 86: 95, 88: 95, 85: 96, 87: 96,
  89: 97, 90: 97, 93: 98, 94: 98, 91: 99, 92: 99, 95: 100, 96: 100,
  97: 101, 98: 101, 99: 102, 100: 102, 101: 104, 102: 104
};

const getMeetingRound = (matchIdA, matchIdB) => {
    if (matchIdA === matchIdB) return '1/16决赛';
    const pathA = [matchIdA]; let currA = matchIdA;
    while(REAL_BRACKET_PARENT_MAP[currA]) { currA = REAL_BRACKET_PARENT_MAP[currA]; pathA.push(currA); }
    let currB = matchIdB;
    if (pathA.includes(currB)) {
        const found = officialKnockoutRoundsFlat.find(m => m.id === `ko_${currB}`);
        return found ? found.round : '1/16决赛';
    }
    while(REAL_BRACKET_PARENT_MAP[currB]) {
        currB = REAL_BRACKET_PARENT_MAP[currB];
        if (pathA.includes(currB)) {
            const found = officialKnockoutRoundsFlat.find(m => m.id === `ko_${currB}`);
            return found ? found.round : '决赛';
        }
    }
    return '决赛';
};

const SLOT_TO_MATCH = {
  'A1': [79], 'A2': [73], 'A3': [74, 82], 'B1': [85], 'B2': [73], 'B3': [74, 81],
  'C1': [76], 'C2': [75], 'C3': [74, 77, 79], 'D1': [81], 'D2': [88], 'D3': [74, 77, 87],
  'E1': [74], 'E2': [78], 'E3': [79, 80, 81, 82, 85], 'F1': [75], 'F2': [76], 'F3': [74, 77, 79, 81, 85],
  'G1': [82], 'G2': [88], 'G3': [77, 85], 'H1': [84], 'H2': [86], 'H3': [77, 79, 80, 82],
  'I1': [77], 'I2': [78], 'I3': [79, 80, 81, 82, 85, 87], 'J1': [86], 'J2': [84], 'J3': [80, 81, 82, 85, 87],
  'K1': [87], 'K2': [83], 'K3': [80], 'L1': [80], 'L2': [83], 'L3': [87]
};

// ==========================================
// 3. 全景大树引擎 (深度自适应全屏压缩版)
// ==========================================

const FullScreenBracket = ({ mode, knockouts = officialKnockoutRoundsFlat, r32Selections = {}, thirdPlaceAssignments = {}, predictions = {}, setPrediction, getTeamFromSlot, onMatchClick, onTeamClick }) => {
    const [isPortrait, setIsPortrait] = useState(true);

    useEffect(() => {
        const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const resolveMatch = useCallback((matchId) => {
        const baseMatch = (mode === 'live' ? knockouts : officialKnockoutRoundsFlat).find(m => m.id === matchId);
        if (!baseMatch) return null;
        if (mode === 'live') return {
          ...baseMatch,
          home: baseMatch.home || getTeamFromSlot(baseMatch.homeStr),
          away: baseMatch.away || getTeamFromSlot(baseMatch.awayStr)
        };
        const resolveSlot = (slotStr) => {
            if (!slotStr || slotStr === '?') return { id: `tbd_${Math.random()}`, name: '待定', flag: '❔', isPlaceholder: true };
            if (/^W\d{2,}$/.test(slotStr)) { const prevMatch = resolveMatch(`ko_${slotStr.slice(1)}`); return prevMatch?.predictedWinner || { id: slotStr, name: `待决出`, flag: '❔', isPlaceholder: true }; }
            if (/^L\d{2,}$/.test(slotStr)) { const prevMatch = resolveMatch(`ko_${slotStr.slice(1)}`); if (prevMatch?.predictedWinner) return prevMatch.predictedWinner.id === prevMatch.home.id ? prevMatch.away : prevMatch.home; return { id: slotStr, name: `待决出`, flag: '❔', isPlaceholder: true }; }
            
            if (mode === 'sandbox' && Object.keys(r32Selections).length > 0) {
                if (slotStr.length === 2 && /[A-L][1-4]/.test(slotStr)) { if (r32Selections[slotStr]) return { ...r32Selections[slotStr], isPlaceholder: false }; }
                else if (slotStr.includes('/')) { const groupAssigned = thirdPlaceAssignments[matchId]; if (groupAssigned && r32Selections[`${groupAssigned}3`]) return { ...r32Selections[`${groupAssigned}3`], isPlaceholder: false }; }
            }
            return getTeamFromSlot(slotStr);
        };
        const homeTeam = resolveSlot(baseMatch.homeStr); const awayTeam = resolveSlot(baseMatch.awayStr);
        let winner = predictions[matchId];
        if (winner && homeTeam && awayTeam && winner.id !== homeTeam.id && winner.id !== awayTeam.id) winner = null; 
        return { ...baseMatch, home: homeTeam, away: awayTeam, predictedWinner: winner };
    }, [mode, knockouts, r32Selections, thirdPlaceAssignments, predictions, getTeamFromSlot]);

    const bracketMatrix = { top: [ ['ko_73', 'ko_75', 'ko_74', 'ko_77', 'ko_83', 'ko_84', 'ko_81', 'ko_82'], ['ko_89', 'ko_90', 'ko_93', 'ko_94'], ['ko_97', 'ko_98'], ['ko_101'] ], bottom: [ ['ko_76', 'ko_78', 'ko_79', 'ko_80', 'ko_86', 'ko_88', 'ko_85', 'ko_87'], ['ko_91', 'ko_92', 'ko_95', 'ko_96'], ['ko_99', 'ko_100'], ['ko_102'] ] };
    
    const getPos = (half, depth, index) => {
        const mainAxes = isPortrait ? [7, 18, 28, 38] : [9, 21, 33, 45]; 
        let main = mainAxes[depth]; if (half === 'bottom') main = 100 - main;
        const crossAxes = [ [6.25, 18.75, 31.25, 43.75, 56.25, 68.75, 81.25, 93.75], [12.5, 37.5, 62.5, 87.5], [25, 75], [50] ];
        let cross = crossAxes[depth][index];
        return isPortrait ? { x: cross, y: main } : { x: main, y: cross };
    };

    const finalMatch = resolveMatch('ko_104');
    const championTeam = mode === 'sandbox' ? finalMatch?.predictedWinner : getMatchWinner(finalMatch);
    
    const nodes = []; const lines = []; const sw = isPortrait ? 0.3 : 0.2; 
    const baseColor = '#475569'; 

    ['top', 'bottom'].forEach(half => {
        [0, 1, 2, 3].forEach(depth => {
            bracketMatrix[half][depth].forEach((mId, index) => {
                const pos = getPos(half, depth, index);
                nodes.push( <BracketNode key={mId} match={resolveMatch(mId)} x={pos.x} y={pos.y} isPortrait={isPortrait} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onTeamClick={onTeamClick} /> );
            });
        });

        [0, 1, 2].forEach(depth => {
            const numPairs = 4 / Math.pow(2, depth);
            for (let i = 0; i < numPairs; i++) {
                const A = getPos(half, depth, i * 2); const B = getPos(half, depth, i * 2 + 1); const Next = getPos(half, depth + 1, i);
                const matchA = resolveMatch(bracketMatrix[half][depth][i * 2]); const matchB = resolveMatch(bracketMatrix[half][depth][i * 2 + 1]);
                const winA = mode === 'sandbox' ? !!matchA?.predictedWinner : !!getMatchWinner(matchA);
                const winB = mode === 'sandbox' ? !!matchB?.predictedWinner : !!getMatchWinner(matchB);
                
                const widthA = winA ? sw * 2.5 : sw; 
                const widthB = winB ? sw * 2.5 : sw; 
                const widthNext = (winA || winB) ? sw * 2.5 : sw;

                const champId = championTeam?.id;
                const isChampA = champId && matchA?.predictedWinner?.id === champId;
                const isChampB = champId && matchB?.predictedWinner?.id === champId;
                const isChampNext = isChampA || isChampB;
                const delay = depth * 0.4;

                if (isPortrait) {
                    const midY = (A.y + Next.y) / 2;
                    const pathA = `M ${A.x} ${A.y} L ${A.x} ${midY} L ${Next.x} ${midY}`;
                    const pathB = `M ${B.x} ${B.y} L ${B.x} ${midY} L ${Next.x} ${midY}`;
                    const pathN = `M ${Next.x} ${midY} L ${Next.x} ${Next.y}`;

                    lines.push(<path key={`L-${half}-${depth}-${i}-A`} d={pathA} stroke={baseColor} strokeWidth={widthA} fill="none" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-B`} d={pathB} stroke={baseColor} strokeWidth={widthB} fill="none" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-N`} d={pathN} stroke={baseColor} strokeWidth={widthNext} fill="none" />);

                    if (isChampA) lines.push(<path key={`C-A-${half}-${depth}-${i}`} className="gold-path" style={{animationDelay: `${delay}s`}} d={pathA} strokeWidth={sw * 3} fill="none" />);
                    if (isChampB) lines.push(<path key={`C-B-${half}-${depth}-${i}`} className="gold-path" style={{animationDelay: `${delay}s`}} d={pathB} strokeWidth={sw * 3} fill="none" />);
                    if (isChampNext) lines.push(<path key={`C-N-${half}-${depth}-${i}`} className="gold-path" style={{animationDelay: `${delay + 0.2}s`}} d={pathN} strokeWidth={sw * 3} fill="none" />);

                } else {
                    const midX = (A.x + Next.x) / 2;
                    const pathA = `M ${A.x} ${A.y} L ${midX} ${A.y} L ${midX} ${Next.y}`;
                    const pathB = `M ${B.x} ${B.y} L ${midX} ${B.y} L ${midX} ${Next.y}`;
                    const pathN = `M ${midX} ${Next.y} L ${Next.x} ${Next.y}`;

                    lines.push(<path key={`L-${half}-${depth}-${i}-A`} d={pathA} stroke={baseColor} strokeWidth={widthA} fill="none" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-B`} d={pathB} stroke={baseColor} strokeWidth={widthB} fill="none" />);
                    lines.push(<path key={`L-${half}-${depth}-${i}-N`} d={pathN} stroke={baseColor} strokeWidth={widthNext} fill="none" />);

                    if (isChampA) lines.push(<path key={`C-A-${half}-${depth}-${i}`} className="gold-path" style={{animationDelay: `${delay}s`}} d={pathA} strokeWidth={sw * 3} fill="none" />);
                    if (isChampB) lines.push(<path key={`C-B-${half}-${depth}-${i}`} className="gold-path" style={{animationDelay: `${delay}s`}} d={pathB} strokeWidth={sw * 3} fill="none" />);
                    if (isChampNext) lines.push(<path key={`C-N-${half}-${depth}-${i}`} className="gold-path" style={{animationDelay: `${delay + 0.2}s`}} d={pathN} strokeWidth={sw * 3} fill="none" />);
                }
            }
        });
    });

    const finalPos = { x: 50, y: 50 };
    const topSemi = getPos('top', 3, 0); const bottomSemi = getPos('bottom', 3, 0);
    const championPos = isPortrait ? { x: 18, y: 50 } : { x: 50, y: 16 };
    const thirdPos = isPortrait ? { x: 82, y: 50 } : { x: 50, y: 84 };
    
    const matchTopSemi = resolveMatch(bracketMatrix.top[3][0]); const matchBotSemi = resolveMatch(bracketMatrix.bottom[3][0]);
    const winTopSF = mode === 'sandbox' ? !!matchTopSemi?.predictedWinner : !!getMatchWinner(matchTopSemi);
    const winBotSF = mode === 'sandbox' ? !!matchBotSemi?.predictedWinner : !!getMatchWinner(matchBotSemi);

    lines.push(<line key="L-final-top" x1={topSemi.x} y1={topSemi.y} x2={finalPos.x} y2={finalPos.y} stroke={baseColor} strokeWidth={winTopSF ? sw * 2.5 : sw} />);
    lines.push(<line key="L-final-bot" x1={bottomSemi.x} y1={bottomSemi.y} x2={finalPos.x} y2={finalPos.y} stroke={baseColor} strokeWidth={winBotSF ? sw * 2.5 : sw} />);

    if (championTeam && matchTopSemi?.predictedWinner?.id === championTeam.id) lines.push(<line key="C-F-T" className="gold-path" style={{animationDelay: `1.2s`}} x1={topSemi.x} y1={topSemi.y} x2={finalPos.x} y2={finalPos.y} strokeWidth={sw * 3} />);
    if (championTeam && matchBotSemi?.predictedWinner?.id === championTeam.id) lines.push(<line key="C-F-B" className="gold-path" style={{animationDelay: `1.2s`}} x1={bottomSemi.x} y1={bottomSemi.y} x2={finalPos.x} y2={finalPos.y} strokeWidth={sw * 3} />);

    const thirdPlaceMatch = resolveMatch('ko_103');
    const isChampionGenerated = mode === 'sandbox' ? !!finalMatch?.predictedWinner : !!getMatchWinner(finalMatch);
    
    lines.push( <line key="L-champion" x1={finalPos.x} y1={finalPos.y} x2={championPos.x} y2={championPos.y} stroke={baseColor} strokeWidth={isChampionGenerated ? sw * 2.5 : sw} strokeDasharray={isChampionGenerated ? "0" : "1,1"} /> );
    if (isChampionGenerated) lines.push(<line key="C-F-WIN" className="gold-path" style={{animationDelay: `1.6s`}} x1={finalPos.x} y1={finalPos.y} x2={championPos.x} y2={championPos.y} strokeWidth={sw * 3} />);

    nodes.push(<BracketNode key="ko_104" match={finalMatch} x={finalPos.x} y={finalPos.y} isPortrait={isPortrait} mode={mode} isFinal setPrediction={setPrediction} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />);
    nodes.push(<BracketNode key="ko_103" match={thirdPlaceMatch} x={thirdPos.x} y={thirdPos.y} isPortrait={isPortrait} mode={mode} isThirdPlace setPrediction={setPrediction} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />);

    nodes.push(
        <div key="champion_node" className={`absolute flex flex-col items-center justify-center border-2 rounded-xl z-[60] transition-all duration-500 ${championTeam ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.7)] scale-125' : 'bg-slate-900 border-dashed border-slate-700'}`} style={{ left: `${championPos.x}%`, top: `${championPos.y}%`, transform: 'translate(-50%, -50%)', width: isPortrait ? '14%' : '12%', height: isPortrait ? '7.5%' : '11%', maxWidth: '100px', minWidth: '46px' }}>
            <div className="absolute -top-6 text-xl sm:text-2xl animate-bounce drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">👑</div>
            {championTeam ? ( <><TeamFlag flag={championTeam.flag} sizeClass="w-6 h-6 sm:w-8 sm:h-8 mb-1 drop-shadow-md" /><span className="text-[10px] sm:text-xs font-black text-yellow-400 truncate w-full text-center px-1 leading-none">{championTeam.name}</span></> ) : ( <span className="text-[9px] sm:text-[11px] text-slate-500 font-bold whitespace-nowrap">冠军之路</span> )}
        </div>
    );

    return (
        <div className="absolute inset-0 bg-slate-950 overflow-hidden select-none">
            <style>{`
                @keyframes drawGoldLine {
                    from { stroke-dashoffset: 150; }
                    to { stroke-dashoffset: 0; }
                }
                .gold-path {
                    stroke: #facc15; 
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    filter: drop-shadow(0 0 6px rgba(234,179,8,0.9));
                    stroke-dasharray: 150;
                    stroke-dashoffset: 150;
                    animation: drawGoldLine 0.5s ease-out forwards;
                }
            `}</style>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0">{lines}</svg>
            {nodes}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-20"><RealTrophy className="w-32 h-32 lg:w-48 lg:h-48 grayscale opacity-40" /></div>
        </div>
    )
}

const BracketNode = ({ match, x, y, isPortrait, mode, isFinal, isThirdPlace, setPrediction, onMatchClick, onTeamClick }) => {
    if (!match) return null;
    const isSandbox = mode === 'sandbox'; const isLive = mode === 'live';
    const liveWinner = isLive ? getMatchWinner(match) : null;
    const homeWinner = isSandbox ? match.predictedWinner?.id === match.home?.id : liveWinner?.id === match.home?.id;
    const awayWinner = isSandbox ? match.predictedWinner?.id === match.away?.id : liveWinner?.id === match.away?.id;

    const handleHomeClick = (e) => { e.stopPropagation(); if (isLive && onTeamClick && match.home && !match.home.isPlaceholder) onTeamClick(match.home); else if (isLive && onMatchClick) onMatchClick(match); if (isSandbox && match.home && !match.home.isPlaceholder) setPrediction(match.id, match.home); }
    const handleAwayClick = (e) => { e.stopPropagation(); if (isLive && onTeamClick && match.away && !match.away.isPlaceholder) onTeamClick(match.away); else if (isLive && onMatchClick) onMatchClick(match); if (isSandbox && match.away && !match.away.isPlaceholder) setPrediction(match.id, match.away); }

    return (
        <div className={`absolute flex flex-col justify-center bg-slate-900 border ${isSandbox && match.predictedWinner ? 'border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : isFinal ? 'border-yellow-600/80 shadow-[0_0_15px_rgba(234,179,8,0.3)] z-40' : 'border-slate-700'} rounded overflow-hidden z-10 hover:z-50 hover:scale-125 transition-all duration-300`} style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', width: isPortrait ? '12.2%' : '13%', height: isPortrait ? '7.5%' : '10.5%', maxWidth: '120px', minWidth: '42px', minHeight: '38px' }}>
            {isFinal && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[6px] text-yellow-500 font-bold whitespace-nowrap bg-yellow-500/20 px-1 rounded flex items-center gap-0.5 hidden sm:flex">终极决战</div>}
            {isThirdPlace && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[6px] text-slate-400 font-bold whitespace-nowrap bg-slate-800 px-1 rounded hidden sm:block">季军战</div>}
            
            <div className={`w-full h-[50%] flex items-center justify-between px-1 border-b border-slate-800/80 cursor-pointer ${isSandbox && match.home && !match.home.isPlaceholder && !homeWinner ? 'hover:bg-yellow-500/20' : ''} ${homeWinner ? 'bg-emerald-900/60 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`} onClick={handleHomeClick}>
                <div className="flex items-center w-[85%] overflow-hidden min-w-0 flex-1">
                    <TeamFlag flag={match.home?.flag} sizeClass="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                    <span className={`text-[6px] sm:text-[9px] ml-0.5 sm:ml-1.5 leading-none truncate block ${homeWinner ? 'font-bold text-yellow-400' : match.home?.isPlaceholder ? 'text-slate-500' : 'text-slate-200'}`} title={match.home?.name}>{match.home?.name}</span>
                </div>
                {isLive && <span className={`text-[6px] lg:text-[8px] leading-none shrink-0 text-right w-[15%] ${homeWinner ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? match.homeScore : '-'}</span>}
            </div>

            <div className={`w-full h-[50%] flex items-center justify-between px-1 cursor-pointer ${isSandbox && match.away && !match.away.isPlaceholder && !awayWinner ? 'hover:bg-yellow-500/20' : ''} ${awayWinner ? 'bg-emerald-900/60 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`} onClick={handleAwayClick}>
                <div className="flex items-center w-[85%] overflow-hidden min-w-0 flex-1">
                    <TeamFlag flag={match.away?.flag} sizeClass="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
                    <span className={`text-[6px] sm:text-[9px] ml-0.5 sm:ml-1.5 leading-none truncate block ${awayWinner ? 'font-bold text-yellow-400' : match.away?.isPlaceholder ? 'text-slate-500' : 'text-slate-200'}`} title={match.away?.name}>{match.away?.name}</span>
                </div>
                {isLive && <span className={`text-[6px] lg:text-[8px] leading-none shrink-0 text-right w-[15%] ${awayWinner ? 'text-yellow-400 font-bold' : 'text-slate-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? match.awayScore : '-'}</span>}
            </div>
        </div>
    )
}

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
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            {filtered.length > 0 && (
                <div className="absolute top-[calc(50%+30px)] left-0 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50">
                    {filtered.map(t => (
                        <button type="button" key={t.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(t); onChange(''); }} className="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center transition-all border-b border-slate-700/50 last:border-0"><TeamFlag flag={t.flag} sizeClass="w-5 h-5 mr-3" /><span className="text-slate-200 text-sm font-bold">{t.name}</span><span className="ml-auto text-xs text-slate-500 font-mono">{t.group}组</span></button>
                    ))}
                </div>
            )}
        </div>
    )
};

const GroupRankingGame = ({ groups, onComplete }) => {
    const groupLetters = Object.keys(groups); const [currentIndex, setCurrentIndex] = useState(0); const currentGroup = groupLetters[currentIndex];
    const originalTeams = groups[currentGroup].teams.map(t => ({...t, isPlaceholder: false}));
    const [slots, setSlots] = useState([null, null, null, null]); const [allRankings, setAllRankings] = useState({});

    const handleTeamClick = (team) => { if (slots.find(t => t?.id === team.id)) return; const emptyIdx = slots.indexOf(null); if (emptyIdx !== -1) { const newSlots = [...slots]; newSlots[emptyIdx] = team; setSlots(newSlots); } };
    const handleSlotClick = (idx) => { const newSlots = [...slots]; newSlots[idx] = null; setSlots(newSlots); };
    const handleRandomize = () => { const shuffled = [...originalTeams].sort(() => 0.5 - Math.random()); setSlots(shuffled); };
    
    const handleNext = () => {
        const currentSlots = [...slots]; 
        const nextRankings = { ...allRankings, [currentGroup]: currentSlots };
        setAllRankings(nextRankings);
        
        if (currentIndex === groupLetters.length - 1) {
            onComplete(nextRankings);
        } else {
            setCurrentIndex(prev => prev + 1); 
            setSlots([null, null, null, null]); 
        }
    }

    return (
        <div className="flex flex-col items-center max-w-lg mx-auto w-full animate-fade-in px-4 pt-4 sm:pt-10 pb-20">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-wider flex items-center"><GitBranch className="w-6 h-6 mr-2 text-emerald-400"/>排兵布阵阶段</h2>
            <p className="text-slate-400 text-sm mb-6 text-center">你的选择将直接决定104场鏖战的大树格局！</p>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(currentIndex / groupLetters.length) * 100}%` }}></div></div>
                <div className="flex justify-between items-center mb-6 mt-2"><h3 className="text-xl font-bold text-emerald-400">决战 {currentGroup} 组</h3><button onClick={handleRandomize} className="text-xs text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-full flex items-center hover:bg-blue-600 hover:text-white transition-all"><Dices className="w-3.5 h-3.5 mr-1" /> 一键随机</button></div>
                <div className="space-y-3 mb-8">
                    {[0, 1, 2, 3].map(i => {
                        const t = slots[i];
                        return (
                            <div key={`slot-${i}`} onClick={() => t && handleSlotClick(i)} className={`flex items-center p-3 rounded-lg border-2 transition-all ${t ? 'border-emerald-500/50 bg-emerald-900/20 cursor-pointer hover:border-red-500/50' : 'border-dashed border-slate-700 bg-slate-950/50'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs mr-3 shrink-0 ${i < 2 ? 'bg-emerald-500 text-emerald-950' : i === 2 ? 'bg-yellow-500 text-yellow-950' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</div>
                                {t ? ( <div className="flex items-center flex-1 animate-fade-in"><TeamFlag flag={t.flag} sizeClass="w-6 h-6 mr-2" /><span className="font-bold text-white text-sm">{t.name}</span><span className="ml-auto text-[10px] text-slate-500">点击撤回</span></div> ) : ( <span className="text-slate-600 text-sm font-bold flex-1">点击下方球队进入席位...</span> )}
                            </div>
                        )
                    })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {originalTeams.map(t => {
                        const isSelected = slots.find(s => s?.id === t.id);
                        return ( <button key={t.id} disabled={isSelected} onClick={() => handleTeamClick(t)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-slate-800 bg-slate-950 opacity-30 grayscale cursor-not-allowed' : 'border-slate-600 bg-slate-800 hover:border-blue-400 hover:bg-slate-700 hover:-translate-y-1 shadow-lg'}`}><TeamFlag flag={t.flag} sizeClass="w-8 h-8 mb-2 drop-shadow-lg" /><span className="font-bold text-slate-200 text-xs">{t.name}</span></button> )
                    })}
                </div>
                {slots.every(s => s !== null) && ( <button onClick={handleNext} className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-fade-in flex items-center justify-center text-sm transition-all active:scale-95">确认 {currentGroup} 组排名 <ArrowRight className="w-4 h-4 ml-2" /></button> )}
            </div>
        </div>
    )
}

const thirdPlaceConstraints = { 'ko_74': ['A', 'B', 'C', 'D', 'F'], 'ko_77': ['C', 'D', 'F', 'G', 'H'], 'ko_79': ['C', 'E', 'F', 'H', 'I'], 'ko_80': ['E', 'H', 'I', 'J', 'K'], 'ko_81': ['B', 'E', 'F', 'I', 'J'], 'ko_82': ['A', 'E', 'H', 'I', 'J'], 'ko_85': ['E', 'F', 'G', 'I', 'J'], 'ko_87': ['D', 'E', 'I', 'J', 'L'] };

function assignThirdPlaceTeams(selectedGroups) {
   const slots = Object.keys(thirdPlaceConstraints); let assignment = {}; let found = false;
   function backtrack(slotIndex) {
       if (slotIndex === slots.length) { found = true; return true; }
       const slot = slots[slotIndex]; const allowed = thirdPlaceConstraints[slot];
       for (let i = 0; i < selectedGroups.length; i++) {
           const g = selectedGroups[i];
           if (allowed.includes(g) && !Object.values(assignment).includes(g)) { assignment[slot] = g; if (backtrack(slotIndex + 1)) return true; delete assignment[slot]; }
       }
       return false;
   }
   backtrack(0);
   if (!found) { let unassigned = [...selectedGroups]; slots.forEach(slot => { if (!assignment[slot]) assignment[slot] = unassigned.pop(); }); }
   return assignment;
}

const getBestThirdPlaceGroups = (groups) => Object.keys(groups)
  .map(groupName => ({ groupName, team: groups[groupName]?.teams?.[2] }))
  .filter(item => item.team && !item.team.isPlaceholder)
  .sort((a, b) =>
    (b.team.pts || 0) - (a.team.pts || 0) ||
    (b.team.gd || 0) - (a.team.gd || 0) ||
    (b.team.gf || 0) - (a.team.gf || 0) ||
    a.groupName.localeCompare(b.groupName)
  )
  .slice(0, 8)
  .map(item => item.groupName);

const getProjectedThirdAssignments = (groups) => assignThirdPlaceTeams(getBestThirdPlaceGroups(groups));

const resolveProjectedSlot = (slotStr, groups, knockoutFlat, thirdAssignments, matchId) => {
  if (!slotStr || slotStr === '?') return getSlotPlaceholder(slotStr);
  if (/^W\d{2,}$/.test(slotStr)) {
    const match = knockoutFlat.find(item => item.id === `ko_${slotStr.slice(1)}`);
    return getMatchWinner(match) || getSlotPlaceholder(slotStr);
  }
  if (/^L\d{2,}$/.test(slotStr)) {
    const match = knockoutFlat.find(item => item.id === `ko_${slotStr.slice(1)}`);
    const winner = getMatchWinner(match);
    if (winner && match?.home && match?.away) return winner.id === match.home.id ? match.away : match.home;
    return getSlotPlaceholder(slotStr);
  }
  if (slotStr.includes('/')) {
    const assignedGroup = thirdAssignments[matchId];
    const team = assignedGroup ? groups[assignedGroup]?.teams?.[2] : null;
    return team ? { ...team, group: assignedGroup, projectedSlot: `${assignedGroup}3` } : getSlotPlaceholder(slotStr);
  }
  if (/^[A-L][1-4]$/.test(slotStr)) {
    const groupName = slotStr.charAt(0).toUpperCase();
    const rank = parseInt(slotStr.charAt(1), 10) - 1;
    const team = groups[groupName]?.teams?.[rank];
    return team ? { ...team, group: groupName, projectedSlot: slotStr } : getSlotPlaceholder(slotStr);
  }
  return getSlotPlaceholder(slotStr);
};

const buildProjectedKnockouts = (groups, knockoutFlat) => {
  const thirdAssignments = getProjectedThirdAssignments(groups);
  return knockoutFlat.map(match => ({
    ...match,
    home: match.home && !match.home.isPlaceholder ? match.home : resolveProjectedSlot(match.homeStr, groups, knockoutFlat, thirdAssignments, match.id),
    away: match.away && !match.away.isPlaceholder ? match.away : resolveProjectedSlot(match.awayStr, groups, knockoutFlat, thirdAssignments, match.id)
  }));
};

function generateKnockout(standings, sourceKnockouts = officialKnockoutRoundsFlat) {
  const safeStandings = standings && typeof standings === 'object' ? standings : initialGroups;
  return buildProjectedKnockouts(safeStandings, sourceKnockouts);
}

function updateBracketFromStandings(standings, sourceKnockouts = officialKnockoutRoundsFlat) {
  return generateKnockout(standings, sourceKnockouts);
}

class SafeSectionBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('世界杯模块渲染失败:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-[#050816] p-4 flex items-center justify-center">
          <div className="rounded-[18px] border border-[#1f2a44] bg-[#111827] p-5 text-center text-[#94a3b8]">
            <div className="text-[#ef4444] font-black mb-2">模块加载失败</div>
            <div className="text-sm">页面暂时没有加载成功，请刷新或稍后再试。</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PredictionSandbox({ getTeamFromSlot, groups, onExitHome, isFullscreen, setIsFullscreen }) {
  const [phase, setPhase] = useState('intro'); 
  const [sandboxRankings, setSandboxRankings] = useState({});
  const [selectedThirds, setSelectedThirds] = useState([]);
  const [thirdPlaceAssignments, setThirdPlaceAssignments] = useState({});
  const [predictions, setPredictions] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleRankingComplete = (groupRankings) => {
      const absoluteRankings = {};
      Object.keys(groupRankings).forEach(group => { 
          if (groupRankings[group]) {
              groupRankings[group].forEach((team, index) => { if (team) absoluteRankings[`${group}${index + 1}`] = team; }); 
          }
      });
      setSandboxRankings(absoluteRankings); setPhase('select_thirds');
  };

  const finalizeThirds = () => { setThirdPlaceAssignments(assignThirdPlaceTeams(selectedThirds)); setPhase('generating'); setTimeout(() => setPhase('bracket'), 1500); };
  
  const handleReset = (e) => { 
      e.stopPropagation();
      if (window.confirm("确定要清空推演记录，重新排兵布阵吗？")) { 
          setPredictions({}); setSandboxRankings({}); setSelectedThirds([]); setThirdPlaceAssignments({}); setPhase('intro'); setShowCompletionModal(false); 
      } 
  };
  
  const handleExit = (e) => { 
      e.stopPropagation();
      if (phase === 'intro') {
          if (onExitHome) onExitHome();
          return;
      }
      if(window.confirm("返回上一页，当前推演进度会保留。确认返回吗？")) { 
          if (onExitHome) onExitHome();
      } 
  };

  const handleContainerClick = () => {
      if (phase === 'bracket') {
          setIsFullscreen(!isFullscreen);
      }
  };

  const finalMatchWinner = predictions['ko_104']; 
  useEffect(() => { if (finalMatchWinner) { const timer = setTimeout(() => setShowCompletionModal(true), 1000); return () => clearTimeout(timer); } }, [finalMatchWinner, predictions]);

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden" onClick={handleContainerClick}>
        {!isFullscreen && (
            <div className="flex justify-between items-center bg-slate-900/80 px-4 py-2 border-b border-slate-800 z-50 shrink-0 shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center space-x-2">
                    <button type="button" onClick={handleExit} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-all">
                        <X className="w-5 h-5"/>
                    </button>
                    <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                    <span className="font-bold text-white text-xs sm:text-base">
                        {phase === 'intro' && '冠军推演沙盘'}
                        {phase === 'ranking' && '冠军之路：小组排序'}
                        {phase === 'select_thirds' && '冠军之路：第三名选择'}
                        {phase === 'generating' && '对阵树落位中'}
                        {phase === 'bracket' && '我的冠军推演板'}
                    </span>
                </div>
                {phase === 'bracket' && (
                    <button onClick={handleReset} className="text-[10px] sm:text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-full flex items-center transition-all">
                        <RotateCcw className="w-3 h-3 mr-1" /> 清空重推
                    </button>
                )}
            </div>
        )}

        <div className={`flex-1 w-full h-full relative custom-scrollbar ${phase === 'bracket' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {phase === 'intro' && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in pb-20">
                    <RealTrophy className="w-32 h-32 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-bounce" />
                    <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-widest mb-4">冠军推演沙盘</h2>
                    <p className="text-slate-400 text-sm sm:text-base mb-10 max-w-md leading-relaxed">先为 12 个小组排列名次，再选出最佳第三名，最后逐轮点击晋级球队，完成你的冠军路线。</p>
                    <button onClick={(e) => { e.stopPropagation(); setPhase('ranking'); }} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-lg px-10 py-4 rounded-full shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center">开始排兵布阵 <ArrowRight className="w-5 h-5 ml-2" /></button>
                </div>
            )}
            {phase === 'ranking' && ( <div onClick={e => e.stopPropagation()}><GroupRankingGame groups={groups} onComplete={handleRankingComplete} /></div> )}
            {phase === 'select_thirds' && (
                <div className="flex flex-col items-center max-w-2xl mx-auto w-full animate-fade-in px-4 pt-4 sm:pt-10 h-full pb-20" onClick={e => e.stopPropagation()}>
                    <h2 className="text-xl sm:text-3xl font-black text-white mb-2 flex items-center"><Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-400"/>选取8支晋级第三名</h2>
                    <p className="text-slate-400 text-xs sm:text-sm mb-6 text-center">48强扩军特有规则：12个小组的第三名中，成绩最好的 8 支球队将复活进入 32 强。</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full mb-8">
                        {Object.keys(groups).map(g => {
                            const team = sandboxRankings[`${g}3`]; if (!team) return null; const isSelected = selectedThirds.includes(g);
                            return (
                                <button key={g} onClick={() => { if (isSelected) setSelectedThirds(selectedThirds.filter(x => x !== g)); else if (selectedThirds.length < 8) setSelectedThirds([...selectedThirds, g]); }} className={`relative p-2 sm:p-3 rounded-xl border-2 flex flex-col items-center transition-all ${isSelected ? 'border-yellow-500 bg-yellow-900/30 shadow-[0_0_10px_rgba(234,179,8,0.3)] scale-105' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                                    <TeamFlag flag={team.flag} sizeClass="w-6 h-6 sm:w-8 sm:h-8 mb-2" /><span className="font-bold text-[10px] sm:text-xs text-white truncate w-full text-center">{team.name}</span><span className="text-[9px] text-slate-400 mt-1">{g}组第三</span>{isSelected && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-yellow-500" />}
                                </button>
                            )
                        })}
                    </div>
                    <button disabled={selectedThirds.length !== 8} onClick={finalizeThirds} className={`w-full py-3.5 rounded-xl font-black transition-all ${selectedThirds.length === 8 ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>{selectedThirds.length === 8 ? '生成最终 32 强对阵树' : `已选 ${selectedThirds.length} / 8 支球队`}</button>
                </div>
            )}
            {phase === 'generating' && ( <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in pb-20"><RefreshCw className="w-16 h-16 text-blue-500 animate-spin mb-6" /><h3 className="text-xl font-bold text-white mb-2">正在将 32 强名单导入国际足联落位图...</h3></div> )}
            
            {phase === 'bracket' && (
                <div id="capture-prediction" className="w-full h-full flex flex-col relative bg-slate-950 overflow-hidden">
                    <div className="absolute top-2 sm:top-4 left-0 right-0 text-center z-20 pointer-events-none">
                        <h2 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-wider inline-block bg-slate-950/80 backdrop-blur-md px-5 py-1.5 rounded-full border border-slate-800 shadow-xl">2026我的夺冠预测卷</h2>
                    </div>
                    
                    <div className="absolute top-12 left-0 right-0 bottom-24">
                        <FullScreenBracket mode="sandbox" r32Selections={sandboxRankings} thirdPlaceAssignments={thirdPlaceAssignments} predictions={predictions} setPrediction={(mId, team) => setPredictions(p => ({...p, [mId]: team}))} getTeamFromSlot={getTeamFromSlot} />
                    </div>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-100 flex justify-center w-full">
                    </div>
                </div>
            )}
        </div>

        {showCompletionModal && finalMatchWinner && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCompletionModal(false)}>
                <div className="bg-slate-900 border border-yellow-500/50 rounded-2xl p-6 sm:p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowCompletionModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-5 h-5"/></button>
                    <RealTrophy className="w-24 h-24 mb-4 drop-shadow-2xl animate-bounce" />
                    <h3 className="text-2xl font-black text-white mb-2">推演完成</h3>
                    <p className="text-sm text-slate-400 mb-6">你预测 <span className="font-bold text-yellow-400">{finalMatchWinner.name}</span> 将捧起2026年大力神杯。</p>
                    <button onClick={() => setShowCompletionModal(false)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-950 font-black text-lg py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center mb-3">
                        返回查看全景大树
                    </button>
                    <p className="text-xs text-slate-500">提示：点击屏幕空白处可进入全屏，方便您手机截屏</p>
                </div>
            </div>
        )}
    </div>
  );
}

function TeamMeetingPredictor({ groups, isFullscreen, setIsFullscreen }) {
    const [teamA, setTeamA] = useState(null); const [teamB, setTeamB] = useState(null);
    const [searchA, setSearchA] = useState(''); const [searchB, setSearchB] = useState('');
    const [isCalculating, setIsCalculating] = useState(false); const [results, setResults] = useState(null);

    const allTeams = useMemo(() => { let teams = []; Object.keys(groups).forEach(g => { groups[g].teams.forEach(t => teams.push({...t, group: g})); }); return teams; }, [groups]);

    const calculateMeetings = (e) => {
        e.stopPropagation();
        if (!teamA || !teamB) {
            setResults(null);
            setIsCalculating(false);
            return;
        }
        setIsCalculating(true);
        setTimeout(() => {
            try {
                const ranks = [1, 2, 3]; let scenarios = [];
                ranks.forEach(rankA => {
                    ranks.forEach(rankB => {
                        if (teamA.group === teamB.group && rankA === rankB) return;
                        const slotsA = SLOT_TO_MATCH[`${teamA.group}${rankA}`] || [];
                        const slotsB = SLOT_TO_MATCH[`${teamB.group}${rankB}`] || [];
                        if (slotsA.length === 0 || slotsB.length === 0) return;
                        let possibleRounds = new Set();
                        slotsA.forEach(m1 => { slotsB.forEach(m2 => { const meetRound = getMeetingRound(m1, m2); if (meetRound) possibleRounds.add(meetRound); }); });
                        const roundOrder = { '1/16决赛':1, '1/8决赛':2, '1/4决赛':3, '半决赛':4, '决赛':5 };
                        const sortedRounds = Array.from(possibleRounds).sort((a,b) => (roundOrder[a] || 5) - (roundOrder[b] || 5));
                        if (sortedRounds.length > 0) {
                            const earliest = sortedRounds[0] || '决赛'; 
                            let meetAtStr = sortedRounds.length > 1 ? sortedRounds.join(' 或 ') : earliest;
                            if (meetAtStr === '决赛') meetAtStr = '分属不同半区，最早只能在决赛相逢';
                            scenarios.push({ rankA, rankB, meetAt: meetAtStr, earliestRound: earliest });
                        }
                    });
                });
                setResults(scenarios.length > 0 ? scenarios : [{ rankA: '-', rankB: '-', meetAt: '暂无可推演路径，请更换球队或等待数据更新', earliestRound: '待定' }]);
            } catch (error) {
                console.error('宿命对决推演失败:', error);
                setResults([{ rankA: '-', rankB: '-', meetAt: '暂时无法计算，请稍后重试', earliestRound: '待定' }]);
            } finally {
                setIsCalculating(false);
            }
        }, 500); 
    };

    const handleClear = (e) => { e.stopPropagation(); setTeamA(null); setTeamB(null); setSearchA(''); setSearchB(''); setResults(null); };
    const handleSelectA = (team) => { setTeamA(team); setResults(null); };
    const handleSelectB = (team) => { setTeamB(team); setResults(null); };

    const handleContainerClick = () => {
        if (results && !isCalculating) {
            setIsFullscreen(!isFullscreen);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden" onClick={handleContainerClick}>
            <div className={`flex-1 w-full h-full relative custom-scrollbar ${isFullscreen ? 'overflow-hidden' : 'overflow-y-auto pb-10'}`}>
                {!isFullscreen && (
                    <div className="text-center pt-6 pb-4 px-4 shrink-0" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 tracking-wider flex items-center justify-center mb-2"><Swords className="w-6 h-6 mr-2 text-red-500"/>宿命对决：相遇推演</h2>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">精准计算两支主队在104场鏖战中，最早可能发生遭遇战的轮次。严格依据国际足联 2026 最新上下半区分区法则计算。</p>
                    </div>
                )}

                {!isFullscreen && (
                    <div className="px-4 max-w-2xl mx-auto w-full z-20 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                            <div className="w-full sm:w-1/2"><TeamSearchInput value={searchA} onChange={setSearchA} onSelect={handleSelectA} selectedTeam={teamA} placeholder="输入第一支球队名..." allTeams={allTeams} /></div>
                            <div className="shrink-0 hidden sm:flex text-slate-600 font-black italic text-2xl">VS</div>
                            <div className="w-full sm:w-1/2"><TeamSearchInput value={searchB} onChange={setSearchB} onSelect={handleSelectB} selectedTeam={teamB} placeholder="输入第二支球队名..." allTeams={allTeams} /></div>
                        </form>
                        <div className="flex gap-3">
                            <button onClick={calculateMeetings} disabled={!teamA || !teamB || isCalculating} className={`flex-1 py-4 rounded-xl font-black text-lg flex items-center justify-center transition-all shadow-lg ${teamA && teamB ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                                {isCalculating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Swords className="w-5 h-5 mr-2" />}{isCalculating ? '正在计算路径...' : '开始推演宿命相遇点'}
                            </button>
                            {results && <button onClick={handleClear} className="px-6 bg-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-all font-bold">重置</button>}
                        </div>
                    </div>
                )}

                {results && teamA && teamB && !isCalculating && (
                    <div id="capture-meeting" className={`px-2 sm:px-4 max-w-2xl mx-auto w-full animate-fade-in relative z-10 bg-slate-950 ${isFullscreen ? 'h-full flex flex-col justify-center pb-0' : 'mt-8 pb-6'}`}>
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden relative shadow-2xl pb-4">
                            <div className="bg-slate-800/80 p-6 text-center border-b border-slate-700">
                                <h3 className="text-xl font-black text-white mb-4">宿命相遇可能性报告</h3>
                                <div className="flex items-center justify-center space-x-6">
                                    <div className="flex flex-col items-center"><TeamFlag flag={teamA.flag} sizeClass="w-10 h-10 mb-1 shadow-lg" /><span className="text-sm font-bold text-slate-300">{teamA.name}</span></div>
                                    <span className="text-2xl font-black text-red-500 italic">VS</span>
                                    <div className="flex flex-col items-center"><TeamFlag flag={teamB.flag} sizeClass="w-10 h-10 mb-1 shadow-lg" /><span className="text-sm font-bold text-slate-300">{teamB.name}</span></div>
                                </div>
                            </div>
                            <div className="p-2 sm:p-4 bg-slate-950 relative pb-28">
                                <div className="grid grid-cols-1 gap-2">
                                    {results.map((res, idx) => {
                                        const isFinal = res.earliestRound === '决赛'; const isEarly = res.meetAt && (res.meetAt.includes('1/16') || res.meetAt.includes('1/8'));
                                        return (
                                        <div key={idx} className={`flex items-center p-3 rounded-xl border ${isFinal ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-slate-900 border-slate-800'} transition-all`}>
                                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center text-[10px] sm:text-sm font-bold text-slate-300">
                                                <div className="flex items-center"><span className="w-14 sm:w-16 truncate leading-tight">{teamA?.name}</span><span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 mx-1 sm:mx-2 text-[9px] sm:text-[10px]">第{res.rankA}名晋级</span></div>
                                                <span className="hidden sm:inline text-slate-600 mx-2">+</span>
                                                <div className="flex items-center mt-2 sm:mt-0"><span className="w-14 sm:w-16 truncate leading-tight">{teamB?.name}</span><span className="px-2 py-0.5 bg-slate-800 rounded text-blue-400 mx-1 sm:mx-2 text-[9px] sm:text-[10px]">第{res.rankB}名晋级</span></div>
                                            </div>
                                            <div className={`ml-auto shrink-0 flex items-center justify-end w-32 sm:w-48 font-black text-[10px] sm:text-sm ${isFinal ? 'text-yellow-400' : isEarly ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {isFinal ? '🏆 ' : isEarly ? '⚔️ ' : '🎯 '} {res.meetAt}
                                            </div>
                                        </div>
                                    )})}
                                </div>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-100 pointer-events-none flex justify-center w-full">
                                </div>
                            </div>
                        </div>
                        {isFullscreen && <p className="text-center text-[10px] text-slate-500 mt-4">提示：再次点击屏幕空白处恢复导航</p>}
                    </div>
                )}
            </div>
        </div>
    )
}

function DailyPredictionsView() {
  const [visibleMatches, setVisibleMatches] = useState(() => getFallbackPredictionMatches());
  const [listStatus, setListStatus] = useState('LOCAL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [analysisIds, setAnalysisIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState({});
  const [message, setMessage] = useState('请选择比赛');
  const resultsRef = useRef(null);
  const windowLabel = useMemo(() => getDailyWindowLabel(), []);

  const analysisMatches = useMemo(
    () => visibleMatches.filter(match => analysisIds.includes(match.id)),
    [analysisIds, visibleMatches]
  );

  useEffect(() => {
    let cancelled = false;
    const loadMatches = async () => {
      try {
        setListStatus('LOADING');
        const response = await fetch('/api/worldcup');
        const data = await response.json();
        if (!response.ok || data.error) throw new Error('赛程暂时无法加载');
        if (cancelled) return;
        setVisibleMatches(getTodayPredictionMatches(data.fixtures));
        setListStatus(data.stale ? 'STALE' : 'SUCCESS');
      } catch (error) {
        console.warn('每日预测赛程加载失败:', error);
        if (!cancelled) {
          setVisibleMatches(getFallbackPredictionMatches());
          setListStatus('LOCAL');
        }
      }
    };
    loadMatches();
    return () => { cancelled = true; };
  }, []);

  const toggleSelected = useCallback((event, id) => {
    event.stopPropagation();
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }, []);

  const scrollToResults = useCallback(() => {
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  const analyzeSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      setMessage('请选择比赛');
      setAnalysisIds([]);
      scrollToResults();
      return;
    }
    setMessage('');
    setAnalysisIds(selectedIds);
    setExpandedIds(Object.fromEntries(selectedIds.map(id => [id, true])));
    scrollToResults();
  }, [scrollToResults, selectedIds]);

  const analyzeAll = useCallback(() => {
    const allIds = visibleMatches.map(match => match.id);
    if (allIds.length === 0) {
      setMessage('当前更新周期暂无可分析比赛');
      setAnalysisIds([]);
      scrollToResults();
      return;
    }
    setSelectedIds(allIds);
    setMessage('');
    setAnalysisIds(allIds);
    setExpandedIds(Object.fromEntries(allIds.map(id => [id, true])));
    scrollToResults();
  }, [scrollToResults, visibleMatches]);

  const toggleResult = useCallback((id) => {
    setExpandedIds(current => ({ ...current, [id]: !current[id] }));
  }, []);

  const renderProbabilityBars = (probabilities) => {
    const rows = [
      ['主胜', probabilities?.home || 0, '#22c55e'],
      ['平局', probabilities?.draw || 0, '#22d3ee'],
      ['客胜', probabilities?.away || 0, '#ef4444']
    ];
    return (
      <div className="space-y-1.5">
        {rows.map(([label, value, color]) => (
          <div key={label} className="grid grid-cols-[34px_1fr_34px] items-center gap-2 text-[10px] text-[#94a3b8]">
            <span>{label}</span>
            <div className="h-1.5 rounded-full bg-[#0b1020] overflow-hidden border border-[#1f2a44]">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${value}%`, backgroundColor: color }} />
            </div>
            <span className="text-right text-[#e5e7eb] font-bold">{value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="h-full flex flex-col bg-[#050816] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        <div className="max-w-4xl mx-auto w-full px-3 sm:px-5 py-5 sm:py-8">
          <div className="mb-5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-black tracking-[0.18em] shadow-[0_0_18px_rgba(34,211,238,0.14)]">
              <Sparkles className="w-3.5 h-3.5" /> 每日更新
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 tracking-wider">世界杯每日预测</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#94a3b8]">每天下午2点更新分析；当前可选比赛范围：北京时间 {windowLabel}。</p>
            <SiteWatermark className="mt-3 text-[11px] sm:text-sm" />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-cyan-300" />
              比赛选择区
            </h3>
            <span className="text-[10px] sm:text-xs text-[#94a3b8]">{listStatus === 'SUCCESS' ? '赛程已更新' : listStatus === 'LOADING' ? '加载赛程中' : listStatus === 'STALE' ? '显示最近赛程' : '赛程已载入'}</span>
          </div>

          <div className="rounded-[18px] border border-[#1f2a44] bg-[#111827] overflow-hidden shadow-[0_0_18px_rgba(15,23,42,0.45)]">
            {visibleMatches.map(match => {
              const isSelected = selectedIds.includes(match.id);
              const hasAnalysis = !!getAnalysisForMatch(match);
              return (
                <label key={match.id} className={`grid grid-cols-[28px_52px_1fr_82px] sm:grid-cols-[32px_70px_1fr_104px] items-center gap-2 px-3 py-2.5 border-b border-[#1f2a44] last:border-b-0 bg-[#111827] hover:bg-[#0b1020] hover:shadow-[0_0_18px_rgba(34,211,238,0.12)] transition-all duration-200 ${isSelected ? 'shadow-[inset_3px_0_0_#22d3ee]' : ''}`}>
                  <input type="checkbox" checked={isSelected} onChange={(event) => toggleSelected(event, match.id)} className="h-4 w-4 accent-cyan-400" />
                  <span className="text-[10px] sm:text-xs text-[#94a3b8] font-mono">{match.time}</span>
                  <span className="min-w-0 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black text-[#e5e7eb]">
                    <TeamFlag flag={match.homeTeam.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="truncate">{match.homeTeam.name || '未知球队'}</span>
                    <span className="text-[#22d3ee] font-black">vs</span>
                    <span className="truncate">{match.awayTeam.name || '未知球队'}</span>
                    <TeamFlag flag={match.awayTeam.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  </span>
                  <span className={`justify-self-end rounded-lg border px-2 py-1 text-[10px] sm:text-xs font-black shadow-[0_0_12px_rgba(34,211,238,0.12)] ${hasAnalysis ? 'border-[#22d3ee]/40 bg-[#22d3ee]/10 text-[#22d3ee]' : 'border-[#1f2a44] bg-[#0b1020] text-[#94a3b8]'}`}>{getPredictionAdvice(getAnalysisForMatch(match))}</span>
                </label>
              );
            })}
            {visibleMatches.length === 0 && <div className="p-6 text-center text-sm text-[#94a3b8]">当前更新周期暂无可选比赛</div>}
          </div>

          <div className="mt-4 rounded-[18px] border border-[#1f2a44] bg-[#0b1020] p-3">
            <h3 className="mb-3 text-sm sm:text-base font-black text-[#e5e7eb]">操作区</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" onClick={analyzeSelected} className="wc-cyan-button w-full py-2.5 text-sm font-black">分析选中比赛</button>
              <button type="button" onClick={analyzeAll} className="wc-cyan-button w-full py-2.5 text-sm font-black">一键分析本周期全部比赛</button>
            </div>
          </div>

          <div ref={resultsRef} className="mt-5">
            <h3 className="mb-3 text-sm sm:text-base font-black text-[#e5e7eb]">分析展示区</h3>
            {message && (
              <div className="rounded-[18px] border border-[#1f2a44] bg-[#111827] p-5 text-center text-sm font-bold text-[#94a3b8]">{message}</div>
            )}
            <div className="space-y-3">
              {analysisMatches.map(match => {
                const analysis = getAnalysisForMatch(match);
                const isOpen = expandedIds[match.id] !== false;
                return (
                  <article key={`analysis-${match.id}`} className="rounded-[18px] border border-[#1f2a44] bg-[#111827] overflow-hidden transition-all duration-200 hover:border-[#22d3ee] hover:shadow-[0_0_22px_rgba(34,211,238,0.18)]">
                    <button type="button" onClick={() => toggleResult(match.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left">
                      <span className="min-w-0">
                        <span className="block text-sm sm:text-base font-black text-[#e5e7eb] truncate">{match.homeTeam.name} vs {match.awayTeam.name}</span>
                        <span className="block text-[10px] text-[#94a3b8] mt-0.5">{match.time} · {analysis ? `预测 ${analysis.final.score}` : '分析待更新'}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#22d3ee] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#1f2a44] bg-[#0b1020] p-4 animate-fade-in">
                        {!analysis ? (
                          <div className="rounded-xl border border-dashed border-[#1f2a44] bg-[#050816] p-5 text-center text-sm text-[#94a3b8]">
                            这场比赛的分析待更新。
                          </div>
                        ) : (
                        <>
                        <div className="mb-3 rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 p-3">
                          <div className="text-[10px] font-black text-[#22d3ee] mb-1">【结论】</div>
                          <div className="text-lg sm:text-xl font-black text-[#e5e7eb] leading-snug">{analysis.conclusion}</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs font-black text-[#22d3ee] mb-2">【分析逻辑】</div>
                              <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-[#e5e7eb]">
                                <p><span className="text-[#94a3b8]">1. 状态分析：</span>{analysis.logic.form}</p>
                                <p><span className="text-[#94a3b8]">2. 战术对比：</span>{analysis.logic.tactics}</p>
                                <p><span className="text-[#94a3b8]">3. 攻防特点：</span>{analysis.logic.attackDefense}</p>
                                <p><span className="text-[#94a3b8]">4. 主客因素：</span>{analysis.logic.venue}</p>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-black text-[#22d3ee] mb-2">【关键证据】</div>
                              <ul className="space-y-1.5 text-xs sm:text-sm text-[#e5e7eb]">
                                {analysis.evidence.map(item => <li key={item} className="flex gap-2"><span className="text-[#22c55e]">-</span><span>{item}</span></li>)}
                              </ul>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="rounded-xl border border-[#1f2a44] bg-[#050816] p-3">
                              <div className="text-xs font-black text-[#22d3ee] mb-2">胜平负概率</div>
                              {analysis.probabilities ? renderProbabilityBars(analysis.probabilities) : <div className="text-xs text-[#94a3b8]">概率待更新</div>}
                            </div>
                            <div className="rounded-xl border border-[#1f2a44] bg-[#050816] p-3">
                              <div className="text-xs font-black text-[#22d3ee] mb-2">赔率/新闻/伤病总结</div>
                              <div className="space-y-1 text-xs text-[#94a3b8]">{analysis.news.map(item => <div key={item}>{item}</div>)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl border border-[#ef4444]/40 bg-[#ef4444]/10 p-3 text-xs sm:text-sm text-[#fecaca]">
                          <span className="font-black text-[#ef4444]">【风险提示】</span> {analysis.risk}
                        </div>
                        <div className="mt-3 rounded-xl border border-[#22d3ee]/40 bg-[#22d3ee]/10 p-3 text-xs sm:text-sm text-[#e5e7eb]">
                          <div className="font-black text-[#22d3ee] mb-1">【最终判断】</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <span>胜平负倾向：<b>{analysis.final.tendency}</b></span>
                            <span>最稳比分：<b>{analysis.final.score}</b></span>
                            <span>推荐方向：<b>{analysis.final.recommendation}</b></span>
                          </div>
                        </div>
                        </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveBracketView({ knockouts, getTeamFromSlot, onMatchClick, onTeamClick, onExitHome, isFullscreen, setIsFullscreen }) {
    const handleExit = (e) => { e.stopPropagation(); onExitHome(); };
    return (
        <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden" onClick={() => setIsFullscreen(!isFullscreen)}>
            {!isFullscreen && (
                <div className="flex justify-between items-center bg-slate-900/80 px-4 py-2 border-b border-slate-800 z-50 shrink-0 shadow-lg" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                        <button type="button" onClick={handleExit} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-all">
                            <X className="w-5 h-5"/>
                        </button>
                        <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        <span className="font-bold text-white text-xs sm:text-base">全景淘汰落位实时树</span>
                    </div>
                </div>
            )}
            
            <div className="flex-1 w-full h-full relative overflow-hidden">
                <div id="capture-live-bracket" className="w-full h-full relative bg-slate-950 overflow-hidden">
                    <div className="absolute top-2 sm:top-4 left-0 right-0 text-center z-20 pointer-events-none">
                        <h2 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-wider inline-block bg-slate-950/80 backdrop-blur-md px-5 py-1.5 rounded-full border border-slate-800 shadow-xl">世界杯全景实况大树</h2>
                    </div>

                    <div className="absolute top-12 left-0 right-0 bottom-24">
                        <FullScreenBracket mode="live" knockouts={knockouts} getTeamFromSlot={getTeamFromSlot} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
                    </div>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-100 flex justify-center w-full">
                    </div>
                </div>
            </div>
        </div>
    );
}

function KnockoutScheduleView({ knockouts, getTeamFromSlot, onMatchClick, onTeamClick }) {
  const roundTabs = [
    { value: '1/16决赛', label: '32强赛' },
    { value: '1/8决赛', label: '16强赛' },
    { value: '1/4决赛', label: '8强赛' },
    { value: '半决赛', label: '半决赛' },
    { value: '季军战', label: '季军赛' },
    { value: '决赛', label: '决赛' }
  ];
  const [activeRound, setActiveRound] = useState('1/16决赛');
  const activeRoundLabel = roundTabs.find(round => round.value === activeRound)?.label || activeRound;
  const currentMatches = knockouts.filter(m => m.round === activeRound);

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
      <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar pb-10">
           <div className="flex flex-col">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-800 shrink-0 bg-slate-900 px-2 py-3 gap-2 sticky top-0 z-10">{roundTabs.map(round => ( <button key={round.value} onClick={() => setActiveRound(round.value)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeRound === round.value ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{round.label}</button> ))}</div>
              <div className="max-w-3xl mx-auto bg-slate-950 p-2 sm:p-4 pb-6 w-full">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-purple-400 mt-4 tracking-wider">{activeRoundLabel}实时对阵</h2>
                  <p className="text-xs text-slate-500 mt-1">席位确定后自动落位；未确定席位仅显示组别与名次</p>
                </div>
                <div className="space-y-4">
                  {currentMatches.map((match) => {
                    const homeTeam = match.home || getTeamFromSlot(match.homeStr); const awayTeam = match.away || getTeamFromSlot(match.awayStr);
                    const showScore = match.status === 'FINISHED' || match.status === 'LIVE';
                    return (
                      <div key={match.id} onClick={() => onMatchClick({ ...match, homeTeam, awayTeam })} className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 cursor-pointer transition-colors shadow-sm overflow-hidden group">
                        <div className="bg-slate-800/50 px-4 py-1.5 border-b border-slate-700 flex justify-between items-center"><span className="text-[10px] text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1 opacity-70"/> {match.timeStr}</span><span className="text-[9px] text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20 font-bold">第 {match.id.replace('ko_', '')} 场</span></div>
                        <div className="flex items-center justify-between p-4 gap-3">
                          <div onClick={(event) => { event.stopPropagation(); if (!homeTeam.isPlaceholder) onTeamClick(homeTeam); }} className={`flex flex-col items-center w-[40%] gap-2 ${homeTeam.isPlaceholder ? '' : 'hover:scale-105 transition-transform'}`}><TeamFlag flag={homeTeam.flag} sizeClass="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" /><div className="text-sm font-bold text-center group-hover:text-purple-300 leading-tight">{homeTeam.isPlaceholder ? homeTeam.placeholderName : homeTeam.name}</div></div>
                          <div className={`bg-slate-950 border px-3 py-1.5 rounded-lg font-black min-w-[60px] text-center text-lg ${match.status === 'LIVE' ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-300'}`}>{showScore ? `${match.homeScore} - ${match.awayScore}` : 'VS'}</div>
                          <div onClick={(event) => { event.stopPropagation(); if (!awayTeam.isPlaceholder) onTeamClick(awayTeam); }} className={`flex flex-col items-center w-[40%] gap-2 ${awayTeam.isPlaceholder ? '' : 'hover:scale-105 transition-transform'}`}><TeamFlag flag={awayTeam.flag} sizeClass="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" /><div className="text-sm font-bold text-center group-hover:text-purple-300 leading-tight">{awayTeam.isPlaceholder ? awayTeam.placeholderName : awayTeam.name}</div></div>
                        </div>
                      </div>
                    );
                  })}
                  {currentMatches.length === 0 && <div className="text-center text-slate-500 py-10 text-sm">此阶段对阵生成中...</div>}
                </div>
              </div>
           </div>
      </div>
    </div>
  );
}

function HeroBoardCard({ title, rows = [], unit = '', emptyText = '暂无数据' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 sm:p-4 shadow-xl">
      <h3 className="mb-3 border-b border-slate-800 pb-2 text-sm font-black text-cyan-300">{title}</h3>
      <div className="space-y-2">
        {rows.slice(0, 10).map((row, index) => (
          <div key={`${title}-${row.player}-${index}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <span className={`text-center text-xs font-black ${index < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>{row.rank || index + 1}</span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-slate-100">{row.player}</span>
              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500"><TeamFlag flag={row.teamLogo} sizeClass="w-3.5 h-3.5" />{TEAM_NAME_ZH[row.team] || row.team || '球队'}</span>
            </span>
            <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-black text-cyan-300">{row.value ?? '-'}{unit}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 px-3 py-6 text-center text-xs text-slate-500">{emptyText}</div>}
      </div>
    </div>
  );
}

function FormationPitch({ recentLineup }) {
  const lineup = recentLineup?.lineup;
  const formation = lineup?.formation;
  const fixture = recentLineup?.fixture;
  const players = (lineup?.startXI || [])
    .map((item) => {
      const player = item?.player || {};
      const [row, col] = String(player.grid || '').split(':').map(Number);
      return { ...player, row, col };
    })
    .filter(player => Number.isFinite(player.row) && Number.isFinite(player.col));
  const maxRow = Math.max(1, ...players.map(player => player.row));
  const maxColByRow = players.reduce((map, player) => {
    map[player.row] = Math.max(map[player.row] || 0, player.col);
    return map;
  }, {});
  const opponentName = fixture?.teams?.home?.id === lineup?.team?.id
    ? fixture?.teams?.away?.name
    : fixture?.teams?.home?.name;

  return (
    <div className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2 mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-300">首发阵型图</h4>
          <p className="mt-1 text-[10px] text-slate-500">按最近一次公开首发阵容生成</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-cyan-300">{formation || '待公布'}</div>
          {opponentName && <div className="text-[10px] text-slate-500">vs {TEAM_NAME_ZH[opponentName] || opponentName}</div>}
        </div>
      </div>
      {players.length > 0 ? (
        <div className="relative h-[360px] overflow-hidden rounded-2xl border border-emerald-500/20 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),rgba(15,23,42,0.95)),linear-gradient(180deg,#064e3b,#022c22)] shadow-inner">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-3 h-12 w-32 -translate-x-1/2 rounded-b-xl border-x border-b border-white/10" />
          <div className="absolute left-1/2 bottom-3 h-12 w-32 -translate-x-1/2 rounded-t-xl border-x border-t border-white/10" />
          {players.map((player) => {
            const colCount = maxColByRow[player.row] || 1;
            const x = (player.col / (colCount + 1)) * 100;
            const y = ((player.row - 0.15) / (maxRow + 0.7)) * 100;
            return (
              <div
                key={`${player.id || player.name}-${player.grid}`}
                className="absolute flex w-[74px] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${player.number || '-'} ${player.name || '球员'}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/70 bg-slate-950/90 text-[10px] font-black text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.35)]">
                  {player.number || '-'}
                </div>
                <div className="mt-1 max-w-[74px] truncate rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-100">
                  {player.name || '球员'}
                </div>
                <div className="text-[8px] font-mono text-slate-300">{player.pos || ''}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900 px-4 py-8 text-center text-xs text-slate-500">
          首发阵型待公布。赛前名单发布后，这里会自动显示球场站位图。
        </div>
      )}
    </div>
  );
}

function RulesView({ groups, knockouts, getTeamFromSlot, defaultTab = 'rules', locked = false }) {
  const [subTab, setSubTab] = useState(defaultTab);
  const [heroState, setHeroState] = useState({ status: 'IDLE', data: null, error: '' });
  const heroRequestStartedRef = useRef(false);
  useEffect(() => {
    if (locked) setSubTab(defaultTab);
  }, [defaultTab, locked]);
  useEffect(() => {
    if (subTab !== 'heroes' || heroRequestStartedRef.current) return;
    let cancelled = false;
    heroRequestStartedRef.current = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      if (!cancelled) {
        heroRequestStartedRef.current = false;
        setHeroState({ status: 'ERROR', data: null, error: '英雄榜暂时无法加载' });
      }
    }, 9000);
    setHeroState({ status: 'LOADING', data: null, error: '' });
    fetch('/api/worldcup-leaders', { signal: controller.signal })
      .then(response => response.json().then(data => {
        if (!response.ok || data.error) throw new Error('英雄榜暂时无法加载');
        return data;
      }))
      .then(data => { if (!cancelled) setHeroState({ status: 'SUCCESS', data, error: '' }); })
      .catch(() => {
        if (!cancelled) {
          heroRequestStartedRef.current = false;
          setHeroState({ status: 'ERROR', data: null, error: '英雄榜暂时无法加载' });
        }
      })
      .finally(() => clearTimeout(timeoutId));
    return () => {
      cancelled = true;
      heroRequestStartedRef.current = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [subTab]);

  const grouped104 = useMemo(() => {
    const allGroupMatches = []; Object.keys(groups).forEach(g => { groups[g].matches.forEach(m => { allGroupMatches.push({ ...m, groupName: g }); }); });
    const allKnockoutMatches = ['r32', 'r16', 'qf', 'sf', 'third', 'final'].flatMap(round => (knockouts[round] || []).map(m => ({ ...m, home: getTeamFromSlot(m.homeStr), away: getTeamFromSlot(m.awayStr) })));
    
    const all104 = [...allGroupMatches, ...allKnockoutMatches].sort((a,b) => {
        const timeA = a.timeStr || '时间待定 00:00';
        const timeB = b.timeStr || '时间待定 00:00';
        return timeA.localeCompare(timeB);
    });
    
    const grouped = {};
    all104.forEach(m => {
        const dateStr = m.timeStr || '时间待定 00:00';
        const date = dateStr.split(' ')[0] || '时间待定';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(m);
    });
    return grouped;
  }, [groups, knockouts, getTeamFromSlot]);

  return (
	    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
	      {!locked && <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex justify-center z-10 shrink-0">
	        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
	          <button onClick={() => setSubTab('rules')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ${subTab === 'rules' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}><BookOpen className="w-4 h-4 mr-1.5" /> 2026最新扩军新规说明</button>
	          <button onClick={() => setSubTab('schedule')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${subTab === 'schedule' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}><CalendarDays className="w-4 h-4 mr-1.5" /> 104场全赛程</button>
	          <button onClick={() => setSubTab('heroes')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${subTab === 'heroes' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}><Crown className="w-4 h-4 mr-1.5" /> 英雄榜</button>
	        </div>
	      </div>}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-10">
        <div className="max-w-4xl lg:max-w-6xl mx-auto p-2 sm:p-6 space-y-6 sm:space-y-8 animate-fade-in bg-slate-950 pb-6 w-full">
	          {subTab === 'rules' ? (
	            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
	              <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 flex items-center"><Shield className="w-8 h-8 mr-3 text-emerald-500" /> 2026 美加墨世界杯规则与观赛要点</h2>
	              <div className="space-y-6 relative z-10">
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
                    <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center"><Users className="w-5 h-5 mr-2" /> 48强历史级扩军与12大分组</h3>
                    <p className="text-slate-300 leading-relaxed">国际足联史诗级改制：参赛队伍由原先的32支激增至 <span className="font-bold text-white">48支</span>。全赛程总计鏖战 <span className="font-bold text-white">104场</span>（原64场）。共划分为 12 个小组（A组至L组），每组固定包含 4 支球队。</p>
                </div>
                <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20">
                  <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center"><ListOrdered className="w-5 h-5 mr-2" /> 极致残酷：全新 32 强资格复活赛制</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                     <div className="bg-emerald-950/40 p-4 rounded-lg border-l-4 border-emerald-500">
                        <h4 className="font-bold text-white mb-2">✅ 小组前两名直通</h4>
                        <p className="text-xs text-slate-400">12个小组斩获前两名的共计 <span className="text-emerald-400 font-bold">24支</span> 豪强毫无悬念直通 32 强淘汰赛。</p>
                     </div>
                     <div className="bg-yellow-950/40 p-4 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-bold text-white mb-2">⚠️ 最佳第三名金牌复活</h4>
                        <p className="text-xs text-slate-400">12个小组的第三名按照“积分、净胜球、总进球、公平竞赛积分”降序排列，排名前 <span className="text-yellow-400 font-bold">8支</span> 的最佳第三名获得复活资格，携手挺进32强。</p>
                     </div>
                  </div>
                </div>
	                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
	                    <h3 className="text-xl font-bold text-blue-400 mb-3 flex items-center"><GitBranch className="w-5 h-5 mr-2" /> 淘汰赛加长路线与常规规定</h3>
	                    <p className="text-slate-300 leading-relaxed">由于增设了 1/16 决赛（32强战），夺冠战线被拉长，进入决赛的球队最终总计需完成 <span className="font-bold text-blue-400">8场</span> 决战。淘汰赛阶段若常规 90 分钟战平，必须进行 30 分钟常规加时赛。若加时依然不分伯仲，则立即引入残酷的点球大决战。</p>
	                </div>
	                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
	                  <div className="bg-slate-950/50 p-5 rounded-xl border border-cyan-500/20">
	                    <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center"><Shield className="w-5 h-5 mr-2" /> 裁判与判罚执行重点</h3>
	                    <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
	                      <li>VAR 继续覆盖进球、点球、红牌、错认身份等关键判罚。</li>
	                      <li>越位、手球、禁区身体接触会是重点复核区域，关键比赛节奏会更依赖补时管理。</li>
	                      <li>替补席、拖延时间、围堵裁判等行为预计会被更严格管理。</li>
	                      <li>比赛实际净时间更受关注，伤停、庆祝、VAR 复核后的补时会更精确。</li>
	                    </ul>
	                  </div>
	                  <div className="bg-slate-950/50 p-5 rounded-xl border border-purple-500/20">
	                    <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center"><MapPin className="w-5 h-5 mr-2" /> 球场与赛程环境要点</h3>
	                    <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
	                      <li>美加墨三国联合承办，球队将面对跨城市、跨气候区作战。</li>
	                      <li>部分球场为大型综合体育场，草皮、顶棚、温度与旅行距离会影响临场节奏。</li>
	                      <li>小组赛密集，轮换深度、恢复质量和替补席强度会比以往更重要。</li>
	                      <li>高温、长途转场与不同时区适应，是强队稳定性的重要变量。</li>
	                    </ul>
	                  </div>
	                </div>
	              </div>
	            </div>
	          ) : subTab === 'schedule' ? (
	            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 sm:p-8 shadow-2xl relative">
              <h2 className="text-xl sm:text-3xl font-black text-blue-400 mb-8 text-center tracking-wider">2026 世界杯 104场 赛程时间轴一览</h2>
              <div className="space-y-6">
                {Object.keys(grouped104).map((date, idx) => (
                   <div key={`all-${date}`} className={`p-4 rounded-xl border border-slate-800/60 ${idx % 2 === 0 ? 'bg-slate-900/80' : 'bg-slate-800/40'}`}>
                      <h4 className="text-emerald-400 font-bold mb-4 flex items-center text-sm sm:text-base border-b border-slate-700/50 pb-2"><CalendarDays className="w-4 h-4 mr-2" /> {date}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {grouped104[date].map(m => {
                            const dateStr = m.timeStr || '时间待定 00:00';
                            const timePart = dateStr.includes(' ') ? dateStr.split(' ')[1] : '00:00';
                            return (
                            <div key={`all-m-${m.id}`} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center text-xs sm:text-sm">
                               <div className="flex items-center space-x-1.5 w-[42%] justify-end"><span className={`truncate leading-tight ${m.home?.isPlaceholder ? 'text-slate-500' : 'text-slate-200 font-bold'}`}>{m.home?.name || m.homeStr}</span><TeamFlag flag={m.home?.flag} sizeClass="w-4 h-4" /></div>
                               <div className="flex flex-col items-center w-[16%]"><span className="text-[9px] font-mono text-slate-500 mb-0.5 leading-tight">{timePart}</span><span className={`text-[10px] font-black bg-slate-900 px-1 rounded ${m.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>{m.status === 'FINISHED' || m.status === 'LIVE' ? `${m.homeScore}-${m.awayScore}` : 'VS'}</span></div>
                               <div className="flex items-center space-x-1.5 w-[42%] justify-start"><TeamFlag flag={m.away?.flag} sizeClass="w-4 h-4" /><span className={`truncate leading-tight ${m.away?.isPlaceholder ? 'text-slate-500' : 'text-slate-200 font-bold'}`}>{m.away?.name || m.awayStr}</span></div>
                            </div>
                         )})}
                      </div>
                   </div>
                ))}
	              </div>
	            </div>
	          ) : (
	            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 sm:p-8 shadow-2xl relative">
	              <h2 className="text-xl sm:text-3xl font-black text-cyan-300 mb-2 text-center tracking-wider">世界杯英雄榜</h2>
	              <p className="mb-6 text-center text-xs text-slate-500">榜单随赛事数据更新；跑动距离等未公开项目暂不展示。</p>
	              {heroState.status === 'LOADING' && <div className="py-10 text-center text-sm text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />正在加载英雄榜...</div>}
	              {heroState.status === 'ERROR' && <div className="py-10 text-center text-sm text-yellow-400">{heroState.error}</div>}
	              {heroState.status === 'SUCCESS' && (
	                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
	                  <HeroBoardCard title="射手榜" rows={heroState.data?.boards?.scorers} unit=" 球" />
	                  <HeroBoardCard title="助攻榜" rows={heroState.data?.boards?.assists} unit=" 次" />
	                  <HeroBoardCard title="抢断榜" rows={heroState.data?.boards?.tackles} unit=" 次" />
	                  <HeroBoardCard title="拦截榜" rows={heroState.data?.boards?.interceptions} unit=" 次" />
	                  <HeroBoardCard title="关键传球榜" rows={heroState.data?.boards?.keyPasses} unit=" 次" />
	                  <HeroBoardCard title="射正榜" rows={heroState.data?.boards?.shotsOn} unit=" 次" />
	                  <HeroBoardCard title="对抗成功榜" rows={heroState.data?.boards?.duelsWon} unit=" 次" />
	                  <HeroBoardCard title="黄牌榜" rows={heroState.data?.boards?.yellowCards} unit=" 张" />
	                  <HeroBoardCard title="红牌榜" rows={heroState.data?.boards?.redCards} unit=" 张" />
	                  <HeroBoardCard title="评分榜" rows={heroState.data?.boards?.ratings} />
	                </div>
	              )}
	            </div>
	          )}
        </div>
      </div>
    </div>
  );
}

function GroupScheduleView({ groups, onMatchClick, onTeamClick }) {
  const [viewMode, setViewMode] = useState('by_time'); 
  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex justify-center z-10 shrink-0">
        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button onClick={() => setViewMode('by_time')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ${viewMode === 'by_time' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> 观战时间轴</button>
          <button onClick={() => setViewMode('by_group')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${viewMode === 'by_group' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> 按小组全景</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-10">
        <div className="bg-slate-950 p-2 sm:p-4 pb-6 w-full">
          {viewMode === 'by_group' ? ( <GroupScheduleByGroup groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} /> ) : ( <GroupScheduleByTime groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} /> )}
        </div>
      </div>
    </div>
  );
}

function GroupScheduleByGroup({ groups, onMatchClick, onTeamClick }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (g) => { setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] })); };
  const renderTeamRow = (team, type, gName, idx) => (
    <div key={`team-row-${gName}-${team.id || 'no-id'}-${idx}-${type}`} onClick={() => !team.isPlaceholder && onTeamClick && onTeamClick(team)} 
         className={`relative flex items-center text-xs px-2 py-2.5 transition-colors border-b border-slate-800/30 last:border-b-0 ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''} ${type === 'top2' ? 'bg-emerald-900/40' : type === 'third' ? 'bg-yellow-900/40' : 'bg-transparent'}`}>
      <span className="flex-1 flex items-center truncate pr-2 font-medium z-10 mt-1"><TeamFlag flag={team.flag} sizeClass="w-5 h-5 mr-2" /><span className={`leading-tight ${type === 'top2' ? 'text-emerald-100 font-bold' : type === 'third' ? 'text-yellow-100 font-bold' : 'text-slate-400'}`}>{team.name}</span></span>
      <span className="w-5 sm:w-6 text-center font-mono text-slate-400 z-10 mt-1">{team.w}</span><span className="w-5 sm:w-6 text-center font-mono text-slate-400 z-10 mt-1">{team.d}</span><span className="w-5 sm:w-6 text-center font-mono text-slate-400 z-10 mt-1">{team.l}</span><span className="w-6 sm:w-8 text-center font-mono text-slate-300 z-10 mt-1">{team.gd > 0 ? `+${team.gd}` : team.gd}</span><span className={`w-6 sm:w-8 text-center font-mono font-bold rounded z-10 mt-1 ${type === 'top2' ? 'text-emerald-400' : type === 'third' ? 'text-yellow-400' : 'text-slate-500'}`}>{team.pts}</span>
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
              <div className="flex items-center space-x-2"><div className="bg-gradient-to-b from-emerald-400 to-emerald-600 w-1.5 h-6 rounded-full"></div><span className="font-black text-white text-lg tracking-wider">{g}组</span></div>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-900/30 rounded border border-emerald-500/30 flex items-center">{isExpanded ? '收起赛程 ▲' : '展开赛程 ▼'}</span>
            </button>
            <div className="bg-slate-950 rounded-lg pt-2 pb-0 border border-slate-800/80 overflow-hidden">
              <div className="flex items-center text-[10px] text-slate-500 font-bold mb-1 px-2 border-b border-slate-800 pb-2"><span className="flex-1">球队</span><span className="w-5 sm:w-6 text-center">胜</span><span className="w-5 sm:w-6 text-center">平</span><span className="w-5 sm:w-6 text-center">负</span><span className="w-6 sm:w-8 text-center">净</span><span className="w-6 sm:w-8 text-center text-emerald-400">分</span></div>
              <div className="flex flex-col">
                 <div className="relative bg-emerald-900/20 border-t border-emerald-500/20 pt-4 pb-0.5 overflow-hidden"><div className="absolute top-0 right-0 bg-emerald-500/90 text-emerald-950 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-bl-xl shadow z-10">晋级32强区</div>{groups[g].teams.slice(0, 2).map((team, idx) => renderTeamRow(team, 'top2', g, idx))}</div>
                 <div className="relative bg-yellow-900/20 border-t border-yellow-500/20 pt-4 pb-0.5 overflow-hidden"><div className="absolute top-0 right-0 bg-yellow-500/90 text-yellow-950 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-bl-xl shadow z-10">待定区</div>{groups[g].teams.slice(2, 3).map((team, idx) => renderTeamRow(team, 'third', g, idx + 2))}</div>
                 <div className="relative bg-slate-800/20 border-t border-slate-700/50 pt-0.5 pb-0.5 overflow-hidden">{groups[g].teams.slice(3, 4).map((team, idx) => renderTeamRow(team, 'fourth', g, idx + 3))}</div>
              </div>
            </div>
            {isExpanded && (
              <div className="space-y-2 mt-4 animate-fade-in border-t border-slate-800/80 pt-4">
                {groups[g].matches.length === 0 && <div className="text-center text-slate-600 text-xs py-2">赛程整理中...</div>}
                {groups[g].matches.map((match, idx) => (
                  <div key={`group-match-${g}-${match.id || 'no-id'}-${idx}`} onClick={() => onMatchClick({ ...match, groupName: g })} className="relative flex flex-col p-2.5 rounded-md border text-sm transition-all border-slate-800/80 bg-slate-950/80 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 group/match">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-1.5"><span className="text-[10px] sm:text-xs font-bold text-slate-300 flex items-center bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50"><Clock className="w-3 h-3 mr-1 opacity-70" /> {match.timeStr}</span><span className="text-[9px] text-slate-500 flex items-center"><MapPin className="w-2.5 h-2.5 mr-0.5 opacity-50" /> {match.venue}</span></div>
                    <div className="flex justify-center items-center w-full mt-1 gap-2">
                      <div onClick={(event) => { event.stopPropagation(); onTeamClick(match.home); }} className="flex items-center justify-end flex-1 max-w-[120px] gap-1.5 hover:scale-105 transition-transform"><span className="truncate leading-tight text-[10px] sm:text-xs font-bold text-slate-300 group-hover/match:text-emerald-100 text-right" title={match.home?.name || '待定'}>{match.home?.name || '待定'}</span><TeamFlag flag={match.home?.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5 ml-1" /></div>
                      <div className="flex flex-col justify-center items-center w-[40px] sm:w-[60px] shrink-0 relative">{match.status === 'LIVE' && <span className="absolute -top-3 text-[9px] text-emerald-400 font-bold animate-pulse">{match.liveMinute}</span>}<span className={`font-mono text-[10px] sm:text-sm font-bold ${match.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-600 group-hover/match:text-emerald-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? `${match.homeScore} - ${match.awayScore}` : 'VS'}</span></div>
                      <div onClick={(event) => { event.stopPropagation(); onTeamClick(match.away); }} className="flex items-center justify-start flex-1 max-w-[120px] gap-1.5 hover:scale-105 transition-transform"><TeamFlag flag={match.away?.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5 mr-1" /><span className="truncate leading-tight text-[10px] sm:text-xs font-bold text-slate-300 group-hover/match:text-emerald-100 text-left" title={match.away?.name || '待定'}>{match.away?.name || '待定'}</span></div>
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
  const allMatches = []; Object.keys(groups).forEach(groupName => { groups[groupName].matches.forEach(m => { allMatches.push({ ...m, groupName }); }); });
  
  allMatches.sort((a, b) => {
      const timeA = a.timeStr || '时间待定 00:00';
      const timeB = b.timeStr || '时间待定 00:00';
      return timeA.localeCompare(timeB);
  }); 
  
  const groupedMatches = {};
  allMatches.forEach(m => {
      const dateStr = m.timeStr || '时间待定 00:00';
      const date = dateStr.split(' ')[0] || '时间待定';
      if (!groupedMatches[date]) groupedMatches[date] = [];
      groupedMatches[date].push(m);
  });

  const renderSidebarTeamRow = (team, type, idx, gName) => (
    <div key={`sb-team-${gName}-${team.id || 'no-id'}-${idx}-${type}`} onClick={() => !team.isPlaceholder && onTeamClick && onTeamClick(team)} 
         className={`relative flex items-center justify-between px-1 sm:px-2 py-1.5 sm:py-2 transition-colors border-b border-slate-800/30 last:border-b-0 ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''} ${type === 'top2' ? 'bg-emerald-900/40' : type === 'third' ? 'bg-yellow-900/40' : 'bg-transparent'}`}>
      <span className={`flex items-center flex-1 min-w-0 pr-1 z-10 mt-0.5 ${type === 'top2' ? 'font-bold text-emerald-100' : type === 'third' ? 'font-bold text-yellow-100' : 'text-slate-400'}`}><TeamFlag flag={team.flag} sizeClass="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"/><span className="truncate leading-tight flex-1 text-[9px] sm:text-xs" title={team.name}>{team.name}</span></span>
      <div className="flex items-center justify-end font-mono z-10 mt-0.5 gap-0.5 sm:gap-1.5 shrink-0 text-[8px] sm:text-xs"><span className="w-2.5 sm:w-4 text-center text-slate-500 hidden sm:block">{team.w}</span><span className="w-2.5 sm:w-4 text-center text-slate-500 hidden sm:block">{team.d}</span><span className="w-2.5 sm:w-4 text-center text-slate-500 hidden sm:block">{team.l}</span><span className="w-3.5 sm:w-6 text-center text-slate-400" title="净胜球">{team.gd}</span><span className={`w-3.5 sm:w-6 text-center font-bold ${type === 'top2' ? 'text-emerald-400' : type === 'third' ? 'text-yellow-400' : 'text-slate-500'}`} title="积分">{team.pts}</span></div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-2 gap-2 sm:gap-4 items-start w-full relative">
      <div className="col-span-1 relative pl-1 sm:pl-2 border-r border-slate-800/50 pr-1 sm:pr-2 shrink-0 overflow-visible">
        <div className="absolute left-2 sm:left-3 top-4 bottom-0 w-px bg-gradient-to-b from-cyan-900 via-cyan-800/50 to-transparent z-0 hidden sm:block"></div>
        {Object.keys(groupedMatches).length === 0 && <div className="text-slate-500 py-10 text-xs">等待数据...</div>}
        <div className="space-y-6 sm:space-y-8 overflow-visible">
          {Object.keys(groupedMatches).map((date, dIdx) => (
            <div key={`timeline-date-${date}-${dIdx}`} className="relative z-10">
              <div className="flex items-center mb-2 sm:mb-4"><div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] border-2 border-slate-950 flex-shrink-0 hidden sm:block"></div><div className="sm:ml-2 px-2 sm:px-4 py-1 sm:py-2 bg-cyan-900/40 rounded-lg border border-cyan-500/30 text-cyan-400 font-bold text-[9px] sm:text-sm shadow-lg">{date}</div></div>
              <div className="space-y-3 sm:space-y-4 sm:pl-8 sm:border-l-2 border-slate-800/50 sm:ml-2 pb-6">
                {groupedMatches[date].map((match) => {
                  const dateStr = match.timeStr || '时间待定 00:00';
                  const timePart = dateStr.includes(' ') ? dateStr.split(' ')[1] : '00:00';
                  return (
                  <div key={match.id} onClick={() => onMatchClick(match)} className="bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl p-2 sm:p-4 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1 sm:pb-2"><span className="text-[8px] sm:text-xs text-slate-400 font-mono flex items-center bg-slate-950 px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-800"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1"/>{timePart}</span><span className="text-[8px] sm:text-[10px] text-cyan-400 font-bold bg-cyan-900/20 px-1 sm:px-2 py-0.5 sm:py-1 rounded border border-cyan-500/20">{match.groupName} 组对决</span></div>
                    <div className="flex items-center justify-between mt-1 sm:mt-2">
                      <div onClick={(event) => { event.stopPropagation(); onTeamClick(match.home); }} className="flex items-center gap-1 sm:gap-1.5 w-[42%] justify-end hover:scale-105 transition-transform"><span className="text-[9px] sm:text-sm font-bold text-slate-300 group-hover:text-cyan-100 truncate leading-tight flex-1 text-right">{match.home?.name || '待定'}</span><TeamFlag flag={match.home?.flag} sizeClass="w-4 h-4 sm:w-6 sm:h-6 shrink-0" /></div>
                      <div className="flex flex-col items-center justify-center w-[16%]">{match.status === 'LIVE' && <span className="text-[8px] text-emerald-400 animate-pulse">{match.liveMinute || ''}'</span>}<span className={`text-[10px] sm:text-lg font-black ${match.status === 'LIVE' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? `${match.homeScore}-${match.awayScore}` : 'VS'}</span></div>
                      <div onClick={(event) => { event.stopPropagation(); onTeamClick(match.away); }} className="flex items-center gap-1 sm:gap-1.5 w-[42%] justify-start hover:scale-105 transition-transform"><TeamFlag flag={match.away?.flag} sizeClass="w-4 h-4 sm:w-6 sm:h-6 shrink-0" /><span className="text-[9px] sm:text-sm font-bold text-slate-300 group-hover:text-cyan-100 truncate leading-tight flex-1 text-left">{match.away?.name || '待定'}</span></div>
                    </div>
                  </div>
                )})}
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
                 <div className="text-emerald-400 font-bold text-[9px] sm:text-xs mb-1.5 sm:mb-2 border-b border-slate-800 pb-1 sm:pb-1.5 flex items-center px-1 sm:px-2"><span className="flex-1">{gName}组积分</span><div className="flex items-center justify-end font-normal text-slate-500 gap-0.5 sm:gap-1.5 shrink-0"><span className="w-2.5 sm:w-4 text-center hidden sm:block">胜</span><span className="w-2.5 sm:w-4 text-center hidden sm:block">平</span><span className="w-2.5 sm:w-4 text-center hidden sm:block">负</span><span className="w-3.5 sm:w-6 text-center">净</span><span className="w-3.5 sm:w-6 text-center">分</span></div></div>
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

const STAT_LABELS = {
  'Shots on Goal': '射正',
  'Shots off Goal': '射偏',
  'Total Shots': '射门',
  'Blocked Shots': '被封堵射门',
  'Shots insidebox': '禁区内射门',
  'Shots outsidebox': '禁区外射门',
  Fouls: '犯规',
  'Corner Kicks': '角球',
  Offsides: '越位',
  'Ball Possession': '控球率',
  'Yellow Cards': '黄牌',
  'Red Cards': '红牌',
  'Goalkeeper Saves': '门将扑救',
  'Total passes': '传球',
  'Passes accurate': '准确传球',
  'Passes %': '传球成功率',
  expected_goals: '预期进球'
};

const getStatLabel = (type) => STAT_LABELS[type] || type || '数据';
const getStatValue = (value) => value === null || value === undefined || value === '' ? '-' : value;

function MatchLineupCard({ lineup }) {
  const starters = lineup?.startXI || [];
  const substitutes = lineup?.substitutes || [];
  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3">
        <span className="flex items-center gap-2 text-sm font-black text-cyan-300"><TeamFlag flag={lineup?.team?.logo} sizeClass="w-5 h-5" />{TEAM_NAME_ZH[lineup?.team?.name] || lineup?.team?.name || '球队'}</span>
        <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-black text-cyan-300">{lineup?.formation || '阵型待定'}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 text-[11px]">
        <div>
          <div className="mb-1.5 text-xs font-bold text-slate-300">首发</div>
          <div className="grid grid-cols-1 gap-1">
            {starters.slice(0, 11).map(row => (
              <div key={row.player?.id || row.player?.name} className="flex justify-between gap-2 rounded bg-slate-900 px-2 py-1.5">
                <span className="truncate text-slate-200">{row.player?.name || '球员'}</span>
                <span className="shrink-0 font-mono text-slate-500">#{row.player?.number || '-'} {row.player?.pos || ''}</span>
              </div>
            ))}
            {starters.length === 0 && <div className="rounded border border-dashed border-slate-800 px-2 py-4 text-center text-slate-500">首发待公布</div>}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-bold text-slate-300">替补</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {substitutes.slice(0, 12).map(row => (
              <div key={row.player?.id || row.player?.name} className="flex justify-between gap-2 rounded bg-slate-900/70 px-2 py-1">
                <span className="truncate text-slate-300">{row.player?.name || '球员'}</span>
                <span className="shrink-0 font-mono text-slate-600">#{row.player?.number || '-'}</span>
              </div>
            ))}
            {substitutes.length === 0 && <div className="rounded border border-dashed border-slate-800 px-2 py-3 text-center text-slate-500 sm:col-span-2">替补待公布</div>}
          </div>
        </div>
        <div className="flex items-center justify-between rounded bg-slate-900 px-2 py-1.5">
          <span className="text-slate-500">主教练</span>
          <span className="font-bold text-slate-200">{lineup?.coach?.name || '待公布'}</span>
        </div>
      </div>
    </div>
  );
}

function PlayerImpactList({ players = [] }) {
  const rows = players
    .flatMap(teamRow => (teamRow.players || []).map(playerRow => ({
      team: teamRow.team,
      player: playerRow.player,
      stats: playerRow.statistics?.[0] || {}
    })))
    .sort((a, b) => Number(b.stats.games?.rating || 0) - Number(a.stats.games?.rating || 0))
    .slice(0, 12);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
      <div className="text-sm font-bold text-slate-300 mb-2">球员表现</div>
      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map(row => (
            <div key={`${row.team?.id}-${row.player?.id}`} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
              <div className="min-w-0 flex items-center gap-2">
                {row.player?.photo ? <img src={row.player.photo} alt={row.player.name} className="h-7 w-7 rounded-full object-cover" /> : <UserCircle2 className="h-7 w-7 text-slate-600" />}
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-slate-100">{row.player?.name || '球员'}</div>
                  <div className="text-[10px] text-slate-500">{TEAM_NAME_ZH[row.team?.name] || row.team?.name || '球队'} · {row.stats.games?.position || '位置'}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <span className="rounded bg-slate-950 px-1 py-1 text-emerald-300">球 {row.stats.goals?.total ?? 0}</span>
                <span className="rounded bg-slate-950 px-1 py-1 text-cyan-300">助 {row.stats.goals?.assists ?? 0}</span>
                <span className="rounded bg-slate-950 px-1 py-1 text-yellow-300">评 {row.stats.games?.rating ? Number(row.stats.games.rating).toFixed(1) : '-'}</span>
                <span className="rounded bg-slate-950 px-1 py-1 text-slate-400">传 {row.stats.passes?.total ?? '-'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-800 rounded-lg">球员表现待公布。</div>}
    </div>
  );
}

function MatchDetailDrawer({ match, onClose, onTeamClick, isTop }) {
  const [detailState, setDetailState] = useState({ status: 'IDLE', data: null, error: '' });
  useEffect(() => {
    let cancelled = false;
    const fixtureId = match?.apiFixtureId;
    if (!fixtureId) {
      setDetailState({ status: 'IDLE', data: null, error: '' });
      return;
    }
    setDetailState({ status: 'LOADING', data: null, error: '' });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch(`/api/worldcup-detail?fixture=${fixtureId}`, { signal: controller.signal })
      .then(response => response.json().then(data => {
        if (!response.ok || data.error) throw new Error('详情暂时无法加载');
        return data;
      }))
      .then(data => { if (!cancelled) setDetailState({ status: 'SUCCESS', data, error: '' }); })
      .catch(() => { if (!cancelled) setDetailState({ status: 'ERROR', data: null, error: '详情暂时无法加载' }); })
      .finally(() => clearTimeout(timeoutId));
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [match?.apiFixtureId]);

  if (!match) return null;
  const zIndex = isTop ? 'z-[100]' : 'z-[90]';
  const hTeam = match.homeTeam || match.home; const aTeam = match.awayTeam || match.away;
  const fixtureInfo = detailState.data?.fixture?.response?.[0];
  const lineups = detailState.data?.lineups?.response || [];
  const events = detailState.data?.events?.response || [];
  const statistics = detailState.data?.statistics?.response || [];
  const players = detailState.data?.players?.response || [];
  const fixtureStatus = fixtureInfo?.fixture?.status?.long || (match.status === 'FINISHED' ? '已结束' : match.status === 'LIVE' ? '进行中' : '未开赛');
  const detailVenue = fixtureInfo?.fixture?.venue?.name || match.venue || '美加墨赛区';
  const detailCity = fixtureInfo?.fixture?.venue?.city;
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${zIndex}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 sm:p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${zIndex} max-h-[85vh] overflow-y-auto custom-scrollbar`}>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 opacity-50" />
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-5 h-5"/></button>
        <div className="text-center mb-6"><p className="text-emerald-400 font-bold text-sm bg-emerald-900/20 inline-block px-3 py-1 rounded-full border border-emerald-500/30">{match.round || '比赛数据中心'}</p><p className="text-slate-400 text-xs mt-3 flex items-center justify-center"><Clock className="w-3.5 h-3.5 mr-1" /> {match.timeStr} • {detailVenue}{detailCity ? ` · ${detailCity}` : ''}</p></div>
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 sm:p-6 rounded-2xl mb-6 shadow-inner">
           <div className="flex flex-col items-center gap-2 w-1/3 cursor-pointer hover:scale-105 transition-transform" onClick={() => onTeamClick(hTeam)}><TeamFlag name={hTeam?.name} flag={hTeam?.flag} sizeClass="w-12 h-12 sm:w-16 sm:h-16" /><span className="font-bold text-sm sm:text-base text-center text-slate-200 mt-2">{hTeam?.isPlaceholder ? hTeam.placeholderName : hTeam?.name}</span><span className="text-[10px] text-blue-400">点击看数据</span></div>
           <div className="w-1/3 text-center"><div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-1">{match.homeScore !== undefined && match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'VS'}</div><div className="text-[10px] text-slate-500">{match.status === 'FINISHED' ? '已结束' : match.status === 'LIVE' ? '进行中' : '未开赛'}</div></div>
           <div className="flex flex-col items-center gap-2 w-1/3 cursor-pointer hover:scale-105 transition-transform" onClick={() => onTeamClick(aTeam)}><TeamFlag name={aTeam?.name} flag={aTeam?.flag} sizeClass="w-12 h-12 sm:w-16 sm:h-16" /><span className="font-bold text-sm sm:text-base text-center text-slate-200 mt-2">{aTeam?.isPlaceholder ? aTeam.placeholderName : aTeam?.name}</span><span className="text-[10px] text-blue-400">点击看数据</span></div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
           <h4 className="text-white font-bold mb-4 flex items-center border-b border-slate-700 pb-2"><Activity className="w-4 h-4 mr-2 text-red-400" /> 比赛数据中心</h4>
           {detailState.status === 'LOADING' && <div className="text-center text-xs text-slate-400 py-6"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />正在加载阵容、事件与技术统计...</div>}
           {detailState.status === 'ERROR' && <div className="text-center text-xs text-yellow-400 py-6">{detailState.error}</div>}
           {detailState.status === 'IDLE' && <div className="text-center text-xs text-slate-500 py-6">该场比赛详情待更新。</div>}
           {detailState.status === 'SUCCESS' && (
             <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ['比赛状态', fixtureStatus],
                    ['半场比分', fixtureInfo?.score?.halftime?.home !== null && fixtureInfo?.score?.halftime?.home !== undefined ? `${fixtureInfo.score.halftime.home}-${fixtureInfo.score.halftime.away}` : '-'],
                    ['全场比分', fixtureInfo?.goals?.home !== null && fixtureInfo?.goals?.home !== undefined ? `${fixtureInfo.goals.home}-${fixtureInfo.goals.away}` : '-'],
                    ['赛事轮次', fixtureInfo?.league?.round || match.groupName || match.round || '-']
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-center">
                      <div className="text-[10px] text-slate-500">{label}</div>
                      <div className="mt-1 truncate text-xs font-black text-cyan-300">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {statistics.map(teamStats => (
                    <div key={teamStats.team?.id || teamStats.team?.name} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <div className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-2"><TeamFlag flag={teamStats.team?.logo} sizeClass="w-5 h-5" />{TEAM_NAME_ZH[teamStats.team?.name] || teamStats.team?.name || '球队'}</div>
                      <div className="space-y-1.5 text-xs">
                        {(teamStats.statistics || []).map(stat => (
                          <div key={stat.type} className="flex justify-between gap-3"><span className="text-slate-500">{getStatLabel(stat.type)}</span><span className="font-mono text-slate-300">{getStatValue(stat.value)}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {statistics.length === 0 && <div className="sm:col-span-2 text-center text-xs text-slate-500 py-4 border border-dashed border-slate-800 rounded-lg">技术统计待公布。</div>}
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-sm font-bold text-slate-300 mb-2">阵容/首发</div>
                  {lineups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {lineups.map(lineup => <MatchLineupCard key={lineup.team?.id || lineup.team?.name} lineup={lineup} />)}
                    </div>
                  ) : <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-800 rounded-lg">赛前阵容尚未公布。</div>}
                </div>
                <PlayerImpactList players={players} />
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-sm font-bold text-slate-300 mb-2">关键事件</div>
                  {events.length > 0 ? (
                    <div className="space-y-2">{events.map((event, index) => <div key={`${event.time?.elapsed}-${event.player?.id || index}`} className="grid grid-cols-[40px_70px_1fr] items-center gap-2 text-xs bg-slate-900 rounded-lg px-3 py-2"><span className="font-mono text-cyan-300">{event.time?.elapsed || 0}'</span><span className="text-slate-500">{event.type}</span><span className="text-slate-200 truncate">{event.player?.name || event.detail || '事件'}{event.assist?.name ? ` · 助攻 ${event.assist.name}` : ''}</span></div>)}</div>
                  ) : <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-800 rounded-lg">暂无比赛事件。</div>}
                </div>
             </div>
           )}
        </div>
      </div>
    </>
  );
}

function TeamDetailDrawer({ team, teamMatches = [], onClose, isTop }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [teamDetailState, setTeamDetailState] = useState({ status: 'IDLE', data: null, error: '' });
  useEffect(() => {
    let cancelled = false;
    const teamId = team?.apiId;
    const teamName = team?.apiName || team?.name;
    if ((!teamId && !teamName) || team?.isPlaceholder) {
      setTeamDetailState({ status: 'IDLE', data: null, error: '' });
      return;
    }
    setTeamDetailState({ status: 'LOADING', data: null, error: '' });
    const params = new URLSearchParams();
    if (teamId) params.set('team', teamId);
    if (teamName) params.set('name', teamName);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    fetch(`/api/team-detail?${params.toString()}`, { signal: controller.signal })
      .then(response => response.json().then(data => {
        if (!response.ok || data.error) throw new Error('球队详情暂时无法加载');
        return data;
      }))
      .then(data => { if (!cancelled) setTeamDetailState({ status: 'SUCCESS', data, error: '' }); })
      .catch(() => { if (!cancelled) setTeamDetailState({ status: 'ERROR', data: null, error: '球队详情暂时无法加载' }); })
      .finally(() => clearTimeout(timeoutId));
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [team?.apiId, team?.apiName, team?.isPlaceholder, team?.name]);

  if (!team || team.isPlaceholder) return null;
  const zIndex = isTop ? 'z-[100]' : 'z-[90]';
  const coach = teamDetailState.data?.coaches?.response?.[0];
  const squadTeam = teamDetailState.data?.squad?.response?.[0];
  const squadPlayers = squadTeam?.players || [];
  const remoteTeam = teamDetailState.data?.teamInfo?.response?.[0]?.team;
  const remoteVenue = teamDetailState.data?.teamInfo?.response?.[0]?.venue;
  const remoteStats = teamDetailState.data?.statistics?.response;
  const remoteFixtures = teamDetailState.data?.fixtures?.response || [];
  const injuryRows = teamDetailState.data?.injuries?.response || [];
  const playerStatsRows = teamDetailState.data?.players?.response || [];
  const recentLineup = teamDetailState.data?.recentLineup;
  const commonLineups = remoteStats?.lineups || [];
  const statCards = [
    ['场次', remoteStats?.fixtures?.played?.total],
    ['胜', remoteStats?.fixtures?.wins?.total],
    ['平', remoteStats?.fixtures?.draws?.total],
    ['负', remoteStats?.fixtures?.loses?.total],
    ['进球', remoteStats?.goals?.for?.total?.total],
    ['失球', remoteStats?.goals?.against?.total?.total],
  ];
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${zIndex}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 sm:p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${zIndex} h-[90vh] flex flex-col`}>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 opacity-50" />
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 z-10"><X className="w-5 h-5"/></button>
        <div className="flex flex-col items-center text-center shrink-0">
          <TeamFlag name={team.name} flag={remoteTeam?.logo || team.flag} sizeClass="w-20 h-20 shadow-lg drop-shadow-xl" />
          <h2 className="text-2xl sm:text-3xl font-black mt-3 text-white">{team.name}</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {team.group && <span className="text-xs text-slate-400 font-mono border border-slate-700 bg-slate-800 px-2 py-0.5 rounded">{team.group} 组</span>}
            {remoteTeam?.code && <span className="text-xs text-cyan-300 font-mono border border-cyan-700/60 bg-cyan-950/40 px-2 py-0.5 rounded">{remoteTeam.code}</span>}
            {remoteTeam?.country && <span className="text-xs text-slate-400 border border-slate-700 bg-slate-800 px-2 py-0.5 rounded">{remoteTeam.country}</span>}
          </div>
        </div>
        <div className="flex mt-6 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 mx-4 sm:mx-10"><button onClick={() => setActiveTab('stats')} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded transition-colors ${activeTab === 'stats' ? 'bg-emerald-600/30 text-emerald-400' : 'text-slate-400'}`}>本届赛事数据</button><button onClick={() => setActiveTab('squad')} className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded transition-colors ${activeTab === 'squad' ? 'bg-blue-600/30 text-blue-400' : 'text-slate-400'}`}>大名单与主帅</button></div>
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
	                  <div className="flex justify-around text-center"><div><div className="text-xl font-black text-emerald-500">{team.w || 0}</div><div className="text-[10px] text-slate-500 mt-1">胜</div></div><div><div className="text-xl font-black text-yellow-500">{team.d || 0}</div><div className="text-[10px] text-slate-500 mt-1">平</div></div><div><div className="text-xl font-black text-red-500">{team.l || 0}</div><div className="text-[10px] text-slate-500 mt-1">负</div></div></div>
	               </div>
                 {teamDetailState.status === 'LOADING' && <div className="text-center text-xs text-slate-400 py-4"><RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-cyan-400" />正在加载球队资料...</div>}
                 {teamDetailState.status === 'SUCCESS' && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <FormationPitch recentLineup={recentLineup} />
                     <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                       <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">球队资料</h4>
                       <div className="space-y-2 text-xs text-slate-400">
                         <div className="flex justify-between gap-3"><span>成立年份</span><span className="text-slate-200 font-mono">{remoteTeam?.founded || '-'}</span></div>
                         <div className="flex justify-between gap-3"><span>主场城市</span><span className="text-slate-200 text-right">{remoteVenue?.city || '-'}</span></div>
                         <div className="flex justify-between gap-3"><span>主场名称</span><span className="text-slate-200 text-right truncate max-w-[180px]">{remoteVenue?.name || '-'}</span></div>
                         <div className="flex justify-between gap-3"><span>容量</span><span className="text-slate-200 font-mono">{remoteVenue?.capacity || '-'}</span></div>
                       </div>
                     </div>
	                     <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
	                       <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">赛事统计</h4>
                       <div className="grid grid-cols-3 gap-2">
                         {statCards.map(([label, value]) => (
                           <div key={label} className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-2 text-center">
                             <div className="text-[10px] text-slate-500">{label}</div>
                             <div className="text-sm font-black text-cyan-300 mt-1">{value ?? '-'}</div>
                           </div>
                         ))}
	                       </div>
	                     </div>
	                     <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
	                       <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">常用阵型</h4>
	                       <div className="space-y-2">
	                         {commonLineups.slice(0, 4).map((lineup) => (
	                           <div key={lineup.formation} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs">
	                             <span className="font-black text-cyan-300">{lineup.formation}</span>
	                             <span className="text-slate-400">使用 {lineup.played} 场</span>
	                           </div>
	                         ))}
	                         {commonLineups.length === 0 && <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 px-3 py-5 text-center text-xs text-slate-500">阵型数据待更新</div>}
	                       </div>
	                     </div>
	                     <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
	                       <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">伤病情况</h4>
	                       <div className="space-y-2">
	                         {injuryRows.slice(0, 6).map((item, index) => (
	                           <div key={`${item.player?.id || item.player?.name}-${index}`} className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-2 text-xs">
	                             <div className="font-bold text-red-200">{item.player?.name || '球员待定'}</div>
	                             <div className="mt-1 text-[10px] text-red-200/70">{item.player?.reason || item.type || '伤病信息待确认'}</div>
	                           </div>
	                         ))}
	                         {injuryRows.length === 0 && <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900 px-3 py-5 text-center text-xs text-slate-500">暂无公开伤病信息</div>}
	                       </div>
	                     </div>
	                   </div>
	                 )}
	               <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
	                  <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">本届小组赛赛程</h4>
	                  <div className="space-y-2">
                    {teamMatches.map(match => {
                      const isHome = match.home?.id === team.id || match.home?.apiId === team.apiId;
                      const opponent = isHome ? match.away : match.home;
                      const score = match.status === 'FINISHED' || match.status === 'LIVE' ? `${match.homeScore} - ${match.awayScore}` : 'VS';
                      return (
                        <div key={match.id} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                          <span className="text-[10px] text-slate-500 w-24 shrink-0">{match.timeStr}</span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0 flex-1"><TeamFlag flag={opponent?.flag} sizeClass="w-4 h-4 shrink-0" /><span className="truncate">{opponent?.name || '待定'}</span></span>
                          <span className={`font-mono text-xs font-bold shrink-0 ${match.status === 'LIVE' ? 'text-emerald-400' : match.status === 'FINISHED' ? 'text-white' : 'text-slate-500'}`}>{score}</span>
                        </div>
                      );
	                    })}
                      {teamMatches.length === 0 && remoteFixtures.slice(0, 6).map((fixture) => {
                        const home = normalizeTeam(fixture.teams?.home);
                        const away = normalizeTeam(fixture.teams?.away);
                        const isHome = home.name === team.name || home.apiId === team.apiId;
                        const opponent = isHome ? away : home;
                        const status = normalizeStatus(fixture.fixture?.status);
                        const score = status === 'FINISHED' || status === 'LIVE' ? `${fixture.goals?.home ?? 0} - ${fixture.goals?.away ?? 0}` : 'VS';
                        return (
                          <div key={fixture.fixture?.id} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                            <span className="text-[10px] text-slate-500 w-24 shrink-0">{formatBeijingTime(fixture.fixture?.date)}</span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0 flex-1"><TeamFlag flag={opponent?.flag} sizeClass="w-4 h-4 shrink-0" /><span className="truncate">{opponent?.name || '待定'}</span></span>
                            <span className={`font-mono text-xs font-bold shrink-0 ${status === 'LIVE' ? 'text-emerald-400' : status === 'FINISHED' ? 'text-white' : 'text-slate-500'}`}>{score}</span>
                          </div>
                        );
                      })}
	                    {teamMatches.length === 0 && remoteFixtures.length === 0 && <div className="text-center text-xs text-slate-500 py-4">赛程整理中...</div>}
	                  </div>
	               </div>
             </div>
           )}
           {activeTab === 'squad' && (
             <div className="space-y-4 animate-fade-in">
                {teamDetailState.status === 'LOADING' && <div className="text-center text-xs text-slate-400 py-8"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />正在加载球队大名单...</div>}
                {teamDetailState.status === 'ERROR' && <div className="text-center text-xs text-yellow-400 py-8">{teamDetailState.error}</div>}
                {teamDetailState.status === 'IDLE' && <div className="text-center text-xs text-slate-500 py-8">该球队详情待更新。</div>}
	                {teamDetailState.status === 'SUCCESS' && (
	                  <>
	                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">国家队主教练</div>
                        <div className="text-sm font-bold text-white mt-1">{coach?.name || '主帅信息待更新'}</div>
                        {coach?.nationality && <div className="text-[10px] text-slate-500 mt-1">{coach.nationality}</div>}
                      </div>
	                      {coach?.photo ? <img src={coach.photo} alt={coach.name} className="w-12 h-12 rounded-full object-cover border border-slate-700" /> : <UserCircle2 className="w-8 h-8 text-slate-600" />}
	                    </div>
	                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
	                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
	                        <h4 className="text-sm font-bold text-slate-300">球员数据</h4>
	                        <span className="text-[9px] bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">{playerStatsRows.length ? `${playerStatsRows.length} 人` : '待更新'}</span>
	                      </div>
	                      <div className="space-y-2">
	                        {playerStatsRows.slice(0, 12).map((row) => {
	                          const stats = row.statistics?.[0] || {};
	                          return (
	                            <div key={row.player?.id || row.player?.name} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
	                              <div className="min-w-0 flex items-center gap-2">
	                                {row.player?.photo ? <img src={row.player.photo} alt={row.player.name} className="w-7 h-7 rounded-full object-cover shrink-0" /> : <UserCircle2 className="w-7 h-7 text-slate-600 shrink-0" />}
	                                <div className="min-w-0">
	                                  <div className="truncate text-xs font-bold text-slate-100">{row.player?.name || '球员'}</div>
	                                  <div className="text-[10px] text-slate-500">{stats.games?.position || row.player?.position || '位置待定'}{row.player?.age ? ` · ${row.player.age}岁` : ''}</div>
	                                </div>
	                              </div>
	                              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
	                                <span className="rounded bg-slate-950 px-1 py-1 text-slate-400">场 {stats.games?.appearences ?? '-'}</span>
	                                <span className="rounded bg-slate-950 px-1 py-1 text-emerald-300">球 {stats.goals?.total ?? 0}</span>
	                                <span className="rounded bg-slate-950 px-1 py-1 text-cyan-300">助 {stats.goals?.assists ?? 0}</span>
	                                <span className="rounded bg-slate-950 px-1 py-1 text-yellow-300">{stats.games?.rating ? Number(stats.games.rating).toFixed(1) : '-'}</span>
	                              </div>
	                            </div>
	                          );
	                        })}
	                        {playerStatsRows.length === 0 && <div className="text-xs text-slate-500 text-center py-6 bg-slate-900 rounded-lg border border-slate-800 border-dashed">球员数据待更新。</div>}
	                      </div>
	                    </div>
	                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
	                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
	                        <h4 className="text-sm font-bold text-slate-300">大名单</h4>
                        <span className="text-[9px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">{squadPlayers.length ? `${squadPlayers.length} 人` : '暂无数据'}</span>
                      </div>
                      {squadPlayers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {squadPlayers.map(player => (
                            <div key={player.id || player.name} className="flex items-center gap-3 bg-slate-900 rounded-lg border border-slate-800 px-3 py-2">
                              {player.photo ? <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover shrink-0" /> : <UserCircle2 className="w-8 h-8 text-slate-600 shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-200 truncate">{player.name}</div>
                                <div className="text-[10px] text-slate-500">{player.position || '位置待定'}{player.age ? ` · ${player.age}岁` : ''}</div>
                              </div>
                              <span className="text-[10px] font-mono text-cyan-300">{player.number || '-'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 text-center py-8 bg-slate-900 rounded-lg border border-slate-800 border-dashed">该队大名单待更新。</div>
	                      )}
	                    </div>
                  </>
                )}
             </div>
           )}
        </div>
      </div>
    </>
  );
}

export default function App() {
  useEffect(() => { setupViewport(); }, []);

  const [activeTab, setActiveTab] = useState('meeting'); 
  const activeTabRef = useRef('meeting');
  const [, setTabHistory] = useState([]);
  const [groups, setGroups] = useState(initialGroups);
  const [knockoutFlat, setKnockoutFlat] = useState(officialKnockoutRoundsFlat);
  const [knockoutRounds, setKnockoutRounds] = useState(officialKnockoutRounds);
  const [selectedMatch, setSelectedMatch] = useState(null); 
  const [selectedTeam, setSelectedTeam] = useState(null); 
  const [lastOpened, setLastOpened] = useState(null); 
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    activeTabRef.current = activeTab;
    setIsFullscreen(false);
  }, [activeTab]);

  const [apiStatus, setApiStatus] = useState('LOCAL'); 
  const [apiErrorMsg, setApiErrorMsg] = useState('赛程加载中...');

  useEffect(() => {
    let cancelled = false;
    let timerId;
    const fetchRealData = async () => {
      if (document.hidden) return;
      setApiStatus('LOADING');
      try {
        const response = await fetch('/api/worldcup');
        const data = await response.json();
        if (!response.ok || data.error) throw new Error('赛程暂时无法加载');
        if (cancelled) return;

        const tournament = buildLiveTournament(data.fixtures, data.standings);
        setGroups(tournament.groups);
        setKnockoutFlat(tournament.knockoutFlat);
        setKnockoutRounds(tournament.knockoutRounds);
        setApiStatus('SUCCESS');
        setApiErrorMsg(data.stale ? '显示最近赛程' : '赛程已更新');
      } catch {
        if (cancelled) return;
        setApiStatus('LOCAL');
        setApiErrorMsg('显示最近赛程');
      }
    };

    fetchRealData();
    timerId = window.setInterval(fetchRealData, 60_000);
    const handleVisibility = () => { if (!document.hidden) fetchRealData(); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleOpenMatch = (match) => { setSelectedMatch(match); setLastOpened('match'); };
  const findCanonicalTeam = useCallback((team) => {
    if (!team || team.isPlaceholder) return team;
    return Object.values(groups).flatMap(group => group.teams).find(candidate =>
      (team.apiId && candidate.apiId === team.apiId) || candidate.id === team.id || candidate.name === team.name
    ) || team;
  }, [groups]);
  const handleOpenTeam = (team) => { setSelectedTeam(findCanonicalTeam(team)); setLastOpened('team'); };
  const handleCloseMatch = () => { setSelectedMatch(null); if (selectedTeam) setLastOpened('team'); };
  const handleCloseTeam = () => { setSelectedTeam(null); if (selectedMatch) setLastOpened('match'); };

  const projectedThirdAssignments = useMemo(() => getProjectedThirdAssignments(groups), [groups]);
  const projectedKnockoutFlat = useMemo(
    () => updateBracketFromStandings(groups, knockoutFlat),
    [groups, knockoutFlat]
  );
  const projectedKnockoutRounds = useMemo(() => Object.fromEntries(
    Object.entries(knockoutRounds).map(([key, matches]) => [
      key,
      matches.map(match => projectedKnockoutFlat.find(item => item.id === match.id) || match)
    ])
  ), [knockoutRounds, projectedKnockoutFlat]);

  const getTeamFromSlot = useCallback((slotStr) => {
    if (!slotStr || slotStr === '?') return getSlotPlaceholder(slotStr);
    if (/^W\d{2,}$/.test(slotStr)) {
      const match = projectedKnockoutFlat.find(item => item.id === `ko_${slotStr.slice(1)}`);
      return getMatchWinner(match) || getSlotPlaceholder(slotStr);
    }
    if (/^L\d{2,}$/.test(slotStr)) {
      const match = projectedKnockoutFlat.find(item => item.id === `ko_${slotStr.slice(1)}`);
      const winner = getMatchWinner(match);
      if (winner && match?.home && match?.away) return winner.id === match.home.id ? match.away : match.home;
      return getSlotPlaceholder(slotStr);
    }
    if (slotStr.includes('/')) {
      const allowedGroups = slotStr.split('/').map(item => item.charAt(0));
      const groupName = Object.values(projectedThirdAssignments).find(group => allowedGroups.includes(group));
      return groupName && groups[groupName]?.teams?.[2] ? groups[groupName].teams[2] : getSlotPlaceholder(slotStr);
    }
    const groupName = slotStr.charAt(0).toUpperCase();
    const rank = parseInt(slotStr.charAt(1)) - 1;
    const group = groups[groupName];
    return group?.teams?.[rank] || getSlotPlaceholder(slotStr);
  }, [groups, projectedKnockoutFlat, projectedThirdAssignments]);

  const selectedTeamMatches = useMemo(() => {
    if (!selectedTeam || selectedTeam.isPlaceholder) return [];
    return Object.values(groups).flatMap(group => group.matches).filter(match =>
      [match.home, match.away].some(team =>
        (selectedTeam.apiId && team?.apiId === selectedTeam.apiId) || team?.id === selectedTeam.id || team?.name === selectedTeam.name
      )
    );
  }, [groups, selectedTeam]);

  const navigateToTab = useCallback((tab) => {
    if (activeTabRef.current === tab) return;
    setTabHistory(history => [...history, activeTabRef.current].slice(-20));
    setActiveTab(tab);
  }, []);

  const navigateBack = useCallback(() => {
    setTabHistory(history => {
      const previousTab = history[history.length - 1] || 'meeting';
      setActiveTab(previousTab);
      return history.slice(0, -1);
    });
  }, []);

  const isCanvasTab = activeTab === 'prediction' || activeTab === 'live_bracket';
  
  const headerClass = `bg-slate-900 border-b border-slate-800 flex flex-col z-20 shadow-xl relative transition-all duration-300 ${isCanvasTab ? 'landscape:hidden' : ''} ${isFullscreen ? 'hidden' : ''}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col h-[100dvh] overflow-hidden selection:bg-emerald-500/30">
      <header className={`${headerClass} px-2 py-1.5 sm:px-4 sm:py-3 gap-1 sm:gap-3`}>
         <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center"><RealTrophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />2026 世界杯实况引擎</h1>
            <div className="flex items-center">
                <div className="text-[10px] sm:text-xs text-slate-500 flex items-center mr-2"><span className={`w-2 h-2 rounded-full mr-1.5 ${apiStatus === 'SUCCESS' ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></span>{apiStatus === 'SUCCESS' ? '赛程已更新' : apiErrorMsg}</div>
	                <button onClick={navigateBack} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all" title="返回上一页"><Home className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            </div>
         </div>
         <nav className="flex space-x-1.5 overflow-x-auto hide-scrollbar pb-1 pt-1">
            <button onClick={() => navigateToTab('daily_predictions')} className={`whitespace-nowrap px-4 sm:px-5 py-1.5 rounded-full text-[10px] sm:text-xs font-black transition-all flex items-center border ${activeTab === 'daily_predictions' ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.45)]' : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_14px_rgba(34,211,238,0.25)]'}`}><Sparkles className="w-3 h-3 mr-1" />今日预测</button>
            <button onClick={() => navigateToTab('meeting')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'meeting' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Swords className="w-3 h-3 mr-1" />宿命对决</button>
            <button onClick={() => navigateToTab('prediction')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'prediction' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Wand2 className="w-3 h-3 mr-1" />夺冠推演</button>
            <button onClick={() => navigateToTab('live_bracket')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'live_bracket' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><GitBranch className="w-3 h-3 mr-1" />实况大树</button>
            <button onClick={() => navigateToTab('group_schedule')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'group_schedule' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Activity className="w-3 h-3 mr-1" />小组全景</button>
            <button onClick={() => navigateToTab('full_schedule')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'full_schedule' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><CalendarDays className="w-3 h-3 mr-1" />全部赛程</button>
            <button onClick={() => navigateToTab('heroes')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'heroes' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Crown className="w-3 h-3 mr-1" />球星榜</button>
            <button onClick={() => navigateToTab('knockout_schedule')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'knockout_schedule' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><LayoutList className="w-3 h-3 mr-1" />淘汰列表</button>
            <button onClick={() => navigateToTab('rules')} className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all flex items-center ${activeTab === 'rules' ? 'bg-slate-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><Shield className="w-3 h-3 mr-1" />赛制规则</button>
         </nav>
      </header>

      <div className="flex-1 overflow-hidden relative w-full h-full bg-slate-950">
        <div className={activeTab === 'prediction' ? 'h-full' : 'hidden'}><PredictionSandbox getTeamFromSlot={getTeamFromSlot} groups={groups} onExitHome={navigateBack} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} /></div>
        <div className={activeTab === 'daily_predictions' ? 'h-full' : 'hidden'}>
          <SafeSectionBoundary>
            <DailyPredictionsView />
          </SafeSectionBoundary>
        </div>
        <div className={activeTab === 'meeting' ? 'h-full' : 'hidden'}><TeamMeetingPredictor groups={groups} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} /></div>
        <div className={activeTab === 'live_bracket' ? 'h-full' : 'hidden'}><SafeSectionBoundary><LiveBracketView knockouts={projectedKnockoutFlat} getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} onTeamClick={handleOpenTeam} onExitHome={navigateBack} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} /></SafeSectionBoundary></div>
        <div className={activeTab === 'group_schedule' ? 'h-full' : 'hidden'}><SafeSectionBoundary><GroupScheduleView groups={groups} onMatchClick={handleOpenMatch} onTeamClick={handleOpenTeam} /></SafeSectionBoundary></div>
        <div className={activeTab === 'full_schedule' ? 'h-full' : 'hidden'}><SafeSectionBoundary><RulesView key="full-schedule" groups={groups} knockouts={projectedKnockoutRounds} getTeamFromSlot={getTeamFromSlot} defaultTab="schedule" locked /></SafeSectionBoundary></div>
        <div className={activeTab === 'heroes' ? 'h-full' : 'hidden'}><SafeSectionBoundary><RulesView key="heroes" groups={groups} knockouts={projectedKnockoutRounds} getTeamFromSlot={getTeamFromSlot} defaultTab="heroes" locked /></SafeSectionBoundary></div>
        <div className={activeTab === 'knockout_schedule' ? 'h-full' : 'hidden'}><SafeSectionBoundary><KnockoutScheduleView knockouts={projectedKnockoutFlat} getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} onTeamClick={handleOpenTeam} /></SafeSectionBoundary></div>
        <div className={activeTab === 'rules' ? 'h-full' : 'hidden'}><SafeSectionBoundary><RulesView key="rules" groups={groups} knockouts={projectedKnockoutRounds} getTeamFromSlot={getTeamFromSlot} defaultTab="rules" locked /></SafeSectionBoundary></div>
      </div>

      <MatchDetailDrawer match={selectedMatch} onClose={handleCloseMatch} onTeamClick={handleOpenTeam} isTop={lastOpened === 'match'} />
      <TeamDetailDrawer team={selectedTeam} teamMatches={selectedTeamMatches} onClose={handleCloseTeam} isTop={lastOpened === 'team'} />
      <SiteWatermark className="fixed bottom-[max(8px,env(safe-area-inset-bottom))] left-0 right-0 z-[260] px-4" />
    </div>
  );
}
