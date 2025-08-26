import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';

interface CustomerNotification {
  id: string;
  type: 'feedback_status_change' | 'roadmap_update' | 'board_announcement';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

interface CustomerNotificationContextType {
  notifications: CustomerNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

const CustomerNotificationContext = createContext<CustomerNotificationContextType | undefined>(undefined);

export const useCustomerNotifications = () => {
  const context = useContext(CustomerNotificationContext);
  if (!context) {
    throw new Error('useCustomerNotifications must be used within CustomerNotificationProvider');
  }
  return context;
};

interface CustomerNotificationProviderProps {
  children: React.ReactNode;
}

export const CustomerNotificationProvider: React.FC<CustomerNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const { user, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated() || !user) return;

    // Load existing notifications
    loadNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('customer-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_notifications',
          filter: `customer_user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as CustomerNotification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback_items',
          filter: `customer_user_id=eq.${user.id}`
        },
        (payload) => {
          // Handle feedback status changes
          const updatedFeedback = payload.new;
          const oldFeedback = payload.old;
          
          if (updatedFeedback.status !== oldFeedback.status) {
            // Create notification for status change
            createNotification({
              type: 'feedback_status_change',
              title: 'Feedback Status Updated',
              message: `Your feedback "${updatedFeedback.title}" status changed to ${updatedFeedback.status}`,
              metadata: { feedback_id: updatedFeedback.id }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAuthenticated]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customer_notifications')
        .select('*')
        .eq('customer_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const createNotification = async (notification: Omit<CustomerNotification, 'id' | 'read' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('customer_notifications')
        .insert({
          customer_user_id: user.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setNotifications(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('customer_notifications')
        .update({ read: true })
        .eq('customer_user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <CustomerNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};