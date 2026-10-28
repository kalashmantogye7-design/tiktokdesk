import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useTikTokDesk } from '../context/TikTokDeskContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTikTokDesk();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
        let borderClass = 'border-slate-200';
        let bgClass = 'bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
          borderClass = 'border-emerald-200';
          bgClass = 'bg-emerald-50/95';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-200';
          bgClass = 'bg-rose-50/95';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-200';
          bgClass = 'bg-amber-50/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200 ${borderClass} ${bgClass}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 truncate">{toast.title}</span>
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
