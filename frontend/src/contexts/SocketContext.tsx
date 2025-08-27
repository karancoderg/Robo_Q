import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Notification } from '@/types';
import { notificationAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  loadNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Only load notifications if user has completed setup
      if (user.setupCompleted) {
        loadNotifications();
      }

      // Socket.IO connects to the base URL, not the API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiUrl.replace('/api', ''); // Remove /api for Socket.IO connection
      // Connecting to Socket.IO server

      const socketInstance = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      socketInstance.on('connect', () => {
        // Socket.IO connected successfully
        setConnected(true);
        
        // Extract user ID - MongoDB uses _id, but frontend might map it to id
        const userId = (user as any)._id || user.id || (user as any).userId;
        // User ID extracted for room joining
        
        if (userId) {
          socketInstance.emit('join_user_room', userId);
          // Joined user room successfully
        } else {
          console.error('❌ No valid user ID found');
          console.error('❌ User object:', user);
        }
      });

      socketInstance.on('disconnect', () => {
        // Socket.IO disconnected
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
      });

      // Listen for notifications
      socketInstance.on('notification', (notification: any) => {
        // Only handle notifications if user has completed setup
        if (user.setupCompleted) {
          // Notification received - processing
          
          const newNotification: Notification = {
            id: Date.now().toString(),
            userId: (user as any)._id || user.id || (user as any).userId || '',
            title: notification.title,
            message: notification.message,
            type: notification.type,
            data: notification.data,
            read: false,
            createdAt: new Date().toISOString(),
          };

          // Adding notification to state
          setNotifications((prev) => {
            // Updating notifications
            const updated = [newNotification, ...prev];
            // Notifications updated
            return updated;
          });

          // Show toast notification
          toast.success(notification.title, {
            duration: 4000,
          });
          // Toast notification shown
        }
      });

      // Listen for robot location updates
      socketInstance.on('robot_location_update', (_data: any) => {
        // Handle robot location updates for tracking
        // Robot location update received
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    try {
      // Loading notifications from API
      const response = await notificationAPI.getAll({ limit: 50 });
      // API Response received
      
      if (response.data.success) {
        const apiNotifications = response.data.data.notifications || [];
        // Loaded notifications successfully
        if (apiNotifications.length > 0) {
          // Notifications found
        }
        
        setNotifications(apiNotifications);
      } else {
        // API returned error
      }
    } catch (error: any) {
      // Handle 403 errors gracefully (user hasn't completed setup)
      if (error.response?.status === 403) {
        console.log('ℹ️ Notifications not available - setup completion required');
        setNotifications([]); // Clear notifications for users without setup
      } else {
        console.error('❌ Failed to load notifications:', error);
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      // Update on server
      await notificationAPI.markAsRead(id);
    } catch (error: any) {
      // Handle 403 errors gracefully (user hasn't completed setup)
      if (error.response?.status === 403) {
        console.log('ℹ️ Cannot mark notification as read - setup completion required');
      } else {
        console.error('Failed to mark notification as read:', error);
        // Revert local state on error
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: false } : notification
          )
        );
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      
      // Update on server
      await notificationAPI.markAllAsRead();
    } catch (error: any) {
      // Handle 403 errors gracefully (user hasn't completed setup)
      if (error.response?.status === 403) {
        console.log('ℹ️ Cannot mark notifications as read - setup completion required');
      } else {
        console.error('Failed to mark all notifications as read:', error);
        // Reload notifications on error
        loadNotifications();
      }
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: SocketContextType = {
    socket,
    connected,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    loadNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
