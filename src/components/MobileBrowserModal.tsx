import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Home,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Smartphone,
  Shield,
  Clock,
  Sparkles,
  Camera,
  Trash2,
  Lock,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Check,
  Search,
  Users,
} from 'lucide-react';
import { useTikTokDesk } from '../context/TikTokDeskContext';

export const MobileBrowserModal: React.FC = () => {
  const { activeMobileAccount, closeMobileBrowser, addToast, proxies, extensions } = useTikTokDesk();

  if (!activeMobileAccount) return null;

  const [activeTab, setActiveTab] = useState<'tiktok' | 'creator' | 'inbox' | 'analytics' | 'profile'>('tiktok');
  const [urlInput, setUrlInput] = useState(`https://www.tiktok.com/${activeMobileAccount.username}`);
  const [isPortrait, setIsPortrait] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(activeMobileAccount.sessionDurationMinutes * 60 + 15);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'proxy' | 'extensions'>('profile');
  const [feedIndex, setFeedIndex] = useState(0);
  const [isOpeningRealWindow, setIsOpeningRealWindow] = useState(false);

  async function openRealChromeWindow() {
    if (isOpeningRealWindow) return;
    setIsOpeningRealWindow(true);
    try {
      const backendMissing = 'Backend nahi mila. Live site par profile nahi khulega. PC par localhost:3000 wala program chalao, wahan ye button kaam karega.';
      async function callApi(action: string) {
        const r = await fetch(`/api/accounts/${encodeURIComponent(activeMobileAccount!.id)}/${action}`, { method: 'POST' });
        const text = await r.text();
        let j: any = {};
        try { j = text ? JSON.parse(text) : {}; } catch { j = {}; }
        if (!r.ok) throw new Error(j.error || backendMissing);
        return j;
      }
      await callApi('profile');
      const opened = await callApi('open-profile');
      addToast('success', opened.alreadyOpen ? 'Profile pehle se khula hai' : 'Chrome profile khul raha hai', 'Asli Chrome window khul rahi hai, ye demo preview nahi hai.');
      closeMobileBrowser();
    } catch (e) {
      addToast('error', 'Profile nahi khula', e instanceof Error ? e.message : String(e));
    } finally {
      setIsOpeningRealWindow(false);
    }
  }

  // Sync timer
  useEffect(() => {
    if (isTimerPaused) return;
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused]);

  // Auto scrolling simulation
  useEffect(() => {
    if (!isAutoScrolling) return;
    const scrollInterval = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(scrollInterval);
  }, [isAutoScrolling]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const assignedProxy = proxies.find((p) => p.id === activeMobileAccount.proxyId);
  const accountExtensions = extensions.filter((e) =>
    activeMobileAccount.assignedExtensions.includes(e.id)
  );

  const sampleVideos = [
    {
      author: activeMobileAccount.username,
      caption: 'This smart magnetic organizer is blowing up everywhere! 🔥 #gadgets #tiktokmademebuyit #lifehacks',
      sound: `original sound - ${activeMobileAccount.displayName}`,
      likes: '—',
      comments: '—',
      shares: '—',
      bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    },
    {
      author: activeMobileAccount.username,
      caption: 'Testing 3 viral kitchen hacks so you do not have to! ✨ #kitchenfinds #foodtok #musthave',
      sound: `trending audio`,
      likes: '—',
      comments: '—',
      shares: '—',
      bgGradient: 'from-slate-900 via-slate-800 to-zinc-950',
    },
    {
      author: activeMobileAccount.username,
      caption: 'Unboxing the cleanest desk setup aesthetic for 2026 🖥️ #desksetup #workspace #tech',
      sound: `chill lo-fi beats - TikTokDesk`,
      likes: '—',
      comments: '—',
      shares: '—',
      bgGradient: 'from-zinc-900 via-neutral-900 to-black',
    },
    {
      author: activeMobileAccount.username,
      caption: 'Which one would you choose? A or B? Comment below! 👇 #fyp #viral #choice',
      sound: `original sound - ${activeMobileAccount.username}`,
      likes: '—',
      comments: '—',
      shares: '—',
      bgGradient: 'from-stone-900 via-slate-900 to-neutral-950',
    },
  ];

  const currentVideo = sampleVideos[feedIndex];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('info', 'Navigating', `Loaded ${urlInput} in profile ${activeMobileAccount.browserProfileId}`);
  };

  const handleQuickAction = (action: 'tiktok' | 'creator' | 'inbox' | 'analytics' | 'profile') => {
    setActiveTab(action);
    const urls: Record<string, string> = {
      tiktok: 'https://www.tiktok.com/foryou',
      creator: 'https://www.tiktok.com/creator-center/upload',
      inbox: 'https://www.tiktok.com/inbox',
      analytics: 'https://www.tiktok.com/creator-center/analytics',
      profile: `https://www.tiktok.com/${activeMobileAccount.username}`,
    };
    setUrlInput(urls[action]);
    addToast('info', 'Opened Page', `Reusing existing browser session tab for ${action.toUpperCase()}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 lg:p-6 overflow-hidden">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top Window Bar */}
        <div className="h-12 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FE2C55]" />
              <span className="text-xs font-semibold text-white">{activeMobileAccount.username}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                {activeMobileAccount.browserProfileId}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Isolated Session
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#FE2C55]" />
              <span className="font-mono text-white">{formatTimer(sessionSeconds)}</span>
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="text-xs text-slate-300 hover:text-white"
                title={isTimerPaused ? 'Resume Session Timer' : 'Pause Session Timer'}
              >
                {isTimerPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
              </button>
            </div>

            <button
              onClick={openRealChromeWindow}
              disabled={isOpeningRealWindow}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors disabled:opacity-50"
              title="Asli Chrome profile kholein (is account ki alag window)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isOpeningRealWindow ? 'Khul raha hai...' : 'Open in New Window'}</span>
            </button>

            <button
              onClick={closeMobileBrowser}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Close Browser Window (Profile Preserved)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser Navigation Toolbar */}
        <div className="h-12 bg-slate-900 px-4 flex items-center gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => addToast('info', 'Browser Action', 'Navigating back')}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => addToast('info', 'Browser Action', 'Navigating forward')}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => addToast('info', 'Refreshed', 'Reloaded current page')}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Reload"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleQuickAction('tiktok')}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="TikTok Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Lock className="w-3 h-3 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              Go
            </button>
          </form>

          {/* Viewport orientation & screenshot */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={() => setIsPortrait(!isPortrait)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Rotate Screen"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isPortrait ? 'Portrait (9:16)' : 'Landscape (16:9)'}</span>
            </button>
            <button
              onClick={() => addToast('success', 'Screenshot Saved', `Captured viewport to D:\\TikTokDesk\\Screenshots\\${activeMobileAccount.username}_${Date.now()}.png`)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
              title="Take Screenshot"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Content Split: Left Controls/Settings, Center Mobile Viewport, Right Quick Actions */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Tabs & Browser Profile Info */}
          <div className="w-64 bg-slate-950/60 p-3 border-r border-slate-800 flex flex-col gap-4 shrink-0 overflow-y-auto">
            {/* Open Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Open Tabs</span>
                <button
                  onClick={() => addToast('info', 'New Tab Opened', 'Created isolated browser tab.')}
                  className="text-[10px] text-[#FE2C55] hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <div className="space-y-1">
                {[
                  { id: 'tiktok', label: 'TikTok · For You' },
                  { id: 'creator', label: 'Creator Center' },
                  { id: 'inbox', label: 'Direct Messages' },
                  { id: 'profile', label: `Profile · ${activeMobileAccount.username}` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleQuickAction(tab.id as any)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-slate-800 text-white font-medium border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    {activeTab === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Assisted Browsing Tools */}
            <div className="border-t border-slate-800 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Assisted Browsing
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setIsAutoScrolling(!isAutoScrolling);
                    addToast(
                      isAutoScrolling ? 'info' : 'success',
                      isAutoScrolling ? 'Auto Scroll Stopped' : 'Auto Scroll Active',
                      isAutoScrolling
                        ? 'Natural feed scroll timer paused.'
                        : 'Simulating natural human pacing (4s per video) for supervised viewing.'
                    );
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isAutoScrolling
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAutoScrolling ? 'Pause Auto Scroll' : 'Start Auto Scroll (4s)'}</span>
                </button>

                <button
                  onClick={() => addToast('success', 'Cache Cleared', 'Browser disk cache cleared. Cookies preserved.')}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded"
                >
                  Clear Browser Cache
                </button>
                <button
                  onClick={() => addToast('warning', 'Cookies Cleared', 'Cleared session cookies. Login required on next launch.')}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded"
                >
                  Clear Session Cookies
                </button>
              </div>
            </div>

            {/* Network / Proxy Routing Status */}
            <div className="border-t border-slate-800 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Network & Profile
              </span>
              <div className="text-[11px] space-y-1.5 text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Proxy:</span>
                  <span className="font-mono text-emerald-400 truncate max-w-[120px]">
                    {assignedProxy ? assignedProxy.name : 'Direct Connection'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Latency:</span>
                  <span className="font-mono text-slate-300">
                    {assignedProxy?.latencyMs ? `${assignedProxy.latencyMs} ms` : 'Local direct'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timezone:</span>
                  <span className="text-slate-300">{activeMobileAccount.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage:</span>
                  <span className="text-slate-300">Isolated Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Simulated Mobile Viewport */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
            <div
              className={`bg-black rounded-[36px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col transition-all duration-300 ${
                isPortrait ? 'w-[340px] h-[640px]' : 'w-[640px] h-[340px]'
              }`}
            >
              {/* Speaker notch / dynamic island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Mobile Screen Area */}
              <div
                className={`flex-1 rounded-[26px] overflow-hidden relative flex flex-col bg-gradient-to-b ${currentVideo.bgGradient} text-white select-none`}
              >
                {/* Mobile Top Status / Header */}
                <div className="h-10 pt-3 px-4 flex items-center justify-between text-xs font-semibold z-20">
                  <div className="text-[10px] text-white/80">9:41</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFeedIndex((prev) => (prev - 1 + 4) % 4)}
                      className={`text-xs ${feedIndex === 0 ? 'text-white font-bold border-b-2 border-white' : 'text-white/60'}`}
                    >
                      Following
                    </button>
                    <button
                      onClick={() => setFeedIndex((prev) => (prev + 1) % 4)}
                      className={`text-xs ${feedIndex !== 0 ? 'text-white font-bold border-b-2 border-white' : 'text-white/60'}`}
                    >
                      For You
                    </button>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 text-white/80" />
                  </div>
                </div>

                {/* Simulated TikTok Video Content */}
                <div className="flex-1 flex flex-col justify-end p-4 pb-14 relative z-10">
                  {/* Right Action Bar */}
                  <div className="absolute right-3 bottom-16 flex flex-col items-center gap-3.5 text-center">
                    <div className="relative">
                      <img
                        src={activeMobileAccount.avatarUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border border-white object-cover"
                      />
                      <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center text-[10px] font-bold">
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => addToast('info', 'Interaction', 'Liked video')}
                      className="flex flex-col items-center"
                    >
                      <Heart className="w-6 h-6 text-rose-500 fill-rose-500 hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-white font-medium">{currentVideo.likes}</span>
                    </button>

                    <button
                      onClick={() => addToast('info', 'Interaction', 'Comments opened')}
                      className="flex flex-col items-center"
                    >
                      <MessageCircle className="w-6 h-6 text-white hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-white font-medium">{currentVideo.comments}</span>
                    </button>

                    <button
                      onClick={() => addToast('info', 'Interaction', 'Bookmarked')}
                      className="flex flex-col items-center"
                    >
                      <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-white font-medium">Save</span>
                    </button>

                    <button
                      onClick={() => addToast('info', 'Interaction', 'Link copied')}
                      className="flex flex-col items-center"
                    >
                      <Share2 className="w-6 h-6 text-white hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-white font-medium">{currentVideo.shares}</span>
                    </button>

                    <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center animate-spin">
                      <Music className="w-3.5 h-3.5 text-[#FE2C55]" />
                    </div>
                  </div>

                  {/* Video Caption & Metadata */}
                  <div className="max-w-[78%] space-y-1.5 drop-shadow-md">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{currentVideo.author}</span>
                      <span className="text-[9px] bg-slate-800/80 px-1 rounded text-slate-300">Creator</span>
                    </div>
                    <p className="text-[11px] leading-tight text-white/95 line-clamp-3">
                      {currentVideo.caption}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                      <Music className="w-3 h-3 text-[#FE2C55]" />
                      <span className="truncate">{currentVideo.sound}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="h-12 bg-black/90 border-t border-white/10 absolute bottom-0 inset-x-0 flex items-center justify-around px-2 text-[10px] text-white/70 z-20">
                  <button onClick={() => setFeedIndex(0)} className="flex flex-col items-center text-white">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <button onClick={() => addToast('info', 'Friends Feed', 'Loaded friends feed')} className="flex flex-col items-center">
                    <Users className="w-4 h-4" />
                    <span>Friends</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('creator')}
                    className="w-8 h-6 rounded bg-gradient-to-r from-[#00F2FE] via-white to-[#FE2C55] p-0.5 flex items-center justify-center text-black font-bold"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button onClick={() => handleQuickAction('inbox')} className="flex flex-col items-center">
                    <MessageCircle className="w-4 h-4" />
                    <span>Inbox</span>
                  </button>
                  <button onClick={() => handleQuickAction('profile')} className="flex flex-col items-center">
                    <img src={activeMobileAccount.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Quick Actions & Advanced Browser Settings */}
          <div className="w-64 bg-slate-950/60 p-3 border-l border-slate-800 flex flex-col gap-4 shrink-0 overflow-y-auto">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Shortcuts
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'tiktok', label: 'Go to TikTok Home' },
                  { id: 'creator', label: 'Open Creator Studio' },
                  { id: 'inbox', label: 'Open Direct Inbox' },
                  { id: 'analytics', label: 'Open Analytics Center' },
                  { id: 'profile', label: 'View Profile & Bio' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleQuickAction(act.id as any)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-800 transition-colors"
                  >
                    <span>{act.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Extensions */}
            <div className="border-t border-slate-800 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Active Extensions ({accountExtensions.length})
              </span>
              {accountExtensions.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">No extensions assigned to this profile.</div>
              ) : (
                <div className="space-y-1.5">
                  {accountExtensions.map((ext) => (
                    <div
                      key={ext.id}
                      className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Shield className="w-3.5 h-3.5 text-[#FE2C55]" />
                        <span className="truncate text-slate-200">{ext.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Actions */}
            <div className="border-t border-slate-800 pt-3 mt-auto">
              <button
                onClick={closeMobileBrowser}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                Close Window & Save Session
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1.5">
                Profile cookies & saved tabs remain saved on disk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
