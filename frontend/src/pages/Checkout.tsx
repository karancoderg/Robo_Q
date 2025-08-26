import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/services/api';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MapPinIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface CheckoutFormData {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes: string;
}

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      deliveryAddress: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
      },
      notes: ''
    }
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Simple authentication check
  if (!isAuthenticated || !user) {
    navigate('/login', { state: { from: location } });
    return null;
  }

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, cartItem) => {
    const vendorId = typeof cartItem.item.vendorId === 'object' 
      ? cartItem.item.vendorId._id 
      : cartItem.item.vendorId;
    
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: typeof cartItem.item.vendorId === 'object' ? cartItem.item.vendorId : null,
        items: []
      };
    }
    acc[vendorId].items.push(cartItem);
    return acc;
  }, {} as any);

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    
    try {
      // Create separate orders for each vendor
      const orderPromises = Object.entries(itemsByVendor).map(async ([vendorId, vendorData]: [string, any]) => {
        const orderItems = vendorData.items.map((cartItem: any) => ({
          itemId: cartItem.item._id,
          quantity: cartItem.quantity
        }));

        return orderAPI.create({
          vendorId,
          items: orderItems,
          deliveryAddress: {
            ...data.deliveryAddress,
            coordinates: {
              lat: user?.address?.coordinates?.lat || 40.7128,
              lng: user?.address?.coordinates?.lng || -74.0060
            }
          },
          notes: data.notes
        });
      });

      await Promise.all(orderPromises);
      
      clearCart();
      toast.success('Orders placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Order placement error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login', { state: { from: location } });
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order</p>
        </div>

        {/* Order Summary */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {Object.entries(itemsByVendor).map(([vendorId, vendorData]: [string, any]) => (
            <div key={vendorId} className="mb-6 last:mb-0">
              <h3 className="font-medium text-gray-900 mb-3">
                {vendorData.vendor?.name || `Vendor ${vendorId}`}
              </h3>
              <div className="space-y-3">
                {vendorData.items.map((cartItem: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{cartItem.item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {cartItem.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      {...register('deliveryAddress.street', { required: 'Street address is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                    {errors.deliveryAddress?.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.street.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('deliveryAddress.city', { required: 'City is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="New York"
                    />
                    {errors.deliveryAddress?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      {...register('deliveryAddress.state', { required: 'State is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="NY"
                    />
                    {errors.deliveryAddress?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      {...register('deliveryAddress.zipCode', { required: 'ZIP code is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="10001"
                    />
                    {errors.deliveryAddress?.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="flex items-center mb-4">
                  <CreditCardIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">$2.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${(total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">${(total + 2.99 + (total * 0.08)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Placing Order...</span>
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </button>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
