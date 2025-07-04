
import { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Filter, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Zap,
  MessageSquare,
  Target,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  onClose?: () => void;
}

const NotificationList = ({ onClose }: NotificationListProps) => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
      feature: Zap,
      feedback: MessageSquare,
      sprint: Target,
      roadmap: Map,
    };
    return iconMap[type] || Info;
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') return 'text-orange-600';
    
    const colorMap = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      feature: 'text-purple-600',
      feedback: 'text-indigo-600',
      sprint: 'text-emerald-600',
      roadmap: 'text-pink-600',
    };
    return colorMap[type] || 'text-gray-600';
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const badgeMap = {
      low: { variant: 'secondary' as const, text: 'Low' },
      medium: { variant: 'outline' as const, text: 'Med' },
      high: { variant: 'default' as const, text: 'High' },
      urgent: { variant: 'destructive' as const, text: 'Urgent' },
    };
    return badgeMap[priority];
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || (filter === 'unread' && !notification.read)
  );

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl && onClose) {
      onClose();
      // In a real app, you'd use router navigation here
      console.log(`Navigate to: ${notification.actionUrl}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-sm text-slate-600 mt-2">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Filter Toggle */}
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            {filter === 'all' ? 'All' : 'Unread'}
          </Button>
          
          {/* Mark All Read */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-80">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No notifications</p>
            <p className="text-sm text-slate-400">
              {filter === 'unread' ? "You're all caught up!" : "When you have updates, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type, notification.priority);
              const priorityBadge = getPriorityBadge(notification.priority);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`p-1.5 rounded-full bg-slate-100 ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`text-sm font-medium truncate ${
                              !notification.read ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.priority !== 'low' && (
                              <Badge {...priorityBadge} className="text-xs">
                                {priorityBadge.text}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                            
                            {notification.actionUrl && (
                              <div className="flex items-center text-xs text-purple-600">
                                <span className="mr-1">{notification.actionText || 'View'}</span>
                                <ExternalLink className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;
