import React from 'react';
import {
  Users,
  Film,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Play,
  RotateCw,
  Folder,
  ArrowRight,
  Shield,
  Puzzle,
  BarChart3,
  Settings,
  ExternalLink,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const DashboardScreen: React.FC = () => {
  const {
    accounts,
    videos,
    queue,
    schedules,
    errors,
    setCurrentScreen,
    setFilterParam,
    setIsCreatePostOpen,
    openMobileBrowser,
    scanFolder,
    addToast,
  } = useTikTokDesk();

  // Quick statistics calculation from real data
  const totalAccounts = accounts.length;
  const totalVideos = videos.length;
  const scheduledCount = schedules.length + queue.filter((t) => t.status === 'pending').length;
  const publishedCount = queue.filter((t) => t.status === 'published').length;
  const failedCount = queue.filter((t) => t.status === 'failed').length + errors.filter((e) => e.status === 'Failed' || e.status === 'Needs Attention').length;

  const activeAccountsCount = accounts.filter((a) => a.status === 'active').length;
  const pausedAccountsCount = accounts.filter((a) => a.status === 'paused').length;
  const attentionAccountsCount = accounts.filter((a) => a.status === 'attention').length;

  const upcomingTasks = queue
    .filter((t) => t.status === 'pending' || t.status === 'processing' || t.status === 'verification')
    .slice(0, 5);

  const quickActions = [
    { label: 'Add Account', icon: Users, screen: 'accounts', action: () => setCurrentScreen('accounts') },
    { label: 'Scan Videos', icon: Film, screen: 'video-library', action: () => setCurrentScreen('video-library') },
    { label: 'Create Batch', icon: Layers, screen: 'batch-publishing', action: () => setCurrentScreen('batch-publishing') },
    { label: 'Open Scheduler', icon: Calendar, screen: 'scheduler', action: () => setCurrentScreen('scheduler') },
    { label: 'Manage Proxies', icon: Shield, screen: 'proxy-vpn', action: () => setCurrentScreen('proxy-vpn') },
    { label: 'Manage Extensions', icon: Puzzle, screen: 'extensions', action: () => setCurrentScreen('extensions') },
    { label: 'View Reports', icon: BarChart3, screen: 'history-reports', action: () => setCurrentScreen('history-reports') },
    { label: 'App Settings', icon: Settings, screen: 'settings', action: () => setCurrentScreen('settings') },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Main Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back! Manage your TikTok accounts, scheduled batches, and isolated browser profiles.
          </p>
        </div>
        <button
          onClick={() => setIsCreatePostOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* 5 Quick Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Accounts */}
        <div
          onClick={() => setCurrentScreen('accounts')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Total Accounts</span>
            <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalAccounts}</div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">{activeAccountsCount} Active right now</div>
        </div>

        {/* Total Videos */}
        <div
          onClick={() => setCurrentScreen('video-library')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Total Videos</span>
            <Film className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalVideos}</div>
          <div className="text-[10px] text-slate-500 mt-1">Ready in local folders</div>
        </div>

        {/* Scheduled Posts */}
        <div
          onClick={() => setCurrentScreen('scheduler')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Scheduled Posts</span>
            <Calendar className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 font-mono tabular-nums">{scheduledCount}</div>
          <div className="text-[10px] text-purple-500 mt-1">Calendar queue active</div>
        </div>

        {/* Published Posts */}
        <div
          onClick={() => {
            setFilterParam('published');
            setCurrentScreen('publishing-queue');
          }}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Published Posts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{publishedCount}</div>
          <div className="text-[10px] text-emerald-600 mt-1">100% verified live</div>
        </div>

        {/* Failed / Attention Posts */}
        <div
          onClick={() => {
            setFilterParam('failed');
            setCurrentScreen('error-center');
          }}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Failed / Errors</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">{failedCount}</div>
          <div className="text-[10px] text-rose-500 mt-1 font-medium">Click to open Error Center</div>
        </div>
      </div>

      {/* Main Grid: Upcoming Posts + Account Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Upcoming Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Posts Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Posts ({upcomingTasks.length})
                </h3>
                <p className="text-[11px] text-slate-400">Next scheduled publishing tasks with assigned profiles</p>
              </div>
              <button
                onClick={() => setCurrentScreen('publishing-queue')}
                className="text-xs text-[#FE2C55] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No pending tasks in queue. Click "+ Create New Post" to schedule videos.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={task.videoThumbnail}
                          alt=""
                          className="w-12 h-12 rounded object-cover bg-slate-200 border border-slate-200"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white/90 fill-white" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.accountAvatar}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="font-bold text-slate-900 truncate">{task.accountUsername}</span>
                          <span className="text-[10px] text-slate-400 truncate font-mono">
                            {task.videoFilename}
                          </span>
                        </div>
                        <p className="text-slate-600 truncate mt-0.5 max-w-md">{task.caption}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.scheduledTime}</span>
                          <span>·</span>
                          <span className="font-mono">{task.timezone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          task.status === 'processing'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : task.status === 'verification'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {task.status}
                      </span>
                      <button
                        onClick={() => {
                          const acc = accounts.find((a) => a.id === task.accountId);
                          if (acc) openMobileBrowser(acc);
                        }}
                        className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                        title="Open account browser"
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Folder Summary (Agency Key Section) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Video Folder Summary
                </h3>
                <p className="text-[11px] text-slate-400">
                  Dedicated local storage folder and detected MP4 video counts per account
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('video-library')}
                className="text-xs text-[#FE2C55] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Open Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {accounts.slice(0, 5).map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => {
                    setCurrentScreen('video-library');
                  }}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 block truncate">{acc.username}</span>
                      <span className="font-mono text-[10px] text-slate-400 block truncate">
                        {acc.videoFolder}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-semibold text-slate-700 tabular-nums">
                      {acc.detectedVideosCount} Videos
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scanFolder(acc.id, acc.videoFolder, true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
                      title="Scan Folder Now"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Account Status Chart & Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Account Status Gauge / Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Account Status ({totalAccounts})
            </h3>
            <div className="flex items-center gap-4 py-2">
              {/* Circular Metric Display */}
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-emerald-500 border-r-amber-500 border-b-rose-500 flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-extrabold text-slate-900 font-mono tabular-nums leading-none">
                  {totalAccounts}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Accounts</span>
              </div>

              {/* Status List with click to filter */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div
                  onClick={() => {
                    setFilterParam('active');
                    setCurrentScreen('accounts');
                  }}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Active
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{activeAccountsCount}</span>
                </div>

                <div
                  onClick={() => {
                    setFilterParam('paused');
                    setCurrentScreen('accounts');
                  }}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Paused
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{pausedAccountsCount}</span>
                </div>

                <div
                  onClick={() => {
                    setFilterParam('attention');
                    setCurrentScreen('accounts');
                  }}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Needs Attention
                  </span>
                  <span className="font-mono font-bold text-rose-600 tabular-nums">{attentionAccountsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (8 Shortcut Buttons) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={qa.action}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#FE2C55] shrink-0" />
                    <span className="truncate">{qa.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Recent Activity
            </h3>
            <div className="space-y-2.5 text-xs">
              {([] as { text: string; time: string; type: string }[]).length === 0 && (
                <p className="text-slate-500">No activity yet. Add an account and schedule a post to see activity here.</p>
              )}
              {([] as { text: string; time: string; type: string }[]).map((act, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      act.type === 'success'
                        ? 'bg-emerald-500'
                        : act.type === 'error'
                        ? 'bg-rose-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-700 leading-snug">{act.text}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
