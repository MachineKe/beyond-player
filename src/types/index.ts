// ============================================================
// packages/types – Core domain types for Beyond Player
// ============================================================

// ─── File & Media ───────────────────────────────────────────

export type MediaCategory = 'video' | 'audio' | 'image' | 'document';

export type VideoFormat = 'mp4' | 'mkv' | 'avi' | 'mov' | 'webm' | 'flv';
export type AudioFormat = 'mp3' | 'wav' | 'aac' | 'ogg' | 'flac' | 'm4a';
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp' | 'svg' | 'bmp';
export type DocumentFormat =
  | 'pdf'
  | 'md'
  | 'txt'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'pptx'
  | 'json'
  | 'xml'
  | 'html';

export type SupportedFormat = VideoFormat | AudioFormat | ImageFormat | DocumentFormat;

export interface MediaFile {
  id: string;
  name: string;
  path: string;
  /** URL or object URL for playback */
  url: string;
  size: number;
  mimeType: string;
  format: SupportedFormat;
  category: MediaCategory;
  metadata: MediaMetadata;
  thumbnailUrl?: string;
  addedAt: Date;
  lastOpenedAt?: Date;
  isFavorite: boolean;
  collectionIds: string[];
}

export interface MediaMetadata {
  duration?: number;
  width?: number;
  height?: number;
  bitrate?: number;
  codec?: string;
  artist?: string;
  album?: string;
  title?: string;
  year?: number;
  genre?: string;
  trackNumber?: number;
  sampleRate?: number;
  channels?: number;
  frameRate?: number;
}

// ─── Playlist ───────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  items: PlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string;
}

export interface PlaylistItem {
  id: string;
  fileId: string;
  position: number;
  file?: MediaFile;
}

// ─── Library ────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  fileIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryState {
  files: MediaFile[];
  recentFiles: MediaFile[];
  favoriteFiles: MediaFile[];
  collections: Collection[];
  playlists: Playlist[];
  searchQuery: string;
  activeFilter: MediaCategory | 'all';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

// ─── Player ─────────────────────────────────────────────────

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';
export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  currentFile: MediaFile | null;
  playlist: Playlist | null;
  playlistIndex: number;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPiP: boolean;
  showSubtitles: boolean;
  subtitleTrack: SubtitleTrack | null;
  availableSubtitles: SubtitleTrack[];
  repeatMode: RepeatMode;
  shuffle: boolean;
  buffered: number;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src: string;
}

// ─── Theme ──────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppTheme {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
}

// ─── Platform Abstraction ───────────────────────────────────

export type Platform = 'web' | 'desktop';

export interface PlatformCapabilities {
  platform: Platform;
  canAccessFileSystem: boolean;
  canScanFolders: boolean;
  canRunFFmpeg: boolean;
  canGenerateThumbnails: boolean;
  canAutoUpdate: boolean;
  hasNativeMenus: boolean;
  hasSQLite: boolean;
}

// ─── Storage ────────────────────────────────────────────────

export interface StorageProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// ─── File System ────────────────────────────────────────────

export interface FileOpenOptions {
  accept?: string[];
  multiple?: boolean;
}

export interface FileSystemProvider {
  openFile(options?: FileOpenOptions): Promise<MediaFile[]>;
  openFolder(): Promise<MediaFile[]>;
  readFile(path: string): Promise<ArrayBuffer>;
  getFileUrl(path: string): Promise<string>;
  supportsOpenFolder: boolean;
}

// ─── Search ─────────────────────────────────────────────────

export interface SearchResult {
  files: MediaFile[];
  total: number;
  query: string;
}

// ─── Keyboard Shortcuts ─────────────────────────────────────

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: string;
}

// ─── Notifications ──────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: Date;
}
