import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListMusic, Plus, Play, Trash2, GripVertical, X, Check } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { formatDuration } from '../lib/mediaUtils';
import { cn } from '../lib/cn';

export function PlaylistsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { playlists, createPlaylist, deletePlaylist } = useLibraryStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  if (id) return <PlaylistDetailPage id={id} />;

  const handleCreate = () => {
    if (!newName.trim()) return;
    const pl = createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
    navigate(`/playlists/${pl.id}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Playlists</h1>
        <span className="text-sm text-surface-500">{playlists.length} playlists</span>
        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 px-3 h-8 rounded-lg text-sm bg-primary-600 hover:bg-primary-500 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {showCreate && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-surface-800 border border-surface-700">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
              placeholder="Playlist name..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-surface-500 focus:outline-none"
            />
            <button onClick={handleCreate} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-600 text-white transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowCreate(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {playlists.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
              <ListMusic className="w-8 h-8 text-surface-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold">No playlists</h3>
              <p className="text-surface-500 text-sm mt-1">Create a playlist to queue up your files.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800 cursor-pointer transition-colors"
                onClick={() => navigate(`/playlists/${pl.id}`)}
              >
                <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0 group-hover:bg-surface-700">
                  <ListMusic className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{pl.name}</p>
                  <p className="text-xs text-surface-500">{pl.items.length} tracks</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-600 hover:text-error-400 hover:bg-surface-700 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlaylistDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const { playlists, removeFromPlaylist } = useLibraryStore();
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div className="flex-1 flex items-center justify-center text-surface-500 bg-surface-950">
        Playlist not found.
      </div>
    );
  }

  const playAll = () => {
    if (playlist.items.length === 0) return;
    setPlaylist(playlist, 0);
    const file = playlist.items[0].file;
    if (file) navigate(`/player/${file.id}`, { state: { file } });
  };

  const totalDuration = playlist.items.reduce(
    (acc, item) => acc + (item.file?.metadata.duration ?? 0), 0
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="px-6 py-5 border-b border-surface-800 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl bg-surface-800 flex items-center justify-center flex-shrink-0">
            <ListMusic className="w-10 h-10 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <button onClick={() => navigate('/playlists')} className="text-xs text-surface-500 hover:text-surface-300 mb-1 transition-colors">
              ← Playlists
            </button>
            <h1 className="text-xl font-bold text-white truncate">{playlist.name}</h1>
            <p className="text-sm text-surface-400 mt-1">
              {playlist.items.length} tracks · {formatDuration(totalDuration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={playAll}
            disabled={playlist.items.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium disabled:opacity-40 transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            Play All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {playlist.items.length === 0 ? (
          <div className="py-12 text-center text-surface-500 text-sm">
            No tracks in this playlist. Add files from the library.
          </div>
        ) : (
          <div className="space-y-0.5">
            {playlist.items.map((item, i) => {
              const file = item.file;
              if (!file) return null;
              return (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800 cursor-pointer transition-colors"
                  onClick={() => {
                    setPlaylist(playlist, i);
                    navigate(`/player/${file.id}`, { state: { file } });
                  }}
                >
                  <span className="w-6 text-xs text-surface-600 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.metadata.title || file.name}</p>
                    {file.metadata.artist && (
                      <p className="text-xs text-surface-500 truncate">{file.metadata.artist}</p>
                    )}
                  </div>
                  <span className="text-xs text-surface-500 flex-shrink-0">
                    {file.metadata.duration ? formatDuration(file.metadata.duration) : '—'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromPlaylist(id, item.id); }}
                    className="w-7 h-7 flex items-center justify-center rounded text-surface-600 hover:text-error-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
