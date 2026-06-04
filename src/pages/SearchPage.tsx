import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useLibraryStore } from '../stores/libraryStore';

export function SearchPage() {
  const navigate = useNavigate();
  const searchQuery = useLibraryStore((s) => s.searchQuery);
  const getFilteredFiles = useLibraryStore((s) => s.getFilteredFiles);
  const setSearchQuery = useLibraryStore((s) => s.setSearchQuery);
  const files = getFilteredFiles();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950">
      <div className="px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <h1 className="text-lg font-semibold text-white">Search</h1>
      </div>

      <div className="px-6 py-4 border-b border-surface-800 flex-shrink-0">
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            autoFocus
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, artists, albums..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!searchQuery ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <SearchIcon className="w-10 h-10 text-surface-700" />
            <p className="text-surface-500 text-sm">Start typing to search your library</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-surface-500 text-sm">
            No files found for "{searchQuery}"
          </div>
        ) : (
          <div>
            <p className="text-xs text-surface-500 mb-3">
              {files.length} result{files.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            <div className="space-y-0.5">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800 cursor-pointer transition-colors"
                  onClick={() => navigate(`/player/${file.id}`, { state: { file } })}
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {file.category === 'image' ? (
                      <img src={file.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-mono text-surface-500">.{file.format}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-500 capitalize">{file.category}</span>
                      {file.metadata.artist && (
                        <>
                          <span className="text-surface-700">·</span>
                          <span className="text-xs text-surface-500 truncate">{file.metadata.artist}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
