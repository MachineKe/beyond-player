import React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/cn';
import type { Notification } from '../../types';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-success-500/30 bg-success-900/20 text-success-400',
  error: 'border-error-500/30 bg-error-900/20 text-error-400',
  warning: 'border-warning-500/30 bg-warning-900/20 text-warning-400',
  info: 'border-primary-500/30 bg-primary-900/20 text-primary-400',
};

export function NotificationToaster() {
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onDismiss={removeNotification} />
      ))}
    </div>
  );
}

function NotificationItem({
  notification: n,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const Icon = icons[n.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-xl border backdrop-blur shadow-xl',
        'pointer-events-auto min-w-64 max-w-sm animate-slide-up',
        'bg-surface-900/90',
        colors[n.type]
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{n.title}</p>
        {n.message && <p className="text-xs text-surface-400 mt-0.5">{n.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(n.id)}
        className="text-surface-500 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
