import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  AcademicCapIcon,
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

const Orders: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Orders Page: Starting fetchOrders...');
      setLoading(true);
      
      console.log('🔍 Orders Page: Calling orderAPI.getAll()...');
      const response = await orderAPI.getAll();
      
      console.log('🔍 Orders Page: Response received:', response);
      console.log('🔍 Orders Page: Response data:', response.data);
      console.log('🔍 Orders Page: Response success:', response.data.success);
      console.log('🔍 Orders Page: Response orders:', (response.data as any).orders);
      
      if (response.data.success) {
        console.log('🔍 Orders Page: Success flag is true');
        const ordersData = (response.data as any).orders || [];
        console.log('🔍 Orders Page: Orders data:', ordersData);
        console.log('🔍 Orders Page: Orders count:', ordersData.length);
        console.log('🔍 Orders Page: Is array:', Array.isArray(ordersData));
        
        // CORRECT: Use the actual API response path
        setOrders(ordersData);
        console.log('🔍 Orders Page: Orders set successfully');
      } else {
        console.log('🔍 Orders Page: Success flag is false');
      }
    } catch (error: any) {
      console.error('❌ Orders Page: Failed to fetch orders:', error);
      console.error('❌ Orders Page: Error details:', error.response);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      console.log('🔍 Orders Page: Loading set to false');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'vendor_approved':
        return 'bg-blue-100 text-blue-800';
      case 'vendor_rejected':
        return 'bg-red-100 text-red-800';
      case 'robot_assigned':
        return 'bg-purple-100 text-purple-800';
      case 'robot_picking_up':
        return 'bg-orange-100 text-orange-800';
      case 'robot_delivering':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'vendor_approved':
        return 'Approved - Awaiting Robot';
      case 'vendor_rejected':
        return 'Rejected';
      case 'robot_assigned':
        return 'Robot Assigned';
      case 'robot_picking_up':
        return 'Being Picked Up';
      case 'robot_delivering':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'vendor_approved': return '✅';
      case 'vendor_rejected': return '❌';
      case 'robot_assigned': return '🤖';
      case 'robot_picking_up': return '📦';
      case 'robot_delivering': return '🚚';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Your order is waiting for restaurant approval';
      case 'vendor_approved': return 'Order approved! Waiting for robot assignment';
      case 'vendor_rejected': return 'Unfortunately, your order was rejected by the restaurant';
      case 'robot_assigned': return 'A delivery robot has been assigned to your order';
      case 'robot_picking_up': return 'Robot is picking up your order from the restaurant';
      case 'robot_delivering': return 'Your order is on its way to you!';
      case 'delivered': return 'Your order has been delivered successfully';
      case 'cancelled': return 'This order has been cancelled';
      default: return 'Order status updated';
    }
  };

  const getDeliveryProgress = (status: string) => {
    switch (status) {
      case 'pending': return 10;
      case 'vendor_approved': return 25;
      case 'robot_assigned': return 40;
      case 'robot_picking_up': return 60;
      case 'robot_delivering': return 80;
      case 'delivered': return 100;
      default: return 0;
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
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
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
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter ? `No orders with status "${getStatusText(statusFilter)}"` : 'You haven\'t placed any orders yet.'}
            </p>
            <Link
              to="/items"
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.vendorId.businessName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <Link
                        to={`/orders/${order._id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Delivery Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">Delivery Progress</h4>
                      <span className="text-xs text-gray-500">{getDeliveryProgress(order.status)}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getDeliveryProgress(order.status)}%` }}
                      ></div>
                    </div>
                    
                    {/* Status Description */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getStatusIcon(order.status)}</span>
                        <span className="font-medium text-gray-900">{getStatusText(order.status)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{getStatusDescription(order.status)}</p>
                      
                      {/* Estimated Time */}
                      {['robot_delivering', 'robot_picking_up'].includes(order.status) && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          🕒 Estimated delivery: 15-20 minutes
                        </div>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          ✅ Delivered at {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium">₹{item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Delivery Address
                      </h4>
                      <div className="text-sm text-gray-600">
                        {order.deliveryAddress.name ? (
                          /* IIT Mandi Address */
                          <div className="flex items-start space-x-2">
                            <AcademicCapIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">{order.deliveryAddress.name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {order.deliveryAddress.category?.replace('_', ' ')}
                              </p>
                              <p className="text-xs">{order.deliveryAddress.fullAddress}</p>
                            </div>
                          </div>
                        ) : (
                          /* Traditional Address */
                          <div>
                            <p>{order.deliveryAddress.street}</p>
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Ordered: {formatDate(order.createdAt)}
                      </div>
                      {order.notes && (
                        <div className="text-right">
                          <span className="font-medium">Note:</span> {order.notes}
                        </div>
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

export default Orders;
