import { useState, useCallback, useRef, useEffect } from 'react';

export type NotificationType = 
  | 'case_pending' | 'case_approved' | 'case_rejected'
  | 'certificate_issued' | 'token_awarded' | 'report_generated' | 'system_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
  read: boolean;
}

interface WebSocketMessage {
  type: string;
  notification?: Notification;
  notifications?: Notification[];
  clientId?: string;
  timestamp?: number;
}

interface UseWebSocketOptions {
  userId?: string;
  role?: 'admin' | 'user';
  onNotification?: (notification: Notification) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { userId = 'anonymous', role = 'user', onNotification, autoReconnect = true, reconnectInterval = 5000 } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Evitar múltiplas conexões simultâneas
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] Connection in progress');
      return;
    }

    // Verificar limite de tentativas de reconexão
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn('[WebSocket] Max reconnection attempts reached, giving up');
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}&role=${role}`;
    
    try {
      console.log('[WebSocket] Connecting to', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset counter on success
        if (reconnectTimeoutRef.current) { 
          clearTimeout(reconnectTimeoutRef.current); 
          reconnectTimeoutRef.current = null; 
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          switch (message.type) {
            case 'notification':
              if (message.notification) {
                setNotifications(prev => [message.notification!, ...prev].slice(0, 100));
                setUnreadCount(prev => prev + 1);
                onNotification?.(message.notification);
              }
              break;
            case 'pending_notifications':
              if (message.notifications) {
                setNotifications(message.notifications);
                setUnreadCount(message.notifications.filter(n => !n.read).length);
              }
              break;
            case 'connected':
              console.log('[WebSocket] Registered as:', message.clientId);
              break;
          }
        } catch (error) { 
          console.error('[WebSocket] Parse error:', error); 
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => { connect(); }, delay);
        }
      };

      ws.onerror = (error: Event) => {
        console.error('[WebSocket] Connection error:', {
          type: error.type,
          message: error instanceof ErrorEvent ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        setIsConnected(false);
      };
    } catch (error) { 
      console.error('[WebSocket] Connection failed:', error);
      setIsConnected(false);
      
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
        console.log(`[WebSocket] Retrying connection in ${delay}ms`);
        reconnectTimeoutRef.current = setTimeout(() => { connect(); }, delay);
      }
    }
  }, [userId, role, onNotification, autoReconnect, reconnectInterval]);

  // Conectar ao montar e desconectar ao desmontar
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) { 
      clearTimeout(reconnectTimeoutRef.current); 
      reconnectTimeoutRef.current = null; 
    }
    if (wsRef.current) { 
      wsRef.current.close(); 
      wsRef.current = null; 
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((type: string, data?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) { 
      wsRef.current.send(JSON.stringify({ type, data })); 
    } else {
      console.warn('[WebSocket] Cannot send message, connection not open');
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    sendMessage('mark_read', { notificationId });
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [sendMessage]);

  const markAllAsRead = useCallback(() => {
    sendMessage('mark_all_read');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [sendMessage]);

  const deleteNotification = useCallback((notificationId: string) => {
    sendMessage('delete_notification', { notificationId });
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, [sendMessage]);

  return {
    isConnected,
    notifications,
    unreadCount,
    connect,
    disconnect,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
