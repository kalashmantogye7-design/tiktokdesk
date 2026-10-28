import React, { useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCw,
  Search,
  Smartphone,
  Sparkles,
  Camera,
  Trash2,
  Clock,
  ExternalLink,
  Shield,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const SessionTimerScreen: React.FC = () => {
  const { accounts, openMobileBrowser, addToast } = useTikTokDesk();

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [sessionTimerMinutes, setSessionTimerMinutes] = useState(15);
  const [whenTimeEnds, setWhenTimeEnds] = useState<'close' | 'minimize' | 'notify'>('close');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(180); // 3 mins

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const activeCount = accounts.filter((a) => a.sessionStatus === 'active').length;
  const idleCount = accounts.filter((a) => a.sessionStatus === 'idle').length;
  const closedCount = accounts.filter((a) => a.sessionStatus === 'closed').length;

  const handleApplyTimer = () => {
    if (!selectedAccount) { addToast('error', 'No Account', 'Add an account first.'); return; }
    setIsTimerRunning(true);
    addToast(
      'success',
      'Session Timer Active',
      `Session timer set to ${sessionTimerMinutes} mins for ${selectedAccount.username}. Action on end: ${whenTimeEnds}.`
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {accounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">No account yet. Go to Accounts and add your first account, then come back here to set a session timer.</div>
      )}
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Session Timer &amp; Assisted Browsing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervised browsing sessions, automated human pacing timers, and mobile profile window management
          </p>
        </div>

        <button
          onClick={() => selectedAccount && openMobileBrowser(selectedAccount)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
        >
          <Play className="w-4 h-4 stroke-[3]" />
          <span>Open Mobile Window</span>
        </button>
      </div>

      {/* Section 8: Active Sessions Overview (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Active Windows</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{activeCount}</span>
          <span className="text-[10px] text-slate-400">Foreground open</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Idle in Background</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">{idleCount}</span>
          <span className="text-[10px] text-slate-400">Ready to focus</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Closed / Profile Saved</span>
          <span className="text-2xl font-extrabold text-slate-700 font-mono tabular-nums">{closedCount}</span>
          <span className="text-[10px] text-slate-400">Cookies preserved</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Avg Session Time</span>
          <span className="text-2xl font-extrabold text-indigo-600 font-mono tabular-nums">18m 42s</span>
          <span className="text-[10px] text-slate-400">Natural dwell time</span>
        </div>
      </div>

      {/* Main Grid: Left Account Sessions List (4 cols), Center Controls & Timer (4 cols), Right Session Activity Log (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Section 1: Account List & Session Status (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Account Session Status ({accounts.length})
          </span>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {accounts.map((acc) => {
              const isSelected = acc.id === selectedAccountId;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'border-[#FE2C55] bg-rose-50/20' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <img src={acc.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{acc.username}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{acc.clientName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        acc.sessionStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : acc.sessionStatus === 'idle'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {acc.sessionStatus}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMobileBrowser(acc);
                      }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                      title="Launch window"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3 & 4: Session Controls & Timer Configuration (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Session Timer: {selectedAccount?.username}
            </span>
            <span className="font-mono text-xs font-bold text-[#FE2C55]">
              {Math.floor(elapsedSecs / 60)}m {elapsedSecs % 60}s
            </span>
          </div>

          {/* Duration selection */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 block">Session Duration</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSessionTimerMinutes(mins)}
                  className={`py-1.5 rounded-lg border font-semibold transition-colors ${
                    sessionTimerMinutes === mins
                      ? 'border-[#FE2C55] bg-rose-50 text-[#FE2C55]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Action on timer complete */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 block">When Session Timer Ends</label>
            <select
              value={whenTimeEnds}
              onChange={(e) => setWhenTimeEnds(e.target.value as any)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800"
            >
              <option value="close">Close Window (Save Cookies &amp; Tabs)</option>
              <option value="minimize">Minimize Window to Tray</option>
              <option value="notify">Keep Open &amp; Play Notification Sound</option>
            </select>
          </div>

          {/* Assisted Browsing Tools (Section 5) */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">Assisted Browsing Quick Tools</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => addToast('info', 'Assisted Scroll', 'Started natural pace scrolling (4s/video)')}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold text-left flex items-center justify-between"
              >
                <span>Auto-Scroll (5m)</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </button>
              <button
                onClick={() => addToast('success', 'Screenshot', 'Screenshot saved to D:\\TikTokDesk\\Screenshots\\')}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold text-left flex items-center justify-between"
              >
                <span>Screenshot</span>
                <Camera className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button
                onClick={() => addToast('info', 'Cache', 'Cleared browser disk cache.')}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-semibold text-left"
              >
                Clear Cache
              </button>
              <button
                onClick={() => addToast('warning', 'Cookies', 'Cleared cookies. Session invalidated.')}
                className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 text-rose-700 font-semibold text-left"
              >
                Clear Cookies
              </button>
            </div>
          </div>

          <button
            onClick={handleApplyTimer}
            className="w-full py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            Apply Timer to {selectedAccount?.username}
          </button>
        </div>

        {/* Section 7: Session Activity Log (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Session Activity Log
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Last 24 Hours</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 text-xs">
            {[
              { time: '01:35 PM', action: 'Window Opened', detail: `${selectedAccount?.username || 'No account yet'} isolated profile launched.` },
              { time: '01:36 PM', action: 'Profile Loaded', detail: 'Restored cookies and 2 open tabs.' },
              { time: '01:40 PM', action: 'Page Refreshed', detail: 'TikTok for-you feed refreshed.' },
              { time: '01:45 PM', action: 'Screenshot Taken', detail: 'Captured viewport to disk.' },
              { time: '01:50 PM', action: 'Window Closed', detail: 'Session duration 15m reached. Profile saved.' },
            ].map((log, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                </div>
                <p className="text-[11px] text-slate-600">{log.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
