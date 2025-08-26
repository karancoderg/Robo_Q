import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { itemCount, total } = useCart();

  // Mock orders data consistent with Orders and OrderDetail pages
  const mockOrders = [
    {
      _id: '1',
      items: [
        { name: 'Margherita Pizza', quantity: 2 },
        { name: 'Pepperoni Pizza', quantity: 1 }
      ],
      totalAmount: 40.97,
      status: 'robot_delivering',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      items: [
        { name: 'Organic Bananas', quantity: 2 }
      ],
      totalAmount: 5.98,
      status: 'delivered',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      items: [
        { name: 'Margherita Pizza', quantity: 1 }
      ],
      totalAmount: 12.99,
      status: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    }
  ];

  const orders = mockOrders;

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
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Track your orders and discover new items delivered by our robot fleet
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-gray-900">{itemCount}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Cart Total</p>
                <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/items" className="card hover:shadow-md transition-shadow">
          <div className="card-content text-center py-8">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold mb-2">Browse Items</h3>
            <p className="text-gray-600">Discover food and groceries from local vendors</p>
          </div>
        </Link>

        <Link to="/cart" className="card hover:shadow-md transition-shadow">
          <div className="card-content text-center py-8">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-lg font-semibold mb-2">View Cart</h3>
            <p className="text-gray-600">Review and checkout your selected items</p>
          </div>
        </Link>

        <Link to="/orders" className="card hover:shadow-md transition-shadow">
          <div className="card-content text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">Track Orders</h3>
            <p className="text-gray-600">Monitor your deliveries in real-time</p>
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
          {orders.length === 0 ? (
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
                        <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item(s) • ${order.totalAmount.toFixed(2)}
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
