import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

interface TextViewerProps {
  src: string;
  format: string;
  className?: string;
}

export function TextViewer({ src, format, className }: TextViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(src)
      .then((r) => r.text())
      .then((text) => { setContent(text); setLoading(false); })
      .catch(() => { setError('Failed to load file'); setLoading(false); });
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

  const isCode = ['json', 'xml', 'html', 'csv'].includes(format);

  if (isCode) {
    return (
      <div className={cn('flex-1 overflow-auto bg-surface-950', className)}>
        <pre className="p-6 text-sm text-surface-200 font-mono leading-relaxed whitespace-pre-wrap break-words">
          <code>{content}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 overflow-y-auto bg-surface-950', className)}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-surface-300 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>
    </div>
  );
}
