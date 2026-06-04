// ============================================================
// Platform abstraction layer – capabilities & DI container
// ============================================================

import type {
  Platform,
  PlatformCapabilities,
  FileSystemProvider,
  StorageProvider,
} from '../types';

// ─── Capability detection ────────────────────────────────────

export function detectPlatform(): Platform {
  if (typeof window !== 'undefined' && (window as Window & { electronAPI?: unknown }).electronAPI) {
    return 'desktop';
  }
  return 'web';
}

export function getPlatformCapabilities(platform: Platform): PlatformCapabilities {
  if (platform === 'desktop') {
    return {
      platform: 'desktop',
      canAccessFileSystem: true,
      canScanFolders: true,
      canRunFFmpeg: true,
      canGenerateThumbnails: true,
      canAutoUpdate: true,
      hasNativeMenus: true,
      hasSQLite: true,
    };
  }
  return {
    platform: 'web',
    canAccessFileSystem: 'showOpenFilePicker' in window,
    canScanFolders: false,
    canRunFFmpeg: false,
    canGenerateThumbnails: false,
    canAutoUpdate: false,
    hasNativeMenus: false,
    hasSQLite: false,
  };
}

// ─── DI Container ────────────────────────────────────────────

interface PlatformServices {
  fileSystem: FileSystemProvider;
  storage: StorageProvider;
  capabilities: PlatformCapabilities;
}

let _services: PlatformServices | null = null;

export function initPlatform(services: PlatformServices): void {
  _services = services;
}

export function getFileSystem(): FileSystemProvider {
  if (!_services) throw new Error('Platform not initialized');
  return _services.fileSystem;
}

export function getStorage(): StorageProvider {
  if (!_services) throw new Error('Platform not initialized');
  return _services.storage;
}

export function getCapabilities(): PlatformCapabilities {
  if (!_services) throw new Error('Platform not initialized');
  return _services.capabilities;
}
