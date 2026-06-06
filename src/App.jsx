import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Activity, ZoomIn, ZoomOut, 
  Maximize, Minimize, Move, Clock, CalendarDays, GitBranch, Database,
  ListOrdered, Wand2, Crown, RotateCcw, X, Shield, MapPin, UserCircle2, Users, Camera, Download, Share2, PlusCircle, RefreshCw, KeyRound, CheckCircle2, BookOpen, ImageIcon, Share, MessageCircle, Gift
} from 'lucide-react';

// ================= 全局真实大力神杯组件 =================
const RealTrophy = ({ className }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/FIFA_World_Cup_Trophy.svg/512px-FIFA_World_Cup_Trophy.svg.png" 
    alt="World Cup Trophy" 
    className={`object-contain drop-shadow-xl ${className}`} 
    crossOrigin="anonymous" 
  />
);

// ================= 全局禁用原生缩放与下拉刷新 =================
const setupViewport = () => {
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = "viewport";
    document.head.appendChild(meta);
  }
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
  document.body.style.overscrollBehavior = 'none';
  document.documentElement.style.overscrollBehavior = 'none';
};

// ================= 1. 数据初始化 (2026 官方确认名单) =================
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

const officialKnockoutRoundsFlat = Object.values(officialKnockoutRounds).flat();

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

// ================= 组件：国旗渲染 =================
function TeamFlag({ flag, sizeClass = "w-6 h-6 sm:w-8 sm:h-8" }) {
  if (!flag || flag === '❔' || flag === '🏳️') return <span className="opacity-50 text-[1em]">❔</span>;
  if (flag.startsWith('http')) return <img src={flag} alt="flag" crossOrigin="anonymous" className={`${sizeClass} object-contain inline-block drop-shadow-md`} />;
  return <span className="drop-shadow-sm text-[1em] leading-none inline-block flex-shrink-0">{flag}</span>;
}

// ================= 变现核心组件：全局商业引流海报底部 =================
const GlobalQRLogo = () => (
  <div className="flex bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-2xl items-center w-full max-w-sm mx-auto mt-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-bl-lg font-bold">限时福利</div>
    <div className="w-16 h-16 bg-white p-1 rounded shrink-0 flex items-center justify-center">
       <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://www.xiaohuang365.com&margin=0" alt="CPS-QR" className="w-full h-full object-contain" crossOrigin="anonymous" />
    </div>
    <div className="ml-3 flex flex-col justify-center flex-1">
      <span className="text-sm font-black text-yellow-400">扫码领·看球夜宵红包</span>
      <span className="text-[10px] text-slate-300 mt-1">识别二维码，最高领66元外卖券！</span>
      <span className="text-[9px] text-slate-500 mt-1 font-mono">或访问: xiaohuang365.com 看直播</span>
    </div>
  </div>
);

const downloadImg = (dataUrl, fileName) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
};

const handleGlobalShare = async (elementId, fileName, setShowWechatPopup) => {
  try {
    const btnText = document.getElementById(`share-text-${elementId}`);
    if(btnText) btnText.innerText = "正在生成长图...";

    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    const watermark = document.getElementById(`watermark-${elementId}`);
    if (watermark) watermark.style.display = 'flex';
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const element = document.getElementById(elementId);
    const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#020617', useCORS: true, allowTaint: true });
    
    if (watermark) watermark.style.display = 'none';

    const dataUrl = canvas.toDataURL('image/png');
    
    if (navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], fileName, { type: 'image/png' });
        await navigator.share({
          title: '2026美加墨世界杯赛程与推演',
          text: '快来看看最新的世界杯动态与冠军预测！',
          files: [file]
        });
        if(btnText) btnText.innerText = "分享成功";
      } catch(e) {
        downloadImg(dataUrl, fileName);
        if(btnText) btnText.innerText = "已保存至相册";
      }
    } else {
      downloadImg(dataUrl, fileName);
      if(btnText) btnText.innerText = "已保存至相册";
    }

    if (setShowWechatPopup) {
        setTimeout(() => setShowWechatPopup(true), 1500);
    }

    setTimeout(() => { if(btnText) btnText.innerText = "生成并分享长图"; }, 3000);
  } catch (e) {
    alert('截图生成失败，请确认网络状态后重试。');
    const btnText = document.getElementById(`share-text-${elementId}`);
    if(btnText) btnText.innerText = "生成并分享长图";
  }
};

const shareWebsite = () => {
  if (navigator.share) {
    navigator.share({
      title: '2026美加墨世界杯 - 实时动态引擎',
      url: 'http://www.xiaohuang365.com'
    });
  } else {
    alert("请手动复制网址: www.xiaohuang365.com 分享给好友！");
  }
};


// ================= 全景淘汰赛大树组件库 (带动态发光连线) =================
function TournamentTree({ mode, r32Selections = {}, predictions = {}, setPrediction, getTeamFromSlot, onMatchClick, onSlotClick }) {
    
    const resolveSlot = useCallback((slotStr) => {
        if (!slotStr || slotStr === '?') return { id: `tbd_${Math.random()}`, name: '待定', flag: '❔', isPlaceholder: true };
        
        if (mode === 'sandbox' && r32Selections[slotStr]) {
            return { ...r32Selections[slotStr], isPlaceholder: false };
        }

        if (slotStr.startsWith('W')) {
            const matchId = `ko_${slotStr.slice(1)}`;
            const match = resolveMatch(matchId);
            return match.predictedWinner || { id: slotStr, name: `胜者 M${slotStr.slice(1)}`, flag: '❔', isPlaceholder: true };
        }
        if (slotStr.startsWith('L')) {
            const matchId = `ko_${slotStr.slice(1)}`;
            const match = resolveMatch(matchId);
            if (match.predictedWinner) {
                return match.predictedWinner.id === match.home.id ? match.away : match.home;
            }
            return { id: slotStr, name: `负者 M${slotStr.slice(1)}`, flag: '❔', isPlaceholder: true };
        }
        return getTeamFromSlot(slotStr);
    }, [getTeamFromSlot, mode, r32Selections]);

    const resolveMatch = useCallback((matchId) => {
        const baseMatch = officialKnockoutRoundsFlat.find(m => m.id === matchId);
        if (!baseMatch) return null;

        if (mode === 'live') {
            return {
                ...baseMatch,
                home: getTeamFromSlot(baseMatch.homeStr),
                away: getTeamFromSlot(baseMatch.awayStr)
            };
        }

        const homeTeam = resolveSlot(baseMatch.homeStr);
        const awayTeam = resolveSlot(baseMatch.awayStr);

        let winner = predictions[matchId];
        if (winner && homeTeam && awayTeam && winner.id !== homeTeam.id && winner.id !== awayTeam.id) {
            winner = null;
        }

        return { ...baseMatch, home: homeTeam, away: awayTeam, predictedWinner: winner };
    }, [mode, predictions, resolveSlot, getTeamFromSlot]);

    const leftR32 = ['ko_73', 'ko_75', 'ko_74', 'ko_76', 'ko_77', 'ko_78', 'ko_79', 'ko_80'];
    const leftR16 = ['ko_89', 'ko_90', 'ko_91', 'ko_92'];
    const leftQF = ['ko_97', 'ko_98'];
    const leftSF = ['ko_101'];

    const rightR32 = ['ko_81', 'ko_82', 'ko_83', 'ko_84', 'ko_85', 'ko_86', 'ko_87', 'ko_88'];
    const rightR16 = ['ko_93', 'ko_94', 'ko_95', 'ko_96'];
    const rightQF = ['ko_99', 'ko_100'];
    const rightSF = ['ko_102'];

    const finalMatch = resolveMatch('ko_104');
    const thirdPlaceMatch = resolveMatch('ko_103');

    // 中轴线高光状态判定
    const leftSFMatch = resolveMatch('ko_101');
    const rightSFMatch = resolveMatch('ko_102');
    const isLeftSFActive = mode === 'sandbox' ? !!leftSFMatch?.predictedWinner : (leftSFMatch?.status === 'FINISHED' && leftSFMatch?.homeScore !== leftSFMatch?.awayScore);
    const isRightSFActive = mode === 'sandbox' ? !!rightSFMatch?.predictedWinner : (rightSFMatch?.status === 'FINISHED' && rightSFMatch?.homeScore !== rightSFMatch?.awayScore);

    return (
        <div className="flex flex-row justify-center gap-4 sm:gap-8 h-[800px] w-full relative">
            <KnockoutColumn matchIds={leftR32} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="left" />
            <KnockoutColumn matchIds={leftR16} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="left" />
            <KnockoutColumn matchIds={leftQF} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="left" />
            <KnockoutColumn matchIds={leftSF} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="left" />

            <div className="flex flex-col justify-center items-center w-[160px] sm:w-[220px] px-2 shrink-0 z-10 relative mt-10">
                <div className="w-full">
                    <div className="text-center text-yellow-500 font-black text-xs sm:text-sm mb-3 flex items-center justify-center bg-yellow-500/10 py-1.5 rounded-lg border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" /> 冠军战
                    </div>
                    <div className="relative w-full">
                        <div className={`absolute top-1/2 -left-2 sm:-left-4 w-2 sm:w-4 h-[2px] ${isLeftSFActive ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]'} z-0 transition-colors duration-500`}></div>
                        <div className={`absolute top-1/2 -right-2 sm:-right-4 w-2 sm:w-4 h-[2px] ${isRightSFActive ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]'} z-0 transition-colors duration-500`}></div>
                        <BracketNode match={finalMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} align="center" isFinal />
                    </div>
                    
                    {mode === 'sandbox' && finalMatch?.predictedWinner && (
                        <div className="mt-8 flex flex-col items-center animate-fade-in drop-shadow-[0_0_30px_rgba(234,179,8,0.6)]">
                            <RealTrophy className="w-16 h-16 sm:w-20 sm:h-20 mb-2 animate-bounce" />
                            <TeamFlag flag={finalMatch.predictedWinner.flag} sizeClass="w-16 h-16 sm:w-20 sm:h-20 mb-2" />
                            <span className="font-black text-2xl sm:text-3xl text-yellow-400 tracking-widest mt-2">{finalMatch.predictedWinner.name}</span>
                        </div>
                    )}
                </div>
                
                <div className="w-full opacity-90 absolute bottom-12">
                    <div className="text-center text-slate-400 font-bold text-xs mb-2 bg-slate-800/50 py-1.5 rounded-lg border border-slate-700">季军战</div>
                    <BracketNode match={thirdPlaceMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} align="center" />
                </div>
            </div>

            <KnockoutColumn matchIds={rightSF} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="right" />
            <KnockoutColumn matchIds={rightQF} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="right" />
            <KnockoutColumn matchIds={rightR16} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="right" />
            <KnockoutColumn matchIds={rightR32} resolveMatch={resolveMatch} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align="right" />
        </div>
    )
}

const KnockoutColumn = ({ matchIds, resolveMatch, mode, setPrediction, onMatchClick, onSlotClick, align }) => {
    return (
        <div className="flex flex-col justify-around h-full w-[120px] sm:w-[150px] z-10 shrink-0 relative">
            {matchIds.map((mId, i) => {
                const match = resolveMatch(mId);
                const isLive = mode === 'live';
                const isSandbox = mode === 'sandbox';
                const hasWinner = isSandbox ? !!match?.predictedWinner : (isLive && match?.status === 'FINISHED' && match?.homeScore !== match?.awayScore);
                const lineColor = hasWinner ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]';

                return (
                    <div key={mId} className="relative w-full">
                        <div className={`absolute top-1/2 ${align === 'left' ? '-right-2 sm:-right-4' : '-left-2 sm:-left-4'} w-2 sm:w-4 h-[2px] ${lineColor} z-0 transition-colors duration-500`}></div>
                        <BracketNode match={match} mode={mode} setPrediction={setPrediction} onMatchClick={onMatchClick} onSlotClick={onSlotClick} align={align} />
                    </div>
                )
            })}
            
            {matchIds.length > 1 && matchIds.map((mId, i) => {
                if (i % 2 === 0) {
                    const matchA = resolveMatch(matchIds[i]);
                    const matchB = resolveMatch(matchIds[i+1]);
                    const hasWinnerA = mode === 'sandbox' ? !!matchA?.predictedWinner : (matchA?.status === 'FINISHED' && matchA?.homeScore !== matchA?.awayScore);
                    const hasWinnerB = mode === 'sandbox' ? !!matchB?.predictedWinner : (matchB?.status === 'FINISHED' && matchB?.homeScore !== matchB?.awayScore);
                    
                    const colorA = hasWinnerA ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]';
                    const colorB = hasWinnerB ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]';
                    const colorMerge = (hasWinnerA || hasWinnerB) ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.3)]';

                    return (
                        <React.Fragment key={`conn-${mId}`}>
                            <div className={`absolute ${align === 'left' ? '-right-2 sm:-right-4' : '-left-2 sm:-left-4'} w-[2px] ${colorA} z-0 transition-colors duration-500`}
                                 style={{
                                     top: `calc(${(i + 0.5) * (100 / matchIds.length)}%)`,
                                     height: `calc(${0.5 * (100 / matchIds.length)}%)`
                                 }}>
                            </div>
                            <div className={`absolute ${align === 'left' ? '-right-2 sm:-right-4' : '-left-2 sm:-left-4'} w-[2px] ${colorB} z-0 transition-colors duration-500`}
                                 style={{
                                     top: `calc(${(i + 1) * (100 / matchIds.length)}%)`,
                                     height: `calc(${0.5 * (100 / matchIds.length)}%)`
                                 }}>
                            </div>
                            <div className={`absolute ${align === 'left' ? '-right-4 sm:-right-8' : '-left-4 sm:-left-8'} w-2 sm:w-4 h-[2px] ${colorMerge} z-0 transition-colors duration-500`}
                                 style={{
                                     top: `calc(${(i + 1) * (100 / matchIds.length)}%)`
                                 }}>
                            </div>
                        </React.Fragment>
                    )
                }
                return null;
            })}
        </div>
    )
}

const BracketNode = ({ match, mode, setPrediction, onMatchClick, onSlotClick, align, isFinal }) => {
    if (!match) return null;
    const isSandbox = mode === 'sandbox';
    const isLive = mode === 'live';
    const homeWinner = isSandbox ? match.predictedWinner?.id === match.home?.id : (isLive && match.status === 'FINISHED' && match.homeScore > match.awayScore);
    const awayWinner = isSandbox ? match.predictedWinner?.id === match.away?.id : (isLive && match.status === 'FINISHED' && match.awayScore > match.homeScore);

    const isBaseSlot = (str) => str && !str.startsWith('W') && !str.startsWith('L');
    
    // 强化点击交互，打破“必须选完32强”的束缚，任何存在的球队直接可点推演
    const handleHomeClick = (e) => {
        if (isLive) { onMatchClick && onMatchClick(match); return; }
        if (isSandbox) {
            if (match.home.isPlaceholder && isBaseSlot(match.homeStr)) {
                onSlotClick && onSlotClick(match.homeStr);
            } else if (!match.home.isPlaceholder) {
                setPrediction(match.id, match.home);
            }
        }
    };

    const handleAwayClick = (e) => {
        if (isLive) { onMatchClick && onMatchClick(match); return; }
        if (isSandbox) {
            if (match.away.isPlaceholder && isBaseSlot(match.awayStr)) {
                onSlotClick && onSlotClick(match.awayStr);
            } else if (!match.away.isPlaceholder) {
                setPrediction(match.id, match.away);
            }
        }
    };

    return (
        <div className={`relative bg-slate-900 border ${isSandbox && match.predictedWinner ? 'border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : isFinal ? 'border-yellow-600/60' : 'border-slate-700'} rounded shadow-lg text-[9px] sm:text-xs flex flex-col transition-all group z-10 ${isSandbox ? 'hover:border-blue-400' : 'hover:border-purple-500/50'}`}>
           <div className={`flex justify-between items-center p-1 sm:p-1.5 border-b border-slate-800/80 transition-all cursor-pointer 
                ${isSandbox && match.home.isPlaceholder && isBaseSlot(match.homeStr) ? 'hover:bg-blue-900/30' : ''} 
                ${isSandbox && !match.home.isPlaceholder && !homeWinner ? 'hover:bg-blue-800/40 hover:scale-[1.02]' : ''} 
                ${!isSandbox && !match.home.isPlaceholder ? 'hover:bg-slate-800' : ''} 
                ${homeWinner ? 'bg-emerald-900/40 border-l-2 border-emerald-500' : 'border-l-2 border-transparent'}`}
                onClick={handleHomeClick}>
               {isSandbox && match.home.isPlaceholder && isBaseSlot(match.homeStr) ? (
                   <div className="flex items-center justify-center w-full text-blue-400 text-[10px] bg-blue-900/10 py-1 border border-dashed border-blue-500/50 rounded hover:bg-blue-600/20">
                       <PlusCircle className="w-3 h-3 mr-1" /> 选择球队
                   </div>
               ) : (
                   <>
                       <div className={`flex items-center gap-1.5 truncate flex-1 ${homeWinner ? 'font-bold text-white' : match.home.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-300'}`}>
                          <TeamFlag flag={match.home.flag} sizeClass="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate" title={match.home.placeholderName || match.home.name}>{match.home.name}</span>
                          {isSandbox && isBaseSlot(match.homeStr) && !match.home.isPlaceholder && (
                              <RefreshCw 
                                  className="w-3 h-3 text-slate-500 hover:text-blue-400 ml-1 shrink-0" 
                                  onClick={(e) => { e.stopPropagation(); onSlotClick && onSlotClick(match.homeStr); }} 
                                  title="重新选择"
                              />
                          )}
                       </div>
                       {isLive && <span className={`font-mono font-bold ml-1 ${homeWinner ? 'text-yellow-400' : 'text-slate-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? match.homeScore : '-'}</span>}
                       {isSandbox && homeWinner && <CheckCircle2 className="w-3 h-3 text-yellow-500 ml-1 shrink-0" />}
                   </>
               )}
           </div>

           <div className={`flex justify-between items-center p-1 sm:p-1.5 transition-all cursor-pointer 
                ${isSandbox && match.away.isPlaceholder && isBaseSlot(match.awayStr) ? 'hover:bg-blue-900/30' : ''} 
                ${isSandbox && !match.away.isPlaceholder && !awayWinner ? 'hover:bg-blue-800/40 hover:scale-[1.02] mt-0.5' : ''} 
                ${!isSandbox && !match.away.isPlaceholder ? 'hover:bg-slate-800 mt-0.5' : ''} 
                ${awayWinner ? 'bg-emerald-900/40 border-l-2 border-emerald-500 mt-0.5' : 'border-l-2 border-transparent mt-0.5'}`}
                onClick={handleAwayClick}>
               {isSandbox && match.away.isPlaceholder && isBaseSlot(match.awayStr) ? (
                   <div className="flex items-center justify-center w-full text-blue-400 text-[10px] bg-blue-900/10 py-1 border border-dashed border-blue-500/50 rounded hover:bg-blue-600/20">
                       <PlusCircle className="w-3 h-3 mr-1" /> 选择球队
                   </div>
               ) : (
                   <>
                       <div className={`flex items-center gap-1.5 truncate flex-1 ${awayWinner ? 'font-bold text-white' : match.away.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-300'}`}>
                          <TeamFlag flag={match.away.flag} sizeClass="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate" title={match.away.placeholderName || match.away.name}>{match.away.name}</span>
                          {isSandbox && isBaseSlot(match.awayStr) && !match.away.isPlaceholder && (
                              <RefreshCw 
                                  className="w-3 h-3 text-slate-500 hover:text-blue-400 ml-1 shrink-0" 
                                  onClick={(e) => { e.stopPropagation(); onSlotClick && onSlotClick(match.awayStr); }} 
                                  title="重新选择"
                              />
                          )}
                       </div>
                       {isLive && <span className={`font-mono font-bold ml-1 ${awayWinner ? 'text-yellow-400' : 'text-slate-500'}`}>{match.status === 'FINISHED' || match.status === 'LIVE' ? match.awayScore : '-'}</span>}
                       {isSandbox && awayWinner && <CheckCircle2 className="w-3 h-3 text-yellow-500 ml-1 shrink-0" />}
                   </>
               )}
           </div>

           <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-950 text-[7px] text-slate-500 px-1 rounded border border-slate-800 whitespace-nowrap hidden sm:block">
              M{match.id.replace('ko_', '')}
           </div>
        </div>
    )
}

// ================= 视图模块：全景大树 =================
function BracketView({ getTeamFromSlot, onMatchClick }) {
  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
        <div className="flex-1 overflow-x-auto custom-scrollbar p-4 sm:p-8">
            <div className="min-w-[1200px] w-max mx-auto pb-20">
                <div className="text-center mb-6">
                   <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider flex items-center justify-center"><GitBranch className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-500"/>全景淘汰赛大树</h2>
                   <p className="text-slate-400 text-sm mt-2">实时战况同步，104场鏖战见证最终冠军之路</p>
                </div>
                <TournamentTree mode="live" getTeamFromSlot={getTeamFromSlot} onMatchClick={onMatchClick} />
            </div>
        </div>
    </div>
  );
}

// ================= 视图模块：冠军推演沙盘 =================
function PredictionSandbox({ getTeamFromSlot, groups, setShowWechatPopup }) {
  const [r32Selections, setR32Selections] = useState({});
  const [predictions, setPredictions] = useState({});
  const [selectingSlot, setSelectingSlot] = useState(null);

  const handleReset = () => {
     if (window.confirm("确定要清空所有的推演记录，重新排兵布阵吗？")) {
         setPredictions({});
         setR32Selections({});
     }
  };

  const getTeamsForSlot = (slot) => {
      if (!slot) return [];
      let targetGroups = [];
      if (slot.length === 2) {
          targetGroups.push(slot[1]); 
      } else if (slot.startsWith('3')) {
          targetGroups = slot.slice(1).split('/'); 
      }
      
      let availableTeams = [];
      targetGroups.forEach(g => {
          if (groups[g] && groups[g].teams) {
              availableTeams = availableTeams.concat(groups[g].teams.filter(t => !t.isPlaceholder));
          }
      });
      return availableTeams;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative overflow-hidden">
        <div className="flex justify-between items-center bg-slate-900/80 px-4 py-3 border-b border-slate-800 z-10 shrink-0">
            <div className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-white text-sm sm:text-base">冠军推演沙盘</span>
            </div>
            <div className="flex space-x-3">
                <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-full flex items-center transition-all"><RotateCcw className="w-3 h-3 mr-1" /> 重置推演</button>
            </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar p-4 sm:p-8 relative">
            <div id="capture-prediction" className="min-w-[1200px] w-max mx-auto bg-slate-950 pb-20 pt-4 px-8 rounded-2xl relative">
                <div className="text-center mb-8">
                   <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-wider flex justify-center items-center">我的2026冠军预测卷</h2>
                   <p className="text-slate-400 text-sm mt-2">任意点击现存球队即可向内推演，选出你心中的神杯得主！</p>
                </div>

                <TournamentTree 
                   mode="sandbox" 
                   r32Selections={r32Selections}
                   predictions={predictions} 
                   setPrediction={(mId, team) => setPredictions(p => ({...p, [mId]: team}))} 
                   getTeamFromSlot={getTeamFromSlot} 
                   onSlotClick={setSelectingSlot}
                />

                <div id="watermark-capture-prediction" className="hidden mt-12 w-full justify-center">
                    <GlobalQRLogo />
                </div>
            </div>
        </div>

        <button onClick={() => handleGlobalShare('capture-prediction', '我的世界杯推演.png', setShowWechatPopup)} className="absolute bottom-6 right-4 sm:right-8 z-[100] bg-gradient-to-r from-yellow-600 to-orange-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.4)] px-5 sm:px-8 py-3 rounded-full font-black text-xs sm:text-sm flex items-center transition-all hover:scale-105 active:scale-95">
            <ImageIcon className="w-5 h-5 mr-2" /> <span id="share-text-capture-prediction">一键生成专属预测长图</span>
        </button>

        {selectingSlot && (
           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectingSlot(null)}>
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full relative shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setSelectingSlot(null)} className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-5 h-5"/></button>
                 <h3 className="text-lg font-black text-white mb-1 flex items-center"><Users className="w-5 h-5 text-emerald-400 mr-2" /> 选拔晋级球队</h3>
                 <p className="text-xs text-slate-400 mb-4">当前争夺席位：<span className="font-bold text-yellow-400 ml-1">{selectingSlot}</span></p>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[60vh] p-1 custom-scrollbar">
                     {getTeamsForSlot(selectingSlot).map(team => {
                         const isSelected = Object.values(r32Selections).some(t => t.id === team.id);
                         return (
                             <button key={team.id} disabled={isSelected} onClick={() => { setR32Selections(p => ({...p, [selectingSlot]: team})); setSelectingSlot(null); }} className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${isSelected ? 'opacity-30 cursor-not-allowed border-slate-800 bg-slate-950' : 'border-slate-700 bg-slate-800 hover:border-emerald-500 hover:bg-slate-700 hover:-translate-y-1'}`}>
                                 <TeamFlag flag={team.flag} sizeClass="w-8 h-8 mb-2 drop-shadow-md" />
                                 <span className="text-xs font-bold text-slate-200">{team.name}</span>
                                 {isSelected && <span className="text-[9px] text-slate-500 mt-1 font-bold">已入选其他席位</span>}
                             </button>
                         )
                     })}
                 </div>
              </div>
           </div>
        )}
    </div>
  );
}


// ================= 2. 赛事规则 & 完整赛程图组件 =================
function RulesView({ groups, knockouts, getTeamFromSlot }) {
  const [subTab, setSubTab] = useState('rules');
  const allGroupMatches = [];
  Object.keys(groups).forEach(g => { groups[g].matches.forEach(m => { allGroupMatches.push({ ...m, groupName: g }); }); });
  const allKnockoutMatches = ['r32', 'r16', 'qf', 'sf', 'final'].flatMap(round => 
    knockouts[round].map(m => ({...m, home: getTeamFromSlot(m.homeStr), away: getTeamFromSlot(m.awayStr)}))
  );

  const all104 = [...allGroupMatches, ...allKnockoutMatches].sort((a,b) => a.timeStr.localeCompare(b.timeStr));
  const grouped104 = groupByDate(all104);

  return (
    <div className="h-full flex flex-col bg-slate-950 relative">
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-2 flex justify-center z-10 shrink-0">
        <div className="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button onClick={() => setSubTab('rules')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ${subTab === 'rules' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> 赛事规则说明
          </button>
          <button onClick={() => setSubTab('schedule')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-1.5 rounded font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center ml-2 ${subTab === 'schedule' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" /> 104场全赛程长图
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar">
        <div id="capture-rules" className="max-w-4xl lg:max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-24 relative bg-slate-950">
          
          {subTab === 'rules' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none grayscale">
                  <RealTrophy className="w-64 h-64" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 flex items-center"><Shield className="w-8 h-8 mr-3 text-emerald-500" /> 2026 美加墨世界杯 - 全新规则</h2>
              <div className="space-y-6 relative z-10">
                <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
                  <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center"><Users className="w-5 h-5 mr-2" /> 扩军与赛制重构</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-slate-400 ml-2">
                    <li><strong className="text-slate-200">48强新纪元：</strong>首次将参赛队伍从 32 支扩充至 48 支。</li>
                    <li><strong className="text-slate-200">12大分组：</strong>分为 12 个小组（A组至L组），每组 4 支球队。</li>
                    <li><strong className="text-slate-200">104场鏖战：</strong>赛事周期长达 39 天，总计 104 场对决。</li>
                  </ul>
                </div>
                <div className="bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/20">
                  <h3 className="text-xl font-bold text-emerald-400 mb-3 flex items-center"><ListOrdered className="w-5 h-5 mr-2" /> 全新晋级规则</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/40 p-4 rounded-lg border-l-4 border-emerald-500">
                      <h4 className="font-bold text-white mb-2">✅ 直通 32 强区</h4>
                      <p className="text-sm text-slate-400">12个小组中，每个小组的 <strong>前两名 (共24支球队)</strong> 直接晋级 32 强。</p>
                    </div>
                    <div className="bg-yellow-950/40 p-4 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-bold text-white mb-2">⚠️ 晋级待定区</h4>
                      <p className="text-sm text-slate-400">剩下的 8 个名额，由成绩最好的 <strong>8 个小组第三</strong> 获得复活晋级资格。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 sm:p-8 shadow-2xl relative">
              <h2 className="text-xl sm:text-3xl font-black text-white mb-8 text-center text-blue-400 tracking-wider">2026 世界杯 104场 实况长图</h2>
              
              <div className="space-y-6">
                {Object.keys(grouped104).map((date, idx) => (
                   <div key={`all-${date}`} className={`p-4 rounded-xl border border-slate-800/60 ${idx % 2 === 0 ? 'bg-slate-900/80' : 'bg-slate-800/40'}`}>
                      <h4 className="text-emerald-400 font-bold mb-4 flex items-center text-sm sm:text-base border-b border-slate-700/50 pb-2">
                        <CalendarDays className="w-4 h-4 mr-2" /> {date}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {grouped104[date].map(m => (
                            <div key={`all-m-${m.id}`} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center text-xs sm:text-sm hover:border-emerald-500/30 transition-colors">
                               <div className="flex items-center space-x-1.5 w-[42%] justify-end">
                                  <span className={`truncate ${m.home?.isPlaceholder ? 'text-slate-500' : 'text-slate-200 font-bold'}`}>{m.home?.name || m.homeStr}</span>
                                  <TeamFlag flag={m.home?.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5" />
                               </div>
                               <div className="flex flex-col items-center w-[16%]">
                                  <span className="text-[9px] font-mono text-slate-500 mb-0.5">{m.timeStr.split(' ')[1]}</span>
                                  <span className="text-[10px] font-black text-slate-600 bg-slate-900 px-1 rounded">VS</span>
                               </div>
                               <div className="flex items-center space-x-1.5 w-[42%] justify-start">
                                  <TeamFlag flag={m.away?.flag} sizeClass="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className={`truncate ${m.away?.isPlaceholder ? 'text-slate-500' : 'text-slate-200 font-bold'}`}>{m.away?.name || m.awayStr}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
              </div>
            </div>
          )}

          <div id="watermark-capture-rules" className="hidden mt-8 w-full">
             <GlobalQRLogo />
          </div>

        </div>
      </div>

      <button onClick={() => handleGlobalShare('capture-rules', '2026世界杯规则与赛程.png')} className="absolute bottom-6 right-4 sm:right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center transition-all active:scale-95">
        <ImageIcon className="w-4 h-4 mr-1.5" /> <span id="share-text-capture-rules">生成并分享长图</span>
      </button>
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
  const [forceShowHeader, setForceShowHeader] = useState(false);
  const [showWechatPopup, setShowWechatPopup] = useState(false);

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

  const getTeamFromSlot = useCallback((slotStr) => {
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
  }, [groups]);

  const isCanvasTab = activeTab === 'bracket' || activeTab === 'prediction';
  const headerClass = `bg-slate-900 border-b border-slate-800 flex flex-col z-20 shadow-xl relative transition-all duration-300 ${isCanvasTab && !forceShowHeader ? 'landscape:hidden' : ''}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col h-[100dvh] overflow-hidden selection:bg-emerald-500/30">
      
      <div 
        onClick={() => window.open('http://www.xiaohuang365.com', '_blank')}
        className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 py-2 flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity w-full shrink-0 z-30"
      >
        <Gift className="w-4 h-4 mr-2 animate-bounce" />
        <span className="truncate">🔥 看2026世界杯全场次高清直播？点击免费下载全网最强 TVBox 影视合集！</span>
        <Download className="w-4 h-4 ml-2" />
      </div>

      <header className={`${headerClass} px-2 py-1.5 sm:px-4 sm:py-3 gap-1 sm:gap-3`}>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                <RealTrophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h1 className="text-sm sm:text-xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent tracking-wider leading-none mt-1">
                  2026美加墨世界杯
                </h1>
              </div>
              <span className="text-[9px] sm:text-xs text-slate-400 font-mono tracking-widest mt-1 leading-none">
                xiaohuang365.com
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 pt-1">
            <button onClick={shareWebsite} className="bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600 hover:text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold flex items-center transition-all">
              <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> <span className="hidden sm:inline">分享本站</span><span className="sm:hidden">分享</span>
            </button>
          </div>
        </div>

        <div className="w-full px-0.5 flex justify-center mt-1 sm:mt-2">
          <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800 shadow-inner w-full justify-between items-center gap-1 overflow-x-auto hide-scrollbar">
            <TabButton active={activeTab === 'group_schedule'} onClick={() => setActiveTab('group_schedule')} icon={<CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="小组赛程" color="emerald" />
            <TabButton active={activeTab === 'knockout_schedule'} onClick={() => setActiveTab('knockout_schedule')} icon={<ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="淘汰赛程" color="purple" />
            <TabButton active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} icon={<BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="赛事规则" color="emerald" />
            <TabButton active={activeTab === 'bracket'} onClick={() => { setActiveTab('bracket'); setForceShowHeader(false); }} icon={<GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="全景大树" color="blue" />
            <TabButton active={activeTab === 'prediction'} onClick={() => { setActiveTab('prediction'); setForceShowHeader(false); }} icon={<Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} text="冠军推演" color="yellow" />
          </div>
        </div>
      </header>

      {isCanvasTab && !forceShowHeader && (
        <button onClick={() => setForceShowHeader(true)} className="fixed top-12 left-4 z-[200] landscape:flex hidden bg-slate-800/80 border border-slate-600 text-white px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-sm text-xs font-bold items-center hover:bg-slate-700">
           显示导航 / 退出沉浸模式
        </button>
      )}

      <div className="flex-1 overflow-hidden relative w-full h-full">
        {activeTab === 'group_schedule' && <GroupScheduleView groups={groups} onMatchClick={handleOpenMatch} onTeamClick={handleOpenTeam} setShowWechatPopup={setShowWechatPopup} />}
        {activeTab === 'knockout_schedule' && <KnockoutScheduleView getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} setShowWechatPopup={setShowWechatPopup} />}
        {activeTab === 'rules' && <RulesView groups={groups} knockouts={officialKnockoutRounds} getTeamFromSlot={getTeamFromSlot} />}
        {activeTab === 'bracket' && <BracketView getTeamFromSlot={getTeamFromSlot} onMatchClick={handleOpenMatch} isFullscreenMode={!forceShowHeader} />}
        {activeTab === 'prediction' && <PredictionSandbox getTeamFromSlot={getTeamFromSlot} groups={groups} onMatchClick={handleOpenMatch} isFullscreenMode={!forceShowHeader} setShowWechatPopup={setShowWechatPopup} />}
      </div>

      <MatchDetailDrawer match={selectedMatch} onClose={handleCloseMatch} onTeamClick={handleOpenTeam} isTop={lastOpened === 'match'} />
      <TeamDetailDrawer team={selectedTeam} onClose={handleCloseTeam} onMatchClick={handleOpenMatch} groups={groups} isTop={lastOpened === 'team'} />
      
      {showWechatPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full relative shadow-2xl flex flex-col items-center text-center">
             <button onClick={() => setShowWechatPopup(false)} className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X className="w-5 h-5"/></button>
             <MessageCircle className="w-16 h-16 text-green-500 mb-4" />
             <h3 className="text-xl font-black text-white mb-2">加入小黄万人聊球群</h3>
             <p className="text-sm text-slate-400 mb-6">每天发布大神预测，看球吹水，还有外卖红包免费领！群满即停！</p>
             <div className="bg-white p-2 rounded-lg mb-4 w-40 h-40 flex items-center justify-center">
                 <img src="IMG_8474.jpg" alt="WeChat Group" className="w-full h-full object-contain" />
             </div>
             <p className="text-xs text-emerald-400 font-bold">长按识别上方二维码进群 👆</p>
          </div>
        </div>
      )}

    </div>
  );
}

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
function GroupScheduleView({ groups, onMatchClick, onTeamClick, setShowWechatPopup }) {
  const [viewMode, setViewMode] = useState('by_time'); 
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
      <div className="flex-1 overflow-y-auto p-2 sm:p-6 custom-scrollbar relative">
        <div id="capture-group-schedule" className="pb-24 bg-slate-950 relative">
          {viewMode === 'by_group' ? (
            <GroupScheduleByGroup groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
          ) : (
            <GroupScheduleByTime groups={groups} onMatchClick={onMatchClick} onTeamClick={onTeamClick} />
          )}

          <div id="watermark-capture-group-schedule" className="hidden mt-8 w-full">
             <GlobalQRLogo />
          </div>
        </div>
      </div>

      <button onClick={() => handleGlobalShare('capture-group-schedule', '2026世界杯小组赛程.png', setShowWechatPopup)} className="absolute bottom-6 right-4 sm:right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center transition-all active:scale-95">
        <Share className="w-4 h-4 mr-1.5" /> <span id="share-text-capture-group-schedule">生成并分享长图</span>
      </button>
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
         className={`relative flex items-center justify-between text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 sm:py-2 transition-colors border-b border-slate-800/30 last:border-b-0
           ${!team.isPlaceholder ? 'cursor-pointer hover:bg-white/5' : ''} 
           ${type === 'top2' ? 'bg-emerald-900/40' : type === 'third' ? 'bg-yellow-900/40' : 'bg-transparent'}`}>
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
    <div className="max-w-[1600px] mx-auto flex flex-row gap-0 sm:gap-4 items-stretch w-full relative">
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
                      
                      <div className="flex justify-center items-center w-full mt-1 gap-1">
                        <div className="flex items-center justify-end flex-1 overflow-hidden">
                          <span className="truncate text-[9px] sm:text-xs font-bold text-slate-300 group-hover:text-white text-right" title={match.home?.name || '待定'}>{match.home?.name || '待定'}</span>
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
                          <span className="truncate text-[9px] sm:text-xs font-bold text-slate-300 group-hover:text-white text-left" title={match.away?.name || '待定'}>{match.away?.name || '待定'}</span>
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

      <div className="w-1/2 pt-0 pl-1 sm:pl-2 pr-1 h-full">
        {/* 修复：移除了 sticky 及其定位属性，实现自然滑动 */}
        <div className="pt-2 sm:pt-6 bg-slate-950/95 z-20 pb-2 border-b border-slate-800 mb-3 sm:mb-4">
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
                    <div className="relative bg-emerald-900/20 border-t border-emerald-500/20 pt-4 pb-0.5 overflow-hidden">
                       <div className="absolute top-0 right-0 bg-emerald-500/90 text-emerald-950 text-[7px] sm:text-[9px] font-black px-1.5 py-px rounded-bl-xl shadow z-10">晋级32强</div>
                       {groups[g].teams.slice(0, 2).map((team, idx) => <React.Fragment key={`sb-team-${team.id}`}>{renderSidebarTeamRow(team, 'top2', idx, g)}</React.Fragment>)}
                    </div>
                    <div className="relative bg-yellow-900/20 border-t border-yellow-500/20 pt-4 pb-0.5 overflow-hidden">
                       <div className="absolute top-0 right-0 bg-yellow-500/90 text-yellow-950 text-[7px] sm:text-[9px] font-black px-1.5 py-px rounded-bl-xl shadow z-10">待定区</div>
                       {groups[g].teams.slice(2, 3).map((team, idx) => <React.Fragment key={`sb-team-${team.id}`}>{renderSidebarTeamRow(team, 'third', idx + 2, g)}</React.Fragment>)}
                    </div>
                    <div className="relative bg-slate-800/20 border-t border-slate-700/50 pt-0.5 pb-0.5 overflow-hidden">
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
function KnockoutScheduleView({ getTeamFromSlot, onMatchClick, setShowWechatPopup }) {
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
        <div className="max-w-6xl mx-auto pb-24 animate-fade-in relative z-10 bg-slate-950" id="global-capture-area">
          
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

          <div id="watermark-global-capture-area" className="hidden mt-8 w-full">
             <GlobalQRLogo />
          </div>
        </div>
      </div>

      <button onClick={() => handleGlobalShare('global-capture-area', '2026世界杯淘汰赛程.png', setShowWechatPopup)} className="absolute bottom-6 right-4 sm:right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] px-4 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm flex items-center transition-all active:scale-95">
        <Share className="w-4 h-4 mr-1.5" /> <span id="share-text-global-capture-area">生成并分享长图</span>
      </button>
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
          <span className={`text-[9px] sm:text-sm truncate font-bold text-right ${match.home.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-200 group-hover:text-white'}`} title={match.home.placeholderName || match.home.name}>{match.home.name}</span>
          <TeamFlag flag={match.home.flag} sizeClass="w-3.5 h-3.5 sm:w-6 sm:h-6 ml-1 flex-shrink-0" />
        </div>
        <div className="flex justify-center items-center shrink-0">
          {isFinished ? (
             <span className="font-mono text-xs sm:text-base font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
               {match.homeScore} - {match.awayScore}
             </span>
          ) : (
             <span className="font-black text-[9px] sm:text-sm text-slate-700">VS</span>
          )}
        </div>
        <div className="flex items-center justify-start flex-1">
          <TeamFlag flag={match.away.flag} sizeClass="w-3.5 h-3.5 sm:w-6 sm:h-6 mr-1 flex-shrink-0" />
          <span className={`text-[9px] sm:text-sm truncate text-left font-bold ${match.away.isPlaceholder ? 'text-slate-500 font-mono font-normal' : 'text-slate-200 group-hover:text-white'}`} title={match.away.placeholderName || match.away.name}>{match.away.name}</span>
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
        <RealTrophy className="w-10 h-10 z-10 hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col gap-4 w-full sm:w-[45%] z-10 mt-4 sm:mt-0"><CompactTreeNode match={matches[2]} onClick={onMatchClick} /><CompactTreeNode match={matches[3]} onClick={onMatchClick} /></div>
      </div>
    );
  }
  if (round === 'sf') {
    return (
      <div className="flex justify-between items-center mt-6 px-2 sm:px-6 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/50 -translate-x-1/2 hidden sm:block"></div>
        <div className="w-full sm:w-[45%] z-10"><CompactTreeNode match={matches[0]} onClick={onMatchClick} /></div>
        <RealTrophy className="w-16 h-16 opacity-40 z-10 hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
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
        <span className="text-[8px] sm:text-[9px] text-slate-500 truncate max-w-[80px] sm:max-w-[120px] group-hover:text-slate-400 flex items-center"><MapPin className="w-2.5 h-2.5 inline mr-0.5 opacity-70"/>{match.venue}</span>
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
        <TeamFlag flag={team.flag} sizeClass="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
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

// ================= 8. 全局弹窗 & 钻取引擎 (融合 API-Football 深度数据 UI) =================
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
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           {match.home?.isPlaceholder ? (
               <div className="text-center text-slate-500 mt-10">等待对阵球队产生...</div>
           ) : (
               <div className="px-2">
                  <h3 className="text-cyan-400 font-bold border-b border-slate-800 pb-2 mb-4 text-left flex items-center"><Activity className="w-4 h-4 mr-2"/> 首发阵容 (Lineups & Formations)</h3>
                  <div className="flex justify-between items-start text-xs gap-4">
                      <div className="flex-1 bg-slate-900/80 rounded border border-slate-800 p-3 text-left">
                          <div className="text-slate-300 font-bold mb-1">{match.home?.name}</div>
                          <div className="text-emerald-500/70 italic text-[10px] mb-3">4-3-3 阵型分析中...</div>
                          <ul className="space-y-1.5 text-slate-400">
                              <li className="flex items-center"><div className="w-4 h-4 bg-slate-800 rounded text-[9px] flex items-center justify-center mr-2">1</div> 门将 (GK)</li>
                              <li className="flex items-center"><div className="w-4 h-4 bg-slate-800 rounded text-[9px] flex items-center justify-center mr-2">10</div> 核心前锋 (FW)</li>
                          </ul>
                      </div>
                      <div className="flex-1 bg-slate-900/80 rounded border border-slate-800 p-3 text-left">
                          <div className="text-slate-300 font-bold mb-1">{match.away?.name}</div>
                          <div className="text-emerald-500/70 italic text-[10px] mb-3">4-2-3-1 阵型分析中...</div>
                          <ul className="space-y-1.5 text-slate-400">
                              <li className="flex items-center"><div className="w-4 h-4 bg-slate-800 rounded text-[9px] flex items-center justify-center mr-2">1</div> 门将 (GK)</li>
                              <li className="flex items-center"><div className="w-4 h-4 bg-slate-800 rounded text-[9px] flex items-center justify-center mr-2">9</div> 核心前锋 (FW)</li>
                          </ul>
                      </div>
                  </div>
                  <div className="text-[10px] text-slate-500 text-center mt-6 p-2 border border-dashed border-slate-800 rounded bg-slate-900/50">
                      *比赛详情及阵型面板已预留，正式开赛后将无缝接入 API-Football Widgets。
                  </div>
               </div>
           )}
        </div>
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
            <div className="mt-3 flex items-center space-x-3 text-xs text-emerald-400 font-bold bg-emerald-900/20 px-3 py-1.5 rounded border border-emerald-500/30">
              <span className="flex items-center">FIFA 2026 参赛国</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
           <h3 className="text-cyan-400 font-bold border-b border-slate-800 pb-2 mb-3 flex items-center"><UserCircle2 className="w-4 h-4 mr-2"/> 主教练 (Coach)</h3>
           <div className="text-slate-300 text-xs flex items-center bg-slate-900 p-3 rounded border border-slate-800 shadow-inner">
               <div className="w-8 h-8 bg-slate-800 rounded-full mr-3 flex items-center justify-center text-slate-500 font-black text-xs">C</div>
               <div>
                  <div className="font-bold text-slate-200 mb-0.5">教练数据读取中...</div>
                  <div className="text-[10px] text-slate-500">api-football /coachs API</div>
               </div>
           </div>

           <h3 className="text-cyan-400 font-bold border-b border-slate-800 pb-2 mt-8 mb-4 flex items-center"><Users className="w-4 h-4 mr-2"/> 大名单与核心球员 (Squad)</h3>
           <div className="grid grid-cols-2 gap-3">
               {[1, 2, 3, 4, 5, 6].map(i => (
                   <div key={`player-mock-${i}`} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center shadow-inner hover:border-slate-600 transition-colors cursor-default">
                      <div className="w-8 h-8 bg-slate-800 rounded-full mr-3 flex items-center justify-center text-slate-600 font-black text-xs">P</div>
                      <div>
                        <div className="text-xs text-slate-200 font-bold mb-0.5">球员名单池</div>
                        <div className="text-[9px] text-slate-500">位置 / 号码</div>
                      </div>
                   </div>
               ))}
           </div>
           
           <div className="text-[10px] text-slate-500 text-center mt-6 p-2 border border-dashed border-slate-800 rounded bg-slate-900/50">
               *大名单及球员详细数据模型已建立，将通过 API-Football /players 接口渲染。
           </div>
        </div>
      </div>
    </>
  );
}
