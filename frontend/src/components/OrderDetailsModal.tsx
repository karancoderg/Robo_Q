import React from 'react';
import { XMarkIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-600">Order #{order._id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className={`badge ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Customer Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Name:</span>
                <span className="text-gray-900">{order.customerName}</span>
              </div>
              {order.customerEmail && (
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{order.customerEmail}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-gray-900">
              {order.deliveryAddress ? (
                <div>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Instructions:</strong> {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No delivery address provided</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">₹{(order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
              </div>
              {order.deliveryFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="text-gray-900">₹{order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t border-gray-300 pt-2">
                <span className="text-gray-900">Total:</span>
                <span className="text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Placed:</span>
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              {order.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved:</span>
                  <span className="text-gray-900">
                    {new Date(order.approvedAt).toLocaleString()}
                  </span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered:</span>
                  <span className="text-gray-900">
                    {new Date(order.deliveredAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
