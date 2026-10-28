export type ScreenId = 
  | 'dashboard'
  | 'accounts'
  | 'mobile-windows'
  | 'video-library'
  | 'batch-publishing'
  | 'metadata'
  | 'scheduler'
  | 'publishing-queue'
  | 'archive'
  | 'history-reports'
  | 'clients'
  | 'proxy-vpn'
  | 'extensions'
  | 'session-timer'
  | 'error-center'
  | 'settings';

export type AccountStatus = 'active' | 'paused' | 'attention';

export interface TikTokAccount {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  clientId: string;
  clientName: string;
  status: AccountStatus;
  proxyId?: string;
  proxyLabel?: string;
  videoFolder: string;
  detectedVideosCount: number;
  lastActive: string;
  timezone: string;
  assignedExtensions: string[];
  browserProfileId: string;
  openTabs: string[];
  sessionStatus: 'active' | 'idle' | 'closed';
  sessionDurationMinutes: number;
}

export interface ClientWorkspace {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  niche: string;
  contactEmail: string;
  timezone: string;
  description: string;
  status: 'active' | 'paused';
  createdDate: string;
  lastActivity: string;
  notes: string;
  defaultFolder: string;
}

export interface VideoItem {
  id: string;
  filename: string;
  filePath: string;
  duration: string;
  durationSeconds: number;
  sizeMb: number;
  resolution: string;
  thumbnailUrl: string;
  addedDate: string;
  accountId: string;
  status: 'new' | 'selected' | 'duplicate' | 'queued' | 'published';
  assignedAccounts: string[];
  publishedAccounts: string[];
  caption?: string;
  hashtags?: string[];
}

export interface MetadataTemplate {
  id: string;
  name: string;
  category: string;
  caption: string;
  hashtags: string[];
  accountId?: string;
  isDefault?: boolean;
}

export type QueueTaskStatus = 
  | 'pending'
  | 'processing'
  | 'verification'
  | 'published'
  | 'failed'
  | 'cancelled';

export interface QueueTask {
  id: string;
  accountId: string;
  accountUsername: string;
  accountAvatar: string;
  videoId: string;
  videoFilename: string;
  videoThumbnail: string;
  caption: string;
  hashtags: string[];
  scheduledTime: string;
  timezone: string;
  status: QueueTaskStatus;
  progressPercent: number;
  retryCount: number;
  maxRetries: number;
  createdDate: string;
  lastUpdated: string;
  errorReason?: string;
  logs: string[];
  tiktokPostUrl?: string;
}

export interface ScheduleItem {
  id: string;
  accountId: string;
  accountUsername: string;
  videoId: string;
  videoFilename: string;
  videoThumbnail: string;
  scheduleType: 'one-time' | 'daily' | 'weekly' | 'custom';
  scheduledDate: string;
  scheduledTime: string;
  repeatDays?: string[];
  status: 'scheduled' | 'running' | 'completed' | 'paused';
}

export interface ProxyServer {
  id: string;
  name: string;
  type: 'HTTP' | 'HTTPS' | 'SOCKS5' | 'VPN';
  host: string;
  port: number;
  username?: string;
  country: string;
  status: 'connected' | 'disconnected' | 'testing' | 'failed';
  latencyMs?: number;
  exitIp?: string;
  assignedAccountsCount: number;
  lastTested?: string;
}

export interface ChromeExtension {
  id: string;
  name: string;
  version: string;
  category: 'VPN' | 'Ad Blocker' | 'Productivity' | 'SEO & Analytics';
  status: 'installed' | 'available' | 'update-available';
  installedDate?: string;
  description: string;
  iconName: string;
  assignedAccountIds: string[];
}

export interface ErrorRecord {
  id: string;
  taskId?: string;
  accountId: string;
  accountUsername: string;
  clientName: string;
  videoFilename?: string;
  errorType: 'Login Errors' | 'Proxy/VPN Errors' | 'Video File Errors' | 'Upload Errors' | 'Scheduler Issues' | 'Browser Errors' | 'Network Errors';
  errorMessage: string;
  errorCode: string;
  status: 'Failed' | 'Needs Attention' | 'Recovered';
  timestamp: string;
  attempts: number;
  maxAttempts: number;
  possibleCauses: string[];
  suggestedSteps: string[];
  timeline: { time: string; event: string }[];
}

export interface BackupRecord {
  id: string;
  name: string;
  timestamp: string;
  type: 'Automatic' | 'Manual';
  sizeMb: number;
  status: 'Success' | 'Failed';
  itemsIncluded: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  startWithWindows: boolean;
  startMinimized: boolean;
  checkForUpdates: boolean;
  autoRepairCrash: boolean;
  defaultPage: ScreenId;
  profilesFolder: string;
  keepProfilesPermanent: boolean;
  separateProfilePerAccount: boolean;
  defaultWindowSize: '390x844 (iPhone 14)' | '412x915 (Pixel 7)' | '360x800 (Galaxy S22)';
  preserveOpenTabs: boolean;
  autoRestoreSessions: boolean;
  autoBackupEnabled: boolean;
  backupFrequency: 'Daily' | 'Weekly' | 'Custom';
  backupTime: string;
  backupFolder: string;
  maxConcurrentTasks: number;
  maxOpenBrowserWindows: number;
  delayBetweenPostsSeconds: number;
  cpuLimitPercent: number;
  memoryLimitPercent: number;
  originalVideosFolder: string;
  uploadedVideosFolder: string;
  autoMoveToUploadedOnAllPublished: boolean;
  keepOriginalIfAnyFailed: boolean;
  checkDuplicateFiles: boolean;
  deleteOriginalAfterMove: boolean;
  notifyOnPublished: boolean;
  notifyOnFailed: boolean;
  notifyOnLoginExpiry: boolean;
}
