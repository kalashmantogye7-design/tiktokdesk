import React, { useState } from 'react';
import {
  ListOrdered,
  Play,
  Pause,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Smartphone,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { QueueTask, QueueTaskStatus } from '../../types/tiktokdesk';

export const PublishingQueueScreen: React.FC = () => {
  const {
    queue,
    isQueueRunning,
    startQueue,
    stopQueue,
    retryTask,
    cancelTask,
    deleteTask,
    clearCompletedQueue,
    confirmTaskPublished,
    accounts,
    openMobileBrowser,
    addToast,
    filterParam,
  } = useTikTokDesk();

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>(filterParam || 'all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string>(queue[0]?.id || '');

  // Concurrency & delays
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [delaySecs, setDelaySecs] = useState(30);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editHashtags, setEditHashtags] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');

  const activeTask = queue.find((t) => t.id === activeTaskId) || queue[0];

  // Filtering
  const filteredQueue = queue.filter((t) => {
    const matchSearch =
      t.accountUsername.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.videoFilename.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.caption.toLowerCase().includes(searchFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Statistics
  const pendingCount = queue.filter((t) => t.status === 'pending').length;
  const processingCount = queue.filter((t) => t.status === 'processing').length;
  const verificationCount = queue.filter((t) => t.status === 'verification').length;
  const publishedCount = queue.filter((t) => t.status === 'published').length;
  const failedCount = queue.filter((t) => t.status === 'failed').length;
  const cancelledCount = queue.filter((t) => t.status === 'cancelled').length;

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredQueue.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredQueue.map((t) => t.id));
    }
  };

  const handleRetryFailed = () => {
    const failedTasks = queue.filter((t) => t.status === 'failed');
    failedTasks.forEach((t) => retryTask(t.id));
    addToast('info', 'Retrying Tasks', `Retrying ${failedTasks.length} failed task(s) with duplicate safety checks.`);
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title & Publish Control (Section 10) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Publishing Queue Control Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time task pipelines, verified uploads, retry recovery, and concurrency limits
          </p>
        </div>

        {/* Master Start / Stop Queue Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompletedQueue}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Clear Completed
          </button>

          <button
            onClick={isQueueRunning ? stopQueue : startQueue}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold shadow-md transition-all active:scale-95 ${
              isQueueRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isQueueRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isQueueRunning ? 'Stop Queue Processing' : 'Start Queue (Automatic)'}</span>
          </button>
        </div>
      </div>

      {/* Section 1 & 7: Filters & Live Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
        {[
          { id: 'all', label: 'All Tasks', count: queue.length, color: 'text-slate-900' },
          { id: 'pending', label: 'Pending', count: pendingCount, color: 'text-blue-600' },
          { id: 'processing', label: 'Processing', count: processingCount, color: 'text-amber-600' },
          { id: 'verification', label: 'Verification', count: verificationCount, color: 'text-purple-600' },
          { id: 'published', label: 'Published', count: publishedCount, color: 'text-emerald-600' },
          { id: 'failed', label: 'Failed', count: failedCount, color: 'text-rose-600' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setStatusFilter(item.id)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              statusFilter === item.id
                ? 'border-[#FE2C55] bg-rose-50/20 ring-1 ring-[#FE2C55]'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-medium block truncate">{item.label}</span>
            <span className={`text-xl font-extrabold font-mono tabular-nums ${item.color}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Bulk Actions Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by account, video filename, or caption..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>
        </div>

        {/* Bulk Action Buttons (Section 5) */}
        <div className="flex items-center gap-2">
          {failedCount > 0 && (
            <button
              onClick={handleRetryFailed}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-semibold flex items-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Failed ({failedCount})</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 pl-2 border-l border-slate-200">
            <span>Concurrency:</span>
            <select
              value={maxConcurrency}
              onChange={(e) => setMaxConcurrency(Number(e.target.value))}
              className="border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-800 font-semibold"
            >
              <option value={1}>1 Account</option>
              <option value={2}>2 Accounts</option>
              <option value={3}>3 Accounts</option>
              <option value={5}>5 Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Queue Table (8 cols), Right Task Preview & Logs (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Section 2: Queue Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3">Account</th>
                  <th className="py-2.5 px-3">Video File</th>
                  <th className="py-2.5 px-3">Caption</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((task) => {
                  const isCurrent = activeTaskId === task.id;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setActiveTaskId(task.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.accountAvatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <span className="font-bold text-slate-900 truncate">{task.accountUsername}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.videoThumbnail}
                            alt=""
                            className="w-7 h-7 rounded object-cover shrink-0 bg-slate-200"
                          />
                          <span className="font-mono text-slate-600 truncate max-w-[110px]">
                            {task.videoFilename}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-600 truncate max-w-[130px] block" title={task.caption}>
                          {task.caption}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {task.scheduledTime}
                      </td>

                      <td className="py-3 px-3 w-28">
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                task.status === 'published'
                                  ? 'bg-emerald-500'
                                  : task.status === 'failed'
                                  ? 'bg-rose-500'
                                  : 'bg-[#FE2C55]'
                              }`}
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block text-right">
                            {task.progressPercent}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            task.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'processing'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : task.status === 'verification'
                              ? 'bg-purple-100 text-purple-800'
                              : task.status === 'failed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {task.status === 'failed' && (
                            <button
                              onClick={() => retryTask(task.id)}
                              className="p-1 text-slate-600 hover:text-emerald-600 rounded"
                              title="Retry Task"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {task.status === 'pending' && (
                            <button
                              onClick={() => cancelTask(task.id)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded"
                              title="Cancel Task"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details, Live Preview & Logs Panel (4 cols) */}
        {activeTask && (
          <div className="lg:col-span-4 space-y-4">
            {/* Section 3 & 4: Task Details & Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Task #{activeTask.id}
                </span>
                <button
                  onClick={() => {
                    const acc = accounts.find((a) => a.id === activeTask.accountId);
                    if (acc) openMobileBrowser(acc);
                  }}
                  className="text-xs text-[#FE2C55] font-semibold hover:underline flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open Browser</span>
                </button>
              </div>

              {/* Video Thumbnail Preview */}
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                <img
                  src={activeTask.videoThumbnail}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
                {activeTask.tiktokPostUrl && (
                  <a
                    href={activeTask.tiktokPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 text-black text-[10px] font-bold rounded flex items-center gap-1 shadow"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View TikTok Post</span>
                  </a>
                )}
              </div>

              {/* Metadata details */}
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-semibold text-slate-900">{activeTask.accountUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Video File:</span>
                  <span className="font-mono text-slate-800">{activeTask.videoFilename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timezone:</span>
                  <span className="text-slate-700">{activeTask.timezone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Caption:</span>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 text-[11px] leading-tight">
                    {activeTask.caption}
                  </p>
                </div>
              </div>
              {activeTask.status === 'verification' && (
                <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50 space-y-2">
                  <p className="text-xs font-bold text-amber-800">Verification required</p>
                  <p className="text-[11px] text-amber-700 leading-snug">This web version does not auto-publish to TikTok. Publish the video on TikTok first, then paste the real post link here. The task will only become Published after you confirm it.</p>
                  <input
                    value={verifyUrl}
                    onChange={(e) => setVerifyUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@username/video/..."
                    className="w-full px-2 py-1.5 text-xs border border-amber-300 rounded bg-white"
                  />
                  <button
                    onClick={() => { if (confirmTaskPublished(activeTask.id, verifyUrl.trim())) setVerifyUrl(''); }}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                  >
                    Confirm Published
                  </button>
                </div>
              )}
            </div>

            {/* Section 6: Task Progress Log */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                6. Task Progress Log
              </span>
              <div className="bg-slate-950 text-slate-300 p-3 rounded-lg font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto">
                {activeTask.logs.map((log, i) => (
                  <div key={i} className="leading-tight flex items-start gap-1.5">
                    <span className="text-emerald-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
                {activeTask.errorReason && (
                  <div className="text-rose-400 pt-1 border-t border-slate-800 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{activeTask.errorReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
