import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layers, Plus, Edit2, Trash2, FolderOpen, X, Check } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';
import { formatFileSize } from '../lib/mediaUtils';
import { cn } from '../lib/cn';
import type { MediaFile } from '../types';

export function CollectionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { collections, files, createCollection, deleteCollection } = useLibraryStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  if (id) {
    return <CollectionDetailPage id={id} />;
  }

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Collections</h1>
        <span className="text-sm text-surface-500">{collections.length} collections</span>
        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 px-3 h-8 rounded-lg text-sm bg-primary-600 hover:bg-primary-500 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Create form */}
        {showCreate && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-surface-800 border border-surface-700">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowCreate(false); }}
              placeholder="Collection name..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-surface-500 focus:outline-none"
            />
            <button onClick={handleCreate} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowCreate(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {collections.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
              <Layers className="w-8 h-8 text-surface-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold">No collections</h3>
              <p className="text-surface-500 text-sm mt-1">Organize your files into collections.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {collections.map((col) => {
              const colFiles = files.filter((f) => col.fileIds.includes(f.id));
              return (
                <div
                  key={col.id}
                  className="group relative rounded-xl bg-surface-900 border border-surface-800 hover:border-surface-600 cursor-pointer transition-all hover:-translate-y-0.5 p-4"
                  onClick={() => navigate(`/collections/${col.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: col.color + '20', borderColor: col.color + '40', border: '1px solid' }}>
                    <Layers className="w-5 h-5" style={{ color: col.color }} />
                  </div>
                  <p className="text-sm font-medium text-white truncate">{col.name}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{colFiles.length} files</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-lg text-surface-600 hover:text-error-400 hover:bg-surface-800 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

function CollectionDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const { collections, files, removeFromCollection } = useLibraryStore();
  const collection = collections.find((c) => c.id === id);

  if (!collection) {
    return (
      <div className="flex-1 flex items-center justify-center text-surface-500 bg-surface-950">
        Collection not found.
      </div>
    );
  }

  const colFiles = files.filter((f) => collection.fileIds.includes(f.id));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <button onClick={() => navigate('/collections')} className="text-surface-400 hover:text-white transition-colors">
          <span className="text-sm">← Back</span>
        </button>
        <div className="w-px h-4 bg-surface-700" />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: collection.color + '20' }}>
          <Layers className="w-4 h-4" style={{ color: collection.color }} />
        </div>
        <h1 className="text-lg font-semibold text-white">{collection.name}</h1>
        <span className="text-sm text-surface-500">{colFiles.length} files</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {colFiles.length === 0 ? (
          <div className="text-center py-12 text-surface-500 text-sm">
            No files in this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {colFiles.map((file) => (
              <div
                key={file.id}
                className="group relative rounded-xl bg-surface-900 border border-surface-800 hover:border-surface-600 cursor-pointer transition-all hover:-translate-y-0.5 overflow-hidden"
                onClick={() => navigate(`/player/${file.id}`, { state: { file } })}
              >
                <div className="aspect-video bg-surface-800 overflow-hidden">
                  {file.category === 'image' ? (
                    <img src={file.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-mono text-surface-600">.{file.format}</span>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-white truncate">{file.name}</p>
                  <p className="text-2xs text-surface-500 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromCollection(id, file.id); }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md bg-surface-900/80 text-surface-400 hover:text-error-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
