import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Notification } from '@/types';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
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
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        // Join user-specific room
        socketInstance.emit('join_user_room', user.id);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      // Listen for notifications
      socketInstance.on('notification', (notification: any) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          userId: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: notification.data,
          read: false,
          createdAt: new Date().toISOString(),
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Show toast notification
        toast.success(notification.title, {
          duration: 4000,
        });
      });

      // Listen for robot location updates
      socketInstance.on('robot_location_update', (data: any) => {
        // Handle robot location updates for tracking
        console.log('Robot location update:', data);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, user]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: SocketContextType = {
    socket,
    connected,
    notifications,
    markNotificationAsRead,
    clearNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
