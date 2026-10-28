import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Download,
  Upload,
  Search,
  Smartphone,
  Folder,
  Settings,
  BarChart3,
  Calendar,
  MoreVertical,
  Play,
  RotateCw,
  Trash2,
  Pause,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { TikTokAccount } from '../../types/tiktokdesk';

export const AccountsScreen: React.FC = () => {
  const {
    accounts,
    clients,
    proxies,
    addAccount,
    updateAccount,
    deleteAccount,
    toggleAccountStatus,
    openMobileBrowser,
    scanFolder,
    setCurrentScreen,
    setFilterParam,
    filterParam,
    addToast,
  } = useTikTokDesk();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterParam || 'all');
  const [groupFilter, setGroupFilter] = useState('all');

  // Backend availability: on static hosting (Vercel) there is no /api server,
  // so profile buttons must say so clearly instead of failing silently.
  const [backendDown, setBackendDown] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/profiles')
      .then((r) => { if (!cancelled) setBackendDown(!r.ok); })
      .catch(() => { if (!cancelled) setBackendDown(true); });
    return () => { cancelled = true; };
  }, []);

  const backendMissingMessage = 'Backend nahi mila. Live site par profile nahi khulega. PC par localhost:3000 wala program chalao, wahan ye button kaam karega.';

  async function callProfileApi(accId: string, action: 'profile' | 'open-profile') {
    const r = await fetch(`/api/accounts/${encodeURIComponent(accId)}/${action}`, { method: 'POST' });
    const text = await r.text();
    let j: any = {};
    try { j = text ? JSON.parse(text) : {}; } catch { j = {}; }
    if (!r.ok) {
      throw new Error(j.error || backendMissingMessage);
    }
    return j;
  }

  // Selected account for right preview panel
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

  // Add Account Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newProxyId, setNewProxyId] = useState('');
  const [newFolder, setNewFolder] = useState('D:\\TikTok\\NewAccount\\Videos\\');

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Filtering
  const filteredAccounts = accounts.filter((acc) => {
    const matchSearch =
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || acc.status === statusFilter;
    const matchGroup = groupFilter === 'all' || acc.clientId === groupFilter;
    return matchSearch && matchStatus && matchGroup;
  });

  const totalCount = accounts.length;
  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const pausedCount = accounts.filter((a) => a.status === 'paused').length;
  const attentionCount = accounts.filter((a) => a.status === 'attention').length;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      addToast('error', 'Validation Error', 'Account username is required.');
      return;
    }
    const client = clients.find((c) => c.id === newClientId);
    const proxy = proxies.find((p) => p.id === newProxyId);

    addAccount({
      username: newUsername.trim(),
      displayName: newDisplayName.trim() || newUsername.trim(),
      avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 50000000)}?w=150&auto=format&fit=crop&q=80`,
      clientId: newClientId,
      clientName: client?.name || 'General',
      status: 'active',
      proxyId: newProxyId || undefined,
      proxyLabel: proxy ? `${proxy.country} (${proxy.type})` : 'Direct Connection',
      videoFolder: newFolder,
      detectedVideosCount: 0,
      timezone: client?.timezone || 'UTC-5 (New York)',
      assignedExtensions: ['ext-1'],
    });

    setIsAddModalOpen(false);
    setNewUsername('');
    setNewDisplayName('');
  };

  const handleExportCSV = () => {
    const rows = [
      ['Username', 'Display Name', 'Client', 'Status', 'Proxy', 'Folder', 'Last Active'],
      ...accounts.map((a) => [a.username, a.displayName, a.clientName, a.status, a.proxyLabel || 'Direct', a.videoFolder, a.lastActive]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tiktokdesk_accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Complete', 'Saved account records to CSV.');
  };

  const handleImportCSV = () => {
    addToast('info', 'Import CSV', 'Simulating CSV parse: 2 accounts detected. Overwrite prevention verified.');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header with Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Account Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your TikTok accounts, browser profiles, proxies, extensions, and settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleImportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {backendDown && (
        <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold">
          Backend nahi chal raha hai. Live site par Profile banayein / Profile kholein kaam nahi karega, kyunke uske peeche koi server nahi hai. Profile kholne ke liye PC par localhost:3000 wala program chalao.
        </div>
      )}

      {/* Section 1: Account Statistics Cards (Clickable Filter Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 block">All Accounts</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'active'
              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 block">Active Profiles</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{activeCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('paused')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'paused'
              ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 block">Paused</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">{pausedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('attention')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'attention'
              ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-medium text-slate-500 block">Needs Attention</span>
          <span className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">{attentionCount}</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username, client, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700"
          >
            <option value="all">All Groups</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredAccounts.length}</span> of {accounts.length} accounts
        </div>
      </div>

      {/* Main Split: Accounts Table + Mobile Window Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredAccounts.length && filteredAccounts.length > 0}
                      onChange={(e) =>
                        setSelectedIds(e.target.checked ? filteredAccounts.map((a) => a.id) : [])
                      }
                      className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                    />
                  </th>
                  <th className="py-2.5 px-3">Username & Profile</th>
                  <th className="py-2.5 px-3">Group</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Proxy / VPN</th>
                  <th className="py-2.5 px-3">Video Folder</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  const isChecked = selectedIds.includes(acc.id);

                  return (
                    <tr
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isSelected ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(acc.id) ? prev.filter((id) => id !== acc.id) : [...prev, acc.id]
                            )
                          }
                          className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={acc.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">{acc.username}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {acc.browserProfileId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {acc.clientName}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAccountStatus(acc.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                            acc.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : acc.status === 'paused'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              acc.status === 'active'
                                ? 'bg-emerald-500'
                                : acc.status === 'paused'
                                ? 'bg-amber-500'
                                : 'bg-rose-500 animate-pulse'
                            }`}
                          />
                          <span className="capitalize">{acc.status}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <div className="truncate max-w-[130px] font-mono text-[11px] text-slate-600">
                          {acc.proxyLabel || 'Direct Connection'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="truncate max-w-[140px] font-mono text-[10px] text-slate-500">
                          {acc.videoFolder}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {acc.detectedVideosCount} videos
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Dedicated mobile browser launch */}
                          <button
                            onClick={() => openMobileBrowser(acc)}
                            className="p-1.5 bg-slate-100 hover:bg-[#FE2C55] hover:text-white rounded-lg text-slate-600 transition-colors"
                            title="Launch Dedicated Mobile Browser"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>

                          {/* Phase 1: real Chrome profile for THIS account only.
                              One account = one profile folder, forever. */}
                          <button
                            onClick={async () => {
                              try {
                                const j = await callProfileApi(acc.id, 'profile');
                                addToast('success', j.alreadyExisted ? 'Profile pehle se bana hua hai' : 'Chrome profile ban gaya', j.alreadyExisted ? 'Dobara nahi bana. Yehi profile is account ke liye hai.' : 'Is account ka alag Chrome profile ban gaya hai.');
                              } catch (e) { addToast('error', 'Profile nahi bana', e instanceof Error ? e.message : String(e)); }
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-[#FE2C55] hover:text-white rounded-lg text-slate-600 transition-colors"
                            title="Profile banayein (is account ka alag Chrome profile)"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const j = await callProfileApi(acc.id, 'open-profile');
                                addToast('success', j.alreadyOpen ? 'Profile pehle se khula hai' : 'Chrome profile khul raha hai', j.message || '');
                              } catch (e) { addToast('error', 'Profile nahi khula', e instanceof Error ? e.message : String(e)); }
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-[#FE2C55] hover:text-white rounded-lg text-slate-600 transition-colors"
                            title="Profile kholein (sirf is account ki Chrome window)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Scan folder */}
                          <button
                            onClick={() => scanFolder(acc.id, acc.videoFolder, true)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="Scan Video Folder"
                          >
                            <Folder className="w-3.5 h-3.5" />
                          </button>

                          {/* Account scheduler */}
                          <button
                            onClick={() => setCurrentScreen('scheduler')}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="Open Scheduler"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${acc.username} from TikTokDesk? Browser profile and TikTok account will remain safe.`)) {
                                deleteAccount(acc.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Remove Account"
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

        {/* Section 7: Mobile Window Preview Panel */}
        {selectedAccount && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#FE2C55]" />
                Mobile Window Preview
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Profile Saved
              </span>
            </div>

            {/* Mobile Preview Frame */}
            <div className="bg-black rounded-2xl p-2.5 border-2 border-slate-800 text-white relative shadow-lg">
              <div className="flex items-center justify-between text-[10px] text-white/70 px-2 pt-1 pb-2">
                <span>9:41</span>
                <span className="font-semibold text-white truncate max-w-[140px]">{selectedAccount.username}</span>
                <span>100%</span>
              </div>

              {/* Account profile card preview */}
              <div className="bg-slate-900/90 rounded-xl p-3 text-center space-y-2">
                <img
                  src={selectedAccount.avatarUrl}
                  alt=""
                  className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-[#FE2C55]"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedAccount.displayName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedAccount.username}</p>
                </div>

                <div className="grid grid-cols-3 gap-1 py-1 text-center border-y border-slate-800">
                  <div>
                    <span className="font-bold text-xs block">142</span>
                    <span className="text-[9px] text-slate-400">Following</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs block">128.4K</span>
                    <span className="text-[9px] text-slate-400">Followers</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs block">2.3M</span>
                    <span className="text-[9px] text-slate-400">Likes</span>
                  </div>
                </div>

                <button
                  onClick={() => openMobileBrowser(selectedAccount)}
                  className="w-full py-2 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Mobile Browser</span>
                </button>
              </div>

              <div className="mt-2 text-[10px] text-slate-400 text-center leading-tight">
                Profile ID: <span className="font-mono text-slate-300">{selectedAccount.browserProfileId}</span>
              </div>
            </div>

            {/* Permanent Profile Rule Explanation */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <span className="font-bold text-slate-800 block">Permanent Profile Rule:</span>
              <p>
                Cookies, local storage, saved tabs, and extensions are strictly isolated per account.
                Closing the window retains session state for subsequent runs.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FE2C55]" />
                Add New TikTok Account
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">TikTok Username</label>
                <input
                  type="text"
                  placeholder="@yourusername"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="Brand / Channel Name"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client Group</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Proxy / VPN (Optional)</label>
                <select
                  value={newProxyId}
                  onChange={(e) => setNewProxyId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-slate-800"
                >
                  <option value="">Direct Connection (No Proxy)</option>
                  {proxies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.country} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Video Storage Folder Path</label>
                <input
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono text-[11px] focus:outline-none focus:border-[#FE2C55]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Create Account Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
