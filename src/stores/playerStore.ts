// ============================================================
// Player store – playback state management
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  PlayerState,
  MediaFile,
  Playlist,
  PlaybackState,
  RepeatMode,
  SubtitleTrack,
} from '../types';

interface PlayerActions {
  setCurrentFile: (file: MediaFile | null) => void;
  setPlaylist: (playlist: Playlist | null, index?: number) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  setFullscreen: (val: boolean) => void;
  togglePiP: () => void;
  toggleSubtitles: () => void;
  setSubtitleTrack: (track: SubtitleTrack | null) => void;
  setAvailableSubtitles: (tracks: SubtitleTrack[]) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  setBuffered: (pct: number) => void;
  playNext: () => void;
  playPrev: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

const defaultState: PlayerState = {
  currentFile: null,
  playlist: null,
  playlistIndex: 0,
  playbackState: 'idle',
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  muted: false,
  playbackRate: 1,
  isFullscreen: false,
  isPiP: false,
  showSubtitles: true,
  subtitleTrack: null,
  availableSubtitles: [],
  repeatMode: 'none',
  shuffle: false,
  buffered: 0,
};

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  subscribeWithSelector((set, get) => ({
    ...defaultState,

    setCurrentFile: (file) =>
      set({
        currentFile: file,
        playbackState: file ? 'loading' : 'idle',
        currentTime: 0,
        duration: 0,
        buffered: 0,
      }),

    setPlaylist: (playlist, index = 0) => {
      const file = playlist?.items[index]?.file ?? null;
      set({ playlist, playlistIndex: index, currentFile: file });
    },

    setPlaybackState: (playbackState) => set({ playbackState }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),

    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), muted: false }),

    toggleMute: () => set((s) => ({ muted: !s.muted })),

    setPlaybackRate: (playbackRate) =>
      set({ playbackRate: Math.max(0.25, Math.min(4, playbackRate)) }),

    toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
    setFullscreen: (val) => set({ isFullscreen: val }),

    togglePiP: () => set((s) => ({ isPiP: !s.isPiP })),
    toggleSubtitles: () => set((s) => ({ showSubtitles: !s.showSubtitles })),
    setSubtitleTrack: (track) => set({ subtitleTrack: track }),
    setAvailableSubtitles: (tracks) => set({ availableSubtitles: tracks }),
    setRepeatMode: (mode) => set({ repeatMode: mode }),
    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
    setBuffered: (buffered) => set({ buffered }),

    playNext: () => {
      const { playlist, playlistIndex, repeatMode, shuffle } = get();
      if (!playlist) return;
      const count = playlist.items.length;
      if (count === 0) return;

      let next: number;
      if (shuffle) {
        next = Math.floor(Math.random() * count);
      } else if (playlistIndex < count - 1) {
        next = playlistIndex + 1;
      } else if (repeatMode === 'all') {
        next = 0;
      } else {
        return;
      }

      const file = playlist.items[next]?.file ?? null;
      set({ playlistIndex: next, currentFile: file, currentTime: 0 });
    },

    playPrev: () => {
      const { playlist, playlistIndex } = get();
      if (!playlist) return;
      const prev = Math.max(0, playlistIndex - 1);
      const file = playlist.items[prev]?.file ?? null;
      set({ playlistIndex: prev, currentFile: file, currentTime: 0 });
    },

    skipForward: (seconds = 10) => {
      const { currentTime, duration } = get();
      set({ currentTime: Math.min(currentTime + seconds, duration) });
    },

    skipBackward: (seconds = 10) => {
      const { currentTime } = get();
      set({ currentTime: Math.max(0, currentTime - seconds) });
    },
  }))
);
