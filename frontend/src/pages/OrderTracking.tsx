import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [robotProgress, setRobotProgress] = useState(0.3); // Progress from 0 to 1
  const [estimatedTime, setEstimatedTime] = useState(12);

  // Mock order data
  const order = {
    _id: orderId || '1',
    status: 'robot_delivering',
    deliveryAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: { lat: 40.7614, lng: -73.9776 }
    },
    vendorAddress: {
      street: '789 Pizza St',
      city: 'New York', 
      state: 'NY',
      zipCode: '10003',
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
    robot: {
      id: 'RB-001',
      name: 'RoboBot Alpha',
      batteryLevel: 85,
      speed: '3.2 mph',
      currentLocation: 'En route to delivery'
    },
    items: [
      { name: 'Margherita Pizza', quantity: 2 },
      { name: 'Pepperoni Pizza', quantity: 1 }
    ],
    totalAmount: 40.97,
    estimatedDeliveryTime: new Date(Date.now() + 12 * 60 * 1000).toISOString()
  };

  // Simulate robot movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotProgress(prev => Math.min(0.95, prev + 0.02)); // Move towards destination
      setEstimatedTime(prev => Math.max(1, prev - 0.2));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'robot_delivering': return '🚚';
      case 'robot_picking_up': return '📦';
      default: return '🤖';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/orders/${orderId}`} className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Order Details
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Live Robot Tracking
            </h1>
            <p className="text-gray-600">
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon(order.status)}</span>
            <span className="badge status-delivering text-lg px-4 py-2">
              Out for Delivery
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Real-time Location</h2>
            </div>
            <div className="card-content">
              {/* Mock Map Display */}
              <div className="bg-gray-100 rounded-lg h-96 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                  {/* Street Grid */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div key={`h-${i}`} className="absolute w-full h-px bg-gray-300" style={{ top: `${i * 12.5}%` }} />
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <div key={`v-${i}`} className="absolute h-full w-px bg-gray-300" style={{ left: `${i * 12.5}%` }} />
                    ))}
                  </div>
                  
                  {/* Vendor Location */}
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: '25%', 
                      top: '75%' 
                    }}
                  >
                    <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                      <span className="text-lg">🏪</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="bg-white px-2 py-1 rounded shadow text-xs font-medium">
                        Pizza Palace
                      </div>
                    </div>
                  </div>

                  {/* Robot Location (Animated) */}
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-linear"
                    style={{ 
                      left: `${25 + robotProgress * 50}%`, 
                      top: `${75 - robotProgress * 50}%` 
                    }}
                  >
                    <div className="bg-green-500 text-white p-3 rounded-full shadow-lg tracking-pulse">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="bg-green-100 border border-green-300 px-2 py-1 rounded shadow text-xs font-medium">
                        {order.robot.name}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: '75%', 
                      top: '25%' 
                    }}
                  >
                    <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                      <span className="text-lg">🏠</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                      <div className="bg-white px-2 py-1 rounded shadow text-xs font-medium">
                        Your Location
                      </div>
                    </div>
                  </div>

                  {/* Route Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 96 288 Q 192 192 288 96"
                      stroke="url(#routeGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="10,5"
                      className="route-dash"
                    />
                  </svg>
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏪</span>
                      <span>Vendor</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🤖</span>
                      <span>Robot (Live)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏠</span>
                      <span>Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Progress */}
          <div className="card mt-6">
            <div className="card-header">
              <h2 className="card-title">Delivery Progress</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Order Picked Up</p>
                      <p className="text-sm text-green-600">Robot collected your order from Pizza Palace</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">2:15 PM</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center animate-pulse">
                      🚚
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">En Route to You</p>
                      <p className="text-sm text-blue-600">Robot is heading to your delivery address</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600">Now</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center center">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Delivery Complete</p>
                      <p className="text-sm text-gray-500">You'll receive an OTP to confirm delivery</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">ETA: {Math.ceil(estimatedTime)} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* ETA Card */}
          <div className="card">
            <div className="card-content text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="text-2xl font-bold text-primary-600 mb-1">
                {Math.ceil(estimatedTime)} minutes
              </h3>
              <p className="text-gray-600">Estimated arrival time</p>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  🎯 Your robot is making great progress!
                </p>
              </div>
            </div>
          </div>

          {/* Robot Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Robot Details</h2>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.robot.name}</h3>
                    <p className="text-sm text-gray-600">ID: {order.robot.id}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🔋</span>
                      <span className="text-sm text-gray-600">Battery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${order.robot.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{order.robot.batteryLevel}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Speed</span>
                    <span className="text-sm font-medium">{order.robot.speed}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium text-green-600">{order.robot.currentLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Order Summary</h2>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary-600">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Delivery Address</h2>
            </div>
            <div className="card-content">
              <div className="flex items-start space-x-2">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="card">
            <div className="card-content text-center">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact our support team if you have any issues
              </p>
              <button className="btn btn-outline btn-sm w-full flex items-center justify-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>Call Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
