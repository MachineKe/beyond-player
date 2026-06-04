import React, { useRef, useEffect, useCallback } from 'react';
import { Music } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { cn } from '../../lib/cn';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const {
    playbackState, volume, muted, playbackRate,
    setPlaybackState, setCurrentTime, setDuration, setBuffered,
    currentFile,
  } = usePlayerStore();

  // Sync volume & rate
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
    a.playbackRate = playbackRate;
  }, [volume, muted, playbackRate]);

  // Play/pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playbackState === 'playing') {
      audio.play().catch(() => setPlaybackState('paused'));
    } else if (playbackState === 'paused') {
      audio.pause();
    }
  }, [playbackState, setPlaybackState]);

  // Global events
  useEffect(() => {
    const onPlayPause = () => {
      if (audioRef.current?.paused) setPlaybackState('playing');
      else setPlaybackState('paused');
    };
    const onSeek = (e: Event) => {
      const { time } = (e as CustomEvent<{ time: number }>).detail;
      if (audioRef.current) {
        audioRef.current.currentTime = time;
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

  // Visualizer
  const initVisualizer = useCallback(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    try {
      if (!contextRef.current) {
        contextRef.current = new AudioContext();
      }
      const ctx = contextRef.current;
      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(audio);
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
      }

      const analyser = analyserRef.current!;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const w = canvas.width;
        const h = canvas.height;
        canvasCtx.clearRect(0, 0, w, h);

        const barWidth = (w / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * h * 0.8;
          const alpha = 0.5 + (dataArray[i] / 255) * 0.5;
          canvasCtx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
          canvasCtx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch {
      // Visualizer not available
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      contextRef.current?.close();
    };
  }, []);

  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-surface-800 to-surface-950',
      className
    )}>
      {/* Album art */}
      <div className="w-48 h-48 rounded-2xl bg-surface-700 flex items-center justify-center shadow-2xl relative overflow-hidden">
        {currentFile?.thumbnailUrl ? (
          <img
            src={currentFile.thumbnailUrl}
            alt="Album art"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-surface-500">
            <Music className="w-16 h-16" />
            <span className="text-sm">No artwork</span>
          </div>
        )}
        {playbackState === 'playing' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        )}
      </div>

      {/* Track info */}
      <div className="text-center max-w-sm w-full">
        <h2 className="text-xl font-semibold text-white truncate">
          {currentFile?.metadata.title || currentFile?.name || 'Unknown Track'}
        </h2>
        <p className="text-surface-400 text-sm mt-1 truncate">
          {currentFile?.metadata.artist || 'Unknown Artist'}
          {currentFile?.metadata.album && (
            <span className="text-surface-500"> — {currentFile.metadata.album}</span>
          )}
        </p>
        {(currentFile?.metadata.year || currentFile?.metadata.genre) && (
          <p className="text-surface-500 text-xs mt-0.5">
            {[currentFile?.metadata.year, currentFile?.metadata.genre]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>

      {/* Visualizer */}
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full max-w-sm rounded-lg opacity-80"
      />

      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
          setPlaybackState('playing');
          initVisualizer();
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onProgress={() => {
          const a = audioRef.current;
          if (!a || a.duration === 0) return;
          const buf = a.buffered;
          if (buf.length > 0) setBuffered(buf.end(buf.length - 1) / a.duration);
        }}
        onPlay={() => setPlaybackState('playing')}
        onPause={() => setPlaybackState('paused')}
        onEnded={() => {
          setPlaybackState('ended');
          usePlayerStore.getState().playNext();
        }}
        onError={() => setPlaybackState('error')}
      />
    </div>
  );
}
