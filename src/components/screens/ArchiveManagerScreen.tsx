import React, { useState } from 'react';
import {
  Archive,
  Folder,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Search,
  ExternalLink,
  Shield,
  FileCheck,
  ArrowRight,
  HardDrive,
  Copy,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { VideoItem } from '../../types/tiktokdesk';

export const ArchiveManagerScreen: React.FC = () => {
  const {
    videos,
    accounts,
    moveCompletedToUploaded,
    restoreArchivedVideo,
    settings,
    updateSettings,
    addToast,
  } = useTikTokDesk();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'failed'>('all');
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || '');

  const selectedVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];

  // Calculate statistics
  const totalCount = videos.length;
  const completedCount = videos.filter(
    (v) =>
      v.assignedAccounts.length > 0 &&
      v.assignedAccounts.every((accId) => v.publishedAccounts.includes(accId))
  ).length;
  const inProgressCount = videos.filter(
    (v) =>
      v.assignedAccounts.length > 0 &&
      !v.assignedAccounts.every((accId) => v.publishedAccounts.includes(accId))
  ).length;

  const filteredVideos = videos.filter((v) => {
    const isCompleted =
      v.assignedAccounts.length > 0 &&
      v.assignedAccounts.every((accId) => v.publishedAccounts.includes(accId));

    const matchSearch = v.filename.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchSearch) return false;

    if (statusFilter === 'completed') return isCompleted;
    if (statusFilter === 'in-progress') return !isCompleted;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Archive Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Multi-Account Archiving: Videos only move to Uploaded when 100% of accounts verify publication
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => moveCompletedToUploaded()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md shadow-slate-900/10 transition-all active:scale-95"
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            <span>Move Completed to Uploaded</span>
          </button>
        </div>
      </div>

      {/* Safety Rule Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 space-y-0.5">
          <span className="font-bold">100% Multi-Account Publication Safety Rule Active:</span>
          <p className="text-emerald-800 leading-relaxed">
            If a video is assigned to 10 TikTok accounts, it will remain in its original folder even if 9/10 accounts
            publish successfully. Only once the 10th account confirms verified publication will automatic archiving move
            the file to the destination Uploaded folder.
          </p>
        </div>
      </div>

      {/* Section 1: Folder Paths Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Original Videos Directory</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.originalVideosFolder}
                onChange={(e) => updateSettings({ originalVideosFolder: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] bg-slate-50 text-slate-800"
              />
              <button
                onClick={() => addToast('info', 'Windows Explorer', 'Selected source folder.')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
              >
                Browse
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Uploaded Videos Archive Directory</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.uploadedVideosFolder}
                onChange={(e) => updateSettings({ uploadedVideosFolder: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] bg-slate-50 text-slate-800"
              />
              <button
                onClick={() => addToast('info', 'Windows Explorer', 'Selected destination folder.')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
              >
                Browse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Strip (Section 9) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Total Monitored</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Fully Verified &amp; Eligible</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{completedCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">In-Progress / Preserved</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">{inProgressCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Destination Size</span>
          <span className="text-2xl font-extrabold text-purple-600 font-mono tabular-nums">542 MB</span>
        </div>
      </div>

      {/* Main Grid: Left Archive Table (8 cols), Right Video Details & Account Status Checklist (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/60">
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
              {[
                { id: 'all', label: `All (${videos.length})` },
                { id: 'completed', label: `Completed (${completedCount})` },
                { id: 'in-progress', label: `In Progress (${inProgressCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search filename..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3">Video Filename</th>
                  <th className="py-2.5 px-3">Duration &amp; Size</th>
                  <th className="py-2.5 px-3">Assigned Accounts</th>
                  <th className="py-2.5 px-3">Published Verification</th>
                  <th className="py-2.5 px-3">Folder State</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVideos.map((vid) => {
                  const isCurrent = selectedVideoId === vid.id;
                  const assignedCount = vid.assignedAccounts.length;
                  const publishedCount = vid.publishedAccounts.length;
                  const isFullyPublished = assignedCount > 0 && publishedCount === assignedCount;
                  const isArchived = vid.filePath.includes('Uploaded');

                  return (
                    <tr
                      key={vid.id}
                      onClick={() => setSelectedVideoId(vid.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={vid.thumbnailUrl}
                            alt=""
                            className="w-8 h-8 rounded object-cover bg-slate-200 border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">{vid.filename}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {vid.filePath}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                        {vid.duration} · {vid.sizeMb}MB
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {assignedCount} accounts
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold tabular-nums text-xs ${
                              isFullyPublished ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {publishedCount} / {assignedCount}
                          </span>
                          {isFullyPublished ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Preserved</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            isArchived
                              ? 'bg-purple-100 text-purple-800'
                              : isFullyPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isArchived ? 'In Uploaded' : isFullyPublished ? 'Archive Ready' : 'In Source'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {isArchived && (
                          <button
                            onClick={() => restoreArchivedVideo(vid.id)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded"
                            title="Restore to Source"
                          >
                            <Undo2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details Panel: Video Details & Assigned Account Checklist (4 cols) */}
        {selectedVideo && (
          <div className="lg:col-span-4 space-y-4">
            {/* Section 5: Account Publishing Status Checklist */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  5. Account Status Checklist
                </span>
                <span className="text-[10px] font-mono text-slate-500">{selectedVideo.filename}</span>
              </div>

              <div className="space-y-1.5">
                {selectedVideo.assignedAccounts.length === 0 ? (
                  <div className="text-xs text-slate-400 py-3 text-center">
                    No accounts currently assigned to this video file.
                  </div>
                ) : (
                  selectedVideo.assignedAccounts.map((accId) => {
                    const acc = accounts.find((a) => a.id === accId);
                    const isPublished = selectedVideo.publishedAccounts.includes(accId);

                    return (
                      <div
                        key={accId}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={acc?.avatarUrl || ''}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                          <span className="font-semibold text-slate-900 truncate">
                            {acc?.username || accId}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 ${
                            isPublished ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {isPublished ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Verified Published</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              <span>Pending Verification</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Progress Bar (Section 6) */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Publication Verification Progress:</span>
                  <span className="font-mono">
                    {selectedVideo.assignedAccounts.length > 0
                      ? Math.round(
                          (selectedVideo.publishedAccounts.length / selectedVideo.assignedAccounts.length) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{
                      width: `${
                        selectedVideo.assignedAccounts.length > 0
                          ? (selectedVideo.publishedAccounts.length / selectedVideo.assignedAccounts.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  File remains safely preserved in source folder until progress reaches 100%.
                </p>
              </div>
            </div>

            {/* Video File Technical Location */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
                File Details
              </span>
              <div className="text-[11px] space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Path:</span>
                  <span className="font-mono text-slate-800 truncate max-w-[170px]">
                    {selectedVideo.filePath}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="font-mono text-slate-800">{selectedVideo.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-mono text-slate-800">{selectedVideo.sizeMb} MB</span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedVideo.filePath);
                  addToast('success', 'Path Copied', 'Copied full path to clipboard.');
                }}
                className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File Path</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
