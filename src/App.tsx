/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TikTokDeskProvider, useTikTokDesk } from './context/TikTokDeskContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileBrowserModal } from './components/MobileBrowserModal';
import { CreatePostModal } from './components/CreatePostModal';

// 16 Complete Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { MobileWindowsScreen } from './components/screens/MobileWindowsScreen';
import { VideoLibraryScreen } from './components/screens/VideoLibraryScreen';
import { BatchPublishingScreen } from './components/screens/BatchPublishingScreen';
import { MetadataScreen } from './components/screens/MetadataScreen';
import { SchedulerScreen } from './components/screens/SchedulerScreen';
import { PublishingQueueScreen } from './components/screens/PublishingQueueScreen';
import { ArchiveManagerScreen } from './components/screens/ArchiveManagerScreen';
import { HistoryReportsScreen } from './components/screens/HistoryReportsScreen';
import { ClientWorkspaceScreen } from './components/screens/ClientWorkspaceScreen';
import { ProxyVpnScreen } from './components/screens/ProxyVpnScreen';
import { ExtensionManagerScreen } from './components/screens/ExtensionManagerScreen';
import { SessionTimerScreen } from './components/screens/SessionTimerScreen';
import { ErrorRecoveryScreen } from './components/screens/ErrorRecoveryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

const MainContent: React.FC = () => {
  const { currentScreen } = useTikTokDesk();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'accounts':
        return <AccountsScreen />;
      case 'mobile-windows':
        return <MobileWindowsScreen />;
      case 'video-library':
        return <VideoLibraryScreen />;
      case 'batch-publishing':
        return <BatchPublishingScreen />;
      case 'metadata':
        return <MetadataScreen />;
      case 'scheduler':
        return <SchedulerScreen />;
      case 'publishing-queue':
        return <PublishingQueueScreen />;
      case 'archive':
        return <ArchiveManagerScreen />;
      case 'history-reports':
        return <HistoryReportsScreen />;
      case 'clients':
        return <ClientWorkspaceScreen />;
      case 'proxy-vpn':
        return <ProxyVpnScreen />;
      case 'extensions':
        return <ExtensionManagerScreen />;
      case 'session-timer':
        return <SessionTimerScreen />;
      case 'error-center':
        return <ErrorRecoveryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans select-none">
      {/* 16-module Navigation Sidebar */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Desktop App Bar */}
        <Header />

        {/* Scrollable Screen Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <ErrorBoundary key={currentScreen}>{renderScreen()}</ErrorBoundary>
        </main>
      </div>

      {/* Overlays & Modals */}
      <MobileBrowserModal />
      <CreatePostModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TikTokDeskProvider>
      <MainContent />
    </TikTokDeskProvider>
  );
}
