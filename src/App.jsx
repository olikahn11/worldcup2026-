import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Trophy, Activity, ZoomIn, ZoomOut, 
  Maximize, Minimize, Move, Clock, CalendarDays, GitBranch, Database,
  ListOrdered, Wand2, Crown, RotateCcw, X, Shield, MapPin, UserCircle2, Users, Camera, Download, Share2, PlusCircle, RefreshCw, KeyRound, CheckCircle2, BookOpen
} from 'lucide-react';

// ================= 全局禁用原生缩放与下拉刷新 (原生App级体验) =================
const setupViewport = () => {
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
  
  // 彻底阻断浏览器原生的下拉刷新和边缘回弹
  document.body.style.overscrollBehavior = 'none';
  document.documentElement.style.overscrollBehavior = 'none';
};

// ================= 1. 数据初始化 (2026 官方确认的最新48强名单) =================
const createGroupTeams = (groupName, host = null) => {
  const teams = [
    { id: `${groupName.toLowerCase()}1`, name: `1${groupName}`, flag: '🏳️' },
    { id: `${groupName.toLowerCase()}2`, name: `2${groupName}`, flag: '🏳️' },
    { id: `${groupName.toLowerCase()}3`, name: `3${groupName}`, flag: '🏳️' },
    { id: `${groupName.toLowerCase()}4`, name: `4${groupName}`, flag: '🏳️' }
  ];
  if (host) teams[0] = host; 
  return teams;
};

const teamsData = {
  A: [
    { id: 'a1', name: '墨西哥', flag: '🇲🇽' }, { id: 'a2', name: '南非', flag: '🇿🇦' },
    { id: 'a3', name: '韩国', flag: '🇰🇷' }, { id: 'a4', name: '捷克', flag: '🇨🇿' }
  ],
  B: [
    { id: 'b1', name: '加拿大', flag: '🇨🇦' }, { id: 'b2', name: '波黑', flag: '🇧🇦' },
    { id: 'b3', name: '卡塔尔', flag: '🇶🇦' }, { id: 'b4', name: '瑞士', flag: '🇨🇭' }
  ],
  C: [
    { id: 'c1', name: '巴西', flag: '🇧🇷' }, { id: 'c2', name: '摩洛哥', flag: '🇲🇦' },
    { id: 'c3', name: '海地', flag: '🇭🇹' }, { id: 'c4', name: '苏格兰', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }
  ],
  D: [
    { id: 'd1', name: '美国', flag: '🇺🇸' }, { id: 'd2', name: '巴拉圭', flag: '🇵🇾' },
    { id: 'd3', name: '澳大利亚', flag: '🇦🇺' }, { id: 'd4', name: '土耳其', flag: '🇹🇷' }
  ],
  E: [
    { id: 'e1', name: '德国', flag: '🇩🇪' }, { id: 'e2', name: '库拉索', flag: '🇨🇼' },
    { id: 'e3', name: '科特迪瓦', flag: '🇨🇮' }, { id: 'e4', name: '厄瓜多尔', flag: '🇪🇨' }
  ],
  F: [
    { id: 'f1', name: '荷兰', flag: '🇳🇱' }, { id: 'f2', name: '日本', flag: '🇯🇵' },
    { id: 'f3', name: '瑞典', flag: '🇸🇪' }, { id: 'f4', name: '突尼斯', flag: '🇹🇳' }
  ],
  G: [
    { id: 'g1', name: '比利时', flag: '🇧🇪' }, { id: 'g2', name: '埃及', flag: '🇪🇬' },
    { id: 'g3', name: '伊朗', flag: '🇮🇷' }, { id: 'g4', name: '新西兰', flag: '🇳🇿' }
  ],
  H: [
    { id: 'h1', name: '西班牙', flag: '🇪🇸' }, { id: 'h2', name: '佛得角', flag: '🇨🇻' },
    { id: 'h3', name: '沙特阿拉伯', flag: '🇸🇦' }, { id: 'h4', name: '乌拉圭', flag: '🇺🇾' }
  ],
  I: [
    { id: 'i1', name: '法国', flag: '🇫🇷' }, { id: 'i2', name: '塞内加尔', flag: '🇸🇳' },
    { id: 'i3', name: '伊拉克', flag: '🇮🇶' }, { id: 'i4', name: '挪威', flag: '🇳🇴' }
  ],
  J: [
    { id: 'j1', name: '阿根廷', flag: '🇦🇷' }, { id: 'j2', name: '阿尔及利亚', flag: '🇩🇿' },
    { id: 'j3', name: '奥地利', flag: '🇦🇹' }, { id: 'j4', name: '约旦', flag: '🇯🇴' }
  ],
  K: [
    { id: 'k1', name: '葡萄牙', flag: '🇵🇹' }, { id: 'k2', name: '刚果(金)', flag: '🇨🇩' },
    { id: 'k3', name: '乌兹别克斯坦', flag: '🇺🇿' }, { id: 'k4', name: '哥伦比亚', flag: '🇨🇴' }
  ],
  L: [
    { id: 'l1', name: '英格兰', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, { id: 'l2', name: '克罗地亚', flag: '🇭🇷' },
    { id: 'l3', name: '加纳', flag: '🇬🇭' }, { id: 'l4', name: '巴拿马', flag: '🇵🇦' }
  ]
};

const getDatesForGroup = (groupIndex) => {
  const md1 = 12 + Math.floor(groupIndex / 2);
  const md2 = 18 + Math.floor(groupIndex / 2);
  const md3 = 24 + Math.floor(groupIndex / 3);
  return [`6月${md1}日`, `6月${md2}日`, `6月${md3}日`];
}

const generateMatches = (teams, groupName) => {
  const gIndex = groupName.charCodeAt(0) - 65; 
  const dates = getDatesForGroup(gIndex);
  return [
    { id: `m_${groupName}_1`, home: teams[0], away: teams[1], homeScore: null, awayScore: null, status: 'UPCOMING', timeStr: `${dates[0]} 03:00`, venue: '美加墨赛区' },
    { id: `m_${groupName}_2`, home: teams[2], away: teams[3], homeScore: null, awayScore: null, status: 'UPCOMING', timeStr: `${dates[0]} 10:00`, venue: '美加墨赛区' },
    { id: `m_${groupName}_3`, home: teams[0], away: teams[2], homeScore: null, awayScore: null, status: 'UPCOMING', timeStr: `${dates[1]} 03:00`, venue: '美加墨赛区' },
    { id: `m_${groupName}_4`, home: teams[1], away: teams[3], homeScore: null, awayScore: null, status: 'UPCOMING', timeStr: `${dates[1]} 09:00`, venue: '美加墨赛区' },
    { id: `m_${groupName}_5`, home: teams[0], away: teams[3], homeScore: null, awayScore: null, status: 'UPCOMING', timeStr: `${dates[2]} 04:00`, venue: '美加墨赛区' },
    { id: `m_${groupName}_6`, home: teams[1], away: teams[2], homeScore: null, awayScore: null, status: 'UPCOMING', timeStr: `${dates[2]} 04:00`, venue: '美加墨赛区' },
  ];
};

const initialGroups = {};
Object.keys(teamsData).forEach(group => {
  initialGroups[group] = {
    status: 'UPCOMING',
    teams: teamsData[group].map(t => ({ ...t, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0, isPlaceholder: false })), 
    matches: generateMatches(teamsData[group], group)
  };
});

const baseMatchProps = { status: 'UPCOMING', homeScore: null, awayScore: null };
const officialKnockoutRounds = {
  r32: [
    { id: 'ko_73', homeStr: '1E', awayStr: '3A/B/C/D/F', timeStr: '6月28日 04:00', venue: '洛杉矶', ...baseMatchProps }, 
    { id: 'ko_74', homeStr: '1I', awayStr: '3C/D/F/G/H', timeStr: '6月28日 09:00', venue: '西雅图', ...baseMatchProps },
    { id: 'ko_75', homeStr: '1D', awayStr: '3B/E/F/I/J', timeStr: '6月29日 04:00', venue: '旧金山', ...baseMatchProps },
    { id: 'ko_76', homeStr: '1G', awayStr: '3A/E/H/I/J', timeStr: '6月29日 09:00', venue: '温哥华', ...baseMatchProps },
    { id: 'ko_77', homeStr: '2A', awayStr: '2B', timeStr: '6月30日 04:00', venue: '休斯顿', ...baseMatchProps }, 
    { id: 'ko_78', homeStr: '1F', awayStr: '2C', timeStr: '6月30日 09:00', venue: '达拉斯', ...baseMatchProps },
    { id: 'ko_79', homeStr: '2K', awayStr: '2L', timeStr: '7月1日 04:00', venue: '堪萨斯城', ...baseMatchProps },
    { id: 'ko_80', homeStr: '1H', awayStr: '2J', timeStr: '7月1日 09:00', venue: '亚特兰大', ...baseMatchProps },
    { id: 'ko_81', homeStr: '1C', awayStr: '2F', timeStr: '7月2日 04:00', venue: '蒙特雷', ...baseMatchProps },
    { id: 'ko_82', homeStr: '2E', awayStr: '2I', timeStr: '7月2日 09:00', venue: '波士顿', ...baseMatchProps },
    { id: 'ko_83', homeStr: '1B', awayStr: '3E/F/G/I/J', timeStr: '7月3日 04:00', venue: '多伦多', ...baseMatchProps }, 
    { id: 'ko_84', homeStr: '1K', awayStr: '3D/E/I/J/L', timeStr: '7月3日 09:00', venue: '费城', ...baseMatchProps },
    { id: 'ko_85', homeStr: '1A', awayStr: '3C/E/F/H/I', timeStr: '7月4日 04:00', venue: '墨西哥城', ...baseMatchProps }, 
    { id: 'ko_86', homeStr: '1L', awayStr: '3E/H/I/J/K', timeStr: '7月4日 09:00', venue: '迈阿密', ...baseMatchProps },
    { id: 'ko_87', homeStr: '1J', awayStr: '2H', timeStr: '7月5日 04:00', venue: '纽约/新泽西', ...baseMatchProps },
    { id: 'ko_88', homeStr: '2D', awayStr: '2G', timeStr: '7月5日 09:00', venue: '瓜达拉哈拉', ...baseMatchProps }
  ],
  r16: [
    { id: 'ko_89', homeStr: 'W73', awayStr: 'W75', timeStr: '7月4日 10:00', venue: '费城', ...baseMatchProps },
    { id: 'ko_90', homeStr: 'W74', awayStr: 'W76', timeStr: '7月4日 14:00', venue: '休斯顿', ...baseMatchProps },
    { id: 'ko_91', homeStr: 'W77', awayStr: 'W78', timeStr: '7月5日 10:00', venue: '纽约/新泽西', ...baseMatchProps },
    { id: 'ko_92', homeStr: 'W79', awayStr: 'W80', timeStr: '7月5日 14:00', venue: '墨西哥城', ...baseMatchProps },
    { id: 'ko_93', homeStr: 'W81', awayStr: 'W82', timeStr: '7月6日 10:00', venue: '达拉斯', ...baseMatchProps },
    { id: 'ko_94', homeStr: 'W83', awayStr: 'W84', timeStr: '7月6日 14:00', venue: '西雅图', ...baseMatchProps }, 
    { id: 'ko_95', homeStr: 'W85', awayStr: 'W86', timeStr: '7月7日 10:00', venue: '亚特兰大', ...baseMatchProps },
    { id: 'ko_96', homeStr: 'W87', awayStr: 'W88', timeStr: '7月7日 14:00', venue: '波士顿', ...baseMatchProps }
  ],
  qf: [
    { id: 'ko_97', homeStr: 'W89', awayStr: 'W90', timeStr: '7月9日 04:00', venue: '洛杉矶', ...baseMatchProps }, 
    { id: 'ko_98', homeStr: 'W91', awayStr: 'W92', timeStr: '7月9日 09:00', venue: '多伦多', ...baseMatchProps },
    { id: 'ko_99', homeStr: 'W93', awayStr: 'W94', timeStr: '7月10日 04:00', venue: '波士顿', ...baseMatchProps },
    { id: 'ko_100', homeStr: 'W95', awayStr: 'W96', timeStr: '7月10日 09:00', venue: '堪萨斯城', ...baseMatchProps }
  ],
  sf: [
    { id: 'ko_101', homeStr: 'W97', awayStr: 'W98', timeStr: '7月14日 04:00', venue: '达拉斯', ...baseMatchProps },
    { id: 'ko_102', homeStr: 'W99', awayStr: 'W100', timeStr: '7月15日 04:00', venue: '亚特兰大', ...baseMatchProps }
  ],
  final: [
    { id: 'ko_103', homeStr: 'L101', awayStr: 'L102', timeStr: '7月18日 04:00', venue: '迈阿密', isThirdPlace: true, ...baseMatchProps },
    { id: 'ko_104', homeStr: 'W101', awayStr: 'W102', timeStr: '7月19日 04:00', venue: '纽约/新泽西', isFinal: true, ...baseMatchProps }
  ]
};

const calculateStandings = (teams, matches) => {
  let standings = teams.map(t => ({ ...t, pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0 }));
  matches.forEach(m => {
    if ((m.status === 'FINISHED' || m.status === 'LIVE') && m.homeScore !== null && m.awayScore !== null) {
      const hIdx = standings.findIndex(t => t.id === m.home.id);
      const aIdx = standings.findIndex(t => t.id === m.away.id);
      if (hIdx === -1 || aIdx === -1) return;
      standings[hIdx].gf += m.homeScore; standings[hIdx].ga += m.awayScore;
      standings[aIdx].gf += m.awayScore; standings[aIdx].ga += m.homeScore;
      standings[hIdx].gd += (m.homeScore - m.awayScore); standings[aIdx].gd += (m.awayScore - m.homeScore);
      if (m.homeScore > m.awayScore) { standings[hIdx].pts += 3; standings[hIdx].w += 1; standings[aIdx].l += 1; }
      else if (m.homeScore < m.awayScore) { standings[aIdx].pts += 3; standings[aIdx].w += 1; standings[hIdx].l += 1; }
      else { standings[hIdx].pts += 1; standings[aIdx].pts += 1; standings[hIdx].d += 1; standings[aIdx].d += 1; }
    }
  });
  return standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
};

const groupByDate = (matches) => {
  const grouped = {};
  matches.forEach(m => {
    const date = m.timeStr.split(' ')[0]; 
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });
  return grouped;
};

const getMatchStatus = (match) => {
  const isFinished = match.status === 'FINISHED';
  const isHomeWin = isFinished && match.homeScore > match.awayScore;
  const isAwayWin = isFinished && match.awayScore > match.homeScore;
  return { ...match, isFinished, isHomeWin, isAwayWin };
};

function TeamFlag({ flag, sizeClass = "w-6 h-6 sm:w-8 sm:h-8" }) {
  if (!flag || flag === '❔' || flag === '🏳️') return <span className="opacity-50 text-[1em]">❔</span>;
  if (flag.startsWith('http')) return <img src={flag} alt="flag" className={`${sizeClass} object-contain inline-block drop-shadow-md`} />;
  return <span className="drop-shadow-sm text-[1em] leading-none inline-block flex-shrink-0">{flag}</span>;
}

// 真实的二维码接入 (利用公共API生成)
const GlobalQRLogo = () => (
  <div className="flex flex-col items-center justify-center bg-white p-0.5 rounded shadow-lg shrink-0 w-8 h-8 sm:w-10 sm:h-10">
    <img 
      src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=http://www.xiaohuang365.com&margin=0" 
      alt="QR" 
      className="w-full h-full object-contain"
    />
  </div>
);

// ================= 2. 赛事规则组件 =================
function RulesView() {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-950 text-slate-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <Trophy className="w-64 h-64 text-emerald-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-emerald-500" />
            2026 美加墨世界杯 - 全新赛事规则
          </h2>
          <div className="space-y-6 relative z-10">
            <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
              <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" /> 扩军与赛制重构
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-slate-400 ml-2">
                <li><strong className="text-slate-200">48强新纪元：</strong>世界杯历史上首次将参赛队伍从 32 支扩充至 48 支。</li>
                <li><strong className="text-slate-200">12大分组：</strong>所有球队被分为 12 个小组（A组至L组），每组依然保持 4 支球队。</li>
                <li><strong className="text-slate-200">104场鏖战：</strong>比赛总场次大幅增加，整个赛事周期长达 39 天，总计 104 场对决。</li>
              </ul>
            </div>
            <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center">
                <ListOrdered className="w-5 h-5 mr-2" /> 全新晋级规则（关键出线条件）
              </h3>
              <p className="text-sm sm:text-base text-slate-300 mb-4 leading-relaxed">
                因为扩军，淘汰赛从 1/8 决赛变为了 <strong>1/16 决赛（32强）</strong>。这导致出线规则发生改变：
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-950/40 p-4 rounded-lg border-l-4 border-emerald-500">
                  <h4 className="font-bold text-white mb-2">✅ 直通 32 强区</h4>
                  <p className="text-sm text-slate-400">12个小组中，每个小组的 <strong>前两名 (共24支球队)</strong> 将无条件直接晋级 32 强淘汰赛。</p>
                </div>
                <div className="bg-yellow-950/40 p-4 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-bold text-white mb-2">⚠️ 晋级待定区 (最好的小组第三)</h4>
                  <p className="text-sm text-slate-400">剩下的 8 个名额，将在 12 个小组的 <strong>第三名</strong> 中产生。成绩最好的 <strong>8 个小组第三</strong> 将获得复活晋级资格。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= 主应用组件 =================
export default function App() {
  useEffect(() => {
    setupViewport(); 
  }, []);

  const [activeTab, setActiveTab] = useState('group_schedule'); 
  const [groups, setGroups] = useState(initialGroups);
  const [selectedMatch, setSelectedMatch] = useState(null); 
  const [selectedTeam, setSelectedTeam] = useState(null); 
  const [lastOpened, setLastOpened] = useState(null); 

  const [apiKey] = useState('8c135d4da927727e57fbf81f6e011d02');
  const [apiStatus, setApiStatus] = useState('LOCAL'); 
  const [apiErrorMsg, setApiErrorMsg] = useState('本地赛前模式 | 开赛后API自动同步');

  const fetchRealData = useCallback(async () => {
    if (!apiKey) return;
    setApiStatus('LOADING');
    setApiErrorMsg('');

    try {
      const headers = { "x-apisports-key": apiKey };
      const targetSeason = 2026;
      let [standingsRes, fixturesRes] = await Promise.all([
        fetch(`https://v3.football.api-sports.io/standings?league=1&season=${targetSeason}`, { headers }),
        fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=${targetSeason}`, { headers })
      ]);
      let standingsData = await standingsRes.json();
      let fixturesData = await fixturesRes.json();

      const hasErrors = (fixturesData.errors && Object.keys(fixturesData.errors).length > 0) || 
                        (standingsData.errors && Object.keys(standingsData.errors).length > 0) || 
                        !fixturesData.response || fixturesData.response.length === 0;

      if (hasErrors) {
        setGroups(initialGroups);
        setApiStatus('LOCAL');
        setApiErrorMsg("本地赛前模式 | 开赛后API自动同步");
        return;
      }

      const newGroups = JSON.parse(JSON.stringify(initialGroups));
      Object.keys(newGroups).forEach(k => { newGroups[k].teams = []; newGroups[k].matches = []; });
      const teamGroupMap = {}; 

      const fixtures = fixturesData.response || [];
      fixtures.forEach(item => {
         const { fixture, teams, league, goals } = item;
         const round = league.round || ''; 
         const groupMatch = round.match(/Group\s+([A-L])/i); 
         if (groupMatch) {
            const groupLetter = groupMatch[1].toUpperCase();
            [teams.home, teams.away].forEach(team => {
                if (team.id && !teamGroupMap[team.id]) {
                    teamGroupMap[team.id] = groupLetter;
                    if(newGroups[groupLetter]) {
                        newGroups[groupLetter].teams.push({
                           id: team.id, name: team.name, flag: team.logo,
                           pts: 0, gd: 0, gf: 0, ga: 0, w: 0, d: 0, l: 0, isPlaceholder: false
                        });
                    }
                }
            });
            let status = 'UPCOMING';
            if (['FT', 'PEN', 'AET', 'AWD'].includes(fixture.status.short)) status = 'FINISHED';
            else if (['1H', '2H', 'HT', 'ET'].includes(fixture.status.short)) status = 'LIVE';
            const dateObj = new Date(fixture.date);
            const timeStr = `${dateObj.getMonth()+1}月${dateObj.getDate()}日 ${dateObj.getHours().toString().padStart(2,'0')}:${dateObj.getMinutes().toString().padStart(2,'0')}`;
            if(newGroups[groupLetter]) {
                newGroups[groupLetter].matches.push({
                   id: fixture.id, home: { id: teams.home.id, name: teams.home.name, flag: teams.home.logo },
                   away: { id: teams.away.id, name: teams.away.name, flag: teams.away.logo },
                   homeScore: goals.home, awayScore: goals.away, status: status, timeStr: timeStr,
                   venue: fixture.venue.city || 'TBD', liveMinute: fixture.status.elapsed ? `${fixture.status.elapsed}'` : null
                });
            }
         }
      });

      const standingsArrays = standingsData.response?.[0]?.league?.standings || [];
      if (standingsArrays.length > 0) {
          standingsArrays.forEach(groupArray => {
             const groupNameStr = groupArray[0]?.group || ''; 
             const groupLetter = groupNameStr.replace('Group ', '').trim();
             if (newGroups[groupLetter]) {
                 newGroups[groupLetter].teams = groupArray.map(item => {
                    teamGroupMap[item.team.id] = groupLetter; 
                    return {
                       id: item.team.id, name: item.team.name, flag: item.team.logo,
                       pts: item.points, gd: item.goalsDiff, gf: item.all.goals.for, ga: item.all.goals.against,
                       w: item.all.win, d: item.all.draw, l: item.all.lose, isPlaceholder: false
                    };
                 });
             }
          });
      } else {
         Object.keys(newGroups).forEach(g => { newGroups[g].teams = calculateStandings(newGroups[g].teams, newGroups[g].matches); });
      }

      Object.keys(newGroups).forEach(g => {
         if (newGroups[g].matches.length > 0 && newGroups[g].matches.every(m => m.status === 'FINISHED')) newGroups[g].status = 'FINISHED';
      });

      setGroups(newGroups);
      setApiStatus('SUCCESS');

    } catch (err) {
      setGroups(initialGroups);
      setApiErrorMsg("本地赛前模式 | 开赛后API自动同步");
      setApiStatus('LOCAL');
    }
  }, [apiKey]);

  useEffect(() => { if (apiKey) fetchRealData(); }, [fetchRealData, apiKey]);

  const handleOpenMatch = (match) => { setSelectedMatch(match); setLastOpened('match'); };
  const handleOpenTeam = (team) => { setSelectedTeam(team); setLastOpened('team'); };
  const handleCloseMatch = () => { setSelectedMatch(null); if (selectedTeam) setLastOpened('team'); };
  const handleCloseTeam = () => { setSelectedTeam(null); if (selectedMatch) setLastOpened('match'); };

  const getTeamFromSlot = (slotStr) => {
    if (!slotStr || slotStr === '?') return { id: `tbd_${Math.random()}`, name: '待定', flag: '❔', isPlaceholder: true, placeholderName: '等待产生' };
    if (slotStr.startsWith('W')) return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: `第${slotStr.replace('W', '')}场胜者` };
    if (slotStr.startsWith('L')) return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: `第${slotStr.replace('L', '')}场负者` };
    if (slotStr.length > 2) return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: '最佳第三名' };
    
    const rank = parseInt(slotStr.charAt(0)) - 1; 
    const groupName = slotStr.charAt(1);
    const groupData = groups[groupName];

    if (!groupData || !groupData.teams || groupData.teams.length === 0 || !groupData.teams[rank]) {
      return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: `${groupName}组第${rank + 1}` };
    }
    const team = groupData.teams[rank];
    if (groupData.status === 'FINISHED') return { ...team, isPlaceholder: false };
    else return { id: slotStr, name: slotStr, flag: '❔', isPlaceholder: true, placeholderName: team.name !== `${groupName}组第${rank+1}档` && team.name !== `1${groupName}` ? team.name : `${groupName}组第${rank + 1}` };
  };

  // 横屏且在画布页面时，彻底隐藏 Header 的利器
  const isCanvasTab = activeTab === 'bracket' || activeTab === 'prediction';
  const headerClass = `bg-slate-900 border-b border-slate-800 px-2 py-1.5 sm:px-4 sm:py-3 flex flex-col z-20 shadow-xl relative gap-1.5 sm:gap-3 transition-all duration-300 ${isCanvasTab ? 'landscape:hidden' : ''}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col h-[100dvh] overflow-hidden selection:bg-emerald-500/30">
      
      <header className={headerClass}>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalQRLogo />
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Trophy className="text-yellow-500 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <h1 className="text-sm sm:text-xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-wider">
                  2026美加墨世界杯
                </h1>
              </div>
              <span className="text-[9px] sm:text-xs text-slate-400 font-mono tracking-widest pl-5 sm:pl-7 mt-0.5">
                www.xiaohuang365.com
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end pt-1">
            <span className="text-[9px] text-slate-500 mb-0.5 mr-2">{apiErrorMsg}</span>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-full p-1 pl-2 sm:pl-3 shadow-inner hidden sm:flex">
              <KeyRound className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 mr-1 sm:mr-2" />
              <input type="password" value={apiKey} readOnly className="bg-transparent text-[10px] sm:text-xs text-emerald-400/80 outline-none w-16 sm:w-48 font-mono cursor-not-allowed tracking-widest" />
              <button onClick={fetchRealData} disabled={apiStatus === 'LOADING'}
                className={`ml-1 sm:ml-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center transition-all ${apiStatus === 'LOADING' ? 'bg-blue-500/20 text-blue-400' : apiStatus === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : apiStatus === 'LOCAL' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
              >
                {apiStatus === 'LOADING' ? <RefreshCw className="w-3 h-3 sm:mr-1 animate-spin" /> : apiStatus === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3 sm:mr-1" /> : <Database className="w-3 h-3 sm:mr-1" />}
                <span className="hidden sm:inline">{apiStatus === 'LOADING' ? '同步...' : apiStatus === 'SUCCESS' ? '数据正常' : apiStatus === 'LOCAL' ? '赛前模式' : '重试'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 导航条 100% 宽度等分平铺，绝不滑动 */}
        <div className="w-full px-0.5 flex justify-center mt-1">
          <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800 shadow-inner w-full justify-between items-center gap-1">
            <TabButton active={activeTab === 'group_schedule'} onClick={() => setActiveTab('group_schedule')} icon={<CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="小组赛程" color="emerald" />
            <TabButton active={activeTab === 'knockout_schedule'} onClick={() => setActiveTab('knockout_schedule')} icon={<ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="淘汰赛程" color="purple" />
            <TabButton active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} icon={<BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="赛事规则" color="emerald" />
            <TabButton active={activeTab === 'bracket'} onClick={() => setActiveTab('bracket')} icon={<GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="全景大树" color="blue" />
            <TabButton active={activeTab === 'prediction'} onClick={() => setActiveTab('prediction')} icon={<Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="冠军推演" color="yellow" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative w-full h-full">
        {activeTab === 'group_schedule' && <GroupScheduleView groups={groups} onMatchClick={handleOpenMatch} onTeamClick={handleOpenTeam} />}
        {activeTab === 'knockout_schedule' && <KnockoutScheduleView getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} />}
        {activeTab === 'rules' && <RulesView />}
        {activeTab === 'bracket' && <BracketView getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} />}
        {activeTab === 'prediction' && <PredictionSandbox getTeamFromSlot={getTeamFromSlot} groups={groups} onMatchClick={handleOpenMatch} />}
      </div>

      <MatchDetailDrawer match={selectedMatch} onClose={handleCloseMatch} onTeamClick={handleOpenTeam} isTop={lastOpened === 'match'} />
      <TeamDetailDrawer team={selectedTeam} onClose={handleCloseTeam} onMatchClick={handleOpenMatch} groups={groups} isTop={lastOpened === 'team'} />
    </div>
  );
}

// 修改为强制垂直排列，5等分
function TabButton({ active, onClick, icon, text, color }) {
  const colorStyles = {
    emerald: active ? 'bg-slate-800 text-emerald-400 border-emerald-500/30 shadow-inner' : 'text-slate-400 hover:bg-slate-900',
    purple: active ? 'bg-slate-800 text-purple-400 border-purple-500/30 shadow-inner' : 'text-slate-400 hover:bg-slate-900',
    blue: active ? 'bg-slate-800 text-blue-400 border-blue-500/30 shadow-inner' : 'text-slate-400 hover:bg-slate-900',
    yellow: active ? 'bg-slate-800 text-yellow-500 border-yellow-500/30 shadow-inner' : 'text-slate-400 hover:bg-slate-900',
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 px-1 py-1.5 sm:py-2 rounded-md font-medium transition-all border border-transparent gap-0.5 sm:gap-1.5 ${colorStyles[color]}`}>
      {icon} <span className="whitespace-nowrap text-[9px] sm:text-xs leading-none">{text}</span>
    </button>
  );
}

// ================= 4. Tab 1: 小组赛程 =================
function GroupScheduleView({ groups, onMatchClick, onTeamClick }) {
  const [viewMode, setViewMode] = useState('by_time'); 
  return (
    <div className="h-full flex flex-col bg-slate-950">
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
      <div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar relative">
        {viewMode === 'by_group' ? (
          <GroupScheduleByGroup groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
        ) : (
          <GroupScheduleByTime groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
        )}
      </div>
    </div>
  );
}

function GroupScheduleByGroup({ groups, onMatchClick, onTeamClick }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (g) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }));

  const renderTeamRow = (team, type, gName, idx) => (
    <div key={`team-row-${gName}-${team.id || 'no-id'}-${idx}-${type}`} onClick={() => !team.isPlaceholder && onTeamClick && onTeamClick(team)} 
         className={`relative flex items-center text-xs px-2 py-2.5 transition-colors border-b border-slate-800/30 last:border-b-0
           ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''}
           ${type === 'top2' ? 'bg-emerald-900/20' : type === 'third' ? 'bg-yellow-900/20' : ''}
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
    <div className="max-w-[1600px] mx-auto animate-fade-in grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20 items-start">
      {Object.keys(groups).map(g => {
        if (!groups[g].teams || groups[g].teams.length === 0) return null; 
        const isExpanded = expandedGroups[g];

        return (
          <div key={`group-board-${g}`} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col shadow-xl hover:border-emerald-500/40 transition-all group">
            <div onClick={() => toggleGroup(g)} className="cursor-pointer flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 mb-3 group-hover:border-emerald-500/30 transition-all">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-b from-emerald-400 to-emerald-600 w-1.5 h-6 rounded-full"></div>
                <span className="font-black text-white text-lg tracking-wider">{g}组</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-1 bg-emerald-900/30 rounded border border-emerald-500/30">
                {isExpanded ? '收起赛程 ▲' : '点击展开该组赛程 ▼'}
              </span>
            </div>
            
            <div className="bg-slate-950 rounded-lg pt-2 pb-0 border border-slate-800/80 overflow-hidden">
              <div className="flex text-[10px] text-slate-500 font-bold mb-1 px-2 border-b border-slate-800 pb-2">
                <span className="flex-1">球队</span>
                <span className="w-5 sm:w-6 text-center">胜</span>
                <span className="w-5 sm:w-6 text-center">平</span>
                <span className="w-5 sm:w-6 text-center">负</span>
                <span className="w-6 sm:w-8 text-center">净</span>
                <span className="w-6 sm:w-8 text-center text-emerald-400">分</span>
              </div>
              
              <div className="relative bg-emerald-900/20 border border-emerald-500/20 rounded-md mb-1.5 pt-4 pb-0.5 overflow-hidden">
                 <div className="absolute top-0 right-0 bg-emerald-500/90 text-emerald-950 text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-bl-xl shadow z-10">晋级32强区</div>
                 {groups[g].teams.slice(0, 2).map((team, idx) => renderTeamRow(team, 'top2', g, idx))}
              </div>

              <div className="relative bg-yellow-900/20 border border-yellow-500/20 rounded-md mb-1.5 pt-4 pb-0.5 overflow-hidden">
                 <div className="absolute top-0 right-0 bg-yellow-500/90 text-yellow-950 text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-bl-xl shadow z-10">晋级待定区</div>
                 {groups[g].teams.slice(2, 3).map((team, idx) => renderTeamRow(team, 'third', g, idx + 2))}
              </div>

              <div className="relative bg-slate-800/20 border border-slate-700/50 rounded-md pt-1 pb-1 overflow-hidden">
                 {groups[g].teams.slice(3, 4).map((team, idx) => renderTeamRow(team, 'fourth', g, idx + 3))}
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
         className={`relative flex items-center justify-between text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 sm:py-2 transition-colors border-b border-slate-800/30 last:border-b-0
           ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''} 
           ${type === 'top2' ? 'bg-emerald-900/20' : type === 'third' ? 'bg-yellow-900/20' : 'bg-transparent'}`}>
      <span className={`flex items-center flex-1 truncate pr-1 z-10 mt-0.5 ${type === 'top2' ? 'font-bold text-emerald-100' : type === 'third' ? 'font-bold text-yellow-100' : 'text-slate-400'}`}>
        <TeamFlag flag={team.flag} sizeClass="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"/>
        <span className="truncate max-w-[45px] sm:max-w-none" title={team.name}>{team.name}</span>
      </span>
      <div className="flex items-center justify-end font-mono z-10 mt-0.5 gap-0.5 sm:gap-1.5">
        <span className="w-3 sm:w-4 text-center text-slate-500 hidden sm:block">{team.w}</span>
        <span className="w-3 sm:w-4 text-center text-slate-500 hidden sm:block">{team.d}</span>
        <span className="w-3 sm:w-4 text-center text-slate-500 hidden sm:block">{team.l}</span>
        <span className="w-4 sm:w-6 text-center text-slate-400" title="净胜球">{team.gd}</span>
        <span className={`w-4 sm:w-6 text-center font-bold ${type === 'top2' ? 'text-emerald-400' : type === 'third' ? 'text-yellow-400' : 'text-slate-500'}`} title="积分">{team.pts}</span>
      </div>
    </div>
  );

  return (
    // 强制双列结构，各占 50%
    <div className="max-w-[1600px] mx-auto flex flex-row gap-0 sm:gap-4 pb-20 animate-fade-in w-full relative">
      
      {/* 左侧：严格时间轴 (固定占比 50%) */}
      <div className="w-1/2 relative pl-1 sm:pl-2 border-r border-slate-800/50 pr-1 sm:pr-2">
        <div className="absolute left-2 sm:left-3 top-4 bottom-0 w-px bg-gradient-to-b from-cyan-900 via-cyan-800/50 to-transparent z-0 hidden sm:block"></div>
        {Object.keys(groupedMatches).length === 0 && <div className="text-slate-500 py-10 text-xs">等待数据...</div>}
        <div className="space-y-6 sm:space-y-8">
          {Object.keys(groupedMatches).map((date, dIdx) => (
            <div key={`timeline-date-${date}-${dIdx}`} className="relative z-10">
              <div className="flex items-center mb-2 sm:mb-4">
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] border-2 border-slate-950 flex-shrink-0 hidden sm:block"></div>
                <div className="sm:ml-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[9px] sm:text-xs font-bold tracking-widest flex items-center backdrop-blur-md">
                  <CalendarDays className="w-3 h-3 mr-1 sm:mr-2 text-cyan-400" /> {date}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:ml-5">
                {groupedMatches[date].map((match, mIdx) => {
                  const timeDisplay = match.timeStr.includes(' ') ? match.timeStr.split(' ')[1] : match.timeStr;
                  return (
                    <div key={`timeline-match-${date}-${match.id || 'no-id'}-${mIdx}`} onClick={() => onMatchClick(match)} className="group relative flex flex-col p-1.5 sm:p-3 rounded-lg border transition-all border-slate-800 bg-slate-900/80 cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-950/20">
                      <div className="flex justify-between items-center mb-1.5 border-b border-slate-800/50 pb-1">
                        <div className="flex items-center text-[8px] sm:text-[10px] font-mono tracking-wider">
                          <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-px rounded mr-1.5 font-bold font-sans">{match.groupName}组</span>
                          <span className="text-slate-300 font-bold"><Clock className="w-2.5 h-2.5 inline mr-0.5 opacity-70"/>{timeDisplay}</span>
                        </div>
                        <span className="text-[8px] text-slate-600 truncate max-w-[50px] sm:max-w-none"><MapPin className="w-2 h-2 inline opacity-50" /> {match.venue}</span>
                      </div>
                      
                      {/* 极限压缩间距排版 */}
                      <div className="flex justify-center items-center w-full mt-1 gap-1">
                        <div className="flex items-center justify-end flex-1 overflow-hidden">
                          <span className="truncate text-[10px] sm:text-xs font-bold text-slate-300 group-hover:text-white text-right" title={match.home?.name || '待定'}>{match.home?.name || '待定'}</span>
                          <TeamFlag flag={match.home?.flag} sizeClass="w-3.5 h-3.5 sm:w-5 sm:h-5 ml-1" />
                        </div>
                        <div className="flex flex-col justify-center items-center shrink-0 relative px-1">
                           {match.status === 'LIVE' && <span className="absolute -top-3 text-[9px] text-cyan-400 font-bold animate-pulse">{match.liveMinute}</span>}
                           <span className={`font-mono text-[10px] sm:text-sm font-bold ${match.status === 'LIVE' ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-500'}`}>
                              {match.status === 'FINISHED' || match.status === 'LIVE' ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                           </span>
                        </div>
                        <div className="flex items-center justify-start flex-1 overflow-hidden">
                          <TeamFlag flag={match.away?.flag} sizeClass="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1" />
                          <span className="truncate text-[10px] sm:text-xs font-bold text-slate-300 group-hover:text-white text-left" title={match.away?.name || '待定'}>{match.away?.name || '待定'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：紧凑型排行榜 (强制占 50%) */}
      <div className="w-1/2 pt-0 pl-1 sm:pl-2 pr-1">
        <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md z-20 pb-2 border-b border-slate-800 mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center"><ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-cyan-500" /> 实时排名</h2>
        </div>
        <div className="space-y-3">
          {Object.keys(groups).map(g => {
             if (!groups[g].teams || groups[g].teams.length === 0) return null;
             return (
               <div key={`sidebar-group-${g}`} className="w-full bg-slate-900 border border-slate-800/60 rounded-md p-1.5 sm:p-2 hover:border-cyan-900 transition-all group">
                 <div className="font-black text-slate-300 text-[10px] sm:text-xs tracking-widest group-hover:text-cyan-400 transition-colors mb-1">{g}组</div>
                 
                 <div className="flex text-[8px] sm:text-[10px] text-slate-500 font-bold mb-1 px-1 border-b border-slate-800 pb-1">
                   <span className="flex-1">球队</span>
                   <span className="w-3 sm:w-4 text-center hidden sm:block">胜</span>
                   <span className="w-3 sm:w-4 text-center hidden sm:block">平</span>
                   <span className="w-3 sm:w-4 text-center hidden sm:block">负</span>
                   <span className="w-4 sm:w-6 text-center">净</span>
                   <span className="w-4 sm:w-6 text-center text-emerald-400">分</span>
                 </div>

                 <div className="bg-slate-950 rounded border border-slate-800/80 overflow-hidden flex flex-col">
                    <div className="relative bg-emerald-900/20 border border-emerald-500/20 rounded-md mb-1 pt-3 sm:pt-4 pb-0.5 overflow-hidden">
                       <div className="absolute top-0 right-0 bg-emerald-500/90 text-emerald-950 text-[7px] sm:text-[9px] font-black px-1.5 py-px rounded-bl-xl shadow z-10">晋级32强</div>
                       {groups[g].teams.slice(0, 2).map((team, idx) => <React.Fragment key={`sb-team-${team.id}`}>{renderSidebarTeamRow(team, 'top2', idx, g)}</React.Fragment>)}
                    </div>
                    <div className="relative bg-yellow-900/20 border border-yellow-500/20 rounded-md mb-1 pt-3 sm:pt-4 pb-0.5 overflow-hidden">
                       <div className="absolute top-0 right-0 bg-yellow-500/90 text-yellow-950 text-[7px] sm:text-[9px] font-black px-1.5 py-px rounded-bl-xl shadow z-10">待定区</div>
                       {groups[g].teams.slice(2, 3).map((team, idx) => <React.Fragment key={`sb-team-${team.id}`}>{renderSidebarTeamRow(team, 'third', idx + 2, g)}</React.Fragment>)}
                    </div>
                    <div className="relative bg-slate-800/20 border border-slate-700/50 rounded-md pt-0.5 pb-0.5 overflow-hidden">
                       {groups[g].teams.slice(3, 4).map((team, idx) => <React.Fragment key={`sb-team-${team.id}`}>{renderSidebarTeamRow(team, 'fourth', idx + 3, g)}</React.Fragment>)}
                    </div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
}

// ================= 5. Tab 2: 淘汰赛程视图 =================
function KnockoutScheduleView({ getTeamFromSlot, onMatchClick }) {
  const [activeRound, setActiveRound] = useState('r32'); 
  
  const roundMatches = officialKnockoutRounds[activeRound].map(match => ({
    ...match, home: getTeamFromSlot(match.homeStr), away: getTeamFromSlot(match.awayStr)
  }));
  const groupedMatches = groupByDate(roundMatches);

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-2 py-2 flex justify-center z-10 shrink-0">
        <div className="flex space-x-1 sm:space-x-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800 overflow-x-auto hide-scrollbar max-w-full">
          <SubRoundTab active={activeRound === 'r32'} onClick={() => setActiveRound('r32')} text="32强" />
          <SubRoundTab active={activeRound === 'r16'} onClick={() => setActiveRound('r16')} text="16强" />
          <SubRoundTab active={activeRound === 'qf'} onClick={() => setActiveRound('qf')} text="8强" />
          <SubRoundTab active={activeRound === 'sf'} onClick={() => setActiveRound('sf')} text="半决赛" />
          <SubRoundTab active={activeRound === 'final'} onClick={() => setActiveRound('final')} text="冠军战" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar relative">
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in relative z-10">
          
          {['qf', 'sf', 'final'].includes(activeRound) ? (
            <div className="mb-8">
              <h3 className="text-sm sm:text-xl font-bold text-white mb-4 flex items-center px-2">
                <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" /> 赛事战局与赛程详情
              </h3>
              <KnockoutCompactTree round={activeRound} matches={roundMatches} onMatchClick={onMatchClick} />
            </div>
          ) : (
            <>
              <KnockoutParticipantsOverview round={activeRound} matches={roundMatches} />

              <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-slate-800/80">
                <h3 className="text-sm sm:text-xl font-bold text-white mb-4 flex items-center">
                   <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" /> 详细赛事表
                </h3>
                {Object.keys(groupedMatches).map((date, dIdx) => (
                  <div key={`ko-date-${date}-${dIdx}`} className="mb-4 sm:mb-6 animate-fade-in">
                    <div className="flex items-center mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/50 text-slate-300 text-[10px] sm:text-xs font-bold tracking-widest flex items-center">
                        <CalendarDays className="w-3 h-3 mr-1 text-purple-500/70" /> {date}
                      </span>
                      <div className="h-px bg-slate-800 flex-1 ml-3"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 px-1 sm:px-2">
                      {groupedMatches[date].map((m, idx) => (
                        <KnockoutCleanListCard key={`ko-match-${date}-${m.id || 'no-id'}-${idx}`} match={m} onClick={() => onMatchClick(m)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SubRoundTab({ active, onClick, text }) {
  return (
    <button onClick={onClick} className={`px-4 sm:px-8 py-1.5 sm:py-2 rounded font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${active ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>
      {text}
    </button>
  );
}

function KnockoutParticipantsOverview({ round, matches }) {
  return (
    <div className="mb-4 sm:mb-8">
      <h3 className="text-sm sm:text-xl font-bold text-white mb-3 flex items-center px-2">
        <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" /> 晋级大名单
      </h3>
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 px-1 sm:px-2">
        {matches.map((m, idx) => <OverviewMatchBox key={`overview-${m.id || 'no-id'}-${idx}`} match={m} />)}
      </div>
    </div>
  );
}

function OverviewMatchBox({ match }) {
  const { home, away, isFinished, isHomeWin, isAwayWin } = getMatchStatus(match);
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded p-1 flex flex-col justify-center gap-0.5 shadow-sm hover:border-purple-500/30 transition-colors">
      <OverviewTeam team={home} isWin={isHomeWin} isLoss={isFinished && !isHomeWin} />
      <div className="h-px bg-slate-800/50 w-full my-px"></div>
      <OverviewTeam team={away} isWin={isAwayWin} isLoss={isFinished && !isAwayWin} />
    </div>
  );
}

function OverviewTeam({ team, isWin, isLoss }) {
  return (
    <div className={`flex items-center relative w-full transition-all rounded px-0.5 py-0.5 ${isLoss ? 'grayscale opacity-30 bg-slate-950/50' : ''} ${isWin ? 'bg-purple-900/20' : ''}`}>
      <div className="relative flex-shrink-0 flex items-center justify-center w-3 h-3 sm:w-5 sm:h-5">
        <TeamFlag flag={team.flag} sizeClass="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        {isLoss && <div className="absolute inset-0 flex items-center justify-center z-10"><X className="w-3 h-3 text-red-500 drop-shadow-md stroke-[3]" /></div>}
      </div>
      <span className={`text-[8px] sm:text-[10px] ml-1 truncate flex-1 ${isWin ? 'text-yellow-400 font-bold' : isLoss || team.isPlaceholder ? 'text-slate-500' : 'text-slate-200'}`} title={team.placeholderName || team.name}>
        {team.name}
      </span>
    </div>
  );
}

function KnockoutCleanListCard({ match, onClick }) {
  const timeDisplay = match.timeStr.includes(' ') ? match.timeStr.split(' ')[1] : match.timeStr;
  const isFinished = match.status === 'FINISHED';

  return (
    <div onClick={onClick} className="group flex flex-col bg-slate-900/40 border border-slate-800/60 rounded-lg p-2 sm:p-3 cursor-pointer hover:border-purple-500/40 hover:bg-slate-900 transition-all">
      <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-1.5">
        <span className="text-[10px] sm:text-xs font-bold text-slate-300 flex items-center bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">
          <Clock className="w-3 h-3 mr-1 opacity-70" /> {timeDisplay}
        </span>
        <span className="text-[8px] sm:text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded flex items-center">
          <MapPin className="w-2.5 h-2.5 mr-0.5 opacity-50" /> {match.venue}
        </span>
      </div>
      <div className="flex justify-center items-center w-full mt-1 gap-2">
        <div className="flex items-center justify-end flex-1">
          <span className={`text-[10px] sm:text-sm truncate font-bold text-right ${match.home.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-200 group-hover:text-white'}`} title={match.home.placeholderName || match.home.name}>{match.home.name}</span>
          <TeamFlag flag={match.home.flag} sizeClass="w-3.5 h-3.5 sm:w-6 sm:h-6 ml-1 flex-shrink-0" />
        </div>
        <div className="flex justify-center items-center shrink-0">
          {isFinished ? (
             <span className="font-mono text-xs sm:text-base font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
               {match.homeScore} - {match.awayScore}
             </span>
          ) : (
             <span className="font-black text-[10px] sm:text-sm text-slate-700">VS</span>
          )}
        </div>
        <div className="flex items-center justify-start flex-1">
          <TeamFlag flag={match.away.flag} sizeClass="w-3.5 h-3.5 sm:w-6 sm:h-6 mr-1 flex-shrink-0" />
          <span className={`text-[10px] sm:text-sm truncate text-left font-bold ${match.away.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-200 group-hover:text-white'}`} title={match.away.placeholderName || match.away.name}>{match.away.name}</span>
        </div>
      </div>
    </div>
  );
}

function KnockoutCompactTree({ round, matches, onMatchClick }) {
  if (round === 'qf') {
    return (
      <div className="flex justify-between items-center relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 -translate-x-1/2 hidden sm:block"></div>
        <div className="flex flex-col gap-4 w-full sm:w-[45%] z-10"><CompactTreeNode match={matches[0]} onClick={onMatchClick} /><CompactTreeNode match={matches[1]} onClick={onMatchClick} /></div>
        <Trophy className="w-10 h-10 text-slate-800 z-10 drop-shadow-2xl hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col gap-4 w-full sm:w-[45%] z-10 mt-4 sm:mt-0"><CompactTreeNode match={matches[2]} onClick={onMatchClick} /><CompactTreeNode match={matches[3]} onClick={onMatchClick} /></div>
      </div>
    );
  }
  if (round === 'sf') {
    return (
      <div className="flex justify-between items-center mt-6 px-2 sm:px-6 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 -translate-x-1/2 hidden sm:block"></div>
        <div className="w-full sm:w-[45%] z-10"><CompactTreeNode match={matches[0]} onClick={onMatchClick} /></div>
        <Trophy className="w-16 h-16 text-yellow-500/30 z-10 drop-shadow-2xl hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="w-full sm:w-[45%] z-10 mt-4 sm:mt-0"><CompactTreeNode match={matches[1]} onClick={onMatchClick} /></div>
      </div>
    );
  }
  if (round === 'final') {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
        <div className="text-center w-full md:w-[45%] opacity-90 order-1">
          <div className="text-slate-400 font-bold mb-1 sm:mb-2 tracking-widest text-[10px] sm:text-xs bg-slate-800/50 py-1.5 rounded-t-lg border border-slate-700 border-b-0">季军战</div>
          <CompactTreeNode match={matches[0]} onClick={onMatchClick} />
        </div>
        <div className="text-center w-full md:w-[45%] order-2">
          <div className="text-yellow-500 font-bold mb-1 sm:mb-2 tracking-widest text-xs sm:text-sm flex justify-center items-center bg-yellow-500/10 py-1.5 rounded-t-lg border border-yellow-500/30 border-b-0">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5"/> 冠军战
          </div>
          <CompactTreeNode match={matches[1]} isFinal onClick={onMatchClick} />
        </div>
      </div>
    );
  }
}

function CompactTreeNode({ match, isFinal, onClick }) {
  const { home, away, isFinished, isHomeWin, isAwayWin } = getMatchStatus(match);
  return (
    <div onClick={() => onClick && onClick(match)} className={`bg-slate-900/80 border transition-all cursor-pointer group ${isFinal ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:border-yellow-400/80' : 'border-slate-800 hover:border-purple-500/50'} rounded-lg p-1.5 sm:p-2 flex flex-col relative overflow-hidden`}>
      <div className="flex justify-between items-center mb-1.5 px-1 border-b border-slate-800/50 pb-1.5 pt-0.5">
        <span className="text-[10px] sm:text-xs font-bold text-slate-300 group-hover:text-slate-100 flex items-center bg-slate-950 px-1.5 py-0.5 rounded"><Clock className="w-3 h-3 inline mr-1 opacity-70"/>{match.timeStr}</span>
        <span className="text-[9px] text-slate-500 truncate max-w-[80px] sm:max-w-[120px] group-hover:text-slate-400 flex items-center"><MapPin className="w-2.5 h-2.5 inline mr-0.5 opacity-70"/>{match.venue}</span>
      </div>
      <CompactTeamRow team={home} isWin={isHomeWin} isLoss={isFinished && !isHomeWin} score={match.homeScore} isFinished={isFinished} />
      <div className="h-px w-full bg-slate-800/50 my-1"></div>
      <CompactTeamRow team={away} isWin={isAwayWin} isLoss={isFinished && !isAwayWin} score={match.awayScore} isFinished={isFinished} />
      {!isFinished && <div className="absolute right-6 top-[65%] -translate-y-1/2 text-slate-700 text-[10px] font-black group-hover:text-purple-500 transition-colors hidden sm:block">VS</div>}
    </div>
  );
}

function CompactTeamRow({ team, isWin, isLoss, score, isFinished }) {
  return (
    <div className={`flex items-center justify-between p-1 sm:p-1.5 rounded relative transition-all ${isLoss ? 'grayscale opacity-40 bg-slate-950' : ''} ${isWin ? 'bg-emerald-900/20 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}>
      <div className="flex items-center space-x-2 pl-1 w-[70%]">
        {isLoss && <span className="absolute -left-1 text-[8px] bg-slate-950 rounded-full border border-slate-800 z-10"><X className="w-3 h-3 text-red-500 p-0.5" /></span>}
        {isWin && <span className="absolute -left-1 text-[8px] font-black bg-yellow-500 text-slate-950 px-1 py-0.5 rounded shadow-lg transform -rotate-12 z-10">WIN</span>}
        <TeamFlag flag={team.flag} sizeClass="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <span className={`text-[10px] sm:text-sm truncate w-full ${isWin ? 'text-white font-bold' : isLoss || team.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-300 font-medium'}`} title={team.placeholderName || team.name}>{team.name}</span>
      </div>
      <div className="w-[30%] text-right pr-2">
        <span className={`font-mono text-[10px] sm:text-base font-bold ${isWin ? 'text-yellow-400' : isLoss ? 'text-slate-600' : 'text-slate-500'}`}>
          {isFinished ? score : '-'}
        </span>
      </div>
    </div>
  );
}


// ================= 6. Tab 3: 全景对阵树视图 =================
function BracketView({ getTeamFromSlot, onMatchClick }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const getInitialScale = useCallback(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scaleX = w / 2400; // 根据新字号增加宽度计算
      const scaleY = (h - 100) / 1600;
      return Math.max(Math.min(scaleX, scaleY, 0.95), 0.15); // 确保最小缩放能看到全貌
    }
    return 0.35;
  }, []);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: getInitialScale() });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDist, setLastTouchDist] = useState(null);

  useEffect(() => {
    const handleResize = () => setTransform(p => ({ ...p, scale: getInitialScale(), x: 0, y: 0 }));
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getInitialScale]);

  // 极限防下拉刷新与原生缩放
  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas) return;
    const prevent = (e) => { e.preventDefault(); };
    canvas.addEventListener('wheel', prevent, { passive: false });
    canvas.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', prevent);
      canvas.removeEventListener('touchmove', prevent);
    };
  }, []);

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); };
  const handleMouseMove = (e) => { if (!isDragging) return; setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })); };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setLastTouchDist(dist);
    }
  };
  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setTransform(prev => ({ ...prev, x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }));
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scaleAdjust = dist / lastTouchDist;
      setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale * scaleAdjust, 0.05), 2) }));
      setLastTouchDist(dist);
    }
  };
  const handleTouchEnd = () => { setIsDragging(false); setLastTouchDist(null); };

  const resetView = () => setTransform({ x: 0, y: 0, scale: getInitialScale() });

  const leftR32 = officialKnockoutRounds.r32.slice(0, 8);
  const rightR32 = officialKnockoutRounds.r32.slice(8, 16);

  return (
    <div className={`relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-[100] w-full h-full' : 'h-[calc(100vh-72px)] w-full'}`}>
      
      {/* 提示信息移到顶部居中 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none space-y-2 opacity-90">
        <div className="flex items-center bg-blue-500/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-full font-bold shadow-md backdrop-blur-md text-[10px] sm:text-xs">
          <GitBranch className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" /> 官方实时自动排位
        </div>
        <div className="text-[9px] sm:text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur shadow-lg">
          💡 按住拖拽平移，双指/滚轮自由缩放
        </div>
      </div>

      <div className="absolute bottom-4 right-2 sm:right-4 z-20 flex items-center bg-slate-800/90 backdrop-blur rounded-lg p-1 space-x-1 border border-slate-700 shadow-xl">
        <button onClick={() => setTransform(p => ({...p, scale: p.scale * 1.2}))} className="p-2 sm:p-2.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="放大"><ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        <button onClick={() => setTransform(p => ({...p, scale: p.scale * 0.8}))} className="p-2 sm:p-2.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="缩小"><ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        <button onClick={resetView} className="p-2 sm:p-2.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="还原中心视角"><Move className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        <div className="w-px h-5 sm:h-6 bg-slate-700 mx-1"></div>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded font-bold text-[10px] sm:text-sm flex items-center transition-colors ${isFullscreen ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {isFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>}
        </button>
      </div>

      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <div 
          className="absolute top-1/2 left-1/2 flex items-center justify-center origin-center will-change-transform"
          style={{ transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.scale})` }}
        >
          <div className="flex items-center space-x-3 sm:space-x-6 mr-3 sm:mr-6">
            <BracketColumn title="32强" gap="space-y-[4.5rem]">
               {leftR32.map((m) => (<MatchCard key={`r32-l-${m.id}`} match={m} home={getTeamFromSlot(m.homeStr)} away={getTeamFromSlot(m.awayStr)} onClick={onMatchClick} />))}
            </BracketColumn>
            <TreeConnector count={4} height="h-[1550px]" />
            <BracketColumn title="16强" gap="space-y-[280px]">
               {Array.from({length: 4}).map((_, idx) => (<MatchCard key={`r16-l-${idx}`} match={officialKnockoutRounds.r16[idx]} isTBD onClick={onMatchClick} />))}
            </BracketColumn>
            <TreeConnector count={2} height="h-[1550px]" />
            <BracketColumn title="1/4 决赛" gap="space-y-[620px]">
               {Array.from({length: 2}).map((_, idx) => (<MatchCard key={`qf-l-${idx}`} match={officialKnockoutRounds.qf[idx]} isTBD onClick={onMatchClick} />))}
            </BracketColumn>
            <TreeConnector count={1} height="h-[1550px]" />
            <BracketColumn title="半决赛" gap="space-y-0" isCenter>
               <MatchCard match={officialKnockoutRounds.sf[0]} isTBD highlight onClick={onMatchClick} />
            </BracketColumn>
            <div className="w-10 sm:w-16 border-b-4 border-blue-500/50"></div>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 z-10 px-4 sm:px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-[80px] animate-pulse"></div>
              <Trophy className="w-32 h-32 sm:w-40 sm:h-40 text-yellow-500 mb-8 shadow-[0_0_60px_rgba(234,179,8,0.3)] rounded-full p-4 bg-yellow-500/10 relative z-10" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white mb-8 tracking-[0.2em] uppercase bg-slate-900 border-2 border-slate-700 px-10 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              2026 决赛
            </div>
            <div className="scale-110 sm:scale-125 origin-center w-56 sm:w-72">
              <MatchCard match={officialKnockoutRounds.final[1]} isTBD isFinal onClick={onMatchClick} />
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6 ml-3 sm:ml-6">
            <div className="w-10 sm:w-16 border-b-4 border-blue-500/50"></div>
            <BracketColumn title="半决赛" gap="space-y-0" isCenter>
               <MatchCard match={officialKnockoutRounds.sf[1]} isTBD highlight onClick={onMatchClick} />
            </BracketColumn>
            <TreeConnector count={1} height="h-[1550px]" reverse />
            <BracketColumn title="1/4 决赛" gap="space-y-[620px]">
               {Array.from({length: 2}).map((_, idx) => (<MatchCard key={`qf-r-${idx}`} match={officialKnockoutRounds.qf[idx+2]} isTBD onClick={onMatchClick} />))}
            </BracketColumn>
            <TreeConnector count={2} height="h-[1550px]" reverse />
            <BracketColumn title="16强" gap="space-y-[280px]">
               {Array.from({length: 4}).map((_, idx) => (<MatchCard key={`r16-r-${idx}`} match={officialKnockoutRounds.r16[idx+4]} isTBD onClick={onMatchClick} />))}
            </BracketColumn>
            <TreeConnector count={4} height="h-[1550px]" reverse />
            <BracketColumn title="32强" gap="space-y-[4.5rem]">
               {rightR32.map((m) => (<MatchCard key={`r32-r-${m.id}`} match={m} home={getTeamFromSlot(m.homeStr)} away={getTeamFromSlot(m.awayStr)} onClick={onMatchClick} />))}
            </BracketColumn>
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketColumn({ title, children, gap, isCenter }) {
  return (
    // 增加卡片宽度以容纳更大字号
    <div className={`flex flex-col w-52 sm:w-72 ${isCenter ? 'justify-center' : 'justify-around'} h-[1600px]`}>
      <div className="text-center font-bold text-slate-400 tracking-widest text-sm sm:text-base mb-6 shrink-0 bg-slate-800/80 py-2 sm:py-3 border border-slate-700 rounded shadow-lg backdrop-blur-sm">{title}</div>
      <div className={`flex flex-col flex-1 justify-center ${gap}`}>{children}</div>
    </div>
  );
}

function MatchCard({ match, home, away, isTBD, highlight, isFinal, onClick }) {
  const displayHome = home || { name: match?.homeStr || '待定', flag: '❔', isPlaceholder: true };
  const displayAway = away || { name: match?.awayStr || '待定', flag: '❔', isPlaceholder: true };
  
  return (
    <div onClick={() => match && onClick && onClick({...match, home: displayHome, away: displayAway})} className={`w-full relative rounded-xl border bg-slate-900/95 backdrop-blur overflow-hidden transition-all duration-300 shadow-xl cursor-pointer group ${isTBD ? 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600' : 'border-slate-600'} ${highlight ? 'border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''} ${isFinal ? 'border-yellow-500/80 bg-gradient-to-br from-slate-900 to-yellow-900/30 shadow-[0_0_40px_rgba(234,179,8,0.2)]' : ''}`}>
      <div className="flex justify-between items-center px-2 sm:px-3 pt-1.5 sm:pt-2 pb-1 sm:pb-1.5 border-b border-slate-800/50 bg-slate-950/40">
        <span className="text-[11px] sm:text-sm font-bold text-slate-400 group-hover:text-slate-200 flex items-center"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1 opacity-70"/>{match?.timeStr || 'TBD'}</span>
      </div>
      <div className="p-1 sm:p-2">
        <TeamRow team={displayHome} isTBD={isTBD} />
        <div className="h-[2px] w-full bg-slate-800/80 my-1 sm:my-1.5"></div>
        <TeamRow team={displayAway} isTBD={isTBD} />
      </div>
    </div>
  );
}

function TeamRow({ team, isTBD }) {
  return (
    <div className={`flex items-center justify-between p-1.5 sm:p-3 rounded bg-slate-800/40`}>
      <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base w-full">
        <TeamFlag flag={team?.flag} sizeClass="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
        <div className="flex flex-col w-[80%]">
          <span className={`truncate w-full ${team?.isPlaceholder ? 'text-slate-500 font-mono font-normal text-xs sm:text-sm' : 'text-slate-100 font-bold text-sm sm:text-base'}`} title={team?.placeholderName || team?.name}>{team?.name || '待定'}</span>
        </div>
      </div>
    </div>
  );
}

function TreeConnector({ count, height, reverse }) {
  return (
    <div className={`flex flex-col justify-around ${height} w-6 sm:w-12 shrink-0`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`connector-${i}`} className="h-1/2 flex flex-col justify-center py-10">
          <div className={`border-t-2 sm:border-t-4 ${reverse ? 'border-l-2 sm:border-l-4 rounded-tl-xl' : 'border-r-2 sm:border-r-4 rounded-tr-xl'} border-slate-700/80 h-1/2 w-full`}></div>
          <div className={`border-b-2 sm:border-b-4 ${reverse ? 'border-l-2 sm:border-l-4 rounded-bl-xl' : 'border-r-2 sm:border-r-4 rounded-br-xl'} border-slate-700/80 h-1/2 w-full`}></div>
        </div>
      ))}
    </div>
  );
}

// ================= 7. Tab 4: 冠军推演沙盒 =================
function PredictionSandbox({ getTeamFromSlot, groups }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const getInitialScale = useCallback(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scaleX = w / 2400; // 适配大字号的大尺寸
      const scaleY = (h - 100) / 1600;
      return Math.max(Math.min(scaleX, scaleY, 0.95), 0.15);
    }
    return 0.35;
  }, []);

  const initPredictions = () => {
    let nodes = {};
    officialKnockoutRounds.r32.forEach((m, idx) => {
      nodes[idx+1] = { 
        id: idx+1, stage: 'R32', home: null, away: null, 
        homePlaceholder: m.homeStr, awayPlaceholder: m.awayStr, winner: null, 
        nextId: 17 + Math.floor(idx / 2), isHomeSlot: idx % 2 === 0, matchData: m
      };
    });
    for(let i=17; i<=24; i++) nodes[i] = { id: i, stage: 'R16', home: null, away: null, winner: null, nextId: 25 + Math.floor((i-17)/2), isHomeSlot: (i-17)%2 === 0, matchData: officialKnockoutRounds.r16[i-17] };
    for(let i=25; i<=28; i++) nodes[i] = { id: i, stage: 'QF', home: null, away: null, winner: null, nextId: 29 + Math.floor((i-25)/2), isHomeSlot: (i-25)%2 === 0, matchData: officialKnockoutRounds.qf[i-25] };
    nodes[29] = { id: 29, stage: 'SF', home: null, away: null, winner: null, nextId: 31, isHomeSlot: true, matchData: officialKnockoutRounds.sf[0] };
    nodes[30] = { id: 30, stage: 'SF', home: null, away: null, winner: null, nextId: 31, isHomeSlot: false, matchData: officialKnockoutRounds.sf[1] };
    nodes[31] = { id: 31, stage: 'FINAL', home: null, away: null, winner: null, nextId: 'CHAMPION', matchData: officialKnockoutRounds.final[1] };
    return { nodes, champion: null };
  };

  const [tree, setTree] = useState(initPredictions());
  const [showPoster, setShowPoster] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState(null); 

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: getInitialScale() });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDist, setLastTouchDist] = useState(null);

  useEffect(() => {
    const handleResize = () => setTransform(p => ({ ...p, scale: getInitialScale(), x: 0, y: 0 }));
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [getInitialScale]);

  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas) return;
    const prevent = (e) => { e.preventDefault(); };
    canvas.addEventListener('wheel', prevent, { passive: false });
    canvas.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', prevent);
      canvas.removeEventListener('touchmove', prevent);
    };
  }, []);

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); };
  const handleMouseMove = (e) => { if (!isDragging) return; setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })); };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - transform.x, y: e.touches[0].clientY - transform.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setLastTouchDist(dist);
    }
  };
  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setTransform(prev => ({ ...prev, x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }));
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scaleAdjust = dist / lastTouchDist;
      setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale * scaleAdjust, 0.05), 2) }));
      setLastTouchDist(dist);
    }
  };
  const handleTouchEnd = () => { setIsDragging(false); setLastTouchDist(null); };

  const resetView = () => setTransform({ x: 0, y: 0, scale: getInitialScale() });

  const handleAdvance = (nodeId, team) => {
    if (!team || team.isPlaceholder || team.name === '待定') return;
    setTree(prev => {
      const newNodes = { ...prev.nodes };
      newNodes[nodeId].winner = team;
      if (newNodes[nodeId].nextId === 'CHAMPION') return { ...prev, nodes: newNodes, champion: team };
      
      const nextNode = newNodes[newNodes[nodeId].nextId];
      if (newNodes[nodeId].isHomeSlot) nextNode.home = team; else nextNode.away = team;
      return { ...prev, nodes: newNodes };
    });
  };

  const handleSelectTeam = (team) => {
    if (!selectingSlot) return;
    setTree(prev => {
      const newNodes = { ...prev.nodes };
      const node = newNodes[selectingSlot.nodeId];
      const oldTeam = selectingSlot.type === 'home' ? node.home : node.away;
      
      if (selectingSlot.type === 'home') node.home = team; else node.away = team;
      if (oldTeam && oldTeam.id !== team.id) node.winner = null; 
      
      return { ...prev, nodes: newNodes };
    });
    setSelectingSlot(null);
  };

  return (
    <div className={`relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-[100] w-full h-full' : 'h-[calc(100vh-72px)] w-full'}`}>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none space-y-2 opacity-90">
        <div className="flex items-center bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-4 py-1.5 rounded-full font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse backdrop-blur-md text-[10px] sm:text-xs whitespace-nowrap">
          <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" /> 点击边缘占位选队，一路晋级！
        </div>
        <div className="text-[9px] sm:text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur whitespace-nowrap shadow-lg">
          💡 按住拖拽平移，双指/滚轮自由缩放，可随时改选
        </div>
      </div>

      <div className="absolute bottom-4 left-2 sm:left-4 z-20 flex items-center bg-slate-800/90 backdrop-blur rounded-lg p-1 space-x-1 border border-slate-700 shadow-xl">
        <button onClick={() => setTree(initPredictions())} className="p-2 sm:p-2.5 hover:bg-red-500/20 rounded text-red-400 transition-colors flex items-center text-[10px] sm:text-xs px-2 sm:px-4"><RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5"/><span className="hidden sm:inline font-bold">重置推演</span></button>
        <div className="w-px h-5 sm:h-6 bg-slate-700 mx-1"></div>
        <button 
            onClick={() => setShowPoster(true)} 
            disabled={!tree.champion}
            className={`p-2 sm:p-2.5 rounded font-bold text-[10px] sm:text-xs flex items-center transition-all px-2 sm:px-4 ${tree.champion ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 hover:scale-105 shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
          >
            <Camera className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5"/> <span>分享海报</span>
        </button>
      </div>

      <div className="absolute bottom-4 right-2 sm:right-4 z-20 flex items-center bg-slate-800/90 backdrop-blur rounded-lg p-1 space-x-1 border border-slate-700 shadow-xl">
        <button onClick={() => setTransform(p => ({...p, scale: p.scale * 1.2}))} className="p-2 sm:p-2.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="放大"><ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        <button onClick={() => setTransform(p => ({...p, scale: p.scale * 0.8}))} className="p-2 sm:p-2.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="缩小"><ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        <button onClick={resetView} className="p-2 sm:p-2.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="还原中心视角"><Move className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        <div className="w-px h-5 sm:h-6 bg-slate-700 mx-1"></div>
        <button onClick={() => setIsFullscreen(!isFullscreen)} className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded font-bold text-[10px] sm:text-sm flex items-center transition-colors ${isFullscreen ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {isFullscreen ? <Minimize className="w-3 h-3 sm:w-4 sm:h-4"/> : <Maximize className="w-3 h-3 sm:w-4 sm:h-4"/>}
        </button>
      </div>

      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <div 
          className="absolute top-1/2 left-1/2 flex items-center justify-center origin-center will-change-transform"
          style={{ transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.scale})` }}
        >
           <div className="flex items-center space-x-3 sm:space-x-6 mr-3 sm:mr-6">
             <BracketColumn title="32强" gap="space-y-[4.5rem]">
               {Array.from({length: 8}).map((_,i) => <InteractiveNode key={`node-l-1-${i}`} node={tree.nodes[1+i]} onTeamClick={handleAdvance} onSelectClick={setSelectingSlot} />)}
             </BracketColumn>
             <TreeConnector count={4} height="h-[1550px]" />
             <BracketColumn title="16强" gap="space-y-[280px]">
               {Array.from({length: 4}).map((_,i) => <InteractiveNode key={`node-l-17-${i}`} node={tree.nodes[17+i]} onTeamClick={handleAdvance} />)}
             </BracketColumn>
             <TreeConnector count={2} height="h-[1550px]" />
             <BracketColumn title="1/4 决赛" gap="space-y-[620px]">
               {Array.from({length: 2}).map((_,i) => <InteractiveNode key={`node-l-25-${i}`} node={tree.nodes[25+i]} onTeamClick={handleAdvance} />)}
             </BracketColumn>
             <TreeConnector count={1} height="h-[1550px]" />
             <BracketColumn title="半决赛" gap="space-y-0" isCenter>
               <InteractiveNode node={tree.nodes[29]} onTeamClick={handleAdvance} />
             </BracketColumn>
             <div className="w-10 sm:w-16 border-b-4 border-yellow-500/50 border-dashed"></div>
           </div>
           
           <div className="flex flex-col items-center justify-center shrink-0 z-10 px-4 sm:px-6">
             <div className="relative">
               <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-[80px] animate-pulse"></div>
               <Trophy className={`w-32 h-32 sm:w-40 sm:h-40 mb-8 shadow-[0_0_60px_rgba(234,179,8,0.3)] rounded-full p-4 relative z-10 transition-all ${tree.champion ? 'text-yellow-400 bg-yellow-500/20 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] scale-110' : 'text-slate-700 bg-slate-800'}`} />
             </div>
             <div className={`text-4xl sm:text-5xl font-black mb-8 tracking-[0.2em] uppercase px-10 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all border-2
               ${tree.champion ? 'bg-yellow-500 text-slate-950 border-yellow-400' : 'bg-slate-900 text-slate-600 border-slate-800 border-dashed'}
             `}>
               {tree.champion ? tree.champion.name : '虚拟总冠军'}
             </div>
             <div className="scale-110 sm:scale-125 origin-center w-56 sm:w-72">
               <InteractiveNode node={tree.nodes[31]} onTeamClick={handleAdvance} isFinal />
             </div>
           </div>

           <div className="flex items-center space-x-3 sm:space-x-6 ml-3 sm:ml-6">
             <div className="w-10 sm:w-16 border-b-4 border-yellow-500/50 border-dashed"></div>
             <BracketColumn title="半决赛" gap="space-y-0" isCenter>
               <InteractiveNode node={tree.nodes[30]} onTeamClick={handleAdvance} />
             </BracketColumn>
             <TreeConnector count={1} height="h-[1550px]" reverse />
             <BracketColumn title="1/4 决赛" gap="space-y-[580px]">
               {Array.from({length: 2}).map((_,i) => <InteractiveNode key={`node-r-27-${i}`} node={tree.nodes[27+i]} onTeamClick={handleAdvance} />)}
             </BracketColumn>
             <TreeConnector count={2} height="h-[1550px]" reverse />
             <BracketColumn title="16强" gap="space-y-[280px]">
               {Array.from({length: 4}).map((_,i) => <InteractiveNode key={`node-r-21-${i}`} node={tree.nodes[21+i]} onTeamClick={handleAdvance} />)}
             </BracketColumn>
             <TreeConnector count={4} height="h-[1550px]" reverse />
             <BracketColumn title="32强" gap="space-y-[4.5rem]">
               {Array.from({length: 8}).map((_,i) => <InteractiveNode key={`node-r-9-${i}`} node={tree.nodes[9+i]} onTeamClick={handleAdvance} onSelectClick={setSelectingSlot} />)}
             </BracketColumn>
           </div>
        </div>
      </div>

      {selectingSlot && <TeamSelectorModal selectingSlot={selectingSlot} onClose={() => setSelectingSlot(null)} onSelect={handleSelectTeam} groups={groups} />}
      {showPoster && <PosterModal tree={tree} onClose={() => setShowPoster(false)} />}
    </div>
  );
}

function InteractiveNode({ node, onTeamClick, onSelectClick, isFinal }) {
  if (!node) return null;
  const isR32 = node.stage === 'R32';
  
  return (
    <div className={`w-full relative rounded-xl border bg-slate-900/95 backdrop-blur overflow-hidden transition-all duration-300 shadow-xl ${isFinal ? 'border-yellow-500/80 shadow-[0_0_40px_rgba(234,179,8,0.2)]' : 'border-slate-800 opacity-90'}`}>
      <div className="flex justify-between items-center px-2 sm:px-3 pt-1.5 sm:pt-2 pb-1 sm:pb-1.5 border-b border-slate-800/50 bg-slate-950/40">
        <span className="text-[11px] sm:text-sm font-bold text-slate-400"><Clock className="w-3.5 h-3.5 inline mr-1 opacity-70"/>{node.matchData?.timeStr || 'TBD'}</span>
      </div>
      <div className="p-1 sm:p-2">
        <InteractiveTeamRow 
          team={node.home} 
          isWinner={node.winner?.id === node.home?.id} 
          onClick={() => onTeamClick(node.id, node.home)} 
          onSelectClick={() => isR32 ? onSelectClick({nodeId: node.id, type: 'home', placeholderStr: node.homePlaceholder}) : null}
          placeholder={node.homePlaceholder}
        />
        <div className="h-[2px] w-full bg-slate-800/80 my-1 sm:my-1.5"></div>
        <InteractiveTeamRow 
          team={node.away} 
          isWinner={node.winner?.id === node.away?.id} 
          onClick={() => onTeamClick(node.id, node.away)} 
          onSelectClick={() => isR32 ? onSelectClick({nodeId: node.id, type: 'away', placeholderStr: node.awayPlaceholder}) : null}
          placeholder={node.awayPlaceholder}
        />
      </div>
    </div>
  );
}

function InteractiveTeamRow({ team, isWinner, onClick, onSelectClick, placeholder }) {
  const isFilled = !!team;
  if (!isFilled) {
    return (
      <div onClick={onSelectClick} className={`flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 rounded transition-all ${onSelectClick ? 'cursor-pointer hover:bg-yellow-500/10 active:scale-95 border border-dashed border-slate-700 hover:border-yellow-500/50' : 'bg-slate-800/20'}`}>
        <span className="text-base sm:text-2xl opacity-20">❔</span>
        {onSelectClick ? <span className="text-xs sm:text-base font-mono text-yellow-500/70 flex items-center"><PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5"/> 选择 {placeholder}</span> : <span className="text-xs sm:text-base font-mono text-slate-600">等待晋级</span>}
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-between p-1.5 sm:p-3 rounded transition-all cursor-pointer hover:bg-yellow-500/20 active:scale-95 ${isWinner ? 'bg-yellow-500/30 border-l-4 border-yellow-400' : 'bg-slate-800/40 border-l-4 border-transparent'}`}>
      <div onClick={onClick} className="flex items-center space-x-2 sm:space-x-4 w-[75%]">
        <TeamFlag flag={team.flag} sizeClass="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
        <span className={`text-xs sm:text-base truncate max-w-[90px] sm:max-w-[140px] font-bold ${isWinner ? 'text-yellow-400' : 'text-slate-100'}`}>{team.name}</span>
      </div>
      {onSelectClick && (
         <div onClick={(e) => { e.stopPropagation(); onSelectClick(); }} className="w-[25%] text-right text-[10px] sm:text-xs text-slate-500 hover:text-yellow-400 px-1 underline decoration-dashed">
            重新选
         </div>
      )}
    </div>
  );
}

function TeamSelectorModal({ selectingSlot, onClose, onSelect, groups }) {
  const parseGroupsFromPlaceholder = (str) => {
    if (!str) return [];
    const match = str.match(/^[123]([A-L](?:\/[A-L])*)$/);
    if (match && match[1]) return match[1].split('/');
    return [];
  };
  const allowedGroups = parseGroupsFromPlaceholder(selectingSlot.placeholderStr);

  return (
    // 固定的绝对弹窗，拒绝随画布放大
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-3 sm:p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-white flex items-center"><Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500" />落位选择：<span className="text-emerald-400 ml-2 font-mono">{selectingSlot.placeholderStr}</span></h3>
            <p className="text-[9px] sm:text-xs text-slate-500 mt-1">系统已根据最新规则过滤了可选球队。</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X className="w-4 h-4 sm:w-5 sm:h-5"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] space-y-4 sm:space-y-6">
          {allowedGroups.length === 0 && <div className="text-center text-slate-500 py-10">等待 API 同步，无可用球队</div>}
          {allowedGroups.map(groupName => {
            const teamsInGroup = groups[groupName]?.teams || [];
            if (teamsInGroup.length === 0) return null;
            return (
              <div key={`selector-group-${groupName}`}>
                <div className="text-xs sm:text-sm font-bold text-slate-400 mb-2 sm:mb-3 border-b border-slate-800 pb-1 flex items-center"><div className="w-1.5 h-3 sm:h-4 bg-emerald-500 rounded mr-2"></div>{groupName}组</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {teamsInGroup.map(team => (
                    <button key={`selector-team-${team.id}`} onClick={() => onSelect(team)} className="flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-900 transition-all active:scale-95">
                      <TeamFlag flag={team.flag} sizeClass="w-6 h-6 sm:w-10 sm:h-10 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm font-bold text-slate-200 truncate w-full px-1 text-center">{team.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PosterModal({ tree, onClose }) {
  // 原生分享或下载逻辑
  const handleShareOrDownload = async () => {
    try {
      const btn = document.getElementById('dl-btn');
      if(btn) btn.innerHTML = '正在生成...';
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      const element = document.getElementById('poster-area');
      const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617' });
      const dataUrl = canvas.toDataURL('image/png');
      
      // 检查浏览器是否支持原生的 Web Share API (微信/朋友圈/QQ的系统入口)
      if (navigator.share) {
         try {
           const blob = await (await fetch(dataUrl)).blob();
           const file = new File([blob], '2026-WC-Prediction.png', { type: 'image/png' });
           await navigator.share({
             title: '我的2026世界杯冠军预测',
             text: '快来看看我的2026美加墨世界杯冠军推演！',
             files: [file]
           });
           if(btn) btn.innerHTML = '分享成功！';
         } catch(e) {
           // 如果分享文件失败，则直接下载
           downloadImg(dataUrl, btn);
         }
      } else {
         downloadImg(dataUrl, btn);
      }
      setTimeout(() => { if(btn) btn.innerHTML = '保存/分享高清海报'; }, 2000);
    } catch (e) {
      alert('保存失败，请直接截图保存');
    }
  };

  const downloadImg = (dataUrl, btn) => {
      const link = document.createElement('a');
      link.download = '2026-WC-Prediction.png';
      link.href = dataUrl;
      link.click();
      if(btn) btn.innerHTML = '已保存到相册！';
  }

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
       <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 bg-slate-800/80 p-1.5 rounded-full"><X className="w-5 h-5"/></button>
          
          <div className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" id="poster-area">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <Trophy className="w-48 h-48 text-yellow-500/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="bg-yellow-500/20 border border-yellow-500/50 px-4 py-1 rounded-full mb-6 mt-4">
              <h3 className="text-yellow-400 font-black tracking-[0.2em] text-xs sm:text-sm">2026 WORLDCUP PREDICTION</h3>
            </div>
            <div className="relative mb-6">
               <div className="absolute inset-0 bg-yellow-500/40 blur-3xl rounded-full"></div>
               <div className="text-[100px] sm:text-[120px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10 leading-none">
                 <TeamFlag flag={tree.champion.flag} sizeClass="w-24 h-24 sm:w-32 sm:h-32" />
               </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-wider drop-shadow-md">{tree.champion.name}</h1>
            <p className="text-yellow-500 font-bold mb-10 text-base sm:text-lg">捧起大力神杯！🏆</p>
            <div className="w-full border-t border-dashed border-slate-700 pt-6 flex justify-between items-center px-2 relative z-10">
              <div className="text-left">
                <div className="text-slate-500 text-[10px] sm:text-xs">生成自全球最酷的赛事引擎</div>
                <div className="text-slate-200 font-black text-xs sm:text-sm mt-1">WC Live Engine 2026</div>
              </div>
              <div className="flex flex-col items-center">
                 <div className="bg-white p-0.5 rounded shadow-lg shrink-0 w-12 h-12 sm:w-14 sm:h-14">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://www.xiaohuang365.com&margin=0" alt="QR" className="w-full h-full object-contain" />
                 </div>
                 <span className="text-[8px] text-slate-400 font-mono mt-1 tracking-widest">xiaohuang365.com</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
             <button id="dl-btn" onClick={handleShareOrDownload} className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
               <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 保存/分享高清海报
             </button>
          </div>
       </div>
    </div>
  );
}

// ================= 8. 全局弹窗 & 钻取引擎 =================
function MatchDetailDrawer({ match, onClose, onTeamClick, isTop }) {
  if (!match) return null;
  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${isTop ? 'z-[50]' : 'z-[30]'}`} onClick={onClose} />
      <div className={`fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ${isTop ? 'z-[55]' : 'z-[35]'}`}>
        <div className="p-6 border-b border-slate-800 relative bg-slate-900/50">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
          <div className="text-center mt-2">
            <div className="flex justify-center items-center space-x-4 px-2 mt-4">
              <div onClick={() => !match.home?.isPlaceholder && onTeamClick && onTeamClick(match.home)} className={`flex flex-col items-center flex-1 ${!match.home?.isPlaceholder ? 'cursor-pointer hover:scale-110 transition-all group' : ''}`}>
                <div className="mb-2 drop-shadow-lg group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"><TeamFlag flag={match.home?.flag} sizeClass="w-12 h-12 sm:w-16 sm:h-16" /></div>
                <span className={`font-bold text-sm sm:text-lg text-center leading-tight ${match.home?.isPlaceholder ? 'text-slate-500 font-mono text-xs' : 'text-slate-200 group-hover:text-emerald-400'}`}>{match.home?.name || '待定'}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-500 bg-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-800 shadow-inner">
                  {match.status === 'FINISHED' || match.status === 'LIVE' ? <span className="text-white">{match.homeScore} - {match.awayScore}</span> : '- : -'}
                </span>
              </div>
              <div onClick={() => !match.away?.isPlaceholder && onTeamClick && onTeamClick(match.away)} className={`flex flex-col items-center flex-1 ${!match.away?.isPlaceholder ? 'cursor-pointer hover:scale-110 transition-all group' : ''}`}>
                <div className="mb-2 drop-shadow-lg group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"><TeamFlag flag={match.away?.flag} sizeClass="w-12 h-12 sm:w-16 sm:h-16" /></div>
                <span className={`font-bold text-sm sm:text-lg text-center leading-tight ${match.away?.isPlaceholder ? 'text-slate-500 font-mono text-xs' : 'text-slate-200 group-hover:text-emerald-400'}`}>{match.away?.name || '待定'}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center space-x-4 text-[10px] sm:text-xs text-slate-500 font-mono">
              <span className="flex items-center"><CalendarDays className="w-3 h-3 mr-1" /> {match.timeStr}</span>
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {match.venue || '待定'}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-center text-slate-500 pt-20">赛事深度数据 API 就绪...</div>
      </div>
    </>
  );
}

function TeamDetailDrawer({ team, onClose }) {
  if (!team) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[60]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 z-[65]">
        <div className="p-6 border-b border-slate-800 relative bg-slate-900/80">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
          <div className="flex flex-col items-center mt-4">
            <div className="mb-3 drop-shadow-lg"><TeamFlag flag={team.flag} sizeClass="w-16 h-16" /></div>
            <h2 className="font-black text-2xl text-slate-100 tracking-widest">{team.name}</h2>
            <div className="mt-3 flex items-center space-x-3 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="flex items-center"><UserCircle2 className="w-3 h-3 mr-1" /> 主教练: 待同步</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-center text-slate-500 pt-20">球队情报中心数据 API 就绪...</div>
      </div>
    </>
  );
}
