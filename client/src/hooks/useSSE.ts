import { useState, useEffect, useCallback, useRef } from 'react';

export type NotificationType = 
  | 'case_pending' | 'case_approved' | 'case_rejected'
  | 'certificate_issued' | 'token_awarded' | 'report_generated'
  | 'system_alert' | 'badge_earned' | 'points_awarded' | 'webhook_delivered';

export interface SSENotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read?: boolean;
  data?: Record<string, unknown>;
}

interface UseSSEOptions {
  userId: string;
  role: 'admin' | 'user';
  onNotification?: (notification: SSENotification) => void;
  enabled?: boolean;
}

interface UseSSEReturn {
  notifications: SSENotification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const STORAGE_KEY = 'impact7_notifications';
const MAX_NOTIFICATIONS = 50;

// Load notifications from localStorage
function loadFromStorage(): SSENotification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('[SSE] Error loading from storage:', error);
  }
  return [];
}

// Save notifications to localStorage
function saveToStorage(notifications: SSENotification[]): void {
  try {
    // Keep only the most recent notifications
    const toSave = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('[SSE] Error saving to storage:', error);
  }
}

export function useSSE(options: UseSSEOptions): UseSSEReturn {
  const { userId, role, onNotification, enabled = true } = options;
  const [notifications, setNotifications] = useState<SSENotification[]>(() => loadFromStorage());
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!enabled || !userId || userId === 'anonymous') {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const url = `/api/notifications/stream?userId=${encodeURIComponent(userId)}&role=${role}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      eventSource.addEventListener('notification', (event) => {
        try {
          const notification: SSENotification = JSON.parse(event.data);
          notification.read = false;
          
          setNotifications(prev => {
            const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
            saveToStorage(updated);
            return updated;
          });

          onNotification?.(notification);
        } catch (error) {
          console.error('[SSE] Error parsing notification:', error);
        }
      });

      eventSource.onerror = () => {
        console.log('[SSE] Connection error, will reconnect...');
        setIsConnected(false);
        eventSource.close();
        
        // Exponential backoff reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current <= 5) {
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('[SSE] Error creating EventSource:', error);
    }
  }, [userId, role, enabled, onNotification]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
}
