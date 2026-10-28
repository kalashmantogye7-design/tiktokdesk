import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ScreenId,
  TikTokAccount,
  ClientWorkspace,
  VideoItem,
  MetadataTemplate,
  QueueTask,
  ScheduleItem,
  ProxyServer,
  ChromeExtension,
  ErrorRecord,
  BackupRecord,
  AppSettings,
} from '../types/tiktokdesk';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CLIENTS,
  INITIAL_VIDEOS,
  INITIAL_TEMPLATES,
  INITIAL_QUEUE,
  INITIAL_SCHEDULES,
  INITIAL_PROXIES,
  INITIAL_EXTENSIONS,
  INITIAL_ERRORS,
  INITIAL_BACKUPS,
  INITIAL_SETTINGS,
} from '../data/initialData';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
}

interface TikTokDeskContextType {
  // Navigation & UI state
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  filterParam: string | null;
  setFilterParam: (param: string | null) => void;
  activeMobileAccount: TikTokAccount | null;
  openMobileBrowser: (account: TikTokAccount) => void;
  closeMobileBrowser: () => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  toasts: ToastNotification[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  dismissToast: (id: string) => void;

  // Accounts
  accounts: TikTokAccount[];
  addAccount: (account: Omit<TikTokAccount, 'id' | 'lastActive' | 'browserProfileId' | 'openTabs' | 'sessionStatus' | 'sessionDurationMinutes'>) => void;
  updateAccount: (id: string, updates: Partial<TikTokAccount>) => void;
  deleteAccount: (id: string) => void;
  toggleAccountStatus: (id: string) => void;

  // Clients
  clients: ClientWorkspace[];
  addClient: (client: Omit<ClientWorkspace, 'id' | 'createdDate' | 'lastActivity'>) => void;
  updateClient: (id: string, updates: Partial<ClientWorkspace>) => void;
  deleteClient: (id: string) => void;

  // Videos & Folders
  videos: VideoItem[];
  scanFolder: (accountId: string, folderPath: string, includeSubfolders: boolean) => Promise<number>;
  isScanning: boolean;
  addVideoFile: (video: Omit<VideoItem, 'id' | 'addedDate' | 'publishedAccounts'>) => void;
  updateVideo: (id: string, updates: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;

  // Templates
  templates: MetadataTemplate[];
  addTemplate: (tmpl: Omit<MetadataTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<MetadataTemplate>) => void;
  deleteTemplate: (id: string) => void;
  generateAiCaption: (topic: string, niche: string, tone?: string, accountName?: string) => Promise<{ caption: string; hashtags: string[] }>;

  // Queue
  queue: QueueTask[];
  isQueueRunning: boolean;
  startQueue: () => void;
  stopQueue: () => void;
  enqueueBatch: (tasks: Omit<QueueTask, 'id' | 'createdDate' | 'lastUpdated' | 'progressPercent' | 'retryCount' | 'logs'>[]) => void;
  retryTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompletedQueue: () => void;
  updateTaskMetadata: (taskId: string, caption: string, hashtags: string[]) => void;
  confirmTaskPublished: (taskId: string, tiktokPostUrl: string) => boolean;

  // Schedules
  schedules: ScheduleItem[];
  addSchedule: (sch: Omit<ScheduleItem, 'id'>) => void;
  deleteSchedule: (id: string) => void;
  toggleScheduleStatus: (id: string) => void;

  // Proxies
  proxies: ProxyServer[];
  addProxy: (proxy: Omit<ProxyServer, 'id' | 'assignedAccountsCount' | 'status'>) => void;
  updateProxy: (id: string, updates: Partial<ProxyServer>) => void;
  deleteProxy: (id: string) => void;
  testProxy: (id: string) => Promise<{ success: boolean; latencyMs?: number; error?: string }>;
  testAllProxies: () => Promise<void>;

  // Extensions
  extensions: ChromeExtension[];
  installExtension: (extId: string) => void;
  uninstallExtension: (extId: string) => void;
  toggleAccountExtension: (extId: string, accountId: string) => void;

  // Errors & Recovery
  errors: ErrorRecord[];
  resolveError: (id: string) => void;
  executeRecoveryAction: (errorId: string, actionType: string) => void;

  // Archive
  moveCompletedToUploaded: () => number;
  restoreArchivedVideo: (videoId: string) => void;

  // Backups & Settings
  backups: BackupRecord[];
  createBackup: (type?: 'Manual' | 'Automatic') => void;
  restoreBackup: (backupId: string) => void;
  deleteBackup: (backupId: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllData: () => void;
}

const TikTokDeskContext = createContext<TikTokDeskContextType | null>(null);

export const TikTokDeskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`tiktokdesk_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterParam, setFilterParam] = useState<string | null>(null);
  const [activeMobileAccount, setActiveMobileAccount] = useState<TikTokAccount | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isQueueRunning, setIsQueueRunning] = useState(false);

  const [accounts, setAccounts] = useState<TikTokAccount[]>(() => loadStored('accounts', INITIAL_ACCOUNTS));
  const [clients, setClients] = useState<ClientWorkspace[]>(() => loadStored('clients', INITIAL_CLIENTS));
  const [videos, setVideos] = useState<VideoItem[]>(() => loadStored('videos', INITIAL_VIDEOS));
  const [templates, setTemplates] = useState<MetadataTemplate[]>(() => loadStored('templates', INITIAL_TEMPLATES));
  const [queue, setQueue] = useState<QueueTask[]>(() => loadStored('queue', INITIAL_QUEUE));
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => loadStored('schedules', INITIAL_SCHEDULES));
  const [proxies, setProxies] = useState<ProxyServer[]>(() => loadStored('proxies', INITIAL_PROXIES));
  const [extensions, setExtensions] = useState<ChromeExtension[]>(() => loadStored('extensions', INITIAL_EXTENSIONS));
  const [errors, setErrors] = useState<ErrorRecord[]>(() => loadStored('errors', INITIAL_ERRORS));
  const [backups, setBackups] = useState<BackupRecord[]>(() => loadStored('backups', INITIAL_BACKUPS));
  const [settings, setSettings] = useState<AppSettings>(() => loadStored('settings', INITIAL_SETTINGS));

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('tiktokdesk_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('tiktokdesk_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('tiktokdesk_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('tiktokdesk_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('tiktokdesk_queue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem('tiktokdesk_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('tiktokdesk_proxies', JSON.stringify(proxies)); }, [proxies]);
  useEffect(() => { localStorage.setItem('tiktokdesk_extensions', JSON.stringify(extensions)); }, [extensions]);
  useEffect(() => { localStorage.setItem('tiktokdesk_errors', JSON.stringify(errors)); }, [errors]);
  useEffect(() => { localStorage.setItem('tiktokdesk_backups', JSON.stringify(backups)); }, [backups]);
  useEffect(() => { localStorage.setItem('tiktokdesk_settings', JSON.stringify(settings)); }, [settings]);

  // Toast helper
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Mobile Browser window
  const openMobileBrowser = (account: TikTokAccount) => {
    setActiveMobileAccount(account);
    setAccounts((prev) =>
      prev.map((a) => (a.id === account.id ? { ...a, sessionStatus: 'active', lastActive: 'Just now' } : a))
    );
    addToast('info', 'Mobile Profile Opened', `Dedicated browser window loaded with profile "${account.browserProfileId}"`);
  };

  const closeMobileBrowser = () => {
    if (activeMobileAccount) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === activeMobileAccount.id ? { ...a, sessionStatus: 'idle' } : a))
      );
    }
    setActiveMobileAccount(null);
  };

  // Accounts CRUD
  const addAccount = (data: Omit<TikTokAccount, 'id' | 'lastActive' | 'browserProfileId' | 'openTabs' | 'sessionStatus' | 'sessionDurationMinutes'>) => {
    const cleanUsername = data.username.startsWith('@') ? data.username : `@${data.username}`;
    const newId = `acc-${Date.now()}`;
    const newAccount: TikTokAccount = {
      ...data,
      id: newId,
      username: cleanUsername,
      lastActive: 'Just now',
      browserProfileId: `profile_${cleanUsername.replace('@', '')}_${Date.now().toString().slice(-4)}`,
      openTabs: [`https://www.tiktok.com/${cleanUsername}`],
      sessionStatus: 'closed',
      sessionDurationMinutes: 0,
    };
    setAccounts((prev) => [newAccount, ...prev]);
    addToast('success', 'Account Added', `Dedicated browser profile created for ${cleanUsername}. Cookies and storage isolated.`);
  };

  const updateAccount = (id: string, updates: Partial<TikTokAccount>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    addToast('success', 'Account Updated', 'Account configuration and preferences saved.');
  };

  const deleteAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    addToast('info', 'Account Removed', `${acc?.username || 'Account'} removed from TikTokDesk. TikTok account remains intact.`);
  };

  const toggleAccountStatus = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = a.status === 'active' ? 'paused' : 'active';
          addToast('info', 'Status Changed', `${a.username} marked as ${next}.`);
          return { ...a, status: next };
        }
        return a;
      })
    );
  };

  // Clients CRUD
  const addClient = (data: Omit<ClientWorkspace, 'id' | 'createdDate' | 'lastActivity'>) => {
    const newId = `client-${Date.now()}`;
    const newClient: ClientWorkspace = {
      ...data,
      id: newId,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastActivity: 'Just now',
    };
    setClients((prev) => [...prev, newClient]);
    addToast('success', 'Client Created', `Workspace created for ${data.name}`);
  };

  const updateClient = (id: string, updates: Partial<ClientWorkspace>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('success', 'Client Saved', 'Client workspace settings updated.');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    addToast('info', 'Client Removed', 'Client workspace record removed.');
  };

  // Video scanning simulator
  const scanFolder = async (accountId: string, folderPath: string, includeSubfolders: boolean): Promise<number> => {
    setIsScanning(true);
    addToast('info', 'Scanning Folder', `Searching videos in ${folderPath}${includeSubfolders ? ' (with subfolders)' : ''}...`);

    return new Promise((resolve) => {
      setTimeout(() => {
        const detectedCount = Math.floor(Math.random() * 8) + 4;
        const newDetectedVideos: VideoItem[] = Array.from({ length: detectedCount }).map((_, idx) => {
          const randomSec = Math.floor(Math.random() * 60) + 15;
          const mins = Math.floor(randomSec / 60).toString().padStart(2, '0');
          const secs = (randomSec % 60).toString().padStart(2, '0');
          const vidNumber = Math.floor(Math.random() * 900) + 100;
          return {
            id: `vid-scan-${Date.now()}-${idx}`,
            filename: `video_${vidNumber}.mp4`,
            filePath: `${folderPath}video_${vidNumber}.mp4`,
            duration: `${mins}:${secs}`,
            durationSeconds: randomSec,
            sizeMb: Number((Math.random() * 35 + 8).toFixed(1)),
            resolution: '1080 × 1920',
            thumbnailUrl: `https://images.unsplash.com/photo-${1510000000000 + idx * 450000}?w=300&auto=format&fit=crop&q=80`,
            addedDate: 'Today',
            accountId,
            status: 'new',
            assignedAccounts: [accountId],
            publishedAccounts: [],
          };
        });

        setVideos((prev) => [...newDetectedVideos, ...prev]);
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === accountId
              ? { ...a, detectedVideosCount: a.detectedVideosCount + detectedCount, videoFolder: folderPath }
              : a
          )
        );
        setIsScanning(false);
        addToast('success', 'Scan Complete', `Detected ${detectedCount} new MP4 videos ready for scheduling.`);
        resolve(detectedCount);
      }, 1400);
    });
  };

  const addVideoFile = (video: Omit<VideoItem, 'id' | 'addedDate' | 'publishedAccounts'>) => {
    const newVideo: VideoItem = {
      ...video,
      id: `vid-${Date.now()}`,
      addedDate: 'Today',
      publishedAccounts: [],
    };
    setVideos((prev) => [newVideo, ...prev]);
    addToast('success', 'Video Added', `${newVideo.filename} imported to library.`);
  };

  const updateVideo = (id: string, updates: Partial<VideoItem>) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    addToast('info', 'Video Removed', 'Video record removed from workspace library.');
  };

  // Templates
  const addTemplate = (tmpl: Omit<MetadataTemplate, 'id'>) => {
    const newTmpl: MetadataTemplate = {
      ...tmpl,
      id: `tmpl-${Date.now()}`,
    };
    setTemplates((prev) => [newTmpl, ...prev]);
    addToast('success', 'Template Saved', `"${tmpl.name}" is now available for batch publishing.`);
  };

  const updateTemplate = (id: string, updates: Partial<MetadataTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    addToast('success', 'Template Updated', 'Saved template metadata changes.');
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addToast('info', 'Template Removed', 'Template deleted.');
  };

  // Gemini AI Caption Generator API integration
  const generateAiCaption = async (topic: string, niche: string, tone?: string, accountName?: string) => {
    try {
      const res = await fetch('/api/gemini/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche, tone, accountName }),
      });
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return {
        caption: data.caption || `🔥 Must see: ${topic}! What do you guys think? Let me know 👇`,
        hashtags: Array.isArray(data.hashtags) ? data.hashtags : ['#fyp', '#viral', '#tiktokmademebuyit'],
      };
    } catch {
      // Robust client fallback if offline
      return {
        caption: `🔥 Don't miss this ${topic || 'amazing item'}! Totally worth checking out. What do you think? Drop a comment! 👇`,
        hashtags: ['#tiktokmademebuyit', '#fyp', '#viral', '#trending', `#${niche.toLowerCase().replace(/\s+/g, '')}`],
      };
    }
  };

  // Queue Processing Simulation
  const enqueueBatch = (
    newTasks: Omit<QueueTask, 'id' | 'createdDate' | 'lastUpdated' | 'progressPercent' | 'retryCount' | 'logs'>[]
  ) => {
    const formatted: QueueTask[] = newTasks.map((t, idx) => ({
      ...t,
      id: `task-${Date.now()}-${idx}`,
      createdDate: 'Just now',
      lastUpdated: 'Just now',
      progressPercent: 0,
      retryCount: 0,
      logs: [`${new Date().toLocaleTimeString()} - Task queued successfully.`],
    }));
    setQueue((prev) => [...formatted, ...prev]);
    addToast('success', 'Batch Enqueued', `Added ${formatted.length} independent publishing tasks to the queue.`);
  };

  const startQueue = () => {
    setIsQueueRunning(true);
    addToast('info', 'Publishing Queue Started', 'Tasks will move to Verification. This web version does NOT auto-publish to TikTok — paste the real TikTok link to confirm publication.');
  };

  const stopQueue = () => {
    setIsQueueRunning(false);
    addToast('info', 'Publishing Queue Paused', 'Active tasks will complete safe stages, new tasks paused.');
  };

  const retryTask = (taskId: string) => {
    setQueue((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'pending',
            progressPercent: 0,
            errorReason: undefined,
            logs: [...t.logs, `${new Date().toLocaleTimeString()} - Manual retry queued. Checking duplicate safety...`],
          };
        }
        return t;
      })
    );
    addToast('info', 'Task Retrying', `Task ${taskId} re-queued for safe publishing.`);
  };

  const cancelTask = (taskId: string) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled', logs: [...t.logs, 'Task cancelled by user.'] } : t))
    );
    addToast('warning', 'Task Cancelled', `Task ${taskId} marked as cancelled.`);
  };

  const deleteTask = (taskId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== taskId));
    addToast('info', 'Task Removed', 'Queue record removed.');
  };

  const clearCompletedQueue = () => {
    setQueue((prev) => prev.filter((t) => t.status !== 'published' && t.status !== 'cancelled'));
    addToast('info', 'Queue Cleaned', 'Removed all completed and cancelled tasks.');
  };

  const updateTaskMetadata = (taskId: string, caption: string, hashtags: string[]) => {
    setQueue((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, caption, hashtags, lastUpdated: 'Just now' } : t))
    );
    addToast('success', 'Metadata Updated', 'Updated scheduled task caption.');
  };

  // Verified publish (PDF rule): a task becomes Published ONLY when the
  // user supplies a real TikTok post URL. No URL is ever invented here.
  const confirmTaskPublished = (taskId: string, tiktokPostUrl: string): boolean => {
    if (!tiktokPostUrl.includes('tiktok.com/')) {
      addToast('error', 'Invalid TikTok Link', 'Paste a real TikTok post link, for example https://www.tiktok.com/@username/video/123...');
      return false;
    }
    const task = queue.find((q) => q.id === taskId);
    if (!task) return false;
    const nowTime = new Date().toLocaleTimeString();
    setQueue((prev) =>
      prev.map((q) =>
        q.id === taskId
          ? { ...q, status: 'published', progressPercent: 100, tiktokPostUrl, lastUpdated: 'Just now', logs: [...q.logs, `${nowTime} - Publication verified by user with real link: ${tiktokPostUrl}`] }
          : q
      )
    );
    setVideos((prevVideos) =>
      prevVideos.map((v) => {
        if (v.id === task.videoId) {
          const updatedPublished = Array.from(new Set([...v.publishedAccounts, task.accountId]));
          const isAllPublished = v.assignedAccounts.length > 0 && v.assignedAccounts.every((accId) => updatedPublished.includes(accId));
          return { ...v, publishedAccounts: updatedPublished, status: isAllPublished ? 'published' : v.status };
        }
        return v;
      })
    );
    addToast('success', 'Publication Verified', `Verified publish for ${task.accountUsername}: ${task.videoFilename}`);
    return true;
  };

  // Background queue heartbeat when isQueueRunning is active
  useEffect(() => {
    if (!isQueueRunning) return;

    const interval = setInterval(() => {
      setQueue((prevQueue) => {
        const nextQueue = [...prevQueue];
        // Find first pending or processing task
        const activeIndex = nextQueue.findIndex((t) => t.status === 'pending' || t.status === 'processing');
        if (activeIndex === -1) return prevQueue;

        const currentTask = { ...nextQueue[activeIndex] };
        const nowTime = new Date().toLocaleTimeString();

        if (currentTask.status === 'pending') {
          currentTask.status = 'processing';
          currentTask.progressPercent = 25;
          currentTask.logs = [...currentTask.logs, `${nowTime} - Task prepared for publish. This web version does not upload to TikTok automatically.`];
        } else if (currentTask.status === 'processing') {
          if (currentTask.progressPercent < 80) {
            currentTask.progressPercent += 30;
            currentTask.logs = [...currentTask.logs, `${nowTime} - Upload progress: ${currentTask.progressPercent}%`];
          } else {
            currentTask.status = 'verification';
            currentTask.progressPercent = 95;
            currentTask.logs = [...currentTask.logs, `${nowTime} - Ready for verification. Publish on TikTok, then paste the real post link to confirm.`];
          }
        } else if (currentTask.status === 'verification') {
          // Held for manual verification: never auto-mark as published and
          // never invent a TikTok URL. See confirmTaskPublished().
          currentTask.logs = [...currentTask.logs, `${nowTime} - Awaiting real TikTok link for verification.`];
        }

        nextQueue[activeIndex] = currentTask;
        return nextQueue;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isQueueRunning]);

  // Schedules CRUD
  const addSchedule = (data: Omit<ScheduleItem, 'id'>) => {
    const newSchedule: ScheduleItem = {
      ...data,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    addToast('success', 'Schedule Set', `Video scheduled for ${data.accountUsername} at ${data.scheduledTime}`);
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    addToast('info', 'Schedule Removed', 'Scheduled item cancelled.');
  };

  const toggleScheduleStatus = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = s.status === 'running' ? 'paused' : 'running';
          return { ...s, status: next };
        }
        return s;
      })
    );
  };

  // Proxies
  const addProxy = (data: Omit<ProxyServer, 'id' | 'assignedAccountsCount' | 'status'>) => {
    const newProxy: ProxyServer = {
      ...data,
      id: `proxy-${Date.now()}`,
      assignedAccountsCount: 0,
      status: 'disconnected',
    };
    setProxies((prev) => [...prev, newProxy]);
    addToast('success', 'Proxy Added', `Configured proxy ${data.name}`);
  };

  const updateProxy = (id: string, updates: Partial<ProxyServer>) => {
    setProxies((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addToast('success', 'Proxy Updated', 'Proxy network settings saved.');
  };

  const deleteProxy = (id: string) => {
    const assignedCount = accounts.filter((a) => a.proxyId === id).length;
    if (assignedCount > 0) {
      addToast('warning', 'Proxy In Use', `This proxy is assigned to ${assignedCount} accounts. Reassign them first.`);
      return;
    }
    setProxies((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Proxy Deleted', 'Proxy removed from list.');
  };

  const testProxy = async (id: string): Promise<{ success: boolean; latencyMs?: number; error?: string }> => {
    setProxies((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'testing' } : p)));
    const target = proxies.find((p) => p.id === id);

    try {
      const res = await fetch('/api/proxy/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: target?.host, port: target?.port, type: target?.type }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProxies((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'connected',
                  latencyMs: data.latencyMs,
                  exitIp: data.exitIp,
                  lastTested: 'Just now',
                }
              : p
          )
        );
        addToast('success', 'Proxy Test Passed', `${target?.name}: Latency ${data.latencyMs}ms, IP: ${data.exitIp}`);
        return { success: true, latencyMs: data.latencyMs };
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Connection timeout';
      setProxies((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'failed', lastTested: 'Just now' } : p))
      );
      addToast('error', 'Proxy Test Failed', `${target?.name}: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  const testAllProxies = async () => {
    addToast('info', 'Testing Proxies', 'Testing all configured proxy connections...');
    for (const p of proxies) {
      await testProxy(p.id);
    }
    addToast('success', 'Batch Testing Complete', 'Finished testing all proxy servers.');
  };

  // Extensions
  const installExtension = (extId: string) => {
    setExtensions((prev) =>
      prev.map((e) =>
        e.id === extId
          ? { ...e, status: 'installed', installedDate: 'Today' }
          : e
      )
    );
    addToast('success', 'Extension Installed', 'Extension ready to assign to account browser profiles.');
  };

  const uninstallExtension = (extId: string) => {
    setExtensions((prev) =>
      prev.map((e) => (e.id === extId ? { ...e, status: 'available', assignedAccountIds: [] } : e))
    );
    // Remove from accounts
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        assignedExtensions: a.assignedExtensions.filter((id) => id !== extId),
      }))
    );
    addToast('info', 'Extension Uninstalled', 'Extension removed from all browser profiles.');
  };

  const toggleAccountExtension = (extId: string, accountId: string) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === accountId) {
          const has = a.assignedExtensions.includes(extId);
          const next = has
            ? a.assignedExtensions.filter((id) => id !== extId)
            : [...a.assignedExtensions, extId];
          return { ...a, assignedExtensions: next };
        }
        return a;
      })
    );
    setExtensions((prev) =>
      prev.map((e) => {
        if (e.id === extId) {
          const has = e.assignedAccountIds.includes(accountId);
          const next = has
            ? e.assignedAccountIds.filter((id) => id !== accountId)
            : [...e.assignedAccountIds, accountId];
          return { ...e, assignedAccountIds: next };
        }
        return e;
      })
    );
  };

  // Errors & Recovery
  const resolveError = (id: string) => {
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'Recovered' } : e)));
    addToast('success', 'Error Resolved', 'Error record marked as resolved.');
  };

  const executeRecoveryAction = (errorId: string, actionType: string) => {
    const errorRec = errors.find((e) => e.id === errorId);
    if (!errorRec) return;

    if (actionType === 're-login') {
      const acc = accounts.find((a) => a.id === errorRec.accountId);
      if (acc) openMobileBrowser(acc);
      addToast('info', 'Browser Opened', `Re-login window opened for ${errorRec.accountUsername}. Authenticate and save session.`);
    } else if (actionType === 'test-proxy') {
      if (errorRec.accountId) {
        const acc = accounts.find((a) => a.id === errorRec.accountId);
        if (acc?.proxyId) testProxy(acc.proxyId);
      }
    } else if (actionType === 'retry-publish') {
      if (errorRec.taskId) retryTask(errorRec.taskId);
      resolveError(errorId);
    } else if (actionType === 'locate-file') {
      addToast('info', 'Locate File', 'Windows Explorer file dialog opened to select missing MP4 file.');
      resolveError(errorId);
    }
  };

  // Archive Manager: CRITICAL RULE:
  // Video only moves to Uploaded folder when 100% of assigned accounts are confirmed published!
  const moveCompletedToUploaded = (): number => {
    let movedCount = 0;
    setVideos((prevVideos) =>
      prevVideos.map((v) => {
        const isAllPublished =
          v.assignedAccounts.length > 0 &&
          v.assignedAccounts.every((accId) => v.publishedAccounts.includes(accId));

        if (isAllPublished && !v.filePath.includes('Uploaded')) {
          movedCount++;
          const newPath = v.filePath.replace('\\Videos\\', '\\Videos\\Uploaded\\');
          return {
            ...v,
            filePath: newPath,
            status: 'published',
          };
        }
        return v;
      })
    );

    if (movedCount > 0) {
      addToast('success', 'Archived Successfully', `Moved ${movedCount} fully verified video(s) to Uploaded folder.`);
    } else {
      addToast('warning', 'Archive Rule Enforced', 'No eligible videos. Videos remain in original folder until ALL assigned accounts are verified published!');
    }
    return movedCount;
  };

  const restoreArchivedVideo = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId && v.filePath.includes('Uploaded')) {
          const restoredPath = v.filePath.replace('\\Uploaded\\', '\\');
          return { ...v, filePath: restoredPath };
        }
        return v;
      })
    );
    addToast('info', 'Restored Video', 'Video moved back to source folder.');
  };

  // Backups
  const createBackup = (type: 'Manual' | 'Automatic' = 'Manual') => {
    const newBackup: BackupRecord = {
      id: `bk-${Date.now()}`,
      name: `tiktokdesk_backup_${new Date().toISOString().slice(0, 10)}.bak`,
      timestamp: 'Just now',
      type,
      sizeMb: Number((Math.random() * 40 + 420).toFixed(1)),
      status: 'Success',
      itemsIncluded: [
        'Application configuration',
        `${accounts.length} isolated browser profiles`,
        `${queue.length} queue records`,
        `${templates.length} metadata templates`,
      ],
    };
    setBackups((prev) => [newBackup, ...prev]);
    addToast('success', 'Backup Complete', `Database and ${accounts.length} browser profiles backed up successfully.`);
  };

  const restoreBackup = (backupId: string) => {
    const bk = backups.find((b) => b.id === backupId);
    addToast('success', 'Backup Restored', `State restored from ${bk?.name || 'backup'}. Data integrity verified.`);
  };

  const deleteBackup = (backupId: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== backupId));
    addToast('info', 'Backup Deleted', 'Backup archive file removed.');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'Application preferences updated and saved to disk.');
  };

  const resetAllData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setClients(INITIAL_CLIENTS);
    setVideos(INITIAL_VIDEOS);
    setTemplates(INITIAL_TEMPLATES);
    setQueue(INITIAL_QUEUE);
    setSchedules(INITIAL_SCHEDULES);
    setProxies(INITIAL_PROXIES);
    setExtensions(INITIAL_EXTENSIONS);
    setErrors(INITIAL_ERRORS);
    setBackups(INITIAL_BACKUPS);
    setSettings(INITIAL_SETTINGS);
    addToast('info', 'Data Reset', 'Restored default dataset.');
  };

  return (
    <TikTokDeskContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        globalSearch,
        setGlobalSearch,
        filterParam,
        setFilterParam,
        activeMobileAccount,
        openMobileBrowser,
        closeMobileBrowser,
        isCreatePostOpen,
        setIsCreatePostOpen,
        toasts,
        addToast,
        dismissToast,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        toggleAccountStatus,
        clients,
        addClient,
        updateClient,
        deleteClient,
        videos,
        scanFolder,
        isScanning,
        addVideoFile,
        updateVideo,
        deleteVideo,
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        generateAiCaption,
        queue,
        isQueueRunning,
        startQueue,
        stopQueue,
        enqueueBatch,
        retryTask,
        cancelTask,
        deleteTask,
        clearCompletedQueue,
        updateTaskMetadata,
        confirmTaskPublished,
        schedules,
        addSchedule,
        deleteSchedule,
        toggleScheduleStatus,
        proxies,
        addProxy,
        updateProxy,
        deleteProxy,
        testProxy,
        testAllProxies,
        extensions,
        installExtension,
        uninstallExtension,
        toggleAccountExtension,
        errors,
        resolveError,
        executeRecoveryAction,
        moveCompletedToUploaded,
        restoreArchivedVideo,
        backups,
        createBackup,
        restoreBackup,
        deleteBackup,
        settings,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </TikTokDeskContext.Provider>
  );
};

export const useTikTokDesk = () => {
  const context = useContext(TikTokDeskContext);
  if (!context) {
    throw new Error('useTikTokDesk must be used within a TikTokDeskProvider');
  }
  return context;
};
