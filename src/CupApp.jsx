import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  LogIn,
  RefreshCw,
  Trophy,
  UserRound,
  UsersRound,
  X
} from 'lucide-react';

const RESULT_LABELS = { home: '主胜', draw: '平局', away: '客胜' };

const TEAM_NAME_ZH = {
  'Algeria': '阿尔及利亚',
  'Argentina': '阿根廷',
  'Australia': '澳大利亚',
  'Austria': '奥地利',
  'Belgium': '比利时',
  'Bosnia & Herzegovina': '波黑',
  'Brazil': '巴西',
  'Canada': '加拿大',
  'Cape Verde Islands': '佛得角',
  'Colombia': '哥伦比亚',
  'Congo DR': '刚果(金)',
  'Croatia': '克罗地亚',
  'Curaçao': '库拉索',
  'Czech Republic': '捷克',
  'Ecuador': '厄瓜多尔',
  'Egypt': '埃及',
  'England': '英格兰',
  'France': '法国',
  'Germany': '德国',
  'Ghana': '加纳',
  'Haiti': '海地',
  'Iran': '伊朗',
  'Iraq': '伊拉克',
  'Ivory Coast': '科特迪瓦',
  'Japan': '日本',
  'Jordan': '约旦',
  'Mexico': '墨西哥',
  'Morocco': '摩洛哥',
  'Netherlands': '荷兰',
  'New Zealand': '新西兰',
  'Norway': '挪威',
  'Panama': '巴拿马',
  'Paraguay': '巴拉圭',
  'Portugal': '葡萄牙',
  'Qatar': '卡塔尔',
  'Saudi Arabia': '沙特阿拉伯',
  'Scotland': '苏格兰',
  'Senegal': '塞内加尔',
  'South Africa': '南非',
  'South Korea': '韩国',
  'Spain': '西班牙',
  'Sweden': '瑞典',
  'Switzerland': '瑞士',
  'Tunisia': '突尼斯',
  'Türkiye': '土耳其',
  'USA': '美国',
  'Uruguay': '乌拉圭',
  'Uzbekistan': '乌兹别克斯坦'
};

const tabs = [
  { id: 'matches', label: '比赛', icon: CalendarDays },
  { id: 'leaderboard', label: '排行', icon: Trophy },
  { id: 'rooms', label: '房间', icon: UsersRound },
  { id: 'mine', label: '我的', icon: UserRound }
];

const groupStageSchedule = {
  '墨西哥 vs 南非': '6月12日 03:00', '韩国 vs 捷克': '6月12日 10:00',
  '加拿大 vs 波黑': '6月13日 03:00', '美国 vs 巴拉圭': '6月13日 09:00',
  '卡塔尔 vs 瑞士': '6月14日 03:00', '巴西 vs 摩洛哥': '6月14日 06:00', '海地 vs 苏格兰': '6月14日 09:00', '澳大利亚 vs 土耳其': '6月14日 12:00',
  '德国 vs 库拉索': '6月15日 01:00', '荷兰 vs 日本': '6月15日 04:00', '科特迪瓦 vs 厄瓜多尔': '6月15日 07:00', '瑞典 vs 突尼斯': '6月15日 10:00',
  '西班牙 vs 佛得角': '6月16日 00:00', '比利时 vs 埃及': '6月16日 03:00', '沙特阿拉伯 vs 乌拉圭': '6月16日 06:00', '伊朗 vs 新西兰': '6月16日 09:00',
  '法国 vs 塞内加尔': '6月17日 03:00', '伊拉克 vs 挪威': '6月17日 06:00', '阿根廷 vs 阿尔及利亚': '6月17日 09:00', '奥地利 vs 约旦': '6月17日 12:00',
  '葡萄牙 vs 刚果(金)': '6月18日 01:00', '英格兰 vs 克罗地亚': '6月18日 04:00', '加纳 vs 巴拿马': '6月18日 07:00', '乌兹别克斯坦 vs 哥伦比亚': '6月18日 10:00',
  '捷克 vs 南非': '6月19日 00:00', '瑞士 vs 波黑': '6月19日 03:00', '加拿大 vs 卡塔尔': '6月19日 06:00', '墨西哥 vs 韩国': '6月19日 09:00',
  '美国 vs 澳大利亚': '6月20日 03:00', '苏格兰 vs 摩洛哥': '6月20日 06:00', '巴西 vs 海地': '6月20日 08:30', '土耳其 vs 巴拉圭': '6月20日 11:00',
  '荷兰 vs 瑞典': '6月21日 01:00', '德国 vs 科特迪瓦': '6月21日 04:00', '厄瓜多尔 vs 库拉索': '6月21日 08:00', '突尼斯 vs 日本': '6月21日 12:00',
  '西班牙 vs 沙特阿拉伯': '6月22日 00:00', '比利时 vs 伊朗': '6月22日 03:00', '乌拉圭 vs 佛得角': '6月22日 06:00', '新西兰 vs 埃及': '6月22日 09:00',
  '阿根廷 vs 奥地利': '6月23日 01:00', '法国 vs 伊拉克': '6月23日 05:00', '挪威 vs 塞内加尔': '6月23日 08:00', '约旦 vs 阿尔及利亚': '6月23日 11:00',
  '葡萄牙 vs 乌兹别克斯坦': '6月24日 01:00', '英格兰 vs 加纳': '6月24日 04:00', '巴拿马 vs 克罗地亚': '6月24日 07:00', '哥伦比亚 vs 刚果(金)': '6月24日 10:00',
  '瑞士 vs 加拿大': '6月25日 03:00', '波黑 vs 卡塔尔': '6月25日 03:00', '苏格兰 vs 巴西': '6月25日 06:00', '摩洛哥 vs 海地': '6月25日 06:00', '捷克 vs 墨西哥': '6月25日 09:00', '南非 vs 韩国': '6月25日 09:00',
  '厄瓜多尔 vs 德国': '6月26日 04:00', '库拉索 vs 科特迪瓦': '6月26日 04:00', '突尼斯 vs 荷兰': '6月26日 07:00', '日本 vs 瑞典': '6月26日 07:00', '土耳其 vs 美国': '6月26日 10:00', '巴拉圭 vs 澳大利亚': '6月26日 10:00',
  '挪威 vs 法国': '6月27日 03:00', '塞内加尔 vs 伊拉克': '6月27日 03:00', '乌拉圭 vs 西班牙': '6月27日 08:00', '佛得角 vs 沙特阿拉伯': '6月27日 08:00', '新西兰 vs 比利时': '6月27日 11:00', '埃及 vs 伊朗': '6月27日 11:00',
  '巴拿马 vs 英格兰': '6月28日 05:00', '克罗地亚 vs 加纳': '6月28日 05:00', '哥伦比亚 vs 葡萄牙': '6月28日 07:30', '刚果(金) vs 乌兹别克斯坦': '6月28日 07:30', '约旦 vs 阿根廷': '6月28日 10:00', '阿尔及利亚 vs 奥地利': '6月28日 10:00'
};

const fallbackMatches = Object.entries(groupStageSchedule).map(([name, kickoffAt], index) => {
  const [home, away] = name.split(' vs ');
  const normalizedKickoffAt = kickoffAt.startsWith('2026-')
    ? kickoffAt
    : `2026-${kickoffAt.replace('月', '-').replace('日', '')}:00+08:00`.replace(/-(\d)(?=-)/, '-0$1').replace(/-(\d) /, '-0$1 ');
  return {
    id: `fallback-${index + 1}`,
    matchNumber: index + 1,
    group: index < 2 ? 'A组' : index < 4 ? 'B/D组' : '小组赛',
    home: { name: home, flag: '⚽' },
    away: { name: away, flag: '⚽' },
    kickoffAt: normalizedKickoffAt,
    status: 'UPCOMING',
    venue: '美加墨赛区'
  };
});

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app can still run for the current session if storage is unavailable.
  }
};

const normalizeStatus = (status = {}) => {
  if (['FT', 'AET', 'PEN'].includes(status.short)) return 'FINISHED';
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'].includes(status.short)) return 'LIVE';
  return 'UPCOMING';
};

const formatBeijingTime = (value) => {
  if (!value) return '时间待定';
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(value));
  const get = (type) => parts.find(part => part.type === type)?.value || '';
  return `${Number(get('month'))}月${Number(get('day'))}日 ${get('hour')}:${get('minute')}`;
};

const dateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '待定';
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
};

const normalizeTeam = (team) => ({
  name: TEAM_NAME_ZH[team?.name] || team?.name || '待定',
  flag: team?.logo || '⚽'
});

const normalizeFixtures = (payload) => {
  const fixtures = payload?.fixtures?.response || payload?.response || payload?.data || [];
  if (!Array.isArray(fixtures) || fixtures.length === 0) return fallbackMatches;
  return fixtures
    .map((item, index) => ({
      id: String(item.fixture?.id || item.matchId || item.id || `match-${index + 1}`),
      providerId: item.fixture?.id || item.providerId,
      matchNumber: index + 1,
      group: item.league?.round?.replace('Group ', '') || item.group || item.round || '世界杯',
      home: item.teams ? normalizeTeam(item.teams.home) : { name: item.home || item.homeTeam || '待定', flag: item.homeFlag || '⚽' },
      away: item.teams ? normalizeTeam(item.teams.away) : { name: item.away || item.awayTeam || '待定', flag: item.awayFlag || '⚽' },
      homeScore: item.goals?.home ?? item.homeScore ?? null,
      awayScore: item.goals?.away ?? item.awayScore ?? null,
      kickoffAt: item.fixture?.date || item.kickoffAt || item.time,
      status: item.fixture ? normalizeStatus(item.fixture.status) : (item.status === 'finished' ? 'FINISHED' : item.status === 'live' ? 'LIVE' : 'UPCOMING'),
      venue: item.fixture?.venue?.name || item.venue || '美加墨赛区'
    }))
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
};

const resultFromScore = (homeScore, awayScore) => (
  homeScore > awayScore ? 'home' : homeScore < awayScore ? 'away' : 'draw'
);

const canPredict = (match) => match.status === 'UPCOMING' && Date.now() < new Date(match.kickoffAt).getTime();

const scorePredictions = (matches, predictions) => {
  let points = 0;
  let settled = 0;
  Object.values(predictions).forEach((prediction) => {
    const match = matches.find(item => item.id === prediction.matchId);
    if (!match || match.status !== 'FINISHED' || match.homeScore == null || match.awayScore == null) return;
    settled += 1;
    const actual = resultFromScore(match.homeScore, match.awayScore);
    if (prediction.result === actual) points += 3;
    if (prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore) points += 2;
  });
  return { points, settled };
};

function TeamMark({ team }) {
  const flag = team?.flag;
  if (flag && String(flag).startsWith('http')) {
    return <img src={flag} alt="" className="h-9 w-9 object-contain drop-shadow-lg" />;
  }
  return <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-lg shadow-inner">{flag || '⚽'}</span>;
}

function MatchCard({ match, prediction, onPredict }) {
  const open = canPredict(match);
  const statusLabel = match.status === 'LIVE' ? '进行中' : match.status === 'FINISHED' ? '已结束' : open ? '可预测' : '已锁定';
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/82 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.28)]">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
        <span>比赛 {match.matchNumber} · {match.group}</span>
        <span className={`rounded-full px-2.5 py-1 font-bold ${open ? 'bg-cyan-400/10 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>{statusLabel}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamMark team={match.home} />
          <strong className="text-sm text-white">{match.home.name}</strong>
        </div>
        <div className="min-w-16 text-center">
          {match.homeScore != null && match.awayScore != null ? (
            <div className="rounded-xl bg-slate-950 px-3 py-2 text-xl font-black text-cyan-200">{match.homeScore}:{match.awayScore}</div>
          ) : (
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-200">VS</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamMark team={match.away} />
          <strong className="text-sm text-white">{match.away.name}</strong>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
        <span>{formatBeijingTime(match.kickoffAt)}</span>
        <span className="truncate">{match.venue}</span>
      </div>
      {prediction ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200">
          <span>我的预测</span>
          <span>{prediction.homeScore}:{prediction.awayScore} · {prediction.resultLabel}</span>
        </div>
      ) : null}
      <button
        type="button"
        disabled={!open}
        onClick={() => onPredict(match)}
        className="mt-3 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:bg-slate-800 disabled:text-slate-500"
      >
        {open ? '预测比分' : '点击查看，开赛后锁定'}
      </button>
    </article>
  );
}

function PredictionModal({ match, saved, onClose, onSave }) {
  const [selectedResult, setSelectedResult] = useState(saved?.result || 'home');
  const defaults = { home: [2, 0], draw: [1, 1], away: [0, 2] };
  const [homeScore, setHomeScore] = useState(saved?.homeScore ?? defaults[selectedResult][0]);
  const [awayScore, setAwayScore] = useState(saved?.awayScore ?? defaults[selectedResult][1]);

  const chooseResult = (result) => {
    setSelectedResult(result);
    setHomeScore(defaults[result][0]);
    setAwayScore(defaults[result][1]);
  };
  const valid = resultFromScore(homeScore, awayScore) === selectedResult;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/76 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full rounded-t-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-cyan-300">世界杯竞猜</p>
            <h2 className="mt-1 text-2xl font-black text-white">{match.home.name} vs {match.away.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{formatBeijingTime(match.kickoffAt)} 开始，开赛后锁定</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-900 p-2 text-slate-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(RESULT_LABELS).map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => chooseResult(id)}
              className={`rounded-2xl border px-3 py-3 text-sm font-black ${selectedResult === id ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-slate-800 bg-slate-900 text-slate-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <ScoreStepper label={match.home.name} value={homeScore} setValue={setHomeScore} />
            <span className="text-2xl font-black text-slate-500">:</span>
            <ScoreStepper label={match.away.name} value={awayScore} setValue={setAwayScore} />
          </div>
          {!valid ? <p className="mt-3 text-center text-xs font-bold text-amber-200">比分和胜平负不一致，请调整一下。</p> : null}
        </div>
        <button
          type="button"
          disabled={!valid}
          onClick={() => onSave({ matchId: match.id, homeScore, awayScore, result: selectedResult, resultLabel: RESULT_LABELS[selectedResult], updatedAt: Date.now() })}
          className="mt-5 w-full rounded-2xl bg-amber-300 px-5 py-4 text-base font-black text-slate-950 transition hover:bg-amber-200 disabled:bg-slate-800 disabled:text-slate-500"
        >
          保存竞猜
        </button>
      </div>
    </div>
  );
}

function ScoreStepper({ label, value, setValue }) {
  return (
    <div className="text-center">
      <p className="mb-2 truncate text-xs font-bold text-slate-400">{label}</p>
      <div className="flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950">
        <button type="button" onClick={() => setValue(Math.max(0, value - 1))} className="p-3 text-cyan-200"><ChevronLeft className="h-5 w-5" /></button>
        <strong className="min-w-9 text-3xl font-black text-white">{value}</strong>
        <button type="button" onClick={() => setValue(Math.min(20, value + 1))} className="p-3 text-cyan-200"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </div>
  );
}

function LoginPanel({ profile, setProfile }) {
  const [nickname, setNickname] = useState(profile.nickname || '');
  const save = () => {
    const next = {
      ...profile,
      nickname: nickname.trim() || `球迷${String(Date.now()).slice(-4)}`,
      userId: profile.userId || crypto.randomUUID?.() || `local-${Date.now()}`
    };
    setProfile(next);
    writeJson('cup-profile', next);
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-slate-950"><UserRound className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-400">昵称登录</p>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="填写昵称开始玩"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-300"
          />
        </div>
        <button type="button" onClick={save} className="rounded-xl bg-cyan-300 px-3 py-2 text-sm font-black text-slate-950"><LogIn className="h-4 w-4" /></button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">当前版本会把竞猜保存在本设备。服务器账号同步接口已预留，接入数据库后可升级为跨设备登录。</p>
    </div>
  );
}

export default function CupApp() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState(fallbackMatches);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [profile, setProfile] = useState(() => readJson('cup-profile', { nickname: '', userId: '' }));
  const [predictions, setPredictions] = useState(() => readJson('cup-predictions', {}));
  const [roomId, setRoomId] = useState(() => readJson('cup-room', `cup-${Math.random().toString(36).slice(2, 8)}`));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/worldcup');
        const payload = await response.json();
        if (!response.ok || payload.error) throw new Error(payload.error || '赛程加载失败');
        if (!cancelled) {
          setMatches(normalizeFixtures(payload));
          setError(payload.stale ? '显示最近缓存赛程' : '');
        }
      } catch {
        if (!cancelled) {
          setMatches(fallbackMatches);
          setError('实时赛程暂时不可用，先显示基础赛程');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => writeJson('cup-predictions', predictions), [predictions]);
  useEffect(() => writeJson('cup-room', roomId), [roomId]);

  const dates = useMemo(() => (
    Array.from(new Set(matches.map(match => dateKey(match.kickoffAt)))).map(date => ({
      id: date,
      label: date === '待定' ? date : `${Number(date.slice(5, 7))}月${Number(date.slice(8, 10))}日`
    }))
  ), [matches]);

  const filteredMatches = useMemo(() => (
    selectedDate === 'all' ? matches : matches.filter(match => dateKey(match.kickoffAt) === selectedDate)
  ), [matches, selectedDate]);

  const predictedCount = Object.keys(predictions).length;
  const progress = matches.length ? Math.round(predictedCount / matches.length * 100) : 0;
  const score = scorePredictions(matches, predictions);
  const leaderboard = [
    { rank: 1, nickname: profile.nickname || '你', points: score.points, predictionCount: predictedCount },
    { rank: 2, nickname: '好友加入后显示', points: 0, predictionCount: 0 }
  ];

  const savePrediction = (prediction) => {
    setPredictions(current => ({ ...current, [prediction.matchId]: prediction }));
    setSelectedMatch(null);
  };

  const copyRoom = async () => {
    const url = `https://cup.xiaohuang365.com/?room=${encodeURIComponent(roomId)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('复制房间链接', url);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100 selection:bg-cyan-300/30">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_30%),linear-gradient(180deg,#07111f,#0f172a_48%,#07111f)]" />
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#07111f]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-300 text-slate-950 shadow-[0_0_30px_rgba(252,211,77,0.25)]"><Trophy className="h-5 w-5" /></div>
            <div>
              <h1 className="text-lg font-black text-white sm:text-xl">世界杯竞猜赛</h1>
              <p className="text-[11px] font-bold tracking-[0.24em] text-cyan-200/80">xiaohuang365.com</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 sm:flex">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            {profile.nickname || '未登录'}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[280px_1fr_280px]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/78 p-5">
            <p className="text-sm font-bold text-cyan-200">我的竞猜进度</p>
            <div className="mt-3 flex items-end justify-between">
              <strong className="text-4xl font-black text-white">{progress}%</strong>
              <span className="text-sm text-slate-400">{predictedCount} / {matches.length} 场</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">猜中胜平负得 3 分，猜中具体比分额外得 2 分。</p>
          </section>
          <LoginPanel profile={profile} setProfile={setProfile} />
        </aside>

        <section className="min-w-0">
          <nav className="mb-4 grid grid-cols-4 gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-2 py-3 text-xs font-black transition ${activeTab === tab.id ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <Icon className="mx-auto mb-1 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {activeTab === 'matches' ? (
            <>
              <div className="mb-4 overflow-x-auto pb-1">
                <div className="flex w-max gap-2">
                  <button type="button" onClick={() => setSelectedDate('all')} className={`rounded-full px-4 py-2 text-xs font-black ${selectedDate === 'all' ? 'bg-amber-300 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>全部</button>
                  {dates.map(date => (
                    <button type="button" key={date.id} onClick={() => setSelectedDate(date.id)} className={`rounded-full px-4 py-2 text-xs font-black ${selectedDate === date.id ? 'bg-amber-300 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>{date.label}</button>
                  ))}
                </div>
              </div>
              {loading ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400"><RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />正在加载赛程...</div> : null}
              {error ? <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">{error}</div> : null}
              <div className="grid gap-4">
                {filteredMatches.map(match => (
                  <MatchCard key={match.id} match={match} prediction={predictions[match.id]} onPredict={setSelectedMatch} />
                ))}
              </div>
            </>
          ) : null}

          {activeTab === 'leaderboard' ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-2xl font-black text-white">玩家总榜</h2>
              <p className="mt-1 text-sm text-slate-400">云端排行榜接入数据库后会展示所有玩家；当前先展示本机账号。</p>
              <div className="mt-5 space-y-3">
                {leaderboard.map(item => (
                  <div key={item.rank} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-300 text-lg font-black text-slate-950">{item.rank}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-white">{item.nickname}</p>
                      <p className="text-xs text-slate-500">已预测 {item.predictionCount} 场</p>
                    </div>
                    <strong className="text-cyan-200">{item.points} 分</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === 'rooms' ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-2xl font-black text-white">好友房间</h2>
              <p className="mt-1 text-sm text-slate-400">先把链接发给朋友一起玩。数据库上线后，同一个房间会同步多人排行榜。</p>
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-bold text-slate-500">当前房间</p>
                <div className="mt-2 flex items-center gap-2">
                  <input value={roomId} onChange={event => setRoomId(event.target.value.trim())} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 font-black text-cyan-100 outline-none" />
                  <button type="button" onClick={copyRoom} className="rounded-xl bg-cyan-300 p-3 text-slate-950"><Copy className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'mine' ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h2 className="text-2xl font-black text-white">我的竞猜</h2>
              <p className="mt-1 text-sm text-slate-400">累计 {score.points} 分，已结算 {score.settled} 场。</p>
              <div className="mt-5 grid gap-3">
                {Object.values(predictions).length ? Object.values(predictions).map(prediction => {
                  const match = matches.find(item => item.id === prediction.matchId);
                  return (
                    <div key={prediction.matchId} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-white">{match ? `${match.home.name} vs ${match.away.name}` : prediction.matchId}</strong>
                        <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-200">{prediction.homeScore}:{prediction.awayScore}</span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-4 w-4 text-cyan-300" />{prediction.resultLabel} · 开赛前可修改</p>
                    </div>
                  );
                }) : <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-500">还没有竞猜记录，去比赛页预测第一场吧。</div>}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-24 lg:h-fit">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/78 p-5">
            <div className="flex items-center gap-2 text-amber-200"><Crown className="h-5 w-5" /><strong>当前积分</strong></div>
            <strong className="mt-4 block text-5xl font-black text-white">{score.points}</strong>
            <p className="mt-2 text-sm text-slate-400">完赛后自动按胜平负和比分计算。</p>
          </section>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/78 p-5">
            <p className="text-sm font-black text-white">上线节奏</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
              <li>1. Web 版先开放游玩</li>
              <li>2. 接数据库后开放跨设备账号</li>
              <li>3. 小程序通过后绑定同一份数据</li>
            </ul>
          </section>
        </aside>
      </main>
      {selectedMatch ? <PredictionModal match={selectedMatch} saved={predictions[selectedMatch.id]} onClose={() => setSelectedMatch(null)} onSave={savePrediction} /> : null}
    </div>
  );
}
