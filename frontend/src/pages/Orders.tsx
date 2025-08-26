import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EyeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Orders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');

  // Mock orders data that matches the OrderDetail page
  const mockOrders = [
    {
      _id: '1',
      userId: '1',
      vendorId: {
        _id: '1',
        businessName: 'Pizza Palace',
      },
      items: [
        {
          itemId: '1',
          name: 'Margherita Pizza',
          price: 12.99,
          quantity: 2,
          totalPrice: 25.98
        },
        {
          itemId: '2',
          name: 'Pepperoni Pizza',
          price: 14.99,
          quantity: 1,
          totalPrice: 14.99
        }
      ],
      totalAmount: 40.97,
      status: 'robot_delivering',
      deliveryAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      notes: 'Please ring the doorbell',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      userId: '1',
      vendorId: {
        _id: '2',
        businessName: 'Fresh Grocery',
      },
      items: [
        {
          itemId: '3',
          name: 'Organic Bananas',
          price: 2.99,
          quantity: 2,
          totalPrice: 5.98
        }
      ],
      totalAmount: 5.98,
      status: 'delivered',
      deliveryAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      notes: '',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      actualDeliveryTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      userId: '1',
      vendorId: {
        _id: '1',
        businessName: 'Pizza Palace',
      },
      items: [
        {
          itemId: '1',
          name: 'Margherita Pizza',
          price: 12.99,
          quantity: 1,
          totalPrice: 12.99
        }
      ],
      totalAmount: 12.99,
      status: 'pending',
      deliveryAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      notes: '',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    }
  ];

  // Filter orders based on status
  const filteredOrders = statusFilter 
    ? mockOrders.filter(order => order.status === statusFilter)
    : mockOrders;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your robot deliveries and order history</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="vendor_approved">Approved</option>
          <option value="robot_assigned">Robot Assigned</option>
          <option value="robot_picking_up">Picking Up</option>
          <option value="robot_delivering">Delivering</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {statusFilter ? 'No orders found' : 'No orders yet'}
          </h2>
          <p className="text-gray-600 mb-8">
            {statusFilter 
              ? 'Try changing the filter to see more orders'
              : 'Start by browsing our available items'
            }
          </p>
          {!statusFilter && (
            <Link to="/items" className="btn btn-primary btn-lg">
              Browse Items
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <div key={order._id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{getStatusIcon(order.status)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Items</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-1">
                          {order.items.slice(0, 2).map((item: any, index: number) => (
                            <p key={index} className="text-xs text-gray-500">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{order.items.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Total</p>
                        <p className="text-lg font-bold text-primary-600">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                        <div className="flex items-start space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600">
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`badge ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        
                        {order.estimatedDeliveryTime && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                              ETA: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {['robot_delivering', 'robot_picking_up', 'robot_assigned'].includes(order.status) && (
                          <Link
                            to={`/orders/${order._id}/tracking`}
                            className="btn btn-outline btn-sm"
                          >
                            Track Robot
                          </Link>
                        )}
                        
                        <Link
                          to={`/orders/${order._id}`}
                          className="btn btn-primary btn-sm flex items-center space-x-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details</span>
                        </Link>
                      </div>
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

export default Orders;
