import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  // Mock orders data that matches the Orders page
  const mockOrders = [
    {
      _id: '1',
      userId: '1',
      vendorId: {
        _id: '1',
        businessName: 'Pizza Palace',
        description: 'Authentic Italian pizzas made with fresh ingredients',
        contactInfo: {
          phone: '+1-555-0123',
          email: 'pizza@example.com'
        },
        address: {
          street: '789 Pizza St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        }
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
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      userId: '1',
      vendorId: {
        _id: '2',
        businessName: 'Fresh Grocery',
        description: 'Fresh fruits, vegetables, and daily essentials',
        contactInfo: {
          phone: '+1-555-0456',
          email: 'grocery@example.com'
        },
        address: {
          street: '321 Market Rd',
          city: 'New York',
          state: 'NY',
          zipCode: '10004'
        }
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
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      actualDeliveryTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      userId: '1',
      vendorId: {
        _id: '1',
        businessName: 'Pizza Palace',
        description: 'Authentic Italian pizzas made with fresh ingredients',
        contactInfo: {
          phone: '+1-555-0123',
          email: 'pizza@example.com'
        },
        address: {
          street: '789 Pizza St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        }
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
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ];

  // Find the specific order by ID
  const order = mockOrders.find(o => o._id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
            <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
            <Link to="/orders" className="btn btn-primary mt-4">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [otpInput, setOtpInput] = useState('');
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

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

  const getTimelineSteps = (order: any) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', completed: true, timestamp: order.createdAt },
      { status: 'vendor_approved', label: 'Vendor Approved', completed: false },
      { status: 'robot_assigned', label: 'Robot Assigned', completed: false },
      { status: 'robot_picking_up', label: 'Picking Up', completed: false },
      { status: 'robot_delivering', label: 'Out for Delivery', completed: false },
      { status: 'delivered', label: 'Delivered', completed: false },
    ];

    const statusOrder = ['pending', 'vendor_approved', 'robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const timelineSteps = getTimelineSteps(order);
  const vendor = order.vendorId;

  const handleConfirmDelivery = async () => {
    if (!otpInput || otpInput.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setConfirmingDelivery(true);
    // Simulate API call
    setTimeout(() => {
      alert('Delivery confirmed successfully!');
      setConfirmingDelivery(false);
      setOtpInput('');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/orders" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(order.status)}</span>
            <span className={`badge ${getStatusColor(order.status)} text-lg px-4 py-2`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Order Progress</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {timelineSteps.map((step, index) => (
                  <div key={step.status} className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.current 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.current ? 'text-primary-600' : step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <p className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Order Items</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-primary-600 font-medium">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-primary-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Confirmation */}
          {order.status === 'robot_delivering' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Confirm Delivery</h2>
              </div>
              <div className="card-content">
                <p className="text-gray-600 mb-4">
                  Enter the OTP provided by the delivery robot to confirm receipt of your order.
                </p>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="input flex-1"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={confirmingDelivery || otpInput.length !== 6}
                    className="btn btn-primary"
                  >
                    {confirmingDelivery ? <LoadingSpinner size="sm" /> : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vendor Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Vendor Details</h2>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                  <p className="text-sm text-gray-600">{vendor.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{vendor.contactInfo?.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>{vendor.contactInfo?.email}</span>
                </div>
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mt-0.5" />
                  <div>
                    <p>{vendor.address?.street}</p>
                    <p>{vendor.address?.city}, {vendor.address?.state} {vendor.address?.zipCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Robot Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Robot Details</h2>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">RoboBot-X1</h3>
                    <p className="text-sm text-gray-600">Battery: 85%</p>
                  </div>
                </div>
                {['robot_picking_up', 'robot_delivering'].includes(order.status) && (
                  <button className="btn btn-outline w-full">
                    Track Robot Live
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Delivery Details</h2>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mt-0.5" />
                    <div>
                      <p>{order.deliveryAddress.street}</p>
                      <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                    </div>
                  </div>
                </div>
                
                {order.estimatedDeliveryTime && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Estimated Delivery</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>{new Date(order.estimatedDeliveryTime).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Special Instructions</p>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
