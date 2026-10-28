import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Play,
  RotateCw,
  Film,
  Users,
  Check,
  Trash2,
  Edit2,
  Download,
  Upload,
  Layers,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { ScheduleItem } from '../../types/tiktokdesk';

export const SchedulerScreen: React.FC = () => {
  const {
    accounts,
    videos,
    schedules,
    addSchedule,
    deleteSchedule,
    toggleScheduleStatus,
    enqueueBatch,
    addToast,
    setCurrentScreen,
  } = useTikTokDesk();

  // Calendar View: Month, Week, Day
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentMonth, setCurrentMonth] = useState('May 2026');

  // Selected accounts & video for scheduling
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id || '');

  // Schedule settings
  const [scheduleType, setScheduleType] = useState<'one-time' | 'daily' | 'weekly' | 'custom'>('daily');
  const [scheduledDate, setScheduledDate] = useState('2026-05-12');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [repeatWeekdays, setRepeatWeekdays] = useState<string[]>(['Mon', 'Wed', 'Fri']);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const selectedVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];

  const toggleWeekday = (day: string) => {
    setRepeatWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateSchedule = () => {
    if (!selectedAccount || !selectedVideo) {
      addToast('error', 'Validation Error', 'Select both account and video.');
      return;
    }

    addSchedule({
      accountId: selectedAccount.id,
      accountUsername: selectedAccount.username,
      videoId: selectedVideo.id,
      videoFilename: selectedVideo.filename,
      videoThumbnail: selectedVideo.thumbnailUrl,
      scheduleType,
      scheduledDate,
      scheduledTime,
      repeatDays: scheduleType === 'weekly' || scheduleType === 'daily' ? repeatWeekdays : undefined,
      status: 'scheduled',
    });
  };

  const handlePushAllToQueue = () => {
    const tasks = schedules.map((sch) => ({
      accountId: sch.accountId,
      accountUsername: sch.accountUsername,
      accountAvatar: accounts.find((a) => a.id === sch.accountId)?.avatarUrl || '',
      videoId: sch.videoId,
      videoFilename: sch.videoFilename,
      videoThumbnail: sch.videoThumbnail,
      caption: `Scheduled publication for ${sch.videoFilename} ✨ #viral #fyp`,
      hashtags: ['#fyp', '#trending', '#viral'],
      scheduledTime: `${sch.scheduledDate} ${sch.scheduledTime}`,
      timezone: accounts.find((a) => a.id === sch.accountId)?.timezone || 'UTC-5',
      status: 'pending' as const,
      maxRetries: 3,
    }));

    enqueueBatch(tasks);
    setCurrentScreen('publishing-queue');
  };

  // Calendar dates (May 2026 simulation)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Scheduler</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated calendar scheduling, recurring post rules, and timezone alignment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePushAllToQueue}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
          >
            <Layers className="w-4 h-4" />
            <span>Enqueue All Scheduled Items ({schedules.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Setup & Calendar, Right Schedule List & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Calendar View & Scheduler Config (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Calendar View Component */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            {/* Calendar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast('info', 'Calendar', 'Showing current month')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold text-slate-700"
                >
                  Today
                </button>
                <div className="flex items-center gap-1">
                  <button className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-xs text-slate-900 min-w-[80px] text-center">
                    {currentMonth}
                  </span>
                  <button className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                {(['month', 'week', 'day'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-md font-semibold capitalize transition-colors ${
                      viewMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Month Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1 text-[11px] font-semibold text-slate-400">
                  {d}
                </div>
              ))}

              {/* First 5 empty offset days for May 2026 */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 bg-slate-50/50 rounded p-1 opacity-30 text-slate-400" />
              ))}

              {daysInMonth.map((day) => {
                const isSelectedDate = day === 12;
                const hasScheduled = day === 12 || day === 13 || day === 15 || day === 18;
                return (
                  <div
                    key={day}
                    onClick={() => {
                      setScheduledDate(`2026-05-${day.toString().padStart(2, '0')}`);
                      addToast('info', 'Date Selected', `Selected 2026-05-${day}`);
                    }}
                    className={`h-16 rounded border p-1 text-left flex flex-col justify-between cursor-pointer transition-colors ${
                      isSelectedDate
                        ? 'border-[#FE2C55] bg-rose-50/30 ring-1 ring-[#FE2C55]'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold ${
                        isSelectedDate ? 'text-[#FE2C55]' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>

                    {hasScheduled && (
                      <div className="space-y-0.5">
                        <span className="block truncate text-[9px] font-semibold bg-[#FE2C55]/10 text-[#FE2C55] px-1 py-0.5 rounded leading-none">
                          2 posts
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3 & 9: Schedule Type & Recurring Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              3. Schedule Type &amp; Recurrence Rules
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'one-time', label: 'One-time Post' },
                { id: 'daily', label: 'Daily Repeat' },
                { id: 'weekly', label: 'Weekly Repeat' },
                { id: 'custom', label: 'Custom Interval' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setScheduleType(opt.id as any)}
                  className={`p-2.5 rounded-lg border font-semibold text-center transition-colors ${
                    scheduleType === opt.id
                      ? 'border-[#FE2C55] bg-rose-50 text-[#FE2C55]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Recurring days selector */}
            {(scheduleType === 'daily' || scheduleType === 'weekly') && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Active Repeat Days:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const isSelected = repeatWeekdays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleWeekday(day)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#FE2C55] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Account & Video selection strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target TikTok Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.username} ({acc.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Video</label>
                <select
                  value={selectedVideoId}
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-mono text-[11px]"
                >
                  {videos.map((vid) => (
                    <option key={vid.id} value={vid.id}>
                      {vid.filename} ({vid.duration})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateSchedule}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Save Schedule to Calendar</span>
            </button>
          </div>
        </div>

        {/* Right Column: Selected Schedule List & Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Scheduled Tasks List (Section 6) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Scheduled Tasks ({schedules.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real database records</span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {schedules.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={item.videoThumbnail}
                      alt=""
                      className="w-9 h-9 rounded object-cover shrink-0 border border-slate-200"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{item.accountUsername}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate block">
                        {item.videoFilename}
                      </span>
                      <span className="text-[10px] text-purple-600 font-medium">
                        {item.scheduledTime} · {item.scheduleType}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleScheduleStatus(item.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Pause / Resume"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Video Preview (Section 7) */}
          {selectedVideo && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Schedule Preview
              </span>
              <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/13]">
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white text-xs">
                  <span className="font-bold">{selectedAccount.username}</span>
                  <p className="text-[11px] text-white/90 line-clamp-2 mt-0.5">
                    {selectedVideo.caption || 'Upcoming scheduled TikTok drop! 🔥'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
