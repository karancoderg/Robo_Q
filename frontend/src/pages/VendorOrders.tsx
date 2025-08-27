import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vendorAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
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
    onMutate: async (orderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries('vendor-orders');

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData('vendor-orders');

      // Optimistically update the order status
      queryClient.setQueryData('vendor-orders', (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((order: any) => 
          order._id === orderId 
            ? { ...order, status: 'vendor_approved' }
            : order
        );
      });

      // Return a context object with the snapshotted value
      return { previousOrders };
    },
    onSuccess: () => {
      toast.success('Order approved successfully!');
      queryClient.invalidateQueries('vendor-orders');
    },
    onError: (error: any, _orderId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData('vendor-orders', context?.previousOrders);
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
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'vendor_approved': return 'Approved - Awaiting Robot';
      case 'robot_assigned': return 'Robot Assigned';
      case 'robot_picking_up': return 'Robot Picking Up';
      case 'robot_delivering': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'vendor_approved': return '✅';
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
      case 'pending': return 'Waiting for your approval';
      case 'vendor_approved': return 'Order approved, waiting for robot assignment';
      case 'robot_assigned': return 'Delivery robot has been assigned';
      case 'robot_picking_up': return 'Robot is picking up the order from your restaurant';
      case 'robot_delivering': return 'Robot is delivering the order to customer';
      case 'delivered': return 'Order successfully delivered to customer';
      case 'cancelled': return 'Order has been cancelled';
      default: return 'Order status updated';
    }
  };

  const getRobotInfo = (status: string) => {
    switch (status) {
      case 'robot_assigned': 
        return { assigned: true, status: 'Assigned', color: 'text-blue-600' };
      case 'robot_picking_up': 
        return { assigned: true, status: 'Picking Up', color: 'text-orange-600' };
      case 'robot_delivering': 
        return { assigned: true, status: 'Delivering', color: 'text-purple-600' };
      case 'delivered': 
        return { assigned: true, status: 'Completed', color: 'text-green-600' };
      default: 
        return { assigned: false, status: 'Not Assigned', color: 'text-gray-500' };
    }
  };

  const handleApproveOrder = (orderId: string, event?: React.MouseEvent) => {
    // Prevent any default behavior that might cause page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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
          {filteredOrders.map((order: any) => (
            <div key={order._id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getStatusIcon(order.status)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{order._id.slice(-8).toUpperCase()}
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
                      <p><strong>Name:</strong> {order.userId?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {order.userId?.email || 'N/A'}</p>
                      {order.userId?.phone && <p><strong>Phone:</strong> {order.userId.phone}</p>}
                      <div className="flex items-start space-x-1 mt-2">
                        <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          {/* Handle both IIT Mandi addresses and traditional addresses */}
                          {order.deliveryAddress.fullAddress ? (
                            <p>{order.deliveryAddress.fullAddress}</p>
                          ) : (
                            <>
                              <p>{order.deliveryAddress.street}</p>
                              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                            </>
                          )}
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
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">₹{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Robot & Delivery Status */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Delivery Status</h4>
                    <div className="space-y-3">
                      {/* Status Description */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Current Status:</strong> {getStatusDescription(order.status)}
                        </p>
                        
                        {/* Robot Information */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Robot:</span>
                            <span className={`text-sm font-semibold ${getRobotInfo(order.status).color}`}>
                              {getRobotInfo(order.status).status}
                            </span>
                          </div>
                          {getRobotInfo(order.status).assigned && (
                            <div className="text-xs text-gray-500">
                              🤖 Active
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Order Placed:</span>
                          <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        {order.approvedAt && (
                          <div className="flex justify-between">
                            <span>Approved:</span>
                            <span>{new Date(order.approvedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.robotAssignedAt && (
                          <div className="flex justify-between">
                            <span>Robot Assigned:</span>
                            <span>{new Date(order.robotAssignedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="flex justify-between">
                            <span>Delivered:</span>
                            <span>{new Date(order.deliveredAt).toLocaleString()}</span>
                          </div>
                        )}
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
                            type="button"
                            onClick={(e) => handleApproveOrder(order._id, e)}
                            disabled={approveOrderMutation.isLoading}
                            className="btn btn-success btn-sm flex items-center space-x-1 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span>{approveOrderMutation.isLoading ? 'Approving...' : 'Approve'}</span>
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
