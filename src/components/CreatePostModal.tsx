import React, { useState } from 'react';
import {
  X,
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
  ChevronRight,
} from 'lucide-react';
import { useTikTokDesk } from '../context/TikTokDeskContext';

export const CreatePostModal: React.FC = () => {
  const {
    isCreatePostOpen,
    setIsCreatePostOpen,
    accounts,
    videos,
    templates,
    enqueueBatch,
    generateAiCaption,
    addToast,
    setCurrentScreen,
  } = useTikTokDesk();

  if (!isCreatePostOpen) return null;

  // Workflow option
  const [workflow, setWorkflow] = useState<'same-to-many' | 'separate-to-separate' | 'custom'>('same-to-many');
  
  // Selection
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(accounts.map((a) => a.id));
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(videos.slice(0, 1).map((v) => v.id));

  // Metadata
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [caption, setCaption] = useState(templates[0]?.caption || 'Check out this amazing {video_title}! 🔥 #fyp #viral');
  const [hashtags, setHashtags] = useState<string>(templates[0]?.hashtags.join(' ') || '#tiktokmademebuyit #viral #gadgets');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('smart home gadget');

  // Scheduling
  const [timingType, setTimingType] = useState<'queue' | 'now' | 'schedule'>('queue');
  const [scheduleDate, setScheduleDate] = useState('2026-05-12');
  const [scheduleTime, setScheduleTime] = useState('14:00');
  const [intervalMinutes, setIntervalMinutes] = useState(30);

  // Batch settings
  const [delayBetweenPosts, setDelayBetweenPosts] = useState(30);
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [skipAlreadyPublished, setSkipAlreadyPublished] = useState(true);

  // Toggle account
  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Toggle video
  const toggleVideo = (id: string) => {
    if (workflow === 'same-to-many') {
      setSelectedVideoIds([id]);
    } else {
      setSelectedVideoIds((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
    }
  };

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      setCaption(tmpl.caption);
      setHashtags(tmpl.hashtags.join(' '));
      addToast('info', 'Template Loaded', `Applied "${tmpl.name}"`);
    }
  };

  const handleAiGenerate = async () => {
    setIsGeneratingAi(true);
    addToast('info', 'AI Generator', 'Generating hook-driven caption & viral hashtags via Gemini...');
    try {
      const result = await generateAiCaption(aiTopic, 'tech gadgets', 'viral and high hook');
      setCaption(result.caption);
      setHashtags(result.hashtags.join(' '));
      addToast('success', 'AI Caption Ready', 'Generated caption with trending hashtags.');
    } catch {
      addToast('error', 'Generation Error', 'Failed to generate AI caption');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmitBatch = () => {
    if (selectedAccountIds.length === 0) {
      addToast('error', 'Validation Error', 'Select at least one TikTok account.');
      return;
    }
    if (selectedVideoIds.length === 0) {
      addToast('error', 'Validation Error', 'Select at least one video to publish.');
      return;
    }

    const hashtagArray = hashtags.split(/\s+/).filter((t) => t.trim().length > 0);
    const chosenAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));
    const chosenVideos = videos.filter((v) => selectedVideoIds.includes(v.id));

    const tasksToCreate: any[] = [];

    if (workflow === 'same-to-many') {
      const vid = chosenVideos[0] || videos[0];
      chosenAccounts.forEach((acc, idx) => {
        const substitutedCaption = caption
          .replace('{video_title}', vid.filename.replace('.mp4', ''))
          .replace('{account_name}', acc.username)
          .replace('{date}', scheduleDate);

        // Calculate offset time
        const offsetMins = idx * intervalMinutes;
        const timeLabel = timingType === 'now' 
          ? 'Immediate'
          : `${scheduleDate} ${scheduleTime} (+${offsetMins}m)`;

        tasksToCreate.push({
          accountId: acc.id,
          accountUsername: acc.username,
          accountAvatar: acc.avatarUrl,
          videoId: vid.id,
          videoFilename: vid.filename,
          videoThumbnail: vid.thumbnailUrl,
          caption: substitutedCaption,
          hashtags: hashtagArray,
          scheduledTime: timeLabel,
          timezone: acc.timezone,
          status: 'pending',
          maxRetries: 3,
        });
      });
    } else {
      // Separate videos or custom: assign 1:1 or cyclical
      chosenAccounts.forEach((acc, idx) => {
        const vid = chosenVideos[idx % chosenVideos.length];
        const substitutedCaption = caption
          .replace('{video_title}', vid.filename.replace('.mp4', ''))
          .replace('{account_name}', acc.username)
          .replace('{date}', scheduleDate);

        const offsetMins = idx * intervalMinutes;
        const timeLabel = timingType === 'now'
          ? 'Immediate'
          : `${scheduleDate} ${scheduleTime} (+${offsetMins}m)`;

        tasksToCreate.push({
          accountId: acc.id,
          accountUsername: acc.username,
          accountAvatar: acc.avatarUrl,
          videoId: vid.id,
          videoFilename: vid.filename,
          videoThumbnail: vid.thumbnailUrl,
          caption: substitutedCaption,
          hashtags: hashtagArray,
          scheduledTime: timeLabel,
          timezone: acc.timezone,
          status: 'pending',
          maxRetries: 3,
        });
      });
    }

    enqueueBatch(tasksToCreate);
    setIsCreatePostOpen(false);
    setCurrentScreen('publishing-queue');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 lg:p-6 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FE2C55] flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Batch Publishing Workflow</h2>
              <p className="text-[11px] text-slate-500">
                Publish single or multiple videos across independent TikTok account profiles
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreatePostOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable wizard sections */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Workflow Choice */}
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              1. Choose Publishing Workflow
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'same-to-many',
                  title: 'Same Video → Multiple Accounts',
                  desc: 'Distribute 1 master video to all selected accounts with isolated tasks',
                  badge: 'Recommended',
                },
                {
                  id: 'separate-to-separate',
                  title: 'Separate Videos → Separate Accounts',
                  desc: 'Assign each account a distinct unique video from its dedicated folder',
                  badge: 'Agency Pro',
                },
                {
                  id: 'custom',
                  title: 'Custom Multi-Video Assignment',
                  desc: 'Manually customize video distribution per account with distinct intervals',
                  badge: 'Custom',
                },
              ].map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => setWorkflow(wf.id as any)}
                  className={`p-3.5 rounded-lg border text-left transition-all relative ${
                    workflow === wf.id
                      ? 'border-[#FE2C55] bg-rose-50/30 ring-1 ring-[#FE2C55]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
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

          {/* Step 2: Select Accounts & Videos Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accounts Selection */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col h-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#FE2C55]" />
                  2. Select Accounts ({selectedAccountIds.length}/{accounts.length})
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => setSelectedAccountIds(accounts.map((a) => a.id))}
                    className="text-[#FE2C55] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => setSelectedAccountIds([])}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {accounts.map((acc) => {
                  const isChecked = selectedAccountIds.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-rose-200 bg-white shadow-xs'
                          : 'border-slate-200 bg-slate-100/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                        />
                        <img
                          src={acc.avatarUrl}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="font-semibold text-slate-900 truncate">{acc.username}</span>
                        <span className="text-[10px] text-slate-400 truncate">{acc.clientName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {acc.detectedVideosCount} vids
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Videos Selection */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col h-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#FE2C55]" />
                  3. Select Videos ({selectedVideoIds.length} chosen)
                </span>
                <span className="text-[10px] text-slate-500">
                  {workflow === 'same-to-many' ? 'Pick 1 master video' : 'Multi-select'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {videos.map((vid) => {
                  const isChecked = selectedVideoIds.includes(vid.id);
                  return (
                    <div
                      key={vid.id}
                      onClick={() => toggleVideo(vid.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-rose-200 bg-white shadow-xs'
                          : 'border-slate-200 bg-slate-100/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                        />
                        <img
                          src={vid.thumbnailUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover shrink-0 bg-slate-200"
                        />
                        <div className="truncate">
                          <span className="font-semibold text-slate-900 block truncate">{vid.filename}</span>
                          <span className="text-[10px] text-slate-400">
                            {vid.duration} · {vid.sizeMb}MB · {vid.resolution}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          vid.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {vid.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Metadata, Dynamic Variables & AI Generator */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FE2C55]" />
                4. Caption, Hashtags & Dynamic Variables
              </span>

              {/* Template dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Preset:</span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-700"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Generator Helper Bar */}
            <div className="p-3 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 rounded-lg border border-rose-200/60 mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Sparkles className="w-4 h-4 text-[#FE2C55] shrink-0" />
                <span className="text-xs font-semibold text-slate-800 shrink-0">Gemini AI Hook Generator:</span>
                <input
                  type="text"
                  placeholder="e.g. portable mini projector, noise cancelling headphones"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="flex-1 bg-white border border-rose-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
                />
              </div>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isGeneratingAi}
                className="px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? 'Generating...' : 'Generate Viral Caption'}</span>
              </button>
            </div>

            {/* Caption Textarea */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 block">Caption</label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your engaging TikTok caption here..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Variables:</span>
                  {['{video_title}', '{account_name}', '{date}'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCaption((prev) => `${prev} ${v}`)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono text-[10px]"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <span>{caption.length} / 2200 chars</span>
              </div>
            </div>

            {/* Hashtags */}
            <div className="mt-3 space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 block">Hashtags (space separated)</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#fyp #viral #tiktokmademebuyit"
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
          </div>

          {/* Step 4: Schedule & Timing */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-[#FE2C55]" />
              5. Schedule & Timing Configuration
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { id: 'queue', title: 'Add to Publishing Queue', desc: 'Hold in queue for automated scheduler processing' },
                { id: 'now', title: 'Publish Immediately', desc: 'Start processing right away within concurrency limits' },
                { id: 'schedule', title: 'Schedule for Specific Time', desc: 'Set date, start hour and account timezone spacing' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimingType(opt.id as any)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    timingType === opt.id
                      ? 'border-[#FE2C55] bg-rose-50/20 ring-1 ring-[#FE2C55]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">{opt.title}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>

            {timingType === 'schedule' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded px-2.5 py-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded px-2.5 py-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interval Between Accounts</label>
                  <select
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                    className="w-full border border-slate-200 bg-white rounded px-2.5 py-1"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="h-16 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500">
            Will generate <span className="font-bold text-slate-900">{selectedAccountIds.length}</span> independent task(s).
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatePostOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitBatch}
              className="px-5 py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Add to Publishing Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
