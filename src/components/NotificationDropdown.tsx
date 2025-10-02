import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'swap_request' | 'swap_accepted' | 'swap_completed' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Fetch pending swap requests as notifications
      const { data: requests, error } = await supabase
        .from('skill_swap_requests')
        .select(`
          *,
          requester:profiles!skill_swap_requests_requester_id_fkey(name),
          requested_skill:skills!skill_swap_requests_requested_skill_id_fkey(name)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const swapNotifs: Notification[] = (requests || []).map((req: any) => ({
        id: req.id,
        type: 'swap_request' as const,
        title: 'New Swap Request',
        message: `${req.requester.name} wants to learn ${req.requested_skill.name}`,
        isRead: false,
        createdAt: new Date(req.created_at),
        actionUrl: '/dashboard'
      }));

      // Fetch accepted requests as match notifications
      const { data: acceptedRequests, error: acceptedError } = await supabase
        .from('skill_swap_requests')
        .select(`
          *,
          receiver:profiles!skill_swap_requests_receiver_id_fkey(name),
          requested_skill:skills!skill_swap_requests_requested_skill_id_fkey(name)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (acceptedError) throw acceptedError;

      const matchNotifs: Notification[] = (acceptedRequests || []).map((req: any) => ({
        id: `match-${req.id}`,
        type: 'swap_accepted' as const,
        title: 'Match Found! 🎉',
        message: `${req.receiver.name} accepted your request for ${req.requested_skill.name}`,
        isRead: false,
        createdAt: new Date(req.updated_at),
        actionUrl: '/chats'
      }));

      setNotifications([...swapNotifs, ...matchNotifs].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      ));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'skill_swap_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'swap_request':
        return <User className="h-4 w-4" />;
      case 'swap_accepted':
        return <Check className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'swap_request':
        return 'bg-primary/10 text-primary';
      case 'swap_accepted':
        return 'bg-success/10 text-success';
      case 'message':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent rounded-full text-xs text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getIconColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm text-foreground">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-accent rounded-full ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
