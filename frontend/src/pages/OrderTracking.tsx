import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '@/services/api';
import DemoRobotMap from '@/components/DemoRobotMap';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RobotTrackingData {
  order: {
    id: string;
    status: string;
    robotId: string;
    estimatedDeliveryTime: string;
    vendorLocation: {
      lat: number;
      lng: number;
      name: string;
    };
    customerLocation: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  robot: {
    id: string;
    name: string;
    status: 'assigned' | 'picking_up' | 'delivering' | 'returning';
    batteryLevel: number;
    currentLocation: {
      lat: number;
      lng: number;
      timestamp: string;
    };
    speed: number;
    estimatedArrival: string;
  };
  isDemo: boolean;
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [trackingData, setTrackingData] = useState<RobotTrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchTrackingData = async () => {
      try {
        const response = await orderAPI.getRobotTracking(orderId!);
        if (response.data.success) {
          setTrackingData(response.data.data);
        } else {
          // Fallback to demo mode
          setTrackingData({
            order: {
              id: orderId || 'demo-order',
              status: 'robot_assigned',
              robotId: 'ROBO-001',
              estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toISOString(),
              vendorLocation: {
                lat: 28.6129,
                lng: 77.2295,
                name: 'Demo Restaurant'
              },
              customerLocation: {
                lat: 28.6304,
                lng: 77.2177,
                name: 'Your Location'
              }
            },
            robot: {
              id: 'ROBO-001',
              name: 'RoboQ-1',
              status: 'assigned',
              batteryLevel: 85,
              currentLocation: {
                lat: 28.6189,
                lng: 77.2251,
                timestamp: new Date().toISOString()
              },
              speed: 12,
              estimatedArrival: new Date(Date.now() + 15 * 60000).toISOString()
            },
            isDemo: true
          });
        }
      } catch (err: any) {
        console.error('Tracking fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTrackingData, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'vendor_approved': return 'Order Approved - Assigning Robot';
      case 'robot_assigned': return 'Robot Assigned';
      case 'robot_picking_up': return 'Robot Picking Up Order';
      case 'robot_delivering': return 'Robot Delivering to You';
      case 'delivered': return 'Order Delivered';
      default: return status.replace('_', ' ').toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vendor_approved': return 'bg-yellow-100 text-yellow-800';
      case 'robot_assigned': return 'bg-blue-100 text-blue-800';
      case 'robot_picking_up': return 'bg-orange-100 text-orange-800';
      case 'robot_delivering': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tracking Data</h2>
            <p className="text-gray-600">Unable to load tracking information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/orders"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Orders
          </Link>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Order #{trackingData.order.id.slice(-8)}</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {getStatusText(trackingData.order.status)}
              </h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.order.status)}`}>
                  {trackingData.order.status.replace('_', ' ').toUpperCase()}
                </span>
                {trackingData.isDemo && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(trackingData.order.estimatedDeliveryTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Robot Map */}
        <DemoRobotMap
          robot={trackingData.robot}
          vendorLocation={trackingData.order.vendorLocation}
          customerLocation={trackingData.order.customerLocation}
        />

        {/* Contact Info */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <PhoneIcon className="h-4 w-4 mr-2" />
              Call Support
            </button>
            <p className="text-gray-600">
              Having issues with your delivery? Our support team is here to help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
