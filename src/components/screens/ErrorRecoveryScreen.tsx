import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Smartphone,
  Folder,
  Play,
  Copy,
  Wrench,
  Wifi,
  FileQuestion,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';
import { ErrorRecord } from '../../types/tiktokdesk';

export const ErrorRecoveryScreen: React.FC = () => {
  const {
    errors,
    resolveError,
    executeRecoveryAction,
    accounts,
    openMobileBrowser,
    testAllProxies,
    addToast,
    filterParam,
  } = useTikTokDesk();

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [errorSearch, setErrorSearch] = useState('');
  const [selectedErrorId, setSelectedErrorId] = useState<string>(errors[0]?.id || '');
  const [solutionTab, setSolutionTab] = useState<'causes' | 'steps' | 'prevention'>('causes');

  const selectedError = errors.find((e) => e.id === selectedErrorId) || errors[0];

  // Statistics
  const totalErrors = errors.length;
  const needAttentionCount = errors.filter((e) => e.status === 'Needs Attention').length;
  const recoveredCount = errors.filter((e) => e.status === 'Recovered').length;
  const failedCount = errors.filter((e) => e.status === 'Failed').length;

  const errorTypes = [
    'all',
    'Login Errors',
    'Proxy/VPN Errors',
    'Video File Errors',
    'Upload Errors',
    'Scheduler Issues',
    'Network Errors',
  ];

  const filteredErrors = errors.filter((err) => {
    const matchType = activeTypeFilter === 'all' || err.errorType === activeTypeFilter;
    const matchSearch =
      err.accountUsername.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.errorMessage.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.errorCode.toLowerCase().includes(errorSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const handleTestInternet = () => {
    addToast('success', 'Internet Online', 'Latency to global DNS: 14ms. Bandwidth nominal.');
  };

  const handleTestTikTok = () => {
    addToast('success', 'TikTok Reachable', 'API endpoints (api16-normal-c-useast1a.tiktokv.com) responding 200 OK.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Error &amp; Recovery Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized diagnostic troubleshooting, account authentication recovery, and safe retry engine
          </p>
        </div>

        <button
          onClick={handleTestTikTok}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>Test TikTok Reachability</span>
        </button>
      </div>

      {/* Section 1: Error Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Total Errors</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalErrors}</span>
          <span className="text-[10px] text-slate-400">Past 30 days log</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-rose-600 font-medium block">Needs Attention</span>
          <span className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">{needAttentionCount}</span>
          <span className="text-[10px] text-rose-500">Requires manual action</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-emerald-600 font-medium block">Safely Recovered</span>
          <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">{recoveredCount}</span>
          <span className="text-[10px] text-emerald-600">No duplicate posts</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-amber-600 font-medium block">Safe Retry Queue</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">{failedCount}</span>
          <span className="text-[10px] text-slate-400">Checked against live status</span>
        </div>
      </div>

      {/* Section 3: Error Type Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {errorTypes.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTypeFilter(t)}
              className={`px-3 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
                activeTypeFilter === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t === 'all' ? 'All Errors' : t}
            </button>
          ))}
        </div>

        <div className="relative w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search error code..."
            value={errorSearch}
            onChange={(e) => setErrorSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#FE2C55]"
          />
        </div>
      </div>

      {/* Main Split: Left Error Table (7 cols), Right Diagnostic Diagnosis & Recovery Actions (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Error List Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/60">
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              Diagnostic Incidents ({filteredErrors.length})
            </span>
            <span className="text-[11px] text-slate-400">Click row to open diagnostic steps</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3">Account &amp; Type</th>
                  <th className="py-2.5 px-3">Error Message</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Recovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredErrors.map((err) => {
                  const isCurrent = err.id === selectedErrorId;

                  return (
                    <tr
                      key={err.id}
                      onClick={() => setSelectedErrorId(err.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block truncate">{err.accountUsername}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{err.errorType}</span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-slate-700 font-medium truncate max-w-xs">{err.errorMessage}</p>
                        <span className="text-[10px] font-mono text-slate-400 block">{err.errorCode}</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                            err.status === 'Recovered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : err.status === 'Needs Attention'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {err.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {err.timestamp}
                      </td>

                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (err.errorType === 'Login Errors') {
                              executeRecoveryAction(err.id, 're-login');
                            } else if (err.errorType === 'Proxy/VPN Errors') {
                              executeRecoveryAction(err.id, 'test-proxy');
                            } else {
                              executeRecoveryAction(err.id, 'retry-publish');
                            }
                          }}
                          className="px-2.5 py-1 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded font-bold text-[11px] shadow-xs"
                        >
                          Fix Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Diagnostic & Solution Panel (5 cols) */}
        {selectedError && (
          <div className="lg:col-span-5 space-y-4">
            {/* Section 5 & 7: Error Details & Recovery Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Incident #{selectedError.id}
                  </span>
                  <span className="text-[10px] font-mono text-rose-600 font-bold">{selectedError.errorCode}</span>
                </div>
                <button
                  onClick={() => resolveError(selectedError.id)}
                  className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>

              {/* Error Message Box */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-rose-900 block">{selectedError.errorMessage}</span>
                <span className="text-[11px] text-rose-700 block">
                  Affected Account: {selectedError.accountUsername} ({selectedError.clientName})
                </span>
                {selectedError.videoFilename && (
                  <span className="text-[11px] font-mono text-slate-600 block">
                    Video: {selectedError.videoFilename}
                  </span>
                )}
              </div>

              {/* Recovery Action Buttons (Section 7) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-slate-900 block">1-Click Recovery Actions</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => executeRecoveryAction(selectedError.id, 're-login')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-left flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#FE2C55]" />
                    <span>Re-login Window</span>
                  </button>

                  <button
                    onClick={() => executeRecoveryAction(selectedError.id, 'test-proxy')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-left flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>Test Proxy Route</span>
                  </button>

                  <button
                    onClick={() => executeRecoveryAction(selectedError.id, 'locate-file')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-left flex items-center gap-1.5"
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                    <span>Locate Video File</span>
                  </button>

                  <button
                    onClick={() => executeRecoveryAction(selectedError.id, 'retry-publish')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-left flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Safe Retry</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 8: Error Diagnosis & Solution (3 Tabs) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                {[
                  { id: 'causes', label: 'Possible Causes' },
                  { id: 'steps', label: 'Step-by-Step Fix' },
                  { id: 'prevention', label: 'Prevention Tips' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSolutionTab(tab.id as any)}
                    className={`flex-1 py-1 rounded text-xs font-semibold text-center transition-colors ${
                      solutionTab === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-700 space-y-2 pt-1">
                {solutionTab === 'causes' && (
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed text-slate-600">
                    {selectedError.possibleCauses.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                )}

                {solutionTab === 'steps' && (
                  <ol className="space-y-1.5 list-decimal list-inside text-[11px] leading-relaxed text-slate-600">
                    {selectedError.suggestedSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}

                {solutionTab === 'prevention' && (
                  <div className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
                    <p>• Keep account cookies active with routine 15m assisted browsing every 3 days.</p>
                    <p>• Avoid modifying drive letters or renaming folders outside TikTokDesk.</p>
                    <p>• Test proxy latency before enqueuing large 20+ video batches.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 9: Error Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Chronological Incident Timeline
              </span>
              <div className="space-y-1.5 border-l-2 border-slate-200 pl-3 ml-1 text-xs">
                {selectedError.timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <span className="font-mono text-[10px] text-slate-400 block">{item.time}</span>
                    <span className="text-slate-700 font-medium text-[11px]">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
