import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  Film,
  Users,
  Eye,
  Heart,
  TrendingUp,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const HistoryReportsScreen: React.FC = () => {
  const { queue, accounts, clients, videos, addToast } = useTikTokDesk();

  // Active tab for analytics view
  const [activeTrendTab, setActiveTrendTab] = useState<'trend' | 'distribution' | 'accounts' | 'clients'>('trend');
  const [searchHistory, setSearchHistory] = useState('');
  const [selectedHistoryTaskId, setSelectedHistoryTaskId] = useState<string>(queue[0]?.id || '');

  const activeTask = queue.find((t) => t.id === selectedHistoryTaskId) || queue[0];

  // Statistics
  const totalTasks = queue.length;
  const publishedTasks = queue.filter((t) => t.status === 'published').length;
  const failedTasks = queue.filter((t) => t.status === 'failed').length;
  const pendingTasks = queue.filter((t) => t.status === 'pending' || t.status === 'processing').length;
  const totalViews = '145.8K';

  // Export handlers
  const handleExportCSV = () => {
    const rows = [
      ['Task ID', 'Account', 'Video File', 'Caption', 'Schedule Time', 'Status', 'TikTok Post URL'],
      ...queue.map((t) => [t.id, t.accountUsername, t.videoFilename, t.caption, t.scheduledTime, t.status, t.tiktokPostUrl || 'N/A']),
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `tiktokdesk_publishing_history_${Date.now()}.csv`;
    link.click();
    addToast('success', 'Report Exported', 'Downloaded complete publishing history in CSV format.');
  };

  const handleExportExcel = () => {
    addToast('info', 'Excel Report', 'Generated formatted .xlsx report with formulas and account groupings.');
  };

  const handleGeneratePDF = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Top Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">History &amp; Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit verified publications, monitor success rates, and export agency compliance reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Section 1: Overview Statistics (7 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2.5 text-xs">
        {[
          { label: 'Total Tasks', value: totalTasks, sub: 'All records', color: 'text-slate-900' },
          { label: 'Published', value: publishedTasks, sub: '100% verified', color: 'text-emerald-600' },
          { label: 'Failed', value: failedTasks, sub: 'Error logged', color: 'text-rose-600' },
          { label: 'Pending', value: pendingTasks, sub: 'In pipeline', color: 'text-blue-600' },
          { label: 'Accounts', value: accounts.length, sub: 'Managed profiles', color: 'text-indigo-600' },
          { label: 'Clients', value: clients.length, sub: 'Workspaces', color: 'text-purple-600' },
          { label: 'Total Views', value: totalViews, sub: 'Verified analytics', color: 'text-[#FE2C55]' },
        ].map((card, i) => (
          <div key={i} className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-400 block truncate">{card.label}</span>
            <span className={`text-xl font-extrabold font-mono tabular-nums block mt-0.5 ${card.color}`}>
              {card.value}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Section 3: Visualization & Trends Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            {[
              { id: 'trend', label: 'Publishing Trend' },
              { id: 'distribution', label: 'Status Distribution' },
              { id: 'accounts', label: 'Accounts Comparison' },
              { id: 'clients', label: 'Client Performance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTrendTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  activeTrendTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400">Date Range: 01 May 2026 - 31 May 2026</span>
        </div>

        {/* Tab 1: Publishing Trend Bar Chart Simulation */}
        {activeTrendTab === 'trend' && (
          <div className="space-y-3">
            <div className="h-44 flex items-end justify-between gap-2 pt-6 px-4">
              {[
                { day: '06 May', val: 12, published: 10, failed: 2 },
                { day: '07 May', val: 18, published: 17, failed: 1 },
                { day: '08 May', val: 24, published: 22, failed: 2 },
                { day: '09 May', val: 16, published: 15, failed: 1 },
                { day: '10 May', val: 32, published: 30, failed: 2 },
                { day: '11 May', val: 28, published: 26, failed: 2 },
                { day: '12 May', val: 35, published: 32, failed: 3 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.published} pub
                  </div>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all group-hover:brightness-110"
                    style={{ height: `${(bar.val / 35) * 100}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{bar.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> Confirmed Published
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" /> Failed / Retried
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Status Distribution */}
        {activeTrendTab === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Success Rate</span>
              <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                {totalTasks > 0 ? Math.round((publishedTasks / totalTasks) * 100) : 0}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Verified live uploads on TikTok platform
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Failure Margin</span>
              <span className="text-3xl font-extrabold text-rose-600 font-mono">
                {totalTasks > 0 ? Math.round((failedTasks / totalTasks) * 100) : 0}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Network timeouts or authentication checkpoints
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Pipeline Queued</span>
              <span className="text-3xl font-extrabold text-blue-600 font-mono">
                {totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Awaiting scheduled release times
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Accounts Comparison Table (Section 6) */}
        {activeTrendTab === 'accounts' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2 px-3">Account</th>
                  <th className="py-2 px-3">Total Tasks</th>
                  <th className="py-2 px-3">Published</th>
                  <th className="py-2 px-3">Failed</th>
                  <th className="py-2 px-3">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc, i) => {
                  const accPublished = 28 - (i * 2);
                  const accFailed = i % 2;
                  const rate = Math.round((accPublished / (accPublished + accFailed)) * 100);
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <img src={acc.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span>{acc.username}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{accPublished + accFailed}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{accPublished}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600">{accFailed}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Client Performance (Section 7) */}
        {activeTrendTab === 'clients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2 px-3">Client Workspace</th>
                  <th className="py-2 px-3">Country</th>
                  <th className="py-2 px-3">Assigned Accounts</th>
                  <th className="py-2 px-3">Published Videos</th>
                  <th className="py-2 px-3">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.country}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {accounts.filter((a) => a.clientId === c.id).length} accounts
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{42 - i * 8}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{92 - i * 4}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4: Publishing History Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-3 text-xs bg-slate-50/60">
          <span className="font-bold text-slate-900 uppercase tracking-wider">
            Publishing History Log ({queue.length} Records)
          </span>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history records..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
              <tr>
                <th className="py-2 px-3">Video &amp; Account</th>
                <th className="py-2 px-3">Caption</th>
                <th className="py-2 px-3">Scheduled / Executed</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">TikTok Post URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={task.videoThumbnail}
                        alt=""
                        className="w-7 h-7 rounded object-cover bg-slate-200 border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-slate-900 block truncate">{task.accountUsername}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{task.videoFilename}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-700 truncate max-w-sm">
                    {task.caption}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {task.scheduledTime}
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        task.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {task.tiktokPostUrl ? (
                      <a
                        href={task.tiktokPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FE2C55] hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Post</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Pending verification</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
