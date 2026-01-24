import { Response } from 'express';

export type NotificationType = 
  | 'info' | 'success' | 'warning' | 'error' | 'system'
  | 'case_pending' | 'case_approved' | 'case_rejected'
  | 'certificate_issued' | 'token_awarded' | 'token_earned' | 'report_generated'
  | 'system_alert' | 'badge_earned' | 'points_awarded' | 'webhook_delivered';

export interface SSENotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface SSEClient {
  id: string;
  userId: string;
  role: 'admin' | 'user';
  response: Response;
  connectedAt: number;
}

interface SSEMetrics {
  totalConnections: number;
  activeConnections: number;
  notificationsSent: number;
  notificationsByType: Record<string, number>;
  averageConnectionDuration: number;
  lastNotificationAt: number | null;
  uptime: number;
}

interface NotificationLog {
  id: string;
  type: NotificationType;
  title: string;
  recipientCount: number;
  timestamp: number;
}

class SSENotificationService {
  private clients: Map<string, SSEClient> = new Map();
  private metrics: SSEMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    notificationsSent: 0,
    notificationsByType: {},
    averageConnectionDuration: 0,
    lastNotificationAt: null,
    uptime: Date.now(),
  };
  private notificationHistory: NotificationLog[] = [];
  private connectionDurations: number[] = [];

  /**
   * Add a new SSE client connection
   */
  addClient(userId: string, role: 'admin' | 'user', res: Response): string {
    const clientId = `${userId}_${Date.now()}`;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Send initial connection event
    this.sendToClient(res, {
      id: `init_${Date.now()}`,
      type: 'system_alert',
      title: 'Conectado',
      message: 'Conexão SSE estabelecida',
      timestamp: Date.now(),
      data: { clientId }
    });

    // Store client
    this.clients.set(clientId, {
      id: clientId,
      userId,
      role,
      response: res,
      connectedAt: Date.now()
    });

    // Update metrics
    this.metrics.totalConnections++;
    this.metrics.activeConnections = this.clients.size;

    console.log(`[SSE] Client connected: ${clientId} (${role})`);

    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(clientId);
    });

    return clientId;
  }

  /**
   * Remove a client connection
   */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Track connection duration
      const duration = Date.now() - client.connectedAt;
      this.connectionDurations.push(duration);
      // Keep only last 100 durations for average calculation
      if (this.connectionDurations.length > 100) {
        this.connectionDurations.shift();
      }
      this.metrics.averageConnectionDuration = 
        this.connectionDurations.reduce((a, b) => a + b, 0) / this.connectionDurations.length;
      
      this.clients.delete(clientId);
      this.metrics.activeConnections = this.clients.size;
      console.log(`[SSE] Client disconnected: ${clientId}`);
    }
  }

  /**
   * Send notification to a specific client
   */
  private sendToClient(res: Response, notification: SSENotification): void {
    try {
      const data = JSON.stringify(notification);
      res.write(`event: notification\n`);
      res.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error('[SSE] Error sending to client:', error);
    }
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, notification: SSENotification): void {
    for (const client of Array.from(this.clients.values())) {
      if (client.userId === userId) {
        this.sendToClient(client.response, notification);
      }
    }
  }

  /**
   * Broadcast notification to a specific user (alias for sendToUser with partial notification)
   */
  broadcastToUser(userId: string, notification: Partial<SSENotification>): void {
    const fullNotification: SSENotification = {
      id: `notif_${Date.now()}`,
      type: (notification.type as NotificationType) || 'system_alert',
      title: notification.title || 'Notificação',
      message: notification.message || '',
      timestamp: notification.timestamp || Date.now(),
      data: notification.data
    };
    this.sendToUser(userId, fullNotification);
  }

  /**
   * Send notification to all admin users
   */
  sendToAdmins(notification: SSENotification): void {
    for (const client of Array.from(this.clients.values())) {
      if (client.role === 'admin') {
        this.sendToClient(client.response, notification);
      }
    }
  }

  /**
   * Broadcast notification to all connected clients
   */
  broadcast(notification: SSENotification): void {
    let recipientCount = 0;
    for (const client of Array.from(this.clients.values())) {
      this.sendToClient(client.response, notification);
      recipientCount++;
    }
    this.trackNotification(notification, recipientCount);
  }

  /**
   * Track notification for metrics
   */
  private trackNotification(notification: SSENotification, recipientCount: number): void {
    this.metrics.notificationsSent++;
    this.metrics.lastNotificationAt = Date.now();
    this.metrics.notificationsByType[notification.type] = 
      (this.metrics.notificationsByType[notification.type] || 0) + 1;
    
    // Add to history (keep last 50)
    this.notificationHistory.unshift({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      recipientCount,
      timestamp: notification.timestamp,
    });
    if (this.notificationHistory.length > 50) {
      this.notificationHistory.pop();
    }
  }

  /**
   * Get connected clients count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get connected clients info
   */
  getClientsInfo(): Array<{ id: string; userId: string; role: string; connectedAt: number }> {
    return Array.from(this.clients.values()).map(c => ({
      id: c.id,
      userId: c.userId,
      role: c.role,
      connectedAt: c.connectedAt
    }));
  }

  /**
   * Get SSE metrics
   */
  getMetrics(): SSEMetrics & { uptimeFormatted: string } {
    const uptimeMs = Date.now() - this.metrics.uptime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
    
    return {
      ...this.metrics,
      activeConnections: this.clients.size,
      uptimeFormatted: `${hours}h ${minutes}m ${seconds}s`,
    };
  }

  /**
   * Get notification history
   */
  getNotificationHistory(): NotificationLog[] {
    return this.notificationHistory;
  }

  /**
   * Get clients grouped by role
   */
  getClientsByRole(): { admins: number; users: number } {
    let admins = 0;
    let users = 0;
    for (const client of Array.from(this.clients.values())) {
      if (client.role === 'admin') admins++;
      else users++;
    }
    return { admins, users };
  }

  /**
   * Send heartbeat to all clients (keep connection alive)
   */
  sendHeartbeat(): void {
    for (const client of Array.from(this.clients.values())) {
      try {
        client.response.write(`:heartbeat\n\n`);
      } catch (error) {
        // Client disconnected, remove it
        this.removeClient(client.id);
      }
    }
  }
}

// Singleton instance
export const sseNotificationService = new SSENotificationService();

// Start heartbeat interval (every 30 seconds)
setInterval(() => {
  sseNotificationService.sendHeartbeat();
}, 30000);
