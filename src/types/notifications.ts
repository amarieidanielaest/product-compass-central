
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feature' | 'feedback' | 'sprint' | 'roadmap';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'product' | 'customer' | 'team' | 'ai';
  metadata?: {
    productId?: string;
    userId?: string;
    sprintId?: string;
    feedbackId?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  categories: {
    system: boolean;
    product: boolean;
    customer: boolean;
    team: boolean;
    ai: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
}

export interface NotificationFilters {
  type?: Notification['type'][];
  category?: Notification['category'][];
  priority?: Notification['priority'][];
  read?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}
