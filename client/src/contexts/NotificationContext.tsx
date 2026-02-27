import { NotificationToastContainer, type ToastNotification } from '@/components/NotificationToast';
import { useAuth } from '@/_core/hooks/useAuth';
import { useSSE, SSENotification } from '@/hooks/useSSE';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface NotificationContextType {
  // SSE state
  isConnected: boolean;
  notifications: SSENotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  // Toast functions
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

// Map SSE notification type to toast type
function mapToToastType(type: string): ToastNotification['type'] {
  const mapping: Record<string, ToastNotification['type']> = {
    // Direct mappings
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    system: 'system',
    case_pending: 'case_pending',
    case_approved: 'case_approved',
    case_rejected: 'case_rejected',
    certificate_issued: 'certificate_issued',
    token_earned: 'token_earned',
    token_awarded: 'token_earned',
    // Fallback mappings
    report_generated: 'info',
    system_alert: 'warning',
    badge_earned: 'success',
    points_awarded: 'success',
    webhook_delivered: 'info',
  };
  return mapping[type] || 'info';
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Use SSE hook for real-time notifications
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useSSE({
    userId: user?.email || String(user?.id || 'anon') || 'anonymous',
    role: (user?.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    enabled: !!user,
    onNotification: (notification) => {
      // Show toast for new notifications (except initial connection)
      if (notification.type !== 'system_alert' || notification.title !== 'Conectado') {
        showToast({
          type: mapToToastType(notification.type),
          title: notification.title,
          message: notification.message,
          duration: 5000
        });
      }
    }
  });

  // Show toast notification
  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  // Dismiss toast
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: NotificationContextType = {
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    showToast,
    dismissToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToastContainer notifications={toasts} onClose={dismissToast} />
    </NotificationContext.Provider>
  );
}
