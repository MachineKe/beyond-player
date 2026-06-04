import React, { useRef, useEffect, useCallback } from 'react';
import { Maximize, Subtitles, PictureInPicture2 } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { cn } from '../../lib/cn';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export function VideoPlayer({ src, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    playbackState, volume, muted, playbackRate, showSubtitles, subtitleTrack,
    setPlaybackState, setCurrentTime, setDuration, setBuffered,
    togglePiP, setFullscreen, isFullscreen,
  } = usePlayerStore();

  const isPlaying = playbackState === 'playing';

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Sync volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Play/Pause from store
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playbackState === 'playing') {
      video.play().catch(() => setPlaybackState('paused'));
    } else if (playbackState === 'paused') {
      video.pause();
    }
  }, [playbackState, setPlaybackState]);

  // Listen for global control events
  useEffect(() => {
    const onPlayPause = () => {
      if (videoRef.current?.paused) {
        setPlaybackState('playing');
      } else {
        setPlaybackState('paused');
      }
    };

    const onSeek = (e: Event) => {
      const { time } = (e as CustomEvent<{ time: number }>).detail;
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    };

    window.addEventListener('bp:playpause', onPlayPause);
    window.addEventListener('bp:seek', onSeek);
    return () => {
      window.removeEventListener('bp:playpause', onPlayPause);
      window.removeEventListener('bp:seek', onSeek);
    };
  }, [setPlaybackState, setCurrentTime]);

  // Fullscreen
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setFullscreen]);

  const handleDoubleClick = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleClick = useCallback(() => {
    window.dispatchEvent(new CustomEvent('bp:playpause'));
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;
    const buf = video.buffered;
    if (buf.length > 0) {
      setBuffered(buf.end(buf.length - 1) / video.duration);
    }
  };

  const handlePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
    togglePiP();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative bg-black flex items-center justify-center group', className)}
    >
      <video
        ref={videoRef}
        src={src}
        className="max-w-full max-h-full w-full h-full object-contain"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (!v) return;
          setDuration(v.duration);
          usePlayerStore.getState().setPlaybackState('playing');
        }}
        onPlay={() => setPlaybackState('playing')}
        onPause={() => setPlaybackState('paused')}
        onEnded={() => {
          setPlaybackState('ended');
          usePlayerStore.getState().playNext();
        }}
        onError={() => setPlaybackState('error')}
        onWaiting={() => setPlaybackState('loading')}
        onCanPlay={() => {
          if (isPlaying) videoRef.current?.play();
        }}
      >
        {subtitleTrack && showSubtitles && (
          <track
            kind="subtitles"
            src={subtitleTrack.src}
            srcLang={subtitleTrack.language}
            label={subtitleTrack.label}
            default
          />
        )}
      </video>

      {/* Overlay controls (visible on hover) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handlePiP}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDoubleClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading spinner */}
      {playbackState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {playbackState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-center p-8">
          <p className="text-white font-medium mb-2">Playback error</p>
          <p className="text-surface-400 text-sm">This format may not be supported by your browser.</p>
        </div>
      )}
    </div>
  );
}
