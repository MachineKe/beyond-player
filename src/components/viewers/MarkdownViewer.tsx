import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '../../lib/cn';

interface MarkdownViewerProps {
  src?: string;
  content?: string;
  className?: string;
}

export function MarkdownViewer({ src, content: initialContent, className }: MarkdownViewerProps) {
  const [content, setContent] = useState(initialContent ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!src) return;
    setLoading(true);
    fetch(src)
      .then((r) => r.text())
      .then((text) => { setContent(text); setLoading(false); })
      .catch(() => { setError('Failed to load document'); setLoading(false); });
  }, [src]);

  if (loading) return <ViewerShell className={className}><Spinner /></ViewerShell>;
  if (error) return <ViewerShell className={className}><ErrorMsg>{error}</ErrorMsg></ViewerShell>;

  return (
    <ViewerShell className={className}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <article className="prose prose-invert prose-sm max-w-none
          prose-headings:text-white prose-headings:font-semibold
          prose-p:text-surface-300 prose-p:leading-relaxed
          prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
          prose-code:text-accent-400 prose-code:bg-surface-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-700
          prose-blockquote:border-l-primary-500 prose-blockquote:text-surface-400
          prose-strong:text-white
          prose-th:text-white prose-td:text-surface-300
          prose-hr:border-surface-700
          prose-img:rounded-lg
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </ViewerShell>
  );
}

function ViewerShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex-1 overflow-y-auto bg-surface-950', className)}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-48">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center h-full min-h-48 text-error-400 text-sm">
      {children}
    </div>
  );
}
