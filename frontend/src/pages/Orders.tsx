import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  userId: string;
  vendorId: {
    _id: string;
    businessName: string;
  };
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: any;
  vendorAddress?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  approvedAt?: string;
  robotAssignedAt?: string;
}

const OrdersFixed: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('No access token found. Please login again.');
        return;
      }
      
      // Make direct axios call
      const axios = (await import('axios')).default;
      
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // Get orders from the correct path
        const ordersData = response.data.data?.orders || [];
        
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          setError('Invalid orders data format');
        }
      } else {
        setError(response.data?.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      setError(`Failed to load orders: ${error.message}`);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'vendor_approved': return 'bg-blue-100 text-blue-800';
      case 'vendor_rejected': return 'bg-red-100 text-red-800';
      case 'robot_assigned': return 'bg-purple-100 text-purple-800';
      case 'robot_picking_up': return 'bg-orange-100 text-orange-800';
      case 'robot_delivering': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'vendor_approved': return 'Approved - Awaiting Robot';
      case 'vendor_rejected': return 'Rejected';
      case 'robot_assigned': return 'Robot Assigned';
      case 'robot_picking_up': return 'Being Picked Up';
      case 'robot_delivering': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredOrders = statusFilter 
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">Track and manage your food delivery orders</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="font-bold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchOrders}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === '' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Orders ({orders.length})
            </button>
            {['pending', 'vendor_approved', 'robot_delivering', 'delivered'].map((status) => {
              const count = orders.filter(order => order.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getStatusText(status)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {statusFilter ? `No ${getStatusText(statusFilter).toLowerCase()} orders` : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter 
                ? 'Try selecting a different status filter.' 
                : 'Start by browsing restaurants and placing your first order!'
              }
            </p>
            {!statusFilter && (
              <Link
                to="/vendors"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Browse Restaurants
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id.slice(-6)}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {order.vendorId.businessName}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm text-gray-600">
                          <strong>Items:</strong> {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          Total: ₹{order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
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

export default OrdersFixed;
