import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import { formatFileSize, formatDuration } from '../lib/mediaUtils';
import { cn } from '../lib/cn';
import type { MediaFile } from '../types';

export function RecentPage() {
  const navigate = useNavigate();
  const recentFiles = useLibraryStore((s) => s.recentFiles);

  if (recentFiles.length === 0) {
    return (
      <EmptyPage
        icon={Clock}
        title="No recent files"
        description="Files you open will appear here for quick access."
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Recent</h1>
        <p className="text-sm text-surface-500 mt-0.5">{recentFiles.length} recently opened files</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-0.5">
          {recentFiles.map((file, i) => (
            <RecentItem
              key={file.id}
              file={file}
              index={i}
              onOpen={() => navigate(`/player/${file.id}`, { state: { file } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentItem({ file, index, onOpen }: { file: MediaFile; index: number; onOpen: () => void }) {
  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800/60 cursor-pointer transition-colors"
      onClick={onOpen}
    >
      <span className="w-6 text-xs text-surface-600 text-right flex-shrink-0">{index + 1}</span>
      <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {file.category === 'image' ? (
          <img src={file.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <CategoryIcon category={file.category} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{file.name}</p>
        <p className="text-xs text-surface-500 mt-0.5">
          {file.lastOpenedAt
            ? `Opened ${timeAgo(new Date(file.lastOpenedAt))}`
            : formatFileSize(file.size)}
        </p>
      </div>
      <div className="hidden sm:block text-xs text-surface-600 font-mono flex-shrink-0">.{file.format}</div>
      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-600 hover:text-white hover:bg-surface-700 opacity-0 group-hover:opacity-100 transition-all">
        <Play className="w-3.5 h-3.5 fill-current" />
      </button>
    </div>
  );
}

function CategoryIcon({ category }: { category: MediaFile['category'] }) {
  const colors = {
    video: 'text-blue-400',
    audio: 'text-green-400',
    image: 'text-amber-400',
    document: 'text-surface-400',
  };
  return <span className={cn('text-xs font-bold font-mono', colors[category])}>
    {category[0].toUpperCase()}
  </span>;
}

function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const favoriteFiles = useLibraryStore((s) => s.favoriteFiles);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  if (favoriteFiles.length === 0) {
    return (
      <EmptyPage
        title="No favorites yet"
        description="Click the heart icon on any file to add it to your favorites."
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Favorites</h1>
        <p className="text-sm text-surface-500 mt-0.5">{favoriteFiles.length} favorite files</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {favoriteFiles.map((file) => (
            <div
              key={file.id}
              className="group relative rounded-xl overflow-hidden bg-surface-900 border border-surface-800 hover:border-primary-600/50 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => navigate(`/player/${file.id}`, { state: { file } })}
            >
              <div className="aspect-video bg-surface-800 overflow-hidden">
                {file.category === 'image' ? (
                  <img src={file.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-mono text-surface-600">.{file.format}</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-white truncate">{file.name}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(file.id); }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-error-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-xs">×</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyPage({
  icon: Icon = Clock,
  title,
  description,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-surface-950">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
        <Icon className="w-8 h-8 text-surface-600" />
      </div>
      <div>
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-surface-500 text-sm mt-1 max-w-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
