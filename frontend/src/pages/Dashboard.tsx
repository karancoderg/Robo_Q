import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { orderAPI } from '@/services/api';
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { itemCount, total } = useCart();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the same API call as Orders page for consistency
        const response = await orderAPI.getAll();
        
        if (response.data.success) {
          // CORRECT path based on actual API response: response.data.data.orders
          const ordersData = response.data.data?.orders || [];
          
          // Ensure we have an array before sorting
          if (Array.isArray(ordersData)) {
            // Sort orders by creation date (newest first)
            const sortedOrders = ordersData.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
          } else {
            console.warn('Orders data is not an array:', ordersData);
            setOrders([]);
          }
        } else {
          setError('Failed to fetch orders');
          setOrders([]);
        }
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        // If user has no orders or API returns empty, don't show error
        if (error.response?.status === 404 || error.response?.data?.message?.includes('No orders found')) {
          setOrders([]);
        } else {
          setError('Failed to load orders');
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'vendor_approved': return 'status-approved';
      case 'robot_assigned': return 'status-assigned';
      case 'robot_picking_up': return 'status-picking-up';
      case 'robot_delivering': return 'status-delivering';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'badge-secondary';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container-responsive section-padding-sm">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track your orders and discover new items delivered by our robot fleet
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="card">
          <div className="card-body p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
                <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-600" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Cart Items</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{itemCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Orders</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Orders</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-3 sm:p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Cart Total</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link to="/items" className="card hover:shadow-md transition-shadow group">
          <div className="card-body text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">🛒</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Browse Items</h3>
            <p className="text-sm sm:text-base text-gray-600">Discover food and groceries from local vendors</p>
          </div>
        </Link>

        <Link to="/cart" className="card hover:shadow-md transition-shadow group">
          <div className="card-body text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">🛍️</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">View Cart</h3>
            <p className="text-sm sm:text-base text-gray-600">Review and checkout your selected items</p>
          </div>
        </Link>

        <Link to="/orders" className="card hover:shadow-md transition-shadow group sm:col-span-2 lg:col-span-1">
          <div className="card-body text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">📦</div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Track Orders</h3>
            <p className="text-sm sm:text-base text-gray-600">Monitor your deliveries in real-time</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="card-title">Recent Orders</h2>
            <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="card-content">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load orders</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start by browsing our available items</p>
              <Link to="/items" className="btn btn-primary">
                Browse Items
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.items.length === 1 
                            ? order.items[0].name
                            : `${order.items[0].name} ${order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}`
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item(s) • ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
