import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Sun, Moon, Monitor, Menu, X, FolderOpen,
  ChevronDown,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { getFileSystem } from '../../platform';
import { cn } from '../../lib/cn';
import type { ThemeMode } from '../../types';

const THEMES: { mode: ThemeMode; icon: React.ElementType; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

export function TopBar() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);
  const addNotification = useUIStore((s) => s.addNotification);
  const addFiles = useLibraryStore((s) => s.addFiles);
  const setSearchQuery = useLibraryStore((s) => s.setSearchQuery);
  const searchQuery = useLibraryStore((s) => s.searchQuery);

  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!themeRef.current?.contains(e.target as Node)) setThemeMenuOpen(false);
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenFile = async () => {
    try {
      const fs = getFileSystem();
      const files = await fs.openFile({ multiple: true });
      if (files.length > 0) {
        addFiles(files);
        if (files.length === 1) {
          navigate(`/player/${files[0].id}`, { state: { file: files[0] } });
        } else {
          navigate('/library');
          addNotification('success', `Added ${files.length} files`);
        }
      }
    } catch {
      addNotification('error', 'Could not open files');
    }
  };

  const ThemeIcon = THEMES.find((t) => t.mode === theme)?.icon ?? Moon;

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-surface-900/80 backdrop-blur border-b border-surface-800 z-20 flex-shrink-0">
      {/* Menu toggle (mobile) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search files, artists, titles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) navigate('/library');
            }}
            className={cn(
              'w-full h-9 pl-9 pr-4 rounded-lg text-sm',
              'bg-surface-800 border border-surface-700',
              'text-white placeholder:text-surface-500',
              'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50',
              'transition-all duration-150'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Open File */}
        <button
          onClick={handleOpenFile}
          className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg text-sm font-medium bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white border border-surface-700 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Open</span>
        </button>

        {/* Theme picker */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeMenuOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="Change theme"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 top-10 w-36 bg-surface-800 border border-surface-700 rounded-lg shadow-xl py-1 z-50 animate-slide-up">
              {THEMES.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => { setTheme(mode); setThemeMenuOpen(false); }}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                    theme === mode
                      ? 'text-primary-400 bg-surface-750'
                      : 'text-surface-300 hover:text-white hover:bg-surface-700'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {theme === mode && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-surface-800 border border-surface-700 rounded-lg shadow-xl z-50 animate-slide-up overflow-hidden">
              <div className="px-3 py-2 border-b border-surface-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => notifications.forEach((n) => removeNotification(n.id))}
                    className="text-xs text-surface-500 hover:text-white transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-surface-500 text-center">No notifications</div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-surface-750 border-b border-surface-700/50 last:border-0">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        n.type === 'success' && 'bg-success-500',
                        n.type === 'error' && 'bg-error-500',
                        n.type === 'warning' && 'bg-warning-500',
                        n.type === 'info' && 'bg-primary-500',
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{n.title}</p>
                        {n.message && <p className="text-xs text-surface-400 mt-0.5">{n.message}</p>}
                      </div>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="text-surface-600 hover:text-surface-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
