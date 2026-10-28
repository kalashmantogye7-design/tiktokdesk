import React, { useState } from 'react';
import {
  Settings,
  HardDrive,
  Shield,
  Bell,
  Cpu,
  Folder,
  Database,
  Lock,
  Download,
  Upload,
  RotateCw,
  Check,
  Trash2,
  Undo2,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { useTikTokDesk } from '../../context/TikTokDeskContext';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    resetAllData,
    addToast,
  } = useTikTokDesk();

  const [activeTab, setActiveTab] = useState<'general' | 'profiles' | 'backup' | 'performance' | 'security' | 'system'>('general');

  const handleExportConfig = () => {
    const configData = JSON.stringify(settings, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiktokdesk_configuration_${Date.now()}.json`;
    a.click();
    addToast('success', 'Configuration Exported', 'Saved application settings JSON to disk.');
  };

  const handleOptimizeDb = () => {
    addToast('success', 'Database Optimized', 'SQLite vacuum complete. Freed 42.5 MB disk space. Account cookies intact.');
  };

  const handleRepairDb = () => {
    addToast('info', 'Database Verified', 'Integrity check: 0 errors detected. All foreign keys and isolated profiles valid.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Settings &amp; Backup</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure desktop preferences, permanent browser profile storage, automated backups, and performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Settings</span>
          </button>
          <button
            onClick={() => createBackup('Manual')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE2C55] hover:bg-[#e0264b] text-white rounded-lg text-xs font-bold shadow-md shadow-[#FE2C55]/20"
          >
            <HardDrive className="w-4 h-4 stroke-[2.5]" />
            <span>Create Backup Now</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
        {[
          { id: 'general', label: 'General & Windows' },
          { id: 'profiles', label: 'Browser Profiles' },
          { id: 'backup', label: 'Backups & Storage' },
          { id: 'performance', label: 'Performance & Limits' },
          { id: 'security', label: 'Security & Privacy' },
          { id: 'system', label: 'System Information' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: General & Windows Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              1. General Application Preferences
            </span>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Start with Windows</span>
                  <span className="text-[11px] text-slate-400">Launch TikTokDesk automatically on PC boot</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startWithWindows}
                  onChange={(e) => updateSettings({ startWithWindows: e.target.checked })}
                  className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Start Minimized</span>
                  <span className="text-[11px] text-slate-400">Keep application in Windows system tray on startup</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startMinimized}
                  onChange={(e) => updateSettings({ startMinimized: e.target.checked })}
                  className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Auto-Repair on Crash</span>
                  <span className="text-[11px] text-slate-400">Reconcile interrupted tasks and restore open tabs</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRepairCrash}
                  onChange={(e) => updateSettings({ autoRepairCrash: e.target.checked })}
                  className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Default Startup Screen</label>
                <select
                  value={settings.defaultPage}
                  onChange={(e) => updateSettings({ defaultPage: e.target.value as any })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800"
                >
                  <option value="dashboard">Main Dashboard</option>
                  <option value="accounts">Account Manager</option>
                  <option value="publishing-queue">Publishing Queue</option>
                  <option value="scheduler">Smart Scheduler</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Windows 10 &amp; 11 Integration
            </span>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>System Architecture:</span>
                <span className="font-mono text-slate-800">Windows 11 Pro 64-bit</span>
              </div>
              <div className="flex justify-between">
                <span>Tray Notifications:</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Multi-Monitor DPI Scaling:</span>
                <span className="font-semibold text-slate-800">100% / 125% Supported</span>
              </div>
            </div>

            <button
              onClick={() => addToast('info', 'Test Notification', 'Windows native desktop toast sent successfully.')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Test Windows Desktop Notification
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Browser Profiles Settings */}
      {activeTab === 'profiles' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 text-xs">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            2. Permanent Browser Profile Storage
          </span>

          <div className="space-y-3 max-w-2xl">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Local Profiles Directory</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.profilesFolder}
                  onChange={(e) => updateSettings({ profilesFolder: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] bg-slate-50 text-slate-800"
                />
                <button
                  onClick={() => addToast('info', 'Explorer', 'Opened Profiles directory')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 shrink-0"
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-semibold text-slate-800 block">Keep Browser Profiles Permanent</span>
                <span className="text-[11px] text-slate-400">Preserve cookies, login states, and local storage on exit</span>
              </div>
              <input
                type="checkbox"
                checked={settings.keepProfilesPermanent}
                onChange={(e) => updateSettings({ keepProfilesPermanent: e.target.checked })}
                className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Use Separate Profile per Account</span>
                <span className="text-[11px] text-slate-400">Account A and Account B data never mix</span>
              </div>
              <input
                type="checkbox"
                checked={settings.separateProfilePerAccount}
                onChange={(e) => updateSettings({ separateProfilePerAccount: e.target.checked })}
                className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Preserve Open Tabs</span>
                <span className="text-[11px] text-slate-400">Restore last visited tab URLs on relaunch</span>
              </div>
              <input
                type="checkbox"
                checked={settings.preserveOpenTabs}
                onChange={(e) => updateSettings({ preserveOpenTabs: e.target.checked })}
                className="rounded text-[#FE2C55] focus:ring-[#FE2C55]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Default Mobile Viewport</label>
              <select
                value={settings.defaultWindowSize}
                onChange={(e) => updateSettings({ defaultWindowSize: e.target.value as any })}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800"
              >
                <option value="390x844 (iPhone 14)">390 × 844 (iPhone 14)</option>
                <option value="412x915 (Pixel 7)">412 × 915 (Google Pixel 7)</option>
                <option value="360x800 (Galaxy S22)">360 × 800 (Samsung Galaxy S22)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backups & Storage */}
      {activeTab === 'backup' && (
        <div className="space-y-5 text-xs">
          {/* Automatic Backup Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              3. Automated Backup Configuration
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Backup Frequency</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => updateSettings({ backupFrequency: e.target.value as any })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Execution Time</label>
                <input
                  type="text"
                  value={settings.backupTime}
                  onChange={(e) => updateSettings({ backupTime: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Storage Location</label>
                <input
                  type="text"
                  value={settings.backupFolder}
                  onChange={(e) => updateSettings({ backupFolder: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Backup History Table (Section 10) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs bg-slate-50/60">
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                Backup Archives ({backups.length})
              </span>
              <button
                onClick={() => createBackup('Manual')}
                className="text-[#FE2C55] font-semibold hover:underline"
              >
                + New Backup
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold select-none">
                  <tr>
                    <th className="py-2 px-3">Archive File</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {bk.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{bk.timestamp}</td>
                      <td className="py-2.5 px-3 text-slate-700">{bk.type}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{bk.sizeMb} MB</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {bk.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => restoreBackup(bk.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => deleteBackup(bk.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
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

          {/* Section 4: Data Management (Database maintenance) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              4. SQLite Database Management
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOptimizeDb}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
              >
                Optimize Database (VACUUM)
              </button>
              <button
                onClick={handleRepairDb}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
              >
                Repair &amp; Integrity Check
              </button>
              <button
                onClick={() => addToast('info', 'Logs Cleared', 'Historical temporary logs cleaned.')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700"
              >
                Clear Temp Logs
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset TikTokDesk demo database to initial state?')) {
                    resetAllData();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-semibold ml-auto"
              >
                Reset Database to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Performance & Limits */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 text-xs">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            7. Performance &amp; Resource Limits (10–30 Accounts Scale)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Maximum Concurrent Publishing Tasks: {settings.maxConcurrentTasks}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={settings.maxConcurrentTasks}
                onChange={(e) => updateSettings({ maxConcurrentTasks: Number(e.target.value) })}
                className="w-full accent-[#FE2C55]"
              />
              <span className="text-[10px] text-slate-400">Controls how many accounts upload videos simultaneously</span>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Delay Between Posts (seconds): {settings.delayBetweenPostsSeconds}s
              </label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={settings.delayBetweenPostsSeconds}
                onChange={(e) => updateSettings({ delayBetweenPostsSeconds: Number(e.target.value) })}
                className="w-full accent-[#FE2C55]"
              />
              <span className="text-[10px] text-slate-400">Safe pacing gap between consecutive tasks</span>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Maximum Open Browser Windows: {settings.maxOpenBrowserWindows}
              </label>
              <input
                type="range"
                min={1}
                max={15}
                value={settings.maxOpenBrowserWindows}
                onChange={(e) => updateSettings({ maxOpenBrowserWindows: Number(e.target.value) })}
                className="w-full accent-[#FE2C55]"
              />
              <span className="text-[10px] text-slate-400">Protects PC RAM from overload</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security & Privacy */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 text-xs max-w-2xl">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            9. Application Security &amp; Credentials Isolation
          </span>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">No Password Stored Rule:</span>
              <p>
                TikTokDesk never saves your raw TikTok passwords in plaintext. All sessions are authenticated
                directly inside the isolated Chromium browser instance using secure persistent cookie jars.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Hide Passwords &amp; Tokens in Logs</span>
                <span className="text-[11px] text-slate-400">Prevent credentials from writing to debug outputs</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-[#FE2C55]" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Encrypted Backup Archives</span>
                <span className="text-[11px] text-slate-400">Use AES-256 local key encryption when archiving profiles</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-[#FE2C55]" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: System Information (Section 12) */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 text-xs">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            12. Technical Environment &amp; System Information
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">TikTokDesk Build</span>
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-mono text-slate-800 font-bold">2.4.0 PRO</span>
              </div>
              <div className="flex justify-between">
                <span>Build Date:</span>
                <span className="font-mono text-slate-800">12 May 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Browser Engine:</span>
                <span className="font-mono text-slate-800">Chromium Embedded 124.0.6</span>
              </div>
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="font-mono text-slate-800">SQLite 3.45.1 (WAL Mode)</span>
              </div>
            </div>

            <div className="space-y-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Host Hardware</span>
              <div className="flex justify-between">
                <span>Operating System:</span>
                <span className="font-semibold text-slate-800">Windows 11 Pro 64-bit</span>
              </div>
              <div className="flex justify-between">
                <span>Available Memory:</span>
                <span className="font-mono text-slate-800">24.2 GB / 32 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Primary Storage (D:):</span>
                <span className="font-mono text-slate-800">412.8 GB Free</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => addToast('info', 'Windows Explorer', 'Opened D:\\TikTokDesk\\ in Windows Explorer')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Folder className="w-4 h-4" />
            <span>Open Application Data Folder</span>
          </button>
        </div>
      )}
    </div>
  );
};
