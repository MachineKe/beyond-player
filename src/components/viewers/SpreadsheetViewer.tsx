import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

interface SpreadsheetViewerProps {
  src: string;
  className?: string;
}

interface SheetData {
  name: string;
  rows: (string | number | boolean | null)[][];
}

export function SpreadsheetViewer({ src, className }: SpreadsheetViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);

    const load = async () => {
      try {
        const XLSX = await import('xlsx');
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const parsedSheets: SheetData[] = workbook.SheetNames.map((name) => ({
          name,
          rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
            header: 1,
            defval: null,
          }) as (string | number | boolean | null)[][],
        }));

        setSheets(parsedSheets);
        setLoading(false);
      } catch {
        setError('Failed to parse spreadsheet');
        setLoading(false);
      }
    };

    load();
  }, [src]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center bg-surface-950', className)}>
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-surface-950 text-error-400 text-sm', className)}>
        {error}
      </div>
    );
  }

  const currentSheet = sheets[activeSheet];
  if (!currentSheet) return null;

  const headers = currentSheet.rows[0] ?? [];
  const dataRows = currentSheet.rows.slice(1);

  return (
    <div className={cn('flex flex-col bg-surface-950', className)}>
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex items-center gap-1 px-4 py-2 bg-surface-900 border-b border-surface-800 flex-shrink-0 overflow-x-auto">
          {sheets.map((sheet, i) => (
            <button
              key={sheet.name}
              onClick={() => setActiveSheet(i)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap',
                i === activeSheet
                  ? 'bg-surface-700 text-white font-medium'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              )}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-surface-900 z-10">
            <tr>
              <th className="w-8 px-2 py-2 text-surface-500 text-right border-r border-b border-surface-800 font-medium" />
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left text-surface-300 font-medium border-r border-b border-surface-800 whitespace-nowrap"
                >
                  {String(h ?? '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-surface-800/50 transition-colors">
                <td className="px-2 py-1.5 text-surface-600 text-right border-r border-surface-800/50 font-mono">
                  {ri + 2}
                </td>
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-1.5 text-surface-300 border-r border-surface-800/30 whitespace-nowrap max-w-48 truncate"
                  >
                    {row[ci] == null ? '' : String(row[ci])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {dataRows.length === 0 && (
          <div className="py-12 text-center text-surface-500 text-sm">Empty sheet</div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 bg-surface-900 border-t border-surface-800 text-xs text-surface-500 flex-shrink-0">
        {dataRows.length} rows · {headers.length} columns
      </div>
    </div>
  );
}
