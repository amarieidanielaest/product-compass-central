
import { Notification, NotificationFilters } from '../../types/notifications';

interface NotificationResponse {
  success: boolean;
  data?: Notification[];
  message?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private subscribers: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    // Initialize with some mock notifications
    this.notifications = [
      {
        id: '1',
        type: 'info',
        title: 'Welcome to ProductHub',
        message: 'Your unified product management platform is ready!',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'system'
      },
      {
        id: '2',
        type: 'feature',
        title: 'New Sprint Created',
        message: 'Sprint 24 has been created and is ready for planning.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        priority: 'high',
        category: 'product'
      }
    ];
  }

  async getNotifications(filters?: NotificationFilters): Promise<NotificationResponse> {
    try {
      let filteredNotifications = [...this.notifications];

      if (filters) {
        if (filters.type) {
          filteredNotifications = filteredNotifications.filter(n => 
            filters.type!.includes(n.type)
          );
        }
        if (filters.category) {
          filteredNotifications = filteredNotifications.filter(n => 
            filters.category!.includes(n.category)
          );
        }
        if (filters.priority) {
          filteredNotifications = filteredNotifications.filter(n => 
            filters.priority!.includes(n.priority)
          );
        }
        if (filters.read !== undefined) {
          filteredNotifications = filteredNotifications.filter(n => 
            n.read === filters.read
          );
        }
      }

      return {
        success: true,
        data: filteredNotifications.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch notifications'
      };
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.read = true);
    this.notifySubscribers();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifySubscribers();
  }

  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    this.notifications.unshift(newNotification);
    this.notifySubscribers();
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
