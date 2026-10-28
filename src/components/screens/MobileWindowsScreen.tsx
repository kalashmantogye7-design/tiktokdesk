import React, { useState } from 'react';
import {
  Smartphone,
  Play,
  Search,
  ExternalLink,
  Shield,
  RotateCw,
  Clock,
  Sparkles,
  Lock,
  Camera,
  Check,
  Plus,
  ArrowLeft,
  ArrowRight,
  Home,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const MobileWindowsScreen: React.FC = () => {
  const { accounts, proxies, extensions, openMobileBrowser, addToast } = useTikTokDesk();

  const [searchAccount, setSearchAccount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isPortrait, setIsPortrait] = useState(true);
  const [activeTab, setActiveTab] = useState<'tiktok' | 'creator' | 'inbox' | 'analytics' | 'profile'>('tiktok');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(1485); // 00:24:45

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const filteredAccounts = accounts.filter(
    (a) =>
      a.username.toLowerCase().includes(searchAccount.toLowerCase()) ||
      a.clientName.toLowerCase().includes(searchAccount.toLowerCase())
  );

  const assignedProxy = proxies.find((p) => p.id === selectedAccount?.proxyId);
  const assignedExtensions = extensions.filter((e) =>
    selectedAccount?.assignedExtensions.includes(e.id)
  );

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mobile Browser Windows</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated mobile-style browser windows with isolated profiles, tabs, cookies, and session timers
          </p>
        </div>
        <button
          onClick={() => selectedAccount && openMobileBrowser(selectedAccount)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 transition-all self-start sm:self-auto"
        >
          <Play className="w-4 h-4 stroke-[3]" />
          <span>Launch Full Window</span>
        </button>
      </div>

      {/* Main Grid: Left Select Account, Center Dedicated Viewport, Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Section 1: Left Account Selector (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Select Account ({accounts.length})
          </span>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search account..."
              value={searchAccount}
              onChange={(e) => setSearchAccount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {filteredAccounts.map((acc) => {
              const isSelected = acc.id === selectedAccountId;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FE2C55] bg-rose-50/20 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={acc.avatarUrl}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{acc.username}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{acc.clientName}</span>
                    </div>
                  </div>

                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      acc.status === 'active'
                        ? 'bg-emerald-500'
                        : acc.status === 'paused'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Center Dedicated Mobile Browser Viewport (5 cols) */}
        {selectedAccount && (
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center">
            {/* Browser top navigation bar */}
            <div className="w-full bg-slate-900 rounded-lg p-2 mb-3 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ArrowLeft className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <ArrowRight className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <RotateCw className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <Home className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>

              <div className="flex-1 mx-2 bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 truncate border border-slate-800 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">https://www.tiktok.com/{selectedAccount.username}</span>
              </div>

              <button
                onClick={() => setIsPortrait(!isPortrait)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Rotate Screen"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>

            {/* Mobile Viewport Simulation */}
            <div
              className={`bg-black rounded-[32px] p-2.5 border-4 border-slate-800 text-white relative shadow-2xl flex flex-col transition-all duration-300 ${
                isPortrait ? 'w-[300px] h-[540px]' : 'w-[540px] h-[300px]'
              }`}
            >
              {/* Screen Content */}
              <div className="flex-1 rounded-[22px] overflow-hidden relative flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 select-none">
                {/* Header tabs */}
                <div className="h-9 px-3 flex items-center justify-between text-[11px] font-bold z-10">
                  <span className="text-[10px] text-white/70">9:41</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60">Following</span>
                    <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                  </div>
                  <Search className="w-3.5 h-3.5 text-white/80" />
                </div>

                {/* Video Mock Info */}
                <div className="flex-1 flex flex-col justify-end p-3 pb-12 relative">
                  {/* Floating Action Icons */}
                  <div className="absolute right-2 bottom-14 flex flex-col items-center gap-2.5">
                    <img
                      src={selectedAccount.avatarUrl}
                      alt=""
                      className="w-7 h-7 rounded-full border border-white object-cover"
                    />
                    <div className="flex flex-col items-center">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      <span className="text-[9px] text-white">128.4K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                      <span className="text-[9px] text-white">1,420</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-[9px] text-white">Save</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center animate-spin">
                      <Music className="w-3 h-3 text-[#FE2C55]" />
                    </div>
                  </div>

                  <div className="max-w-[75%] space-y-1">
                    <span className="font-bold text-xs block">{selectedAccount.username}</span>
                    <p className="text-[10px] leading-tight text-white/90">
                      Amazing smart gadget unboxing! Check the link in bio 🔥 #tiktokmademebuyit #gadgets
                    </p>
                    <div className="text-[9px] text-white/60 flex items-center gap-1">
                      <Music className="w-2.5 h-2.5 text-[#FE2C55]" />
                      <span className="truncate">original sound - {selectedAccount.displayName}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom App Bar */}
                <div className="h-10 bg-black/90 absolute bottom-0 inset-x-0 flex items-center justify-around text-[9px] text-white/70">
                  <span className="text-white font-bold">Home</span>
                  <span>Friends</span>
                  <div className="w-6 h-5 bg-gradient-to-r from-cyan-400 via-white to-pink-500 rounded flex items-center justify-center text-black font-bold text-xs">
                    +
                  </div>
                  <span>Inbox</span>
                  <span>Profile</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Right Controls & Settings (4 cols) */}
        {selectedAccount && (
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2.5">
                Quick Actions
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Go to TikTok', tab: 'tiktok' },
                  { label: 'Creator Studio', tab: 'creator' },
                  { label: 'Open Inbox', tab: 'inbox' },
                  { label: 'Open Analytics', tab: 'analytics' },
                  { label: 'Open Profile', tab: 'profile' },
                  { label: 'Take Screenshot', action: () => addToast('success', 'Screenshot', 'Viewport captured.') },
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (act.action) act.action();
                      else if (act.tab) setActiveTab(act.tab as any);
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium text-left truncate flex items-center justify-between"
                  >
                    <span className="truncate">{act.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Session Timer & Window Controls */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Session Timer & Window
                </span>
                <span className="text-xs font-mono font-bold text-[#FE2C55]">
                  {formatTimer(sessionSecs)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setIsAutoScrolling(!isAutoScrolling);
                    addToast(
                      isAutoScrolling ? 'info' : 'success',
                      isAutoScrolling ? 'Auto Scroll Stopped' : 'Auto Scroll Started',
                      'Simulating human feed pacing.'
                    );
                  }}
                  className={`p-2 rounded-lg border text-center font-semibold transition-colors ${
                    isAutoScrolling
                      ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isAutoScrolling ? 'Pause Auto Scroll' : 'Start Auto Scroll'}
                </button>

                <button
                  onClick={() => setIsPortrait(!isPortrait)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold text-center"
                >
                  Rotate Screen
                </button>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span>Assigned Proxy:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[150px]">
                    {assignedProxy?.name || 'Direct Connection'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Location:</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-[150px]">
                    {selectedAccount.browserProfileId}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Extensions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                Active Extensions ({assignedExtensions.length})
              </span>
              <div className="space-y-1.5">
                {assignedExtensions.map((ext) => (
                  <div
                    key={ext.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Shield className="w-3.5 h-3.5 text-[#FE2C55]" />
                      <span className="font-medium text-slate-800 truncate">{ext.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
