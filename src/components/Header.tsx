import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Minus,
  Square,
  X,
  Play,
  Pause,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTikTokDesk } from '../context/TikTokDeskContext';

export const Header: React.FC = () => {
  const {
    globalSearch,
    setGlobalSearch,
    setIsCreatePostOpen,
    isQueueRunning,
    startQueue,
    stopQueue,
    queue,
    errors,
    setCurrentScreen,
    addToast,
  } = useTikTokDesk();

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(`${dateStr} · ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = queue.filter((t) => t.status === 'pending' || t.status === 'processing').length;
  const attentionCount = errors.filter((e) => e.status === 'Needs Attention').length;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Search input */}
      <div className="flex items-center gap-3 w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts, videos, tasks..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FE2C55] focus:bg-white transition-colors"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Center: Live status summary */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <button
          onClick={() => setCurrentScreen('publishing-queue')}
          className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Queue:</span>
          <span className="font-semibold tabular-nums text-slate-900">{pendingCount} Active</span>
        </button>

        {attentionCount > 0 && (
          <button
            onClick={() => setCurrentScreen('error-center')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg text-rose-700 font-medium transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{attentionCount} Errors Need Attention</span>
          </button>
        )}

        <button
          onClick={isQueueRunning ? stopQueue : startQueue}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors text-xs ${
            isQueueRunning
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
          }`}
          title={isQueueRunning ? 'Pause Queue Scheduler' : 'Start Queue Automation'}
        >
          {isQueueRunning ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
          <span>{isQueueRunning ? 'Queue Running' : 'Queue Paused'}</span>
        </button>
      </div>

      {/* Right: Date, Create Post button, Notifications, Windows Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden md:block text-right">
          <div className="text-[11px] font-medium text-slate-500 tabular-nums">{currentTime}</div>
        </div>

        <button
          onClick={() => setCurrentScreen('error-center')}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications and error center"
        >
          <Bell className="w-4 h-4" />
          {attentionCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FE2C55] rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Pink + Create New Post CTA Button */}
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Post</span>
        </button>

        {/* Simulated Windows 10/11 Window Controls */}
        <div className="flex items-center pl-2 ml-1 border-l border-slate-200">
          <button
            onClick={() => addToast('info', 'Window Minimized', 'TikTokDesk minimized to Windows system tray.')}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => addToast('info', 'Window Maximized', 'Desktop window toggled.')}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => addToast('warning', 'App Backgrounded', 'TikTokDesk running in background tray. Scheduling active.')}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Close to Tray"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
