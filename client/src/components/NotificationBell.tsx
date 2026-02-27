import { useState } from 'react';
import { Bell, Check, CheckCheck, X, FileText, Award, Coins, Brain, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSSE, SSENotification, NotificationType } from '@/hooks/useSSE';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';

const notificationIcons: Record<NotificationType, typeof Bell> = {
  case_pending: FileText, case_approved: Check, case_rejected: X,
  certificate_issued: Award, token_awarded: Coins, report_generated: Brain, 
  system_alert: AlertTriangle, badge_earned: Award, points_awarded: Coins,
  webhook_delivered: FileText,
};

const notificationColors: Record<NotificationType, string> = {
  case_pending: 'bg-yellow-500/10 text-yellow-500', case_approved: 'bg-green-500/10 text-green-500',
  case_rejected: 'bg-red-500/10 text-red-500', certificate_issued: 'bg-blue-500/10 text-blue-500',
  token_awarded: 'bg-purple-500/10 text-purple-500', report_generated: 'bg-teal-500/10 text-teal-500',
  system_alert: 'bg-orange-500/10 text-orange-500', badge_earned: 'bg-indigo-500/10 text-indigo-500',
  points_awarded: 'bg-pink-500/10 text-pink-500', webhook_delivered: 'bg-gray-500/10 text-gray-500',
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function NotificationItem({ notification, onMarkAsRead }: { notification: SSENotification; onMarkAsRead: (id: string) => void }) {
  const Icon = notificationIcons[notification.type] || Bell;
  const colorClass = notificationColors[notification.type] || 'bg-gray-500/10 text-gray-500';

  return (
    <div className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}>
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
            <span className="text-xs text-muted-foreground shrink-0">{formatTimeAgo(notification.timestamp)}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        </div>
        {!notification.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useSSE({
    userId: user?.email || String(user?.id || 'anon') || 'anonymous',
    role: (user?.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
    onNotification: (notification) => console.log('[Notification] New:', notification.title),
    enabled: !!user
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          {isConnected && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
              <CheckCheck className="w-3 h-3 mr-1" />Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" /><p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Link href="/notificacoes">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setIsOpen(false)}>
              Ver todas as notificações
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
