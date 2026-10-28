import React from 'react';
import {
  LayoutDashboard,
  Users,
  Smartphone,
  Film,
  Layers,
  Tag,
  Calendar,
  ListOrdered,
  Archive,
  BarChart3,
  Briefcase,
  Shield,
  Puzzle,
  Timer,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { ScreenId } from '../types/tiktokdesk';
import { useTikTokDesk } from '../context/TikTokDeskContext';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, accounts, queue, errors, videos } = useTikTokDesk();

  const activeErrorsCount = errors.filter((e) => e.status === 'Needs Attention').length;
  const pendingQueueCount = queue.filter((t) => t.status === 'pending' || t.status === 'processing').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Users, badge: accounts.length },
    { id: 'mobile-windows', label: 'Mobile Windows', icon: Smartphone },
    { id: 'video-library', label: 'Video Library', icon: Film, badge: videos.length },
    { id: 'batch-publishing', label: 'Batch Publishing', icon: Layers },
    { id: 'metadata', label: 'Metadata', icon: Tag },
    { id: 'scheduler', label: 'Scheduler', icon: Calendar },
    {
      id: 'publishing-queue',
      label: 'Publishing Queue',
      icon: ListOrdered,
      badge: pendingQueueCount > 0 ? pendingQueueCount : undefined,
      badgeColor: 'bg-emerald-500',
    },
    { id: 'archive', label: 'Archive Manager', icon: Archive },
    { id: 'history-reports', label: 'History & Reports', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Briefcase },
    { id: 'proxy-vpn', label: 'Proxy & VPN', icon: Shield },
    { id: 'extensions', label: 'Extensions', icon: Puzzle },
    { id: 'session-timer', label: 'Session Timer', icon: Timer },
    {
      id: 'error-center',
      label: 'Error Center',
      icon: AlertTriangle,
      badge: activeErrorsCount > 0 ? activeErrorsCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-[#121620] text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800">
      {/* Brand Logo Header */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-800/80">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00F2FE] via-[#FE2C55] to-[#FF0050] flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.9 2.9 0 0 1 2.316-4.643c.33 0 .647.056.942.16V9.397a6.347 6.347 0 0 0-.942-.072 6.344 6.344 0 0 0-6.344 6.345 6.344 6.344 0 0 0 6.344 6.344 6.342 6.342 0 0 0 6.33-6.195V8.128a8.212 8.212 0 0 0 4.77 1.524V6.207a4.83 4.83 0 0 1-1-.479v.958z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            TikTokDesk
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 bg-[#FE2C55]/20 text-[#FE2C55] rounded border border-[#FE2C55]/30">PRO</span>
          </span>
          <span className="text-[10px] text-slate-400">Multi-Account Automation</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#FE2C55] text-white shadow-md shadow-[#FE2C55]/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full tabular-nums ${
                    isActive
                      ? 'bg-black/30 text-white'
                      : item.badgeColor
                      ? `${item.badgeColor} text-white`
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Quick Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">Local Desktop Node</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">v2.4.0</span>
      </div>
    </aside>
  );
};
