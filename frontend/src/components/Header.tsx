import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSocket } from '@/contexts/SocketContext';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const { user, isAuthenticated, logout, isVendor, isUser } = useAuth();
  const { itemCount } = useCart();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useSocket();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Link 
              to={
                isAuthenticated 
                  ? (isVendor ? "/vendor/dashboard" : "/dashboard")
                  : "/"
              } 
              className="flex items-center space-x-1 sm:space-x-2"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">🤖</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden xs:inline">DeliveryBot</span>
                <span className="xs:hidden">DB</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              to="/items"
              className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
            >
              Browse Items
            </Link>
            
            {isAuthenticated && isUser && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  My Orders
                </Link>
              </>
            )}

            {isAuthenticated && isVendor && (
              <>
                <Link
                  to="/vendor/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Vendor </span>Dashboard
                </Link>
                <Link
                  to="/vendor/orders"
                  className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Orders
                </Link>
                <Link
                  to="/vendor/items"
                  className="text-gray-700 hover:text-primary-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  My Items
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Cart (only for users) */}
            {isAuthenticated && isUser && (
              <Link
                to="/cart"
                className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-[80vh] overflow-hidden">
                    <div className="py-1 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => {
                          // Get notification icon based on type
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

                          // Get notification color based on type
                          const getNotificationColor = (type: string) => {
                            switch (type) {
                              case 'order_update': return 'text-blue-600';
                              case 'delivery_update': return 'text-green-600';
                              case 'vendor_order': return 'text-purple-600';
                              case 'promotion': return 'text-orange-600';
                              case 'system': return 'text-gray-600';
                              default: return 'text-blue-600';
                            }
                          };

                          return (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                              onClick={() => {
                                // Mark as read when clicked
                                if (!notification.read) {
                                  markNotificationAsRead(notification.id);
                                }
                                // Navigate to relevant page if order-related
                                if (notification.data?.orderId) {
                                  navigate(`/orders/${notification.data.orderId}`);
                                  setIsNotificationsOpen(false);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-lg flex-shrink-0 mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-400">
                                      {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                    {!notification.read && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  {notification.data?.orderTotal && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Order Total: ₹{notification.data.orderTotal}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                markAllNotificationsAsRead();
                                setIsNotificationsOpen(false);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark all as read
                            </button>
                            <Link
                              to="/notifications"
                              onClick={() => setIsNotificationsOpen(false)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View all
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:block text-sm font-medium truncate max-w-24 lg:max-w-none">
                    {user?.name}
                  </span>
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          <span>Sign out</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 md:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 sm:py-4 bg-white">
            <div className="flex flex-col space-y-1">
              <Link
                to="/items"
                className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Items
              </Link>
              
              {isAuthenticated && isUser && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                </>
              )}

              {isAuthenticated && isVendor && (
                <>
                  <Link
                    to="/vendor/dashboard"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    to="/vendor/orders"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/vendor/items"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Items
                  </Link>
                </>
              )}

              {/* Mobile auth buttons */}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block mt-2 mx-3 btn btn-primary text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
