import React from 'react';
import { Sun, Moon, Monitor, Keyboard, Info, Github, Globe } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useLibraryStore } from '../stores/libraryStore';
import { cn } from '../lib/cn';
import type { ThemeMode } from '../types';

const KEYBOARD_SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause' },
  { key: '←', description: 'Seek back 10s' },
  { key: '→', description: 'Seek forward 10s' },
  { key: '↑', description: 'Volume up' },
  { key: '↓', description: 'Volume down' },
  { key: 'M', description: 'Toggle mute' },
  { key: 'F', description: 'Toggle fullscreen' },
  { key: 'N', description: 'Next track' },
  { key: 'P', description: 'Previous track' },
  { key: 'S', description: 'Toggle shuffle' },
  { key: 'R', description: 'Cycle repeat mode' },
];

const THEMES: { mode: ThemeMode; icon: React.ElementType; label: string; desc: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light', desc: 'Always use light theme' },
  { mode: 'dark', icon: Moon, label: 'Dark', desc: 'Always use dark theme' },
  { mode: 'system', icon: Monitor, label: 'System', desc: 'Follow system preference' },
];

export function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const files = useLibraryStore((s) => s.files);
  const clearLibrary = useLibraryStore((s) => s.clearLibrary);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950 overflow-y-auto">
      <div className="px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 w-full space-y-8">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-1">Appearance</h2>
          <p className="text-xs text-surface-500 mb-4">Choose your preferred color scheme.</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(({ mode, icon: Icon, label, desc }) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={cn(
                  'flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left',
                  theme === mode
                    ? 'border-primary-500 bg-primary-900/20'
                    : 'border-surface-700 bg-surface-900 hover:border-surface-600'
                )}
              >
                <Icon className={cn('w-5 h-5', theme === mode ? 'text-primary-400' : 'text-surface-400')} />
                <div>
                  <p className={cn('text-sm font-medium', theme === mode ? 'text-white' : 'text-surface-300')}>{label}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Keyboard Shortcuts
          </h2>
          <p className="text-xs text-surface-500 mb-4">When the player is focused.</p>
          <div className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden">
            {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
              <div
                key={shortcut.key}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5',
                  i !== KEYBOARD_SHORTCUTS.length - 1 && 'border-b border-surface-800'
                )}
              >
                <span className="text-sm text-surface-300">{shortcut.description}</span>
                <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-surface-800 text-surface-300 border border-surface-700">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Library */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-1">Library</h2>
          <p className="text-xs text-surface-500 mb-4">Manage your media library.</p>
          <div className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
              <div>
                <p className="text-sm text-white font-medium">Total files</p>
                <p className="text-xs text-surface-500">{files.length} items in library</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-white font-medium">Clear library</p>
                <p className="text-xs text-surface-500">Remove all files from the library</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Clear all files from library?')) clearLibrary();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-error-400 border border-error-500/30 hover:bg-error-500/10 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Info className="w-4 h-4" />
            About
          </h2>
          <div className="bg-surface-900 rounded-xl border border-surface-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Beyond Player</p>
                <p className="text-xs text-surface-500">v0.1.0 — Universal Media Player</p>
              </div>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              A modern universal media and document player. Open and play videos, audio,
              images, PDFs, Markdown, spreadsheets and more from a single elegant interface.
            </p>
            <div className="mt-3 pt-3 border-t border-surface-800 grid grid-cols-2 gap-2 text-xs text-surface-500">
              <span>React 18 + TypeScript</span>
              <span>Tailwind CSS</span>
              <span>Zustand + TanStack Query</span>
              <span>Vite + React Router</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
