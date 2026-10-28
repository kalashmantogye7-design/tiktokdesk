import React, { useState } from 'react';
import {
  Puzzle,
  Download,
  Trash2,
  Check,
  Search,
  Shield,
  RotateCw,
  ExternalLink,
  Users,
  Smartphone,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const ExtensionManagerScreen: React.FC = () => {
  const {
    extensions,
    accounts,
    installExtension,
    uninstallExtension,
    toggleAccountExtension,
    openMobileBrowser,
    addToast,
  } = useTikTokDesk();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [extensionSearch, setExtensionSearch] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const filteredExtensions = extensions.filter((e) => {
    const matchCat = activeCategory === 'all' || e.category === activeCategory;
    const matchSearch =
      e.name.toLowerCase().includes(extensionSearch.toLowerCase()) ||
      e.description.toLowerCase().includes(extensionSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {accounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">No account yet. Go to Accounts and add your first account, then come back here to assign extensions.</div>
      )}
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Extension Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Chrome VPN extensions, ad blockers, and analytics tools isolated per browser profile
          </p>
        </div>

        <button
          onClick={() => addToast('info', 'Check Updates', 'All installed Chrome extensions are up to date.')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Check for Updates</span>
        </button>
      </div>

      {/* Main Grid: Left Extension Library (7 cols), Right Per-Account Assignment (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Extension Library & Installed List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Extension Library ({extensions.length})
              </span>

              {/* Category tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                {['all', 'VPN', 'Ad Blocker', 'Productivity', 'SEO & Analytics'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                      activeCategory === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search extensions by name or function..."
                value={extensionSearch}
                onChange={(e) => setExtensionSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredExtensions.map((ext) => {
                const isInstalled = ext.status === 'installed';

                return (
                  <div
                    key={ext.id}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 text-xs flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-[#FE2C55] flex items-center justify-center shrink-0 mt-0.5">
                        <Puzzle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{ext.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{ext.version}</span>
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                            {ext.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                          {ext.description}
                        </p>
                        {isInstalled && (
                          <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                            <Check className="w-3 h-3" />
                            <span>Installed &amp; isolated per profile</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isInstalled ? (
                        <button
                          onClick={() => uninstallExtension(ext.id)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded font-semibold text-[11px]"
                        >
                          Uninstall
                        </button>
                      ) : (
                        <button
                          onClick={() => installExtension(ext.id)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] shadow-xs"
                        >
                          Install
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Account Extension Assignment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Profile Extension Assignment
              </span>
              <button
                onClick={() => selectedAccount && openMobileBrowser(selectedAccount)}
                className="text-xs text-[#FE2C55] font-semibold hover:underline flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Launch Browser</span>
              </button>
            </div>

            {/* Select account */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Target Account Profile</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50 font-semibold"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.username} ({a.clientName})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned extensions toggles */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Toggle Extensions for {selectedAccount ? selectedAccount.username : "No account yet"}:
              </span>

              {extensions
                .filter((e) => e.status === 'installed')
                .map((ext) => {
                  const isAssigned = selectedAccount?.assignedExtensions.includes(ext.id) ?? false;

                  return (
                    <div
                      key={ext.id}
                      onClick={() => selectedAccount && toggleAccountExtension(ext.id, selectedAccount.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isAssigned
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">{ext.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{ext.category}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold ${
                          isAssigned ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {isAssigned ? 'Active in Profile' : 'Disabled'}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Permanent Extension Persistence:</span>
              <p>
                Each account maintains its own independent Chrome extension runtime cache. Enabling a VPN
                extension on Account A will never affect Account B.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
