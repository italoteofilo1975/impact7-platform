import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

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

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  role: 'admin' | 'user';
  connectedAt: number;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private notifications: Map<string, Notification[]> = new Map();

  initialize(server: Server) {
    try {
      console.log('[WebSocket] Initializing WebSocketServer...');
      this.wss = new WebSocketServer({ server, path: '/ws' });
      console.log('[WebSocket] WebSocketServer created successfully');

      this.wss.on('connection', (ws, req) => {
        console.log('[WebSocket] New connection attempt');
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId') || 'anonymous';
      const role = (url.searchParams.get('role') || 'user') as 'admin' | 'user';
      const clientId = `${userId}_${Date.now()}`;
      
      this.clients.set(clientId, { ws, userId, role, connectedAt: Date.now() });
      console.log(`[WebSocket] Client connected: ${clientId} (${role})`);

      const pending = this.notifications.get(userId) || [];
      if (pending.length > 0) {
        ws.send(JSON.stringify({ type: 'pending_notifications', notifications: pending.filter(n => !n.read) }));
      }

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('[WebSocket] Invalid message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocket] Error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      ws.send(JSON.stringify({ type: 'connected', clientId, timestamp: Date.now() }));
    });

      console.log('[WebSocket] Server initialized on /ws');
    } catch (error) {
      console.error('[WebSocket] Error initializing WebSocketServer:', error);
    }
  }

  private handleMessage(clientId: string, message: { type: string; data?: unknown }) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'mark_read':
        const { notificationId } = message.data as { notificationId: string };
        this.markAsRead(client.userId, notificationId);
        break;
      case 'mark_all_read':
        this.markAllAsRead(client.userId);
        break;
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sendToUser(userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification, id: this.generateNotificationId(), timestamp: Date.now(), read: false
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(fullNotification);
    if (userNotifications.length > 100) userNotifications.pop();
    this.notifications.set(userId, userNotifications);

    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({ type: 'notification', notification: fullNotification }));
      }
    });
  }

  sendToAdmins(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification, id: this.generateNotificationId(), timestamp: Date.now(), read: false
    };

    this.clients.forEach((client) => {
      if (client.role === 'admin' && client.ws.readyState === WebSocket.OPEN) {
        const userNotifications = this.notifications.get(client.userId) || [];
        userNotifications.unshift(fullNotification);
        if (userNotifications.length > 100) userNotifications.pop();
        this.notifications.set(client.userId, userNotifications);
        client.ws.send(JSON.stringify({ type: 'notification', notification: fullNotification }));
      }
    });
  }

  broadcast(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification, id: this.generateNotificationId(), timestamp: Date.now(), read: false
    };
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({ type: 'notification', notification: fullNotification }));
      }
    });
  }

  markAsRead(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) notification.read = true;
    }
  }

  markAllAsRead(userId: string) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) userNotifications.forEach(n => n.read = true);
  }

  getUnreadCount(userId: string): number {
    return (this.notifications.get(userId) || []).filter(n => !n.read).length;
  }

  getNotifications(userId: string, limit = 50): Notification[] {
    return (this.notifications.get(userId) || []).slice(0, limit);
  }

  getConnectedClients(): number { return this.clients.size; }

  getStats() {
    const adminCount = Array.from(this.clients.values()).filter(c => c.role === 'admin').length;
    return {
      totalConnected: this.clients.size,
      admins: adminCount,
      users: this.clients.size - adminCount,
      totalNotifications: Array.from(this.notifications.values()).reduce((sum, n) => sum + n.length, 0)
    };
  }
  
  shutdown() {
    console.log('[WebSocket] Shutting down...');
    
    // Close all client connections
    this.clients.forEach((client, clientId) => {
      try {
        client.ws.close(1001, 'Server shutting down');
        console.log(`[WebSocket] Closed connection: ${clientId}`);
      } catch (e) {
        console.error(`[WebSocket] Error closing client ${clientId}:`, e);
      }
    });
    
    // Clear clients map
    this.clients.clear();
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close(() => {
        console.log('[WebSocket] Server closed');
      });
    }
  }
}

export const websocketService = new WebSocketService();

export const notifyNewCasePending = (caseTitle: string, submittedBy: string) => {
  websocketService.sendToAdmins({
    type: 'case_pending', title: 'Novo Case Pendente',
    message: `"${caseTitle}" submetido por ${submittedBy} aguarda revisão.`,
    data: { caseTitle, submittedBy }
  });
};

export const notifyCaseApproved = (userId: string, caseTitle: string) => {
  websocketService.sendToUser(userId, {
    type: 'case_approved', title: 'Case Aprovado!',
    message: `Seu case "${caseTitle}" foi aprovado e publicado.`,
    data: { caseTitle }
  });
};

export const notifyCertificateIssued = (userId: string, certificateTitle: string, hash: string) => {
  websocketService.sendToUser(userId, {
    type: 'certificate_issued', title: 'Certificado Emitido!',
    message: `Seu certificado "${certificateTitle}" foi emitido com sucesso.`,
    data: { certificateTitle, hash }
  });
};

export const notifyTokenAwarded = (userId: string, amount: number, reason: string) => {
  websocketService.sendToUser(userId, {
    type: 'token_awarded', title: 'Tokens SIT Recebidos!',
    message: `Você recebeu ${amount} tokens SIT: ${reason}`,
    data: { amount, reason }
  });
};

export const notifyReportGenerated = (userId: string, reportTitle: string) => {
  websocketService.sendToUser(userId, {
    type: 'report_generated', title: 'Relatório Pronto!',
    message: `Seu relatório "${reportTitle}" foi gerado com sucesso.`,
    data: { reportTitle }
  });
};
