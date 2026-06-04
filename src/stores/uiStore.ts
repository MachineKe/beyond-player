// ============================================================
// UI store – theme, sidebar, notifications, modals
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, Notification, NotificationType } from '../types';
import { nanoid } from '../lib/nanoid';

interface UIState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeRoute: string;
  notifications: Notification[];
  pendingModal: string | null;
}

interface UIActions {
  setTheme: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  collapseSidebar: (val: boolean) => void;
  setActiveRoute: (route: string) => void;
  addNotification: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  openModal: (name: string) => void;
  closeModal: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,
      activeRoute: '/library',
      notifications: [],
      pendingModal: null,

      setTheme: (mode) => {
        const resolved = resolveTheme(mode);
        set({ theme: mode, resolvedTheme: resolved });
        document.documentElement.classList.toggle('dark', resolved === 'dark');
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      collapseSidebar: (val) => set({ sidebarCollapsed: val }),
      setActiveRoute: (activeRoute) => set({ activeRoute }),

      addNotification: (type, title, message, duration = 4000) => {
        const notification: Notification = {
          id: nanoid(),
          type,
          title,
          message,
          duration,
          createdAt: new Date(),
        };
        set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 5) }));

        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, duration);
        }
      },

      removeNotification: (id) => {
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
      },

      openModal: (name) => set({ pendingModal: name }),
      closeModal: () => set({ pendingModal: null }),
    }),
    {
      name: 'beyond-player-ui',
      partialize: (s) => ({
        theme: s.theme,
        resolvedTheme: s.resolvedTheme,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
);
