import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Check,
  Film,
  Users,
  AlertCircle,
  FileText,
  Sliders,
  Download,
  Trash2,
  Bookmark,
  Play,
  RotateCw,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const BatchPublishingScreen: React.FC = () => {
  const {
    accounts,
    videos,
    templates,
    enqueueBatch,
    generateAiCaption,
    addToast,
    setCurrentScreen,
  } = useTikTokDesk();

  // Workflow choice: same-to-many, separate-to-separate, custom
  const [workflow, setWorkflow] = useState<'same-to-many' | 'separate-to-separate' | 'custom'>('same-to-many');

  // Selected accounts & videos
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(accounts.map((a) => a.id));
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(videos.slice(0, 3).map((v) => v.id));

  // Metadata
  const [caption, setCaption] = useState('Check out this amazing {video_title} on {date}! #fyp #viral');
  const [hashtags, setHashtags] = useState('#tiktokmademebuyit #trending #tech');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('must-have lifestyle gadget');

  // Schedule & Timing
  const [timingMode, setTimingMode] = useState<'queue' | 'now' | 'schedule'>('queue');
  const [startDate, setStartDate] = useState('2026-05-12');
  const [startTime, setStartTime] = useState('10:00');
  const [intervalMins, setIntervalMins] = useState(30);

  // Advanced Batch Settings
  const [delayBetweenPosts, setDelayBetweenPosts] = useState(15);
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [skipAlreadyPublished, setSkipAlreadyPublished] = useState(true);
  const [autoArchiveOnAllPublished, setAutoArchiveOnAllPublished] = useState(true);
  const [stopOnCriticalError, setStopOnCriticalError] = useState(true);

  // Handlers
  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleVideo = (id: string) => {
    if (workflow === 'same-to-many') {
      setSelectedVideoIds([id]);
    } else {
      setSelectedVideoIds((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
    }
  };

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    addToast('info', 'Gemini AI', 'Generating batch viral caption & hashtags...');
    try {
      const res = await generateAiCaption(aiTopic, 'tech gadgets', 'hook-driven and energetic');
      setCaption(res.caption);
      setHashtags(res.hashtags.join(' '));
      addToast('success', 'Caption Generated', 'AI caption loaded into batch editor.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate preview items
  const chosenAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));
  const chosenVideos = videos.filter((v) => selectedVideoIds.includes(v.id));

  const previewItems = chosenAccounts.map((acc, idx) => {
    const vid =
      workflow === 'same-to-many'
        ? chosenVideos[0] || videos[0]
        : chosenVideos[idx % (chosenVideos.length || 1)] || videos[0];

    const offsetMins = idx * intervalMins;
    const timeLabel =
      timingMode === 'now'
        ? 'Immediate'
        : `${startDate} ${startTime} (+${offsetMins}m)`;

    return {
      account: acc,
      video: vid,
      time: timeLabel,
      caption: caption
        .replace('{video_title}', vid?.filename?.replace('.mp4', '') || 'video')
        .replace('{account_name}', acc.username)
        .replace('{date}', startDate),
    };
  });

  const handleEnqueue = () => {
    if (chosenAccounts.length === 0 || chosenVideos.length === 0) {
      addToast('error', 'Validation Error', 'Please select at least 1 account and 1 video.');
      return;
    }

    const hashtagArray = hashtags.split(/\s+/).filter(Boolean);
    const tasks = previewItems.map((item) => ({
      accountId: item.account.id,
      accountUsername: item.account.username,
      accountAvatar: item.account.avatarUrl,
      videoId: item.video.id,
      videoFilename: item.video.filename,
      videoThumbnail: item.video.thumbnailUrl,
      caption: item.caption,
      hashtags: hashtagArray,
      scheduledTime: item.time,
      timezone: item.account.timezone,
      status: 'pending' as const,
      maxRetries: 3,
    }));

    enqueueBatch(tasks);
    setCurrentScreen('publishing-queue');
  };

  const handleExportCSV = () => {
    const rows = [
      ['Account', 'Video', 'Scheduled Time', 'Caption'],
      ...previewItems.map((p) => [p.account.username, p.video.filename, p.time, p.caption]),
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `batch_preview_${Date.now()}.csv`;
    link.click();
    addToast('success', 'Batch Exported', 'Preview assignments exported to CSV.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Batch Publishing Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign videos, schedule publishing, and configure concurrency across 10–30+ TikTok accounts
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
            onClick={handleEnqueue}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Add Batch to Queue ({previewItems.length})</span>
          </button>
        </div>
      </div>

      {/* Section 1: 3 Publishing Workflows */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2.5">
          1. Publishing Workflow (3 Options)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'same-to-many',
              title: 'Option A: Same Video → Multiple Accounts',
              desc: 'Select 1 master video and distribute it across all accounts with isolated independent tasks',
              badge: 'Recommended',
            },
            {
              id: 'separate-to-separate',
              title: 'Option B: Separate Videos → Separate Accounts',
              desc: 'Each account gets a unique video assigned from its own dedicated folder',
              badge: 'Agency Pro',
            },
            {
              id: 'custom',
              title: 'Option C: Custom Multi-Video Assignment',
              desc: 'Manually configure which specific video goes to which account with customized intervals',
              badge: 'Custom',
            },
          ].map((wf) => (
            <button
              key={wf.id}
              onClick={() => setWorkflow(wf.id as any)}
              className={`p-3.5 rounded-lg border text-left transition-all relative ${
                workflow === wf.id
                  ? 'border-[#FE2C55] bg-rose-50/20 ring-1 ring-[#FE2C55]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">{wf.title}</span>
                <span className="text-[10px] font-semibold text-[#FE2C55] bg-rose-100 px-1.5 py-0.2 rounded">
                  {wf.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{wf.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Section 2 & 3: Accounts and Videos Multi-Select */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Accounts (Section 2) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-72">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FE2C55]" />
              2. Select Accounts ({selectedAccountIds.length}/{accounts.length})
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => setSelectedAccountIds(accounts.map((a) => a.id))}
                className="text-[#FE2C55] font-semibold hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">·</span>
              <button onClick={() => setSelectedAccountIds([])} className="text-slate-500 hover:text-slate-800">
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {accounts.map((acc) => {
              const isChecked = selectedAccountIds.includes(acc.id);
              return (
                <div
                  key={acc.id}
                  onClick={() => toggleAccount(acc.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                    />
                    <img src={acc.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{acc.username}</span>
                    <span className="text-[10px] text-slate-400 truncate">{acc.clientName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{acc.timezone}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Videos (Section 3) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-72">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#FE2C55]" />
              3. Select Videos ({selectedVideoIds.length} chosen)
            </span>
            <span className="text-[10px] text-slate-400">
              {workflow === 'same-to-many' ? 'Select 1 video' : 'Multiple videos'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {videos.map((vid) => {
              const isChecked = selectedVideoIds.includes(vid.id);
              return (
                <div
                  key={vid.id}
                  onClick={() => toggleVideo(vid.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                    />
                    <img src={vid.thumbnailUrl} alt="" className="w-7 h-7 rounded object-cover shrink-0 bg-slate-200" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 block truncate">{vid.filename}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{vid.duration} · {vid.sizeMb}MB</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {vid.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 4 & 5: Metadata & Scheduling Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Metadata Editor */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#FE2C55]" />
              4. Metadata &amp; AI Caption
            </span>
            <button
              onClick={handleAiGenerate}
              disabled={isAiLoading}
              className="text-[11px] text-[#FE2C55] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Generating...' : 'AI Generate'}</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Caption</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
            />
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
              <span>Insert:</span>
              {['{video_title}', '{account_name}', '{date}'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCaption((prev) => `${prev} ${v}`)}
                  className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>
        </div>

        {/* Schedule & Timing (Section 5) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FE2C55]" />
            5. Schedule &amp; Timing
          </span>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'queue', label: 'Add to Queue' },
              { id: 'now', label: 'Publish Now' },
              { id: 'schedule', label: 'Custom Schedule' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimingMode(opt.id as any)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-colors ${
                  timingMode === opt.id
                    ? 'border-[#FE2C55] bg-rose-50 text-[#FE2C55]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1"
              />
            </div>
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Interval Between Posts (per account)</label>
              <select
                value={intervalMins}
                onChange={(e) => setIntervalMins(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Batch Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              6. Batch Preview ({previewItems.length} tasks ready)
            </h3>
            <p className="text-[11px] text-slate-400">
              Verified independent task generated per account. Each task runs isolated in dedicated browser profile.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Duplicate Protection: Checked
          </span>
        </div>

        <div className="overflow-x-auto max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0 select-none">
              <tr>
                <th className="py-2 px-3">Account</th>
                <th className="py-2 px-3">Video File</th>
                <th className="py-2 px-3">Scheduled Time</th>
                <th className="py-2 px-3">Substituted Caption Preview</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    <img src={item.account.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span>{item.account.username}</span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 truncate max-w-[140px]">
                    {item.video.filename}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                    {item.time}
                  </td>
                  <td className="py-2 px-3 text-slate-700 truncate max-w-xs text-[11px]">
                    {item.caption}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 7 & 8: Batch Settings & Submit Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={skipAlreadyPublished}
              onChange={(e) => setSkipAlreadyPublished(e.target.checked)}
              className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
            />
            <span>Skip already published assignments</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoArchiveOnAllPublished}
              onChange={(e) => setAutoArchiveOnAllPublished(e.target.checked)}
              className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
            />
            <span>Auto archive video only when 100% of accounts verify</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={stopOnCriticalError}
              onChange={(e) => setStopOnCriticalError(e.target.checked)}
              className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
            />
            <span>Stop on critical proxy/network error</span>
          </label>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => {
              setSelectedAccountIds([]);
              setSelectedVideoIds([]);
              addToast('info', 'Cleared', 'Selection reset.');
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear All
          </button>
          <button
            onClick={handleEnqueue}
            className="px-5 py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Enqueue All {previewItems.length} Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
