import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";
import { cn } from "../../lib/cn";

interface PDFViewerProps {
  src: string;
  className?: string;
}

export function PDFViewer({ src, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canvases, setCanvases] = useState<string[]>([]);
  const pdfRef = useRef<unknown>(null);

  const renderPage = useCallback(
    async (
      pdf: unknown,
      pageNum: number,
      pageScale: number,
    ): Promise<string> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await (pdf as any).getPage(pageNum);
      const viewport = page.getViewport({ scale: pageScale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d")!;
      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setCanvases([]);

    const load = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        // Handle blob URLs (file uploads) and regular URLs
        let pdfData: string | ArrayBuffer;
        if (src.startsWith("blob:")) {
          const response = await fetch(src);
          pdfData = await response.arrayBuffer();
        } else {
          pdfData = src;
        }

        const pdf = await pdfjsLib.getDocument(pdfData).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);

        // Render first page immediately
        const firstCanvas = await renderPage(pdf, 1, scale);
        if (!cancelled) {
          setCanvases([firstCanvas]);
          setLoading(false);
          setCurrentPage(1);
        }

        // Render remaining pages
        for (let i = 2; i <= pdf.numPages && !cancelled; i++) {
          const dataUrl = await renderPage(pdf, i, scale);
          if (!cancelled) {
            setCanvases((prev) => [...prev, dataUrl]);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            "Failed to load PDF. Make sure the file is a valid PDF document.",
          );
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [src, scale, renderPage]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-950 text-error-400 text-sm p-8 text-center",
          className,
        )}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-surface-950", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-900 border-b border-surface-800 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="w-7 h-7 flex items-center justify-center rounded text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-surface-400 px-2">
            {loading ? "Loading..." : `${currentPage} / ${numPages}`}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="w-7 h-7 flex items-center justify-center rounded text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-surface-700 mx-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="w-7 h-7 flex items-center justify-center rounded text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-surface-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="w-7 h-7 flex items-center justify-center rounded text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 overflow-y-auto bg-surface-950 p-6">
        {loading && canvases.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
            {canvases.map((dataUrl, i) => (
              <div key={i} className="shadow-2xl rounded overflow-hidden">
                <img src={dataUrl} alt={`Page ${i + 1}`} className="block" />
              </div>
            ))}
            {loading && canvases.length > 0 && (
              <div className="flex items-center gap-2 text-surface-500 text-sm py-4">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                Rendering remaining pages...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
