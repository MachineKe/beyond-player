import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ImageViewer({ src, alt = '', className }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const rotate = () => setRotation((r) => (r + 90) % 360);
  const reset = () => { setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.25, Math.min(5, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className={cn('relative flex items-center justify-center bg-surface-950 overflow-hidden', className)}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Checkered background for transparent images */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #fff 25%, transparent 25%),
            linear-gradient(-45deg, #fff 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #fff 75%),
            linear-gradient(-45deg, transparent 75%, #fff 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      />

      <img
        src={src}
        alt={alt}
        draggable={false}
        className="max-w-none select-none transition-transform duration-100"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
        }}
        onDoubleClick={reset}
      />

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-surface-900/80 backdrop-blur border border-surface-700 rounded-lg p-1">
        <ToolBtn onClick={zoomOut} title="Zoom out"><ZoomOut className="w-4 h-4" /></ToolBtn>
        <button
          onClick={reset}
          className="px-2 h-7 text-xs text-surface-300 hover:text-white hover:bg-surface-700 rounded transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        <ToolBtn onClick={zoomIn} title="Zoom in"><ZoomIn className="w-4 h-4" /></ToolBtn>
        <div className="w-px h-5 bg-surface-700 mx-0.5" />
        <ToolBtn onClick={rotate} title="Rotate"><RotateCw className="w-4 h-4" /></ToolBtn>
        <ToolBtn
          onClick={() => {
            const a = document.createElement('a');
            a.href = src;
            a.download = '';
            a.click();
          }}
          title="Download"
        >
          <Download className="w-4 h-4" />
        </ToolBtn>
      </div>

      {/* Zoom hint */}
      {zoom !== 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-900/70 text-surface-300 text-xs px-3 py-1.5 rounded-full backdrop-blur">
          Double-click to reset
        </div>
      )}
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 rounded transition-colors"
    >
      {children}
    </button>
  );
}
