import React from 'react';
import { X, Film, Music, Image as ImageIcon, FileText, Clock, HardDrive } from 'lucide-react';
import { formatDuration, formatFileSize, formatBitrate } from '../../lib/mediaUtils';
import { cn } from '../../lib/cn';
import type { MediaFile } from '../../types';

interface MetadataPanelProps {
  file: MediaFile;
  onClose: () => void;
}

export function MetadataPanel({ file, onClose }: MetadataPanelProps) {
  const CategoryIcon = {
    video: Film,
    audio: Music,
    image: ImageIcon,
    document: FileText,
  }[file.category];

  const rows: { label: string; value: string | undefined | null }[] = [
    { label: 'Format', value: file.format.toUpperCase() },
    { label: 'Size', value: formatFileSize(file.size) },
    { label: 'Duration', value: file.metadata.duration ? formatDuration(file.metadata.duration) : undefined },
    { label: 'Resolution', value: file.metadata.width && file.metadata.height ? `${file.metadata.width} × ${file.metadata.height}` : undefined },
    { label: 'Bitrate', value: file.metadata.bitrate ? formatBitrate(file.metadata.bitrate) : undefined },
    { label: 'Codec', value: file.metadata.codec },
    { label: 'Frame Rate', value: file.metadata.frameRate ? `${file.metadata.frameRate} fps` : undefined },
    { label: 'Sample Rate', value: file.metadata.sampleRate ? `${file.metadata.sampleRate} Hz` : undefined },
    { label: 'Channels', value: file.metadata.channels != null ? String(file.metadata.channels) : undefined },
    { label: 'Artist', value: file.metadata.artist },
    { label: 'Album', value: file.metadata.album },
    { label: 'Title', value: file.metadata.title },
    { label: 'Year', value: file.metadata.year ? String(file.metadata.year) : undefined },
    { label: 'Genre', value: file.metadata.genre },
    { label: 'Track', value: file.metadata.trackNumber != null ? String(file.metadata.trackNumber) : undefined },
    { label: 'Added', value: file.addedAt ? new Date(file.addedAt).toLocaleDateString() : undefined },
  ].filter((r) => r.value);

  return (
    <div className="w-72 flex-shrink-0 bg-surface-900 border-l border-surface-800 flex flex-col animate-slide-right">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-800">
        <CategoryIcon className="w-4 h-4 text-primary-400" />
        <span className="text-sm font-medium text-white flex-1">File Info</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-surface-500 hover:text-white hover:bg-surface-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* File name */}
      <div className="px-4 py-3 border-b border-surface-800">
        <p className="text-xs text-surface-500 mb-1">Filename</p>
        <p className="text-sm text-white break-all font-medium">{file.name}</p>
        {file.path !== file.name && (
          <p className="text-xs text-surface-600 mt-0.5 break-all">{file.path}</p>
        )}
      </div>

      {/* Metadata rows */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <span className="text-xs text-surface-500 flex-shrink-0 w-24">{row.label}</span>
            <span className="text-xs text-surface-200 text-right break-words">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
