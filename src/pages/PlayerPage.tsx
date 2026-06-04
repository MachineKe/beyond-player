import React, { useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  MoreHorizontal,
  Heart,
  Plus,
  Share2,
  FolderOpen,
} from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";
import { useLibraryStore } from "../stores/libraryStore";
import { VideoPlayer } from "../components/player/VideoPlayer";
import { AudioPlayer } from "../components/player/AudioPlayer";
import { ImageViewer } from "../components/viewers/ImageViewer";
import { PDFViewer } from "../components/viewers/PDFViewer";
import { MarkdownViewer } from "../components/viewers/MarkdownViewer";
import { SpreadsheetViewer } from "../components/viewers/SpreadsheetViewer";
import { TextViewer } from "../components/viewers/TextViewer";
import { MetadataPanel } from "../components/player/MetadataPanel";
import { cn } from "../lib/cn";
import type { MediaFile } from "../types";

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentFile, setCurrentFile } = usePlayerStore();
  const files = useLibraryStore((s) => s.files);
  const markOpened = useLibraryStore((s) => s.markOpened);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const [infoOpen, setInfoOpen] = React.useState(false);

  // Resolve the file from location state, store, or library
  useEffect(() => {
    const stateFile = location.state?.file as MediaFile | undefined;
    const libraryFile = files.find((f) => f.id === id);
    const resolved = stateFile ?? libraryFile ?? currentFile;
    if (resolved) {
      setCurrentFile(resolved);
      markOpened(resolved.id);
    }
  }, [id]);

  if (!currentFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-surface-500">
        <p className="text-sm">No file selected</p>
        <button
          onClick={() => navigate("/library")}
          className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
        >
          Go to Library
        </button>
      </div>
    );
  }

  // Handle cases where the temporary browser blob session expired
  if (!currentFile.url) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-surface-500 p-8 text-center bg-surface-950">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-primary-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">
            Local File Session Expired
          </h3>
          <p className="text-sm mt-1 max-w-sm leading-relaxed text-surface-400">
            Because this file was loaded temporarily from your local device,
            browser security requires you to re-select it after a refresh.
          </p>
        </div>
        <button
          onClick={() => navigate("/library")}
          className="mt-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const { category, format } = currentFile;
  const isFav = currentFile.isFavorite;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950 relative">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-900/80 backdrop-blur border-b border-surface-800 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {currentFile.metadata.title || currentFile.name}
          </p>
          {currentFile.metadata.artist && (
            <p className="text-xs text-surface-500 truncate">
              {currentFile.metadata.artist}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavorite(currentFile.id)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
              isFav
                ? "text-error-400 hover:text-error-300"
                : "text-surface-400 hover:text-white hover:bg-surface-800",
            )}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
          </button>
          <button
            onClick={() => setInfoOpen((v) => !v)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
              infoOpen
                ? "text-primary-400 bg-primary-900/30"
                : "text-surface-400 hover:text-white hover:bg-surface-800",
            )}
            title="File info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          {category === "video" && (
            <VideoPlayer src={currentFile.url} className="flex-1" />
          )}
          {category === "audio" && (
            <AudioPlayer src={currentFile.url} className="flex-1" />
          )}
          {category === "image" && (
            <ImageViewer
              src={currentFile.url}
              alt={currentFile.name}
              className="flex-1"
            />
          )}
          {category === "document" && format === "pdf" && (
            <PDFViewer src={currentFile.url} className="flex-1" />
          )}
          {category === "document" && format === "md" && (
            <MarkdownViewer src={currentFile.url} className="flex-1" />
          )}
          {category === "document" &&
            (format === "xlsx" || format === "csv") && (
              <SpreadsheetViewer src={currentFile.url} className="flex-1" />
            )}
          {category === "document" &&
            ["txt", "json", "xml", "html"].includes(format) && (
              <TextViewer
                src={currentFile.url}
                format={format}
                className="flex-1"
              />
            )}
          {category === "document" &&
            ![
              "pdf",
              "md",
              "xlsx",
              "csv",
              "txt",
              "json",
              "xml",
              "html",
            ].includes(format) && (
              <UnsupportedViewer name={currentFile.name} format={format} />
            )}
        </div>

        {/* Metadata panel */}
        {infoOpen && (
          <MetadataPanel
            file={currentFile}
            onClose={() => setInfoOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function UnsupportedViewer({ name, format }: { name: string; format: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-surface-500 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
        <span className="text-2xl font-mono font-bold text-surface-400">
          .{format}
        </span>
      </div>
      <div>
        <p className="text-white font-medium">{name}</p>
        <p className="text-sm mt-1">
          Preview not available for .{format} files
        </p>
      </div>
    </div>
  );
}
