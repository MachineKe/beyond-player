import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const store = usePlayerStore.getState();
      if (!store.currentFile) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('bp:playpause'));
          break;
        case 'ArrowRight':
          e.preventDefault();
          store.skipForward(e.shiftKey ? 30 : 10);
          window.dispatchEvent(new CustomEvent('bp:seek', {
            detail: { time: usePlayerStore.getState().currentTime },
          }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          store.skipBackward(e.shiftKey ? 30 : 10);
          window.dispatchEvent(new CustomEvent('bp:seek', {
            detail: { time: usePlayerStore.getState().currentTime },
          }));
          break;
        case 'ArrowUp':
          e.preventDefault();
          store.setVolume(Math.min(1, store.volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          store.setVolume(Math.max(0, store.volume - 0.05));
          break;
        case 'm':
        case 'M':
          store.toggleMute();
          break;
        case 'f':
        case 'F':
          store.toggleFullscreen();
          break;
        case 'n':
        case 'N':
          store.playNext();
          break;
        case 'p':
        case 'P':
          store.playPrev();
          break;
        case 's':
        case 'S':
          store.toggleShuffle();
          break;
        case 'r':
        case 'R': {
          const next = store.repeatMode === 'none'
            ? 'all' : store.repeatMode === 'all' ? 'one' : 'none';
          store.setRepeatMode(next);
          break;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
