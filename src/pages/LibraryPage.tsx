import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Film, Music, Image as ImageIcon, FileText, Grid3x3,
  List, SlidersHorizontal, FolderOpen, Upload, SortAsc, SortDesc,
  MoreHorizontal, Heart, Trash2, Plus,
} from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import { useUIStore } from '../stores/uiStore';
import { usePlayerStore } from '../stores/playerStore';
import { getFileSystem } from '../platform';
import { formatFileSize, formatDuration } from '../lib/mediaUtils';
import { cn } from '../lib/cn';
import type { MediaCategory, MediaFile } from '../types';

const FILTERS: { label: string; value: MediaCategory | 'all'; icon: React.ElementType }[] = [
  { label: 'All', value: 'all', icon: Grid3x3 },
  { label: 'Videos', value: 'video', icon: Film },
  { label: 'Music', value: 'audio', icon: Music },
  { label: 'Images', value: 'image', icon: ImageIcon },
  { label: 'Docs', value: 'document', icon: FileText },
];

export function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') as MediaCategory | null;

  const {
    activeFilter, setActiveFilter, viewMode, setViewMode,
    sortBy, setSortBy, sortOrder, setSortOrder,
    addFiles, toggleFavorite, removeFile, getFilteredFiles,
  } = useLibraryStore();
  const addNotification = useUIStore((s) => s.addNotification);
  const setCurrentFile = usePlayerStore((s) => s.setCurrentFile);

  // Sync filter from URL param
  React.useEffect(() => {
    if (filterParam) setActiveFilter(filterParam);
  }, [filterParam, setActiveFilter]);

  const files = getFilteredFiles();

  const handleOpenFiles = async () => {
    try {
      const fs = getFileSystem();
      const newFiles = await fs.openFile({ multiple: true });
      if (newFiles.length > 0) {
        addFiles(newFiles);
        addNotification('success', `Added ${newFiles.length} file${newFiles.length > 1 ? 's' : ''}`);
      }
    } catch {
      addNotification('error', 'Could not open files');
    }
  };

  const handleOpenFile = useCallback((file: MediaFile) => {
    navigate(`/player/${file.id}`, { state: { file } });
  }, [navigate]);

  const cycleSortOrder = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Library</h1>
        <span className="text-sm text-surface-500">{files.length} files</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 px-2 text-xs rounded-lg bg-surface-800 border border-surface-700 text-surface-300 focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="date">Date Added</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={cycleSortOrder}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>

          {/* View mode */}
          <div className="flex items-center bg-surface-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-surface-700 text-white' : 'text-surface-500 hover:text-white'
              )}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
                viewMode === 'list' ? 'bg-surface-700 text-white' : 'text-surface-500 hover:text-white'
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-surface-800 flex-shrink-0 overflow-x-auto">
        {FILTERS.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
              activeFilter === value
                ? 'bg-primary-600 text-white'
                : 'text-surface-400 hover:text-white hover:bg-surface-800'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {files.length === 0 ? (
          <EmptyState onOpen={handleOpenFiles} />
        ) : viewMode === 'grid' ? (
          <GridView files={files} onOpen={handleOpenFile} onFavorite={toggleFavorite} onRemove={removeFile} />
        ) : (
          <ListView files={files} onOpen={handleOpenFile} onFavorite={toggleFavorite} onRemove={removeFile} />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleOpenFiles}
        className="fixed bottom-24 right-6 w-12 h-12 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Add files"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-6 text-center py-16">
      <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center">
        <FolderOpen className="w-10 h-10 text-surface-600" />
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">Your library is empty</h3>
        <p className="text-surface-500 text-sm max-w-sm leading-relaxed">
          Open videos, audio, images, or documents to get started.
          Supports 20+ file formats.
        </p>
      </div>
      <button
        onClick={onOpen}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
      >
        <FolderOpen className="w-4 h-4" />
        Open Files
      </button>
    </div>
  );
}

function CategoryBadge({ category }: { category: MediaFile['category'] }) {
  const colors = {
    video: 'bg-blue-900/50 text-blue-400',
    audio: 'bg-green-900/50 text-green-400',
    image: 'bg-amber-900/50 text-amber-400',
    document: 'bg-purple-900/50 text-purple-400',
  };
  return (
    <span className={cn('text-2xs px-1.5 py-0.5 rounded font-medium', colors[category])}>
      {category}
    </span>
  );
}

function FileThumbnail({ file }: { file: MediaFile }) {
  const icons = {
    video: Film,
    audio: Music,
    image: ImageIcon,
    document: FileText,
  };
  const Icon = icons[file.category];

  if (file.category === 'image') {
    return (
      <img
        src={file.url}
        alt={file.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-surface-800">
      <Icon className="w-8 h-8 text-surface-500" />
      <span className="text-2xs text-surface-600 font-mono">.{file.format}</span>
    </div>
  );
}

function GridView({
  files, onOpen, onFavorite, onRemove,
}: {
  files: MediaFile[];
  onOpen: (f: MediaFile) => void;
  onFavorite: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative rounded-xl overflow-hidden bg-surface-900 border border-surface-800 hover:border-surface-600 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
          onClick={() => onOpen(file)}
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-surface-800 overflow-hidden">
            <FileThumbnail file={file} />
          </div>

          {/* Info */}
          <div className="p-2.5">
            <p className="text-xs font-medium text-white truncate">{file.name}</p>
            <p className="text-2xs text-surface-500 mt-0.5">{formatFileSize(file.size)}</p>
          </div>

          {/* Hover actions */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(file.id); }}
              className={cn(
                'w-6 h-6 flex items-center justify-center rounded-md backdrop-blur transition-colors',
                file.isFavorite
                  ? 'bg-error-500/80 text-white'
                  : 'bg-black/50 text-white hover:bg-error-500/70'
              )}
            >
              <Heart className={cn('w-3 h-3', file.isFavorite && 'fill-current')} />
            </button>
          </div>

          {/* Format badge */}
          <div className="absolute bottom-10 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-2xs bg-black/60 text-white px-1.5 py-0.5 rounded font-mono backdrop-blur">
              .{file.format}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListView({
  files, onOpen, onFavorite, onRemove,
}: {
  files: MediaFile[];
  onOpen: (f: MediaFile) => void;
  onFavorite: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {files.map((file) => (
        <div
          key={file.id}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800/60 cursor-pointer transition-colors"
          onClick={() => onOpen(file)}
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-800">
            <FileThumbnail file={file} />
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{file.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xs text-surface-500">{formatFileSize(file.size)}</span>
              {file.metadata.duration && (
                <span className="text-2xs text-surface-600">{formatDuration(file.metadata.duration)}</span>
              )}
              {file.metadata.artist && (
                <span className="text-2xs text-surface-500 truncate">{file.metadata.artist}</span>
              )}
            </div>
          </div>

          {/* Category + format */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <span className="text-2xs text-surface-500 font-mono">.{file.format}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(file.id); }}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
                file.isFavorite ? 'text-error-400' : 'text-surface-500 hover:text-error-400'
              )}
            >
              <Heart className={cn('w-3.5 h-3.5', file.isFavorite && 'fill-current')} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-500 hover:text-error-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
