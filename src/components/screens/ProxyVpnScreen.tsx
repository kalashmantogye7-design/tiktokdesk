import React, { useState } from 'react';
import {
  Shield,
  Plus,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Lock,
  Play,
  Download,
  Upload,
  Trash2,
  Edit2,
  Activity,
  Check,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { ProxyServer } from '../../types/tiktokdesk';

export const ProxyVpnScreen: React.FC = () => {
  const {
    proxies,
    accounts,
    addProxy,
    updateProxy,
    deleteProxy,
    testProxy,
    testAllProxies,
    addToast,
  } = useTikTokDesk();

  const [activeConnType, setActiveConnType] = useState<'all' | 'HTTP' | 'SOCKS5' | 'VPN' | 'Direct'>('all');
  const [proxySearch, setProxySearch] = useState('');
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Add Proxy Modal
  const [isAddProxyModal, setIsAddProxyModal] = useState(false);
  const [proxyName, setProxyName] = useState('');
  const [proxyType, setProxyType] = useState<'HTTP' | 'HTTPS' | 'SOCKS5' | 'VPN'>('HTTP');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(8080);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United States');

  // Stats
  const totalProxies = proxies.length;
  const connectedCount = proxies.filter((p) => p.status === 'connected').length;
  const failedCount = proxies.filter((p) => p.status === 'failed').length;

  const filteredProxies = proxies.filter((p) => {
    const matchType = activeConnType === 'all' || p.type === activeConnType;
    const matchSearch =
      p.name.toLowerCase().includes(proxySearch.toLowerCase()) ||
      p.host.toLowerCase().includes(proxySearch.toLowerCase()) ||
      p.country.toLowerCase().includes(proxySearch.toLowerCase());
    return matchType && matchSearch;
  });

  const handleCreateProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proxyName.trim() || !host.trim()) return;

    addProxy({
      name: proxyName.trim(),
      type: proxyType,
      host: host.trim(),
      port: Number(port),
      username: username.trim() || undefined,
      country,
    });

    setIsAddProxyModal(false);
    setProxyName('');
    setHost('');
  };

  const handleRunBatchTest = async () => {
    setIsTestingAll(true);
    await testAllProxies();
    setIsTestingAll(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Proxy &amp; VPN Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage residential proxies, SOCKS5 servers, and VPN routing for 10–30+ isolated TikTok accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunBatchTest}
            disabled={isTestingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isTestingAll ? 'animate-spin' : ''}`} />
            <span>Test All Proxies</span>
          </button>
          <button
            onClick={() => setIsAddProxyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Proxy</span>
          </button>
        </div>
      </div>

      {/* Section 1: Connection Type Selection Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          { id: 'Direct', title: 'Direct Connection', desc: 'Normal internet connection without proxy routing', icon: Globe },
          { id: 'HTTP', title: 'HTTP/HTTPS Proxy', desc: 'Secure web proxy for accounts with standard routing', icon: Shield },
          { id: 'SOCKS5', title: 'SOCKS5 Proxy', desc: 'Low-level TCP protocol with high-speed proxy tunnel', icon: Lock },
          { id: 'VPN', title: 'VPN Integration', desc: 'Surfshark / Urban VPN browser extensions', icon: Shield },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeConnType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveConnType(item.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#FE2C55] bg-rose-50/20 ring-1 ring-[#FE2C55]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900">{item.title}</span>
                <Icon className="w-4 h-4 text-[#FE2C55]" />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Section 6: Connection Health Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Total Proxies</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalProxies}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Active &amp; Connected</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{connectedCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Failed Node Alerts</span>
          <span className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">{failedCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Avg Response Latency</span>
          <span className="text-2xl font-extrabold text-indigo-600 font-mono tabular-nums">42 ms</span>
        </div>
      </div>

      {/* Main Grid: Left Proxy Servers Table, Right Account & Proxy Assignment Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Proxy Server Pool (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/60">
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              Configured Proxy Servers ({filteredProxies.length})
            </span>
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search host..."
                value={proxySearch}
                onChange={(e) => setProxySearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded pl-6 pr-2 py-0.5 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2 px-3">Proxy Name</th>
                  <th className="py-2 px-3">Host &amp; Port</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProxies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block">{p.country} · {p.type}</span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                      {p.host}:{p.port}
                    </td>

                    <td className="py-2.5 px-3 font-mono">
                      {p.latencyMs ? (
                        <span className="text-emerald-600 font-bold">{p.latencyMs} ms</span>
                      ) : p.status === 'testing' ? (
                        <span className="text-amber-500 text-[10px]">Testing...</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">--</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          p.status === 'connected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : p.status === 'testing'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => testProxy(p.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100"
                          title="Test Connection"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProxy(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          title="Delete Proxy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Account & Proxy Assignment Table (Section 2) (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/60">
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              Account Network Routing ({accounts.length})
            </span>
            <span className="text-[10px] text-slate-400">Isolated per profile</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2 px-3">Account</th>
                  <th className="py-2 px-3">Assigned Proxy</th>
                  <th className="py-2 px-3">Route Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <img src={acc.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate">{acc.username}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-mono text-slate-700 text-[11px] truncate block max-w-[140px]">
                        {acc.proxyLabel || 'Direct Connection'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Routed
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (acc.proxyId) testProxy(acc.proxyId);
                          else addToast('info', 'Direct Test', `${acc.username} uses normal direct internet connection.`);
                        }}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700"
                      >
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Proxy Modal */}
      {isAddProxyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FE2C55]" />
                Add New Proxy Server
              </h3>
              <button onClick={() => setIsAddProxyModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProxy} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Proxy Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. USA-NewYork-Residential-01"
                  required
                  value={proxyName}
                  onChange={(e) => setProxyName(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type</label>
                  <select
                    value={proxyType}
                    onChange={(e) => setProxyType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 bg-slate-50"
                  >
                    <option value="HTTP">HTTP</option>
                    <option value="HTTPS">HTTPS</option>
                    <option value="SOCKS5">SOCKS5</option>
                    <option value="VPN">VPN Tunnel</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">IP / Hostname</label>
                  <input
                    type="text"
                    placeholder="proxy.example.com"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProxyModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#FE2C55] text-white rounded font-bold"
                >
                  Save Proxy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
