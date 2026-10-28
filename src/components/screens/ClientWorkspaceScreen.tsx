import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Folder,
  Shield,
  Play,
  RotateCw,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Clock,
  Check,
  Smartphone,
  Save,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { ClientWorkspace } from '../../types/tiktokdesk';

export const ClientWorkspaceScreen: React.FC = () => {
  const {
    clients,
    accounts,
    addClient,
    updateClient,
    deleteClient,
    openMobileBrowser,
    setCurrentScreen,
    addToast,
  } = useTikTokDesk();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [clientSearch, setClientSearch] = useState('');
  const [notesText, setNotesText] = useState(clients[0]?.notes || '');

  // Add client modal
  const [isAddClientModal, setIsAddClientModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('United States');
  const [newNiche, setNewNiche] = useState('E-commerce');
  const [newEmail, setNewEmail] = useState('');
  const [newTimezone, setNewTimezone] = useState('UTC-5 (New York)');

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientAccounts = accounts.filter((a) => a.clientId === selectedClientId);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.country.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addClient({
      name: newName.trim(),
      country: newCountry,
      countryFlag: newCountry.includes('USA') || newCountry.includes('United States') ? '🇺🇸' : '🇩🇪',
      niche: newNiche,
      contactEmail: newEmail || 'ops@agency.com',
      timezone: newTimezone,
      description: `Client workspace for ${newName}`,
      status: 'active',
      notes: 'New client account initialized.',
      defaultFolder: `D:\\TikTok\\${newName.replace(/\s+/g, '')}\\`,
    });

    setIsAddClientModal(false);
    setNewName('');
  };

  const handleSaveNotes = () => {
    if (selectedClient) {
      updateClient(selectedClient.id, { notes: notesText });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Client Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage agency clients (USA, Germany, UK), dedicated account pools, folders, and isolated proxies
          </p>
        </div>

        <button
          onClick={() => setIsAddClientModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Main Grid: Left Clients List (3 cols), Center Client Info & Accounts (6 cols), Right Notes & Settings (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Client List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Clients ({clients.length})
          </span>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
            />
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              const count = accounts.filter((a) => a.clientId === client.id).length;

              return (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClientId(client.id);
                    setNotesText(client.notes);
                  }}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#FE2C55] bg-rose-50/20 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                      <span>{client.countryFlag}</span>
                      <span className="truncate">{client.name}</span>
                    </span>
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        client.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{client.niche}</span>
                    <span className="font-mono font-semibold">{count} accounts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Client Details & Accounts Table (6 cols) */}
        {selectedClient && (
          <div className="lg:col-span-6 space-y-4">
            {/* Section 2: Client Profile Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedClient.countryFlag}</span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{selectedClient.name}</h2>
                    <span className="text-[11px] text-slate-400">{selectedClient.country} · {selectedClient.niche}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      clientAccounts.forEach((acc) => openMobileBrowser(acc));
                      addToast('info', 'Batch Launched', `Opened browser windows for all ${clientAccounts.length} accounts.`);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open All Accounts</span>
                  </button>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Timezone</span>
                  <span className="font-semibold text-slate-800 block truncate">{selectedClient.timezone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email</span>
                  <span className="text-slate-800 block truncate">{selectedClient.contactEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Created</span>
                  <span className="font-mono text-slate-800 block">{selectedClient.createdDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Videos</span>
                  <span className="font-mono font-bold text-slate-900 block">48 Vids</span>
                </div>
              </div>
            </div>

            {/* Section 4: Client Accounts Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/60">
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  Client Accounts ({clientAccounts.length})
                </span>
                <span className="text-[11px] text-slate-400">Strict profile isolation active</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                    <tr>
                      <th className="py-2 px-3">Username</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Video Folder</th>
                      <th className="py-2 px-3">Proxy / VPN</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <img src={acc.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <span className="font-bold text-slate-900 truncate">{acc.username}</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                              acc.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                          {acc.videoFolder}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 truncate max-w-[110px]">
                          {acc.proxyLabel || 'Direct'}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => openMobileBrowser(acc)}
                            className="p-1.5 bg-slate-100 hover:bg-[#FE2C55] hover:text-white rounded-lg text-slate-700 transition-colors"
                            title="Open Browser"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Client Notes & Settings (3 cols) */}
        {selectedClient && (
          <div className="lg:col-span-3 space-y-4">
            {/* Section 9: Client Notes & Instructions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#FE2C55]" />
                  Client Notes &amp; Rules
                </span>
                <button
                  onClick={handleSaveNotes}
                  className="text-[10px] text-[#FE2C55] font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
              </div>

              <textarea
                rows={5}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Client specific posting guidelines, hook preferences, hashtag rules..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>

            {/* Performance Summary (Section 10) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
                Client Performance
              </span>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Published Success:</span>
                  <span className="font-mono font-bold text-emerald-600">92%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Views:</span>
                  <span className="font-mono font-bold text-slate-900">1.2M</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Accounts:</span>
                  <span className="font-mono font-bold text-slate-900">{clientAccounts.length}</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentScreen('history-reports')}
                className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                View Detailed Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FE2C55]" />
                Add Agency Client Workspace
              </h3>
              <button onClick={() => setIsAddClientModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="Client name"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Niche</label>
                  <input
                    type="text"
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
                <input
                  type="text"
                  value={newTimezone}
                  onChange={(e) => setNewTimezone(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#FE2C55] text-white rounded font-bold"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
