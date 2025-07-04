
import { BaseApiService, ApiResponse } from '../api/BaseApiService';
import { Notification, NotificationPreferences, NotificationFilters } from '../../types/notifications';

class NotificationService extends BaseApiService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    super('/api/notifications');
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock notifications for demonstration
    this.notifications = [
      {
        id: '1',
        type: 'feature',
        title: 'New Feature Request',
        message: 'User feedback suggests adding dark mode support',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        priority: 'high',
        category: 'customer',
        actionUrl: '/customer',
        actionText: 'View Feedback',
        metadata: { feedbackId: 'fb-123' }
      },
      {
        id: '2',
        type: 'sprint',
        title: 'Sprint Review Due',
        message: 'Sprint 24 review is scheduled for tomorrow',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        priority: 'medium',
        category: 'team',
        actionUrl: '/sprints',
        actionText: 'View Sprint'
      },
      {
        id: '3',
        type: 'success',
        title: 'AI Analysis Complete',
        message: 'Portfolio analytics report is ready for review',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
        priority: 'medium',
        category: 'ai',
        actionUrl: '/dashboard',
        actionText: 'View Report'
      },
      {
        id: '4',
        type: 'warning',
        title: 'OKR Risk Alert',
        message: 'Q4 user engagement target is at risk',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        read: false,
        priority: 'urgent',
        category: 'product',
        actionUrl: '/strategy',
        actionText: 'View OKRs'
      },
      {
        id: '5',
        type: 'info',
        title: 'System Maintenance',
        message: 'Scheduled maintenance window this weekend',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        priority: 'low',
        category: 'system'
      }
    ];
  }

  async getNotifications(filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> {
    let filtered = [...this.notifications];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(n => filters.type!.includes(n.type));
      }
      if (filters.category) {
        filtered = filtered.filter(n => filters.category!.includes(n.category));
      }
      if (filters.priority) {
        filtered = filtered.filter(n => filters.priority!.includes(n.priority));
      }
      if (filters.read !== undefined) {
        filtered = filtered.filter(n => n.read === filters.read);
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      data: filtered,
      success: true,
      message: 'Notifications retrieved successfully'
    };
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      return {
        data: true,
        success: true,
        message: 'Notification marked as read'
      };
    }
    return {
      data: false,
      success: false,
      message: 'Notification not found'
    };
  }

  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
    return {
      data: true,
      success: true,
      message: 'All notifications marked as read'
    };
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<boolean>> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
      return {
        data: true,
        success: true,
        message: 'Notification deleted'
      };
    }
    return {
      data: false,
      success: false,
      message: 'Notification not found'
    };
  }

  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<ApiResponse<Notification>> {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    
    return {
      data: newNotification,
      success: true,
      message: 'Notification created'
    };
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    // Mock preferences - in real app, this would come from user settings
    return {
      data: {
        email: true,
        inApp: true,
        categories: {
          system: true,
          product: true,
          customer: true,
          team: true,
          ai: true
        },
        priority: {
          low: false,
          medium: true,
          high: true,
          urgent: true
        }
      },
      success: true,
      message: 'Preferences retrieved'
    };
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<ApiResponse<boolean>> {
    // Mock update - in real app, this would save to backend
    console.log('Updating notification preferences:', preferences);
    return {
      data: true,
      success: true,
      message: 'Preferences updated'
    };
  }
}

export const notificationService = new NotificationService();
