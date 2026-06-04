// ============================================================
// Shared media utilities
// ============================================================

import type { MediaCategory, SupportedFormat } from '../types';

export function getMediaCategory(format: string): MediaCategory {
  const videoFormats = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv'];
  const audioFormats = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'];
  const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

  if (videoFormats.includes(format)) return 'video';
  if (audioFormats.includes(format)) return 'audio';
  if (imageFormats.includes(format)) return 'image';
  return 'document';
}

export function getMimeType(format: SupportedFormat | string): string {
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    webm: 'video/webm',
    flv: 'video/x-flv',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    pdf: 'application/pdf',
    md: 'text/markdown',
    txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
  };
  return map[format] ?? 'application/octet-stream';
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatBitrate(bps?: number): string {
  if (!bps) return 'Unknown';
  if (bps < 1000) return `${bps} bps`;
  if (bps < 1_000_000) return `${(bps / 1000).toFixed(0)} kbps`;
  return `${(bps / 1_000_000).toFixed(1)} Mbps`;
}

export function getFormatLabel(format: string): string {
  return format.toUpperCase();
}

export function getCategoryIcon(category: MediaCategory): string {
  switch (category) {
    case 'video': return 'video';
    case 'audio': return 'music';
    case 'image': return 'image';
    case 'document': return 'file-text';
  }
}

export function getSupportedAcceptString(category?: MediaCategory): string {
  if (!category) return '*/*';
  switch (category) {
    case 'video': return 'video/mp4,video/x-matroska,video/x-msvideo,video/quicktime,video/webm,.flv';
    case 'audio': return 'audio/mpeg,audio/wav,audio/aac,audio/ogg,audio/flac,audio/mp4';
    case 'image': return 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp';
    case 'document': return '.pdf,.md,.txt,.docx,.xlsx,.csv,.pptx,.json,.xml,.html';
  }
}

export function isTextBasedFormat(format: string): boolean {
  return ['md', 'txt', 'json', 'xml', 'html', 'csv'].includes(format);
}
