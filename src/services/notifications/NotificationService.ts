
import { Notification, NotificationFilters } from '../../types/notifications';
import { supabase } from '@/integrations/supabase/client';

interface NotificationResponse {
  success: boolean;
  data?: Notification[];
  message?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private subscribers: ((notifications: Notification[]) => void)[] = [];

  async getNotifications(filters?: NotificationFilters): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type.join(','));
      if (filters?.category) params.append('category', filters.category.join(','));
      if (filters?.priority) params.append('priority', filters.priority.join(','));
      if (filters?.read !== undefined) params.append('read', String(filters.read));

      const { data, error } = await supabase.functions.invoke('notifications/list', {
        method: 'GET'
      });

      if (error) throw error;

      this.notifications = data.data || [];
      this.notifySubscribers();

      return data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return {
        success: false,
        message: 'Failed to fetch notifications'
      };
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase.functions.invoke('notifications/mark-read', {
        body: { notificationId }
      });
      
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await supabase.functions.invoke('notifications/mark-all-read', {
        method: 'POST'
      });
      
      this.notifications.forEach(n => n.read = true);
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await supabase.functions.invoke('notifications/delete', {
        method: 'DELETE',
        body: { notificationId }
      });
      
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data } = await supabase.functions.invoke('notifications/create', {
        body: notification
      });
      
      if (data?.data) {
        this.notifications.unshift(data.data);
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.notifications));
  }
}

export const notificationService = new NotificationService();
