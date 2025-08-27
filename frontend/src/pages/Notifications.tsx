import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  BellIcon, 
  CheckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Notifications: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useSocket();
  const [loading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update': return '📋';
      case 'delivery_update': return '🚚';
      case 'vendor_order': return '🔔';
      case 'promotion': return '🎉';
      case 'system': return '📢';
      default: return '📋';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_update': return 'border-l-blue-500 bg-blue-50';
      case 'delivery_update': return 'border-l-green-500 bg-green-50';
      case 'vendor_order': return 'border-l-purple-500 bg-purple-50';
      case 'promotion': return 'border-l-orange-500 bg-orange-50';
      case 'system': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'order_update': return 'Order Update';
      case 'delivery_update': return 'Delivery Update';
      case 'vendor_order': return 'New Order';
      case 'promotion': return 'Promotion';
      case 'system': return 'System';
      default: return 'Notification';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your notifications.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-2 text-gray-600">
                Stay updated with your orders and important announcements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Mark all as read
                </button>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {unreadCount} unread
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'order_update', label: 'Orders', count: notifications.filter(n => n.type === 'order_update').length },
                { key: 'delivery_update', label: 'Delivery', count: notifications.filter(n => n.type === 'delivery_update').length },
                { key: 'vendor_order', label: 'New Orders', count: notifications.filter(n => n.type === 'vendor_order').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.key
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${
                  !notification.read 
                    ? getNotificationColor(notification.type)
                    : 'border-l-gray-300 bg-white'
                } overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getTypeLabel(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                          {notification.data?.orderTotal && (
                            <p className="text-sm font-medium text-gray-900">
                              ₹{notification.data.orderTotal}
                            </p>
                          )}
                        </div>
                        {notification.data?.orderId && (
                          <div className="mt-3">
                            <Link
                              to={`/orders/${notification.data.orderId}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Order
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
