import React, { useState } from 'react';
import {
  Film,
  Folder,
  Search,
  RotateCw,
  Play,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Clock,
  HardDrive,
  Copy,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { VideoItem } from '../../types/tiktokdesk';

export const VideoLibraryScreen: React.FC = () => {
  const {
    accounts,
    videos,
    scanFolder,
    isScanning,
    enqueueBatch,
    templates,
    generateAiCaption,
    deleteVideo,
    addToast,
    setCurrentScreen,
  } = useTikTokDesk();

  // Selected account for folder isolation
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Folder paths
  const [folderPathInput, setFolderPathInput] = useState(selectedAccount?.videoFolder || '');
  const [includeSubfolders, setIncludeSubfolders] = useState(true);

  // Tabs: All, New, Selected, Duplicates
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'new' | 'selected' | 'duplicates'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected videos for bulk actions
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [activePreviewVideoId, setActivePreviewVideoId] = useState<string>(videos[0]?.id || '');

  // Metadata editor for selected video
  const [caption, setCaption] = useState(videos[0]?.caption || 'Amazing product for daily life! #gadgets #fyp');
  const [hashtags, setHashtags] = useState(videos[0]?.hashtags?.join(' ') || '#tiktokmademebuyit #viral #tech');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('smart home gadget');

  const activeVideo = videos.find((v) => v.id === activePreviewVideoId) || videos[0];

  // Filter videos
  const accountVideos = videos.filter((v) => v.accountId === selectedAccountId || v.assignedAccounts.includes(selectedAccountId));

  const filteredVideos = accountVideos.filter((v) => {
    const matchSearch = v.filename.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilterTab === 'new') return v.status === 'new';
    if (activeFilterTab === 'selected') return selectedVideoIds.includes(v.id);
    if (activeFilterTab === 'duplicates') return v.status === 'duplicate';
    return true;
  });

  const handleScan = async () => {
    if (!selectedAccountId) return;
    await scanFolder(selectedAccountId, folderPathInput, includeSubfolders);
  };

  const toggleSelectAll = () => {
    if (selectedVideoIds.length === filteredVideos.length) {
      setSelectedVideoIds([]);
    } else {
      setSelectedVideoIds(filteredVideos.map((v) => v.id));
    }
  };

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    addToast('info', 'AI Assistant', 'Crafting high-engagement caption & tags...');
    try {
      if (!selectedAccount) { addToast('error', 'No Account', 'Add an account first.'); setIsAiLoading(false); return; }
    const res = await generateAiCaption(aiPrompt, 'tech finds', 'viral hook', selectedAccount.username);
      setCaption(res.caption);
      setHashtags(res.hashtags.join(' '));
      addToast('success', 'Caption Generated', 'AI hook and trending tags applied to editor.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBulkAddToQueue = () => {
    if (selectedVideoIds.length === 0) {
      addToast('warning', 'Selection Needed', 'Select at least one video to enqueue.');
      return;
    }
    if (!selectedAccount) { addToast('error', 'No Account', 'Add an account first.'); return; }
    const chosen = videos.filter((v) => selectedVideoIds.includes(v.id));
    const hashtagList = hashtags.split(/\s+/).filter(Boolean);

    const tasks = chosen.map((vid, idx) => ({
      accountId: selectedAccount.id,
      accountUsername: selectedAccount.username,
      accountAvatar: selectedAccount.avatarUrl,
      videoId: vid.id,
      videoFilename: vid.filename,
      videoThumbnail: vid.thumbnailUrl,
      caption: caption.replace('{video_title}', vid.filename.replace('.mp4', '')),
      hashtags: hashtagList,
      scheduledTime: `Scheduled (${idx * 15}m gap)`,
      timezone: selectedAccount.timezone,
      status: 'pending' as const,
      maxRetries: 3,
    }));

    enqueueBatch(tasks);
    setSelectedVideoIds([]);
    setCurrentScreen('publishing-queue');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Video Library &amp; Folder Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan local Windows directories, inspect MP4 media, configure metadata, and queue for publishing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkAddToQueue}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 transition-all active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Add Selected to Queue ({selectedVideoIds.length})</span>
          </button>
        </div>
      </div>

      {/* Sections 1, 2, 3: Account Selector & Folder Path Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Account selector (4 cols) */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">1. Account Selection</label>
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                const acc = accounts.find((a) => a.id === e.target.value);
                if (acc) setFolderPathInput(acc.videoFolder);
              }}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.username} ({acc.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Folder path (6 cols) */}
          <div className="md:col-span-6">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">2. Video Folder Directory</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={folderPathInput}
                onChange={(e) => setFolderPathInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#FE2C55]"
              />
              <button
                onClick={() => addToast('info', 'Windows Explorer', 'Folder selection dialog launched.')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shrink-0"
              >
                Browse
              </button>
            </div>
          </div>

          {/* Scan button (2 cols) */}
          <div className="md:col-span-2 pt-4">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Folder'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={(e) => setIncludeSubfolders(e.target.checked)}
              className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
            />
            <span>Include Subfolders when scanning video files</span>
          </label>
          <span className="font-mono">{filteredVideos.length} videos detected for this account</span>
        </div>
      </div>

      {/* Main Grid: Left Table & Filters, Right Video Preview & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Video List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/60">
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
              {[
                { id: 'all', label: `All (${accountVideos.length})` },
                { id: 'new', label: 'New' },
                { id: 'selected', label: `Selected (${selectedVideoIds.length})` },
                { id: 'duplicates', label: 'Duplicates (0)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeFilterTab === tab.id
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2 px-3 w-8">
                    <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-800">
                      {selectedVideoIds.length === filteredVideos.length && filteredVideos.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#FE2C55]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 px-3">Video File</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Resolution</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVideos.map((vid) => {
                  const isChecked = selectedVideoIds.includes(vid.id);
                  const isCurrent = activePreviewVideoId === vid.id;

                  return (
                    <tr
                      key={vid.id}
                      onClick={() => setActivePreviewVideoId(vid.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() =>
                            setSelectedVideoIds((prev) =>
                              prev.includes(vid.id) ? prev.filter((id) => id !== vid.id) : [...prev, vid.id]
                            )
                          }
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#FE2C55]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={vid.thumbnailUrl}
                            alt=""
                            className="w-9 h-9 rounded object-cover bg-slate-200 border border-slate-200 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 block truncate">{vid.filename}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {vid.filePath}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums">
                        {vid.duration}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums">
                        {vid.sizeMb} MB
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {vid.resolution}
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            vid.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : vid.status === 'queued'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {vid.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => deleteVideo(vid.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Video Preview & Metadata Panel (4 cols) */}
        {activeVideo && (
          <div className="lg:col-span-4 space-y-4">
            {/* Section 6: Video Preview Player Mockup */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                6. Video Preview
              </span>

              <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/14] flex flex-col items-center justify-center">
                <img
                  src={activeVideo.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
                <button
                  onClick={() => addToast('info', 'Video Player', `Playing ${activeVideo.filename}`)}
                  className="absolute w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                >
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </button>
                <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-white flex justify-between font-mono">
                  <span>{activeVideo.duration}</span>
                  <span>{activeVideo.resolution}</span>
                </div>
              </div>

              {/* Technical Video Info */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Filename:</span>
                  <span className="truncate max-w-[170px] text-slate-800">{activeVideo.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Size:</span>
                  <span className="text-slate-800">{activeVideo.sizeMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Location:</span>
                  <span className="truncate max-w-[170px] text-slate-800">{activeVideo.filePath}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addToast('info', 'Explorer', `Opened folder: ${activeVideo.filePath}`)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Open Folder</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeVideo.filePath);
                    addToast('success', 'Copied', 'File path copied to clipboard.');
                  }}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                  title="Copy Path"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Section 8: Metadata & AI Caption */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  8. Metadata &amp; AI
                </span>
                <button
                  onClick={handleAiGenerate}
                  disabled={isAiLoading}
                  className="text-[11px] text-[#FE2C55] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiLoading ? 'Generating...' : 'AI Caption'}</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Caption</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hashtags</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <button
                onClick={handleBulkAddToQueue}
                className="w-full py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Add Video to Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
