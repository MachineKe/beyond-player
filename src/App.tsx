import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MediaControls } from './components/player/MediaControls';
import { NotificationToaster } from './components/ui/NotificationToaster';
import { LibraryPage } from './pages/LibraryPage';
import { PlayerPage } from './pages/PlayerPage';
import { RecentPage, FavoritesPage } from './pages/RecentPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { useUIStore } from './stores/uiStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { initPlatform, detectPlatform, getPlatformCapabilities } from './platform';
import { WebFileSystemProvider, IndexedDBStorageProvider } from './platform/web';
import { cn } from './lib/cn';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const resolvedTheme = useUIStore((s) => s.resolvedTheme);

  useKeyboardShortcuts();

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.classList.toggle('light', resolvedTheme === 'light');
  }, [resolvedTheme]);

  return (
    <div className={cn(
      'h-screen flex flex-col bg-surface-950 text-white overflow-hidden',
      resolvedTheme === 'light' && 'light'
    )}>
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        <div className={cn(
          'transition-all duration-250 flex-shrink-0 relative',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute z-30 h-full',
          'md:translate-x-0 md:relative md:z-auto'
        )}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <TopBar />
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Routes>
              <Route path="/" element={<Navigate to="/library" replace />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/player/:id" element={<PlayerPage />} />
              <Route path="/recent" element={<RecentPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:id" element={<CollectionsPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/library" replace />} />
            </Routes>
          </main>
          {/* Media controls bar */}
          <MediaControls />
        </div>
      </div>

      <NotificationToaster />
    </div>
  );
}

function PlatformInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    const platform = detectPlatform();
    const capabilities = getPlatformCapabilities(platform);
    initPlatform({
      fileSystem: new WebFileSystemProvider(),
      storage: new IndexedDBStorageProvider(),
      capabilities,
    });
    setReady(true);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PlatformInit>
          <AppShell />
        </PlatformInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
