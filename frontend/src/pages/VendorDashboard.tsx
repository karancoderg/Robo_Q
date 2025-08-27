import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vendorAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import toast from 'react-hot-toast';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'vendor-dashboard-stats',
    vendorAPI.getDashboardStats,
    {
      select: (response) => response.data.data.stats,
    }
  );

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'vendor-recent-orders',
    () => vendorAPI.getOrders({ limit: 5 }),
    {
      select: (response) => response.data.data.orders,
    }
  );

  // Fetch menu items
  const { data: itemsData, isLoading: itemsLoading } = useQuery(
    'vendor-dashboard-items',
    () => vendorAPI.getItems(),
    {
      select: (response) => response.data.data.items,
    }
  );

  // Approve order mutation
  const approveOrderMutation = useMutation(vendorAPI.approveOrder, {
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries('vendor-recent-orders');
      await queryClient.cancelQueries('vendor-dashboard-stats');

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData('vendor-recent-orders');
      const previousStats = queryClient.getQueryData('vendor-dashboard-stats');

      // Optimistically update the order status
      queryClient.setQueryData('vendor-recent-orders', (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((order: any) => 
          order._id === orderId 
            ? { ...order, status: 'vendor_approved' }
            : order
        );
      });

      // Return a context object with the snapshotted value
      return { previousOrders, previousStats };
    },
    onSuccess: () => {
      toast.success('Order approved successfully!');
      // Refetch to get the latest data from server
      queryClient.invalidateQueries('vendor-recent-orders');
      queryClient.invalidateQueries('vendor-dashboard-stats');
    },
    onError: (error: any, _orderId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData('vendor-recent-orders', context?.previousOrders);
      queryClient.setQueryData('vendor-dashboard-stats', context?.previousStats);
      toast.error(error.response?.data?.message || 'Failed to approve order');
    },
  });

  // Toggle item availability mutation
  const toggleAvailabilityMutation = useMutation(vendorAPI.toggleItemAvailability, {
    onSuccess: () => {
      toast.success('Item availability updated!');
      queryClient.invalidateQueries('vendor-dashboard-items');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  const vendorStats = statsData || {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    averageOrderValue: 0
  };

  const recentOrders = ordersData || [];
  const menuItems = itemsData || [];

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

  const handleApproveOrder = (orderId: string, event?: React.MouseEvent) => {
    // Prevent any default behavior that might cause page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    approveOrderMutation.mutate(orderId);
  };

  const handleViewOrderDetails = (order: any, event?: React.MouseEvent) => {
    // Prevent any default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  const toggleItemAvailability = (itemId: string) => {
    toggleAvailabilityMutation.mutate(itemId);
  };

  if (statsLoading || ordersLoading || itemsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👨‍🍳
        </h1>
        <p className="text-gray-600">
          Manage your restaurant orders and menu items
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{vendorStats.totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{vendorStats.pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{vendorStats.completedOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{vendorStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/vendor/orders" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="card-content text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold mb-2">Manage Orders</h3>
            <p className="text-gray-600">View and approve incoming orders</p>
          </div>
        </Link>

        <Link to="/vendor/items" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="card-content text-center py-8">
            <div className="text-4xl mb-4">🍕</div>
            <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
            <p className="text-gray-600">Add and edit your menu items</p>
          </div>
        </Link>

        <Link to="/vendor/analytics" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="card-content text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View sales and performance data</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Recent Orders</h2>
              <Link to="/vendor/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order._id}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    {order.items.map((item: any, index: number) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={(e) => handleApproveOrder(order._id, e)}
                          disabled={approveOrderMutation.isLoading}
                          className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approveOrderMutation.isLoading ? 'Approving...' : 'Approve'}
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={(e) => handleViewOrderDetails(order, e)}
                        className="btn btn-outline btn-sm"
                        title="View Order Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Menu Items</h2>
              <button className="btn btn-primary btn-sm flex items-center space-x-1">
                <PlusIcon className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {menuItems.map((item: any) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>₹{item.price.toFixed(2)}</span>
                        <span>⏱️ {item.preparationTime} min</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.isAvailable}
                          onChange={() => toggleItemAvailability(item._id)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <button className="btn btn-outline btn-sm">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-error'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="card mt-8">
        <div className="card-header">
          <h2 className="card-title">Revenue Summary</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₹{vendorStats.todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-green-700">Today's Revenue</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">₹{vendorStats.averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-blue-700">Average Order Value</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{vendorStats.totalOrders}</p>
              <p className="text-sm text-purple-700">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
    </div>
  );
};

export default VendorDashboard;
