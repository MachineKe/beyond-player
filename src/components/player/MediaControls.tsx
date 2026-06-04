import React, { useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Volume1, Maximize, Minimize, Shuffle, Repeat, Repeat1,
  Rewind, FastForward, Gauge, Subtitles, PictureInPicture2,
  ChevronUp, ListMusic,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/mediaUtils';
import { cn } from '../../lib/cn';

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];

export function MediaControls() {
  const {
    currentFile, playbackState, currentTime, duration,
    volume, muted, playbackRate, repeatMode, shuffle, buffered,
    setVolume, toggleMute, setPlaybackRate, setRepeatMode, toggleShuffle,
    playNext, playPrev, skipForward, skipBackward, toggleFullscreen,
    isFullscreen,
  } = usePlayerStore();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [speedOpen, setSpeedOpen] = React.useState(false);

  const isPlaying = playbackState === 'playing';
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = buffered * 100;

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    usePlayerStore.getState().setCurrentTime(x * duration);
    // Dispatch seek event for the actual player
    window.dispatchEvent(new CustomEvent('bp:seek', { detail: { time: x * duration } }));
  }, [duration]);

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(x);
  }, [setVolume]);

  const handlePlayPause = () => {
    window.dispatchEvent(new CustomEvent('bp:playpause'));
  };

  const cycleRepeat = () => {
    const next = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
    setRepeatMode(next);
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  if (!currentFile) return null;

  return (
    <div className={cn(
      'flex-shrink-0 bg-surface-900/95 backdrop-blur border-t border-surface-800',
      'px-4 py-3'
    )}>
      {/* Progress bar */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xs text-surface-500 w-10 text-right tabular-nums flex-shrink-0">
          {formatDuration(currentTime)}
        </span>
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="flex-1 h-1 bg-surface-700 rounded-full cursor-pointer group relative hover:h-2 transition-all duration-100"
        >
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 bg-surface-600 rounded-full pointer-events-none"
            style={{ width: `${bufferedPct}%` }}
          />
          {/* Progress */}
          <div
            className="absolute inset-y-0 left-0 bg-primary-500 rounded-full pointer-events-none"
            style={{ width: `${pct}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
            style={{ left: `${pct}%` }}
          />
        </div>
        <span className="text-2xs text-surface-500 w-10 tabular-nums flex-shrink-0">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Now playing info */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {currentFile.thumbnailUrl && (
            <img
              src={currentFile.thumbnailUrl}
              alt=""
              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentFile.metadata.title || currentFile.name}
            </p>
            {(currentFile.metadata.artist || currentFile.metadata.album) && (
              <p className="text-xs text-surface-500 truncate">
                {[currentFile.metadata.artist, currentFile.metadata.album]
                  .filter(Boolean)
                  .join(' — ')}
              </p>
            )}
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <IconBtn onClick={toggleShuffle} active={shuffle} title="Shuffle">
            <Shuffle className="w-3.5 h-3.5" />
          </IconBtn>

          <IconBtn onClick={playPrev} title="Previous">
            <SkipBack className="w-4 h-4" />
          </IconBtn>

          <IconBtn onClick={() => skipBackward(10)} title="Rewind 10s">
            <Rewind className="w-3.5 h-3.5" />
          </IconBtn>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'bg-white text-surface-900 hover:scale-105 active:scale-95',
              'transition-all duration-100 shadow-md',
              playbackState === 'loading' && 'opacity-60'
            )}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <IconBtn onClick={() => skipForward(10)} title="Forward 10s">
            <FastForward className="w-3.5 h-3.5" />
          </IconBtn>

          <IconBtn onClick={playNext} title="Next">
            <SkipForward className="w-4 h-4" />
          </IconBtn>

          <IconBtn onClick={cycleRepeat} active={repeatMode !== 'none'} title="Repeat">
            <RepeatIcon className="w-3.5 h-3.5" />
          </IconBtn>
        </div>

        {/* Right controls */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-surface-400 hover:text-white transition-colors"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <div
              ref={volumeRef}
              onClick={handleVolumeClick}
              className="w-20 h-1 bg-surface-700 rounded-full cursor-pointer group hover:h-2 transition-all duration-100 relative"
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary-500 rounded-full pointer-events-none"
                style={{ width: `${muted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>

          {/* Speed */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setSpeedOpen((v) => !v)}
              className={cn(
                'h-7 px-2 rounded text-xs font-medium transition-colors',
                playbackRate !== 1
                  ? 'text-primary-400 bg-primary-900/30'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              )}
            >
              {playbackRate}x
            </button>
            {speedOpen && (
              <div className="absolute bottom-10 right-0 w-24 bg-surface-800 border border-surface-700 rounded-lg py-1 shadow-xl z-50 max-h-48 overflow-y-auto animate-slide-up">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setPlaybackRate(s); setSpeedOpen(false); }}
                    className={cn(
                      'w-full px-3 py-1.5 text-xs text-left transition-colors',
                      s === playbackRate
                        ? 'text-primary-400 bg-surface-750'
                        : 'text-surface-300 hover:text-white hover:bg-surface-700'
                    )}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <IconBtn onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
        active
          ? 'text-primary-400 bg-primary-900/30'
          : 'text-surface-400 hover:text-white hover:bg-surface-800'
      )}
    >
      {children}
    </button>
  );
}
