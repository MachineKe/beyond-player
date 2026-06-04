// ============================================================
// Web implementations of platform providers
// ============================================================

import { nanoid } from '../lib/nanoid';
import type {
  FileSystemProvider,
  StorageProvider,
  MediaFile,
  FileOpenOptions,
  SupportedFormat,
  MediaCategory,
} from '../types';
import { getMediaCategory, getMimeType } from '../lib/mediaUtils';

// ─── IndexedDB Storage Provider ─────────────────────────────

const DB_NAME = 'BeyondPlayer';
const DB_VERSION = 1;
const STORE_NAME = 'keyvalue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class IndexedDBStorageProvider implements StorageProvider {
  async get<T>(key: string): Promise<T | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clear(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async keys(): Promise<string[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => reject(req.error);
    });
  }
}

// ─── Web File System Provider ────────────────────────────────

export class WebFileSystemProvider implements FileSystemProvider {
  readonly supportsOpenFolder = false;

  async openFile(options: FileOpenOptions = {}): Promise<MediaFile[]> {
    // Try modern File System Access API first
    if ('showOpenFilePicker' in window) {
      try {
        const handles = await (window as Window & {
          showOpenFilePicker: (opts: unknown) => Promise<FileSystemFileHandle[]>;
        }).showOpenFilePicker({
          multiple: options.multiple ?? true,
          types: options.accept ? [{ accept: this._buildAcceptMap(options.accept) }] : undefined,
        });
        const files = await Promise.all(handles.map((h) => h.getFile()));
        return files.map((f) => this._fileToMediaFile(f));
      } catch {
        // User cancelled or API not available
        return [];
      }
    }

    // Fallback to input[type=file]
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.multiple ?? true;
      if (options.accept?.length) input.accept = options.accept.join(',');

      input.onchange = () => {
        const files = Array.from(input.files ?? []);
        resolve(files.map((f) => this._fileToMediaFile(f)));
      };
      input.oncancel = () => resolve([]);
      input.click();
    });
  }

  async openFolder(): Promise<MediaFile[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      (input as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true;
      input.multiple = true;

      input.onchange = () => {
        const files = Array.from(input.files ?? []);
        resolve(
          files
            .filter((f) => this._isSupportedFormat(f.name))
            .map((f) => this._fileToMediaFile(f))
        );
      };
      input.oncancel = () => resolve([]);
      input.click();
    });
  }

  async readFile(path: string): Promise<ArrayBuffer> {
    const response = await fetch(path);
    return response.arrayBuffer();
  }

  async getFileUrl(path: string): Promise<string> {
    return path;
  }

  private _fileToMediaFile(file: File): MediaFile {
    const ext = file.name.split('.').pop()?.toLowerCase() as SupportedFormat;
    const url = URL.createObjectURL(file);
    const category = getMediaCategory(ext);

    return {
      id: nanoid(),
      name: file.name,
      path: file.name,
      url,
      size: file.size,
      mimeType: file.type || getMimeType(ext),
      format: ext,
      category,
      metadata: {},
      addedAt: new Date(),
      isFavorite: false,
      collectionIds: [],
    };
  }

  private _isSupportedFormat(name: string): boolean {
    const ext = name.split('.').pop()?.toLowerCase();
    const supported = [
      'mp4','mkv','avi','mov','webm','flv',
      'mp3','wav','aac','ogg','flac','m4a',
      'jpg','jpeg','png','gif','webp','svg','bmp',
      'pdf','md','txt','docx','xlsx','csv','pptx','json','xml','html',
    ];
    return supported.includes(ext ?? '');
  }

  private _buildAcceptMap(exts: string[]): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const ext of exts) {
      const mime = getMimeType(ext.replace('.', '') as SupportedFormat);
      if (mime) {
        map[mime] = map[mime] ?? [];
        map[mime].push(ext.startsWith('.') ? ext : `.${ext}`);
      }
    }
    return map;
  }
}
