import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  userId: string;
  vendorId: {
    _id: string;
    businessName: string;
    contactInfo: {
      phone: string;
      email: string;
    };
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryAddress: any;
  vendorAddress?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryTime?: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && isAuthenticated) {
      fetchOrderDetail();
    }
  }, [orderId, isAuthenticated]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getById(orderId!);
      if (response.data.success) {
        setOrder(response.data.data.order || response.data.data);
      } else {
        setError('Order not found');
      }
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      if (error.response?.status === 404) {
        setError('Order not found');
      } else {
        setError('Failed to load order details');
        toast.error('Failed to load order details');
      }
    } finally {
      setLoading(false);
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
        return 'Approved by Vendor';
      case 'vendor_rejected':
        return 'Rejected by Vendor';
      case 'robot_assigned':
        return 'Robot Assigned';
      case 'robot_picking_up':
        return 'Robot Picking Up';
      case 'robot_delivering':
        return 'Robot Delivering';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view order details.</p>
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
            <p className="text-gray-600 mt-2">
              {error || "The order you're looking for doesn't exist."}
            </p>
            <Link 
              to="/orders" 
              className="inline-flex items-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/orders" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">{order.vendorId.businessName}</h3>
                </div>
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span>{order.vendorId.contactInfo.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <span>{order.vendorId.contactInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Delivery Address
              </h2>
              <div className="text-gray-600">
                {order.deliveryAddress.name ? (
                  /* IIT Mandi Address */
                  <div className="flex items-start space-x-3">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 text-lg">{order.deliveryAddress.name}</p>
                      <p className="text-sm text-gray-500 capitalize mb-1">
                        {order.deliveryAddress.category?.replace('_', ' ')}
                      </p>
                      <p className="text-gray-600">{order.deliveryAddress.fullAddress}</p>
                      {order.deliveryAddress.coordinates && (
                        <p className="text-xs text-gray-500 mt-2">
                          📍 GPS: {order.deliveryAddress.coordinates.lat}, {order.deliveryAddress.coordinates.lng}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Traditional Address */
                  <div>
                    <p className="font-medium text-gray-900">{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['pending', 'vendor_approved', 'robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status)
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['vendor_approved', 'robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status)
                      ? 'bg-green-500' : order.status === 'vendor_rejected' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Vendor Response</p>
                    <p className="text-sm text-gray-600">
                      {order.status === 'pending' ? 'Waiting for approval' : 
                       order.status === 'vendor_rejected' ? 'Order rejected' : 'Order approved'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status)
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Robot Assigned</p>
                    <p className="text-sm text-gray-600">
                      {['robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status)
                        ? 'Robot assigned to your order' : 'Waiting for robot assignment'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['robot_picking_up', 'robot_delivering', 'delivered'].includes(order.status)
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Pickup</p>
                    <p className="text-sm text-gray-600">
                      {order.status === 'robot_picking_up' ? 'Robot is picking up your order' :
                       ['robot_delivering', 'delivered'].includes(order.status) ? 'Order picked up' : 'Waiting for pickup'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['robot_delivering', 'delivered'].includes(order.status)
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">
                      {order.status === 'robot_delivering' ? 'Robot is delivering your order' :
                       order.status === 'delivered' ? 'Order delivered' : 'Waiting for delivery'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-600">
                      {order.status === 'delivered' ? 'Order completed successfully' : 'Pending completion'}
                    </p>
                  </div>
                </div>
              </div>

              {order.status === 'robot_delivering' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-sm font-medium text-blue-900">
                      Your order is on the way!
                    </p>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Estimated delivery: 15-20 minutes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
