import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Sparkles,
  Download,
  Upload,
  Search,
  Check,
  Edit2,
  Trash2,
  Bookmark,
  Smartphone,
  Eye,
  Film,
  Copy,
  Folder,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { MetadataTemplate } from '../../types/tiktokdesk';

export const MetadataScreen: React.FC = () => {
  const {
    accounts,
    templates,
    videos,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    generateAiCaption,
    addToast,
  } = useTikTokDesk();

  // Selected account
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Active template selected for editing
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Editor fields
  const [templateName, setTemplateName] = useState(activeTemplate?.name || 'New Template');
  const [category, setCategory] = useState(activeTemplate?.category || 'Tech & Gadgets');
  const [caption, setCaption] = useState(activeTemplate?.caption || '');
  const [hashtags, setHashtags] = useState(activeTemplate?.hashtags.join(' ') || '');
  const [isDefault, setIsDefault] = useState(activeTemplate?.isDefault || false);

  // Search templates
  const [searchFilter, setSearchFilter] = useState('');

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('smart home gadget');

  // Preview video
  const previewVideo = videos[0];

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.caption.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelectTemplate = (tmpl: MetadataTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setTemplateName(tmpl.name);
    setCategory(tmpl.category);
    setCaption(tmpl.caption);
    setHashtags(tmpl.hashtags.join(' '));
    setIsDefault(tmpl.isDefault || false);
  };

  const handleSaveTemplate = () => {
    const tagsArray = hashtags.split(/\s+/).filter(Boolean);
    if (!templateName.trim()) {
      addToast('error', 'Validation Error', 'Template name is required.');
      return;
    }

    if (selectedTemplateId) {
      updateTemplate(selectedTemplateId, {
        name: templateName,
        category,
        caption,
        hashtags: tagsArray,
        isDefault,
      });
    } else {
      addTemplate({
        name: templateName,
        category,
        caption,
        hashtags: tagsArray,
        isDefault,
      });
    }
  };

  const handleCreateNewTemplate = () => {
    setSelectedTemplateId('');
    setTemplateName('Brand New Template');
    setCategory('General');
    setCaption('Check out this amazing {video_title}! 🔥 #fyp #viral');
    setHashtags('#trending #viral #fyp');
    setIsDefault(false);
  };

  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    addToast('info', 'Gemini AI', 'Generating viral hook and hashtags...');
    try {
      if (!selectedAccount) { addToast('error', 'No Account', 'Add an account first.'); setIsAiGenerating(false); return; }
      const res = await generateAiCaption(aiTopic, category, 'viral and punchy', selectedAccount.username);
      setCaption(res.caption);
      setHashtags(res.hashtags.join(' '));
      addToast('success', 'AI Caption Generated', 'Applied to editor.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApplyToFolder = () => {
    addToast(
      'success',
      'Applied to Folder',
      `Applied "${templateName}" as default metadata for all videos in ${selectedAccount?.videoFolder || 'no folder yet'}`
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {accounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">No account yet. Go to Accounts and add your first account, then come back here to use metadata and previews.</div>
      )}
      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Metadata Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure reusable templates, dynamic variables, and viral captions before scheduling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addToast('info', 'CSV Import', 'Simulating caption spreadsheet import...')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import from CSV</span>
          </button>
          <button
            onClick={handleCreateNewTemplate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Account Selector Strip */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">1. Select Account Context:</span>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-semibold"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username} ({a.clientName})
              </option>
            ))}
          </select>
        </div>
        <span className="text-[11px] text-slate-400">
          Saved video folder: <span className="font-mono text-slate-700">{selectedAccount?.videoFolder || "No account selected yet"}</span>
        </span>
      </div>

      {/* Main Grid: Left Templates List, Center Editor, Right Live TikTok Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Template List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Templates ({templates.length})
            </span>
            <button
              onClick={handleCreateNewTemplate}
              className="text-[10px] text-[#FE2C55] font-semibold hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FE2C55] bg-rose-50/20 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate">{tmpl.name}</span>
                    {tmpl.isDefault && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{tmpl.category}</span>
                  <p className="text-slate-600 line-clamp-2 text-[11px] mt-1">{tmpl.caption}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Caption &amp; Hashtags Editor
            </span>
            <div className="flex items-center gap-1">
              {selectedTemplateId && (
                <button
                  onClick={() => deleteTemplate(selectedTemplateId)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Template Name & Category */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
          </div>

          {/* AI Caption Generator Quick Bar */}
          <div className="p-3 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 rounded-lg border border-rose-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Sparkles className="w-4 h-4 text-[#FE2C55] shrink-0" />
              <input
                type="text"
                placeholder="Product topic (e.g. ergonomic wireless mouse)..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full bg-white border border-rose-200 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>
            <button
              onClick={handleAiGenerate}
              disabled={isAiGenerating}
              className="px-3 py-1 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded text-xs font-semibold shrink-0 disabled:opacity-50"
            >
              {isAiGenerating ? 'AI Thinking...' : 'AI Generate'}
            </button>
          </div>

          {/* Caption textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Caption Prose</label>
              <span className="text-[10px] text-slate-400 font-mono">{caption.length} / 2200</span>
            </div>
            <textarea
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55] font-sans"
            />
            {/* Variables buttons */}
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
              <span>Variables:</span>
              {['{video_title}', '{account_name}', '{date}'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCaption((prev) => `${prev} ${v}`)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtags input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
            />
            <span>Set as Default Template for {selectedAccount?.username || "an account"}</span>
          </label>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleApplyToFolder}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Apply to All in Folder
            </button>

            <button
              onClick={handleSaveTemplate}
              className="px-4 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              Save Template
            </button>
          </div>
        </div>

        {/* Right Column: Live TikTok Preview (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#FE2C55]" />
              Live TikTok Post Preview
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Mobile View</span>
          </div>

          {/* Smartphone Frame */}
          <div className="bg-black rounded-2xl p-2 border-2 border-slate-800 text-white relative shadow-lg aspect-[9/15] flex flex-col justify-end overflow-hidden">
            <img
              src={previewVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80'}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Simulated Live Post Metadata */}
            <div className="relative z-10 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={selectedAccount?.avatarUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-7 h-7 rounded-full border border-white object-cover"
                />
                <span className="font-bold text-xs">{selectedAccount?.username || "No account yet"}</span>
              </div>

              <p className="text-xs leading-snug text-white/95 line-clamp-3 font-sans">
                {caption
                  .replace('{video_title}', previewVideo?.filename?.replace('.mp4', '') || 'gadget')
                  .replace('{account_name}', selectedAccount?.username || 'your account')
                  .replace('{date}', '12 May')}
              </p>

              <p className="text-[11px] text-[#00F2FE] font-mono leading-tight">
                {hashtags}
              </p>

              <div className="text-[10px] text-white/60 pt-1">
                ♫ original sound - {selectedAccount?.displayName || "No account yet"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
