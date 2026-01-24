import { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, AlertCircle, Info, Award, FileCheck, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'case_pending' | 'case_approved' | 'case_rejected' | 'certificate_issued' | 'token_earned' | 'system';
  title: string;
  message: string;
  link?: string;
  duration?: number;
}

interface NotificationToastProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

const typeConfig = {
  info: { icon: Info, bg: 'bg-blue-500', border: 'border-blue-600' },
  success: { icon: CheckCircle, bg: 'bg-green-500', border: 'border-green-600' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-500', border: 'border-yellow-600' },
  error: { icon: AlertCircle, bg: 'bg-red-500', border: 'border-red-600' },
  case_pending: { icon: Bell, bg: 'bg-orange-500', border: 'border-orange-600' },
  case_approved: { icon: CheckCircle, bg: 'bg-green-500', border: 'border-green-600' },
  case_rejected: { icon: AlertCircle, bg: 'bg-red-500', border: 'border-red-600' },
  certificate_issued: { icon: Award, bg: 'bg-purple-500', border: 'border-purple-600' },
  token_earned: { icon: Coins, bg: 'bg-amber-500', border: 'border-amber-600' },
  system: { icon: FileCheck, bg: 'bg-slate-500', border: 'border-slate-600' },
};

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const duration = notification.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const handleClick = () => {
    if (notification.link) {
      window.location.href = notification.link;
    }
    handleClose();
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-out',
        'bg-card border',
        config.border,
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        notification.link && 'cursor-pointer hover:bg-muted/50'
      )}
      onClick={notification.link ? handleClick : undefined}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', config.bg)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-foreground">{notification.title}</p>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
            {notification.link && (
              <p className="mt-2 text-xs text-primary hover:underline">Clique para ver detalhes</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <span className="sr-only">Fechar</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className={cn('h-full transition-all ease-linear', config.bg)}
          style={{
            animation: `shrink ${notification.duration || 5000}ms linear forwards`,
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

interface NotificationToastContainerProps {
  notifications: ToastNotification[];
  onClose: (id: string) => void;
}

export function NotificationToastContainer({ notifications, onClose }: NotificationToastContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end px-4 py-6 sm:p-6"
    >
      <div className="flex w-full flex-col items-end space-y-4">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}
