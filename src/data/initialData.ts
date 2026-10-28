import {
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

// WORKABLE VERSION (2026-10-28): demo data removed.
// App starts empty. User adds their own clients, accounts, videos,
// proxies, extensions, templates, schedules and queue tasks from the UI.
// Data persists in the browser (localStorage) via TikTokDeskContext.
export const INITIAL_CLIENTS: ClientWorkspace[] = [];
export const INITIAL_ACCOUNTS: TikTokAccount[] = [];
export const INITIAL_VIDEOS: VideoItem[] = [];
export const INITIAL_TEMPLATES: MetadataTemplate[] = [];
export const INITIAL_QUEUE: QueueTask[] = [];
export const INITIAL_SCHEDULES: ScheduleItem[] = [];
export const INITIAL_PROXIES: ProxyServer[] = [];
export const INITIAL_EXTENSIONS: ChromeExtension[] = [];
export const INITIAL_ERRORS: ErrorRecord[] = [];
export const INITIAL_BACKUPS: BackupRecord[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  startWithWindows: true,
  startMinimized: false,
  checkForUpdates: true,
  autoRepairCrash: true,
  defaultPage: 'dashboard',
  profilesFolder: 'D:\\TikTokDesk\\Profiles\\',
  keepProfilesPermanent: true,
  separateProfilePerAccount: true,
  defaultWindowSize: '390x844 (iPhone 14)',
  preserveOpenTabs: true,
  autoRestoreSessions: true,
  autoBackupEnabled: true,
  backupFrequency: 'Daily',
  backupTime: '02:00 AM',
  backupFolder: 'D:\\TikTokDesk\\Backups\\',
  maxConcurrentTasks: 2,
  maxOpenBrowserWindows: 5,
  delayBetweenPostsSeconds: 30,
  cpuLimitPercent: 80,
  memoryLimitPercent: 85,
  originalVideosFolder: 'D:\\TikTok\\Videos\\',
  uploadedVideosFolder: 'D:\\TikTok\\Uploaded\\',
  autoMoveToUploadedOnAllPublished: true,
  keepOriginalIfAnyFailed: true,
  checkDuplicateFiles: true,
  deleteOriginalAfterMove: false,
  notifyOnPublished: true,
  notifyOnFailed: true,
  notifyOnLoginExpiry: true,
};
