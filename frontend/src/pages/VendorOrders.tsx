import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vendorAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const VendorOrders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery(
    ['vendor-orders', statusFilter],
    () => vendorAPI.getOrders({ status: statusFilter || undefined }),
    {
      select: (response) => response.data.data.orders,
    }
  );

  // Approve order mutation
  const approveOrderMutation = useMutation(vendorAPI.approveOrder, {
    onSuccess: () => {
      toast.success('Order approved successfully!');
      queryClient.invalidateQueries('vendor-orders');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve order');
    },
  });

  // Reject order mutation
  const rejectOrderMutation = useMutation(
    ({ orderId, reason }: { orderId: string; reason?: string }) =>
      vendorAPI.rejectOrder(orderId, { reason }),
    {
      onSuccess: () => {
        toast.success('Order rejected successfully');
        queryClient.invalidateQueries('vendor-orders');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to reject order');
      },
    }
  );

  const filteredOrders = ordersData || [];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'vendor_approved': return '✅';
      case 'robot_assigned': return '🤖';
      case 'robot_picking_up': return '📦';
      case 'robot_delivering': return '🚚';
      case 'delivered': return '✨';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleApproveOrder = (orderId: string) => {
    approveOrderMutation.mutate(orderId);
  };

  const handleRejectOrder = (orderId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (confirm('Are you sure you want to reject this order?')) {
      rejectOrderMutation.mutate({ orderId, reason: reason || undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const getPreparationTime = (items: any[]) => {
    // Calculate total preparation time based on items
    const maxTime = Math.max(...items.map(item => {
      switch (item.name) {
        case 'Margherita Pizza': return 15;
        case 'Pepperoni Pizza': return 18;
        case 'Caesar Salad': return 10;
        default: return 12;
      }
    }));
    return maxTime;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/vendor/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">Manage incoming orders and track deliveries</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending Approval</option>
          <option value="vendor_approved">Approved</option>
          <option value="robot_assigned">Robot Assigned</option>
          <option value="robot_picking_up">Being Picked Up</option>
          <option value="robot_delivering">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {statusFilter ? 'No orders found' : 'No orders yet'}
          </h2>
          <p className="text-gray-600 mb-8">
            {statusFilter 
              ? 'Try changing the filter to see more orders'
              : 'Orders will appear here when customers place them'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getStatusIcon(order.status)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{order._id.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Customer Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {order.customerName}</p>
                      <p><strong>Phone:</strong> {order.customerPhone}</p>
                      <div className="flex items-start space-x-1 mt-2">
                        <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{order.deliveryAddress.street}</p>
                          <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-2">
                          <p><strong>Notes:</strong> {order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-primary-600">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Info & Actions */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Order Info</h4>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Prep Time: ~{getPreparationTime(order.items)} min</span>
                      </div>
                      <p>Items: {order.items.length}</p>
                      <p>Payment: Cash on Delivery</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveOrder(order._id)}
                            className="btn btn-success btn-sm flex items-center space-x-1 flex-1"
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order._id)}
                            className="btn btn-error btn-sm flex items-center space-x-1 flex-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                      
                      <button className="btn btn-outline btn-sm w-full flex items-center justify-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
