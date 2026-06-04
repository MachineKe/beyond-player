// ============================================================
// Library store – file collection management
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MediaFile,
  Collection,
  Playlist,
  LibraryState,
  MediaCategory,
  PlaylistItem,
} from "../types";
import { nanoid } from "../lib/nanoid";

const MAX_RECENT = 20;

interface LibraryActions {
  addFiles: (files: MediaFile[]) => void;
  removeFile: (id: string) => void;
  toggleFavorite: (id: string) => void;
  markOpened: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: MediaCategory | "all") => void;
  setSortBy: (sort: LibraryState["sortBy"]) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setViewMode: (mode: "grid" | "list") => void;
  createCollection: (name: string, color?: string) => Collection;
  updateCollection: (id: string, patch: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, fileId: string) => void;
  removeFromCollection: (collectionId: string, fileId: string) => void;
  createPlaylist: (name: string, fileIds?: string[]) => Playlist;
  updatePlaylist: (id: string, patch: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, fileId: string) => void;
  removeFromPlaylist: (playlistId: string, itemId: string) => void;
  clearLibrary: () => void;
  getFilteredFiles: () => MediaFile[];
}

const COLLECTION_COLORS = [
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export const useLibraryStore = create<LibraryState & LibraryActions>()(
  persist(
    (set, get) => ({
      files: [],
      recentFiles: [],
      favoriteFiles: [],
      collections: [],
      playlists: [],
      searchQuery: "",
      activeFilter: "all",
      sortBy: "date",
      sortOrder: "desc",
      viewMode: "grid",

      addFiles: (incoming) => {
        set((s) => {
          const existingIds = new Set(s.files.map((f) => f.id));
          const newFiles = incoming.filter((f) => !existingIds.has(f.id));
          return { files: [...s.files, ...newFiles] };
        });
      },

      removeFile: (id) => {
        set((s) => ({
          files: s.files.filter((f) => f.id !== id),
          recentFiles: s.recentFiles.filter((f) => f.id !== id),
          favoriteFiles: s.favoriteFiles.filter((f) => f.id !== id),
        }));
      },

      toggleFavorite: (id) => {
        set((s) => {
          const files = s.files.map((f) =>
            f.id === id ? { ...f, isFavorite: !f.isFavorite } : f,
          );
          const favoriteFiles = files.filter((f) => f.isFavorite);
          return { files, favoriteFiles };
        });
      },

      markOpened: (id) => {
        set((s) => {
          const files = s.files.map((f) =>
            f.id === id ? { ...f, lastOpenedAt: new Date() } : f,
          );
          const file = files.find((f) => f.id === id);
          if (!file) return { files };
          const recentFiles = [
            file,
            ...s.recentFiles.filter((f) => f.id !== id),
          ].slice(0, MAX_RECENT);
          return { files, recentFiles };
        });
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveFilter: (activeFilter) => set({ activeFilter }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setViewMode: (viewMode) => set({ viewMode }),

      createCollection: (name, color) => {
        const collection: Collection = {
          id: nanoid(),
          name,
          color:
            color ??
            COLLECTION_COLORS[
              get().collections.length % COLLECTION_COLORS.length
            ],
          icon: "folder",
          fileIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ collections: [...s.collections, collection] }));
        return collection;
      },

      updateCollection: (id, patch) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c,
          ),
        }));
      },

      deleteCollection: (id) => {
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }));
      },

      addToCollection: (collectionId, fileId) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId && !c.fileIds.includes(fileId)
              ? { ...c, fileIds: [...c.fileIds, fileId], updatedAt: new Date() }
              : c,
          ),
          files: s.files.map((f) =>
            f.id === fileId && !f.collectionIds.includes(collectionId)
              ? { ...f, collectionIds: [...f.collectionIds, collectionId] }
              : f,
          ),
        }));
      },

      removeFromCollection: (collectionId, fileId) => {
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  fileIds: c.fileIds.filter((id) => id !== fileId),
                  updatedAt: new Date(),
                }
              : c,
          ),
          files: s.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  collectionIds: f.collectionIds.filter(
                    (id) => id !== collectionId,
                  ),
                }
              : f,
          ),
        }));
      },

      createPlaylist: (name, fileIds = []) => {
        const { files } = get();
        const items: PlaylistItem[] = fileIds.map((fid, i) => ({
          id: nanoid(),
          fileId: fid,
          position: i,
          file: files.find((f) => f.id === fid),
        }));
        const playlist: Playlist = {
          id: nanoid(),
          name,
          items,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ playlists: [...s.playlists, playlist] }));
        return playlist;
      },

      updatePlaylist: (id, patch) => {
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date() } : p,
          ),
        }));
      },

      deletePlaylist: (id) => {
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
      },

      addToPlaylist: (playlistId, fileId) => {
        const { files } = get();
        const file = files.find((f) => f.id === fileId);
        set((s) => ({
          playlists: s.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const item: PlaylistItem = {
              id: nanoid(),
              fileId,
              position: p.items.length,
              file,
            };
            return { ...p, items: [...p.items, item], updatedAt: new Date() };
          }),
        }));
      },

      removeFromPlaylist: (playlistId, itemId) => {
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  items: p.items.filter((i) => i.id !== itemId),
                  updatedAt: new Date(),
                }
              : p,
          ),
        }));
      },

      clearLibrary: () =>
        set({ files: [], recentFiles: [], favoriteFiles: [] }),

      getFilteredFiles: () => {
        const { files, searchQuery, activeFilter, sortBy, sortOrder } = get();
        let result = [...files];

        if (activeFilter !== "all") {
          result = result.filter((f) => f.category === activeFilter);
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          result = result.filter(
            (f) =>
              f.name.toLowerCase().includes(q) ||
              f.metadata.artist?.toLowerCase().includes(q) ||
              f.metadata.album?.toLowerCase().includes(q) ||
              f.metadata.title?.toLowerCase().includes(q),
          );
        }

        result.sort((a, b) => {
          let cmp = 0;
          switch (sortBy) {
            case "name":
              cmp = a.name.localeCompare(b.name);
              break;
            case "date":
              const timeA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
              const timeB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
              cmp = timeA - timeB;
              break;
            case "size":
              cmp = a.size - b.size;
              break;
            case "type":
              cmp = a.format.localeCompare(b.format);
              break;
          }
          return sortOrder === "desc" ? -cmp : cmp;
        });

        return result;
      },
    }),
    {
      name: "beyond-player-library",
      partialize: (s) => ({
        files: s.files,
        recentFiles: s.recentFiles,
        favoriteFiles: s.favoriteFiles,
        collections: s.collections,
        playlists: s.playlists,
        viewMode: s.viewMode,
        sortBy: s.sortBy,
        sortOrder: s.sortOrder,
      }),
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;

        const sanitizeFiles = (files: any[]) => {
          if (!Array.isArray(files)) return [];
          return files.map((f) => {
            if (f && typeof f === "object" && f.url?.startsWith("blob:")) {
              return { ...f, url: "" };
            }
            return f;
          });
        };

        const sanitizedPlaylists = Array.isArray(persistedState.playlists)
          ? persistedState.playlists.map((p: any) => ({
              ...p,
              items: Array.isArray(p.items)
                ? p.items.map((item: any) => ({
                    ...item,
                    file:
                      item.file && item.file.url?.startsWith("blob:")
                        ? { ...item.file, url: "" }
                        : item.file,
                  }))
                : p.items,
            }))
          : persistedState.playlists;

        return {
          ...currentState,
          ...persistedState,
          files: sanitizeFiles(persistedState.files),
          recentFiles: sanitizeFiles(persistedState.recentFiles),
          favoriteFiles: sanitizeFiles(persistedState.favoriteFiles),
          playlists: sanitizedPlaylists,
        };
      },
    },
  ),
);
