import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();
  const navigate = useNavigate();
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
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Review your order and delivery details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Delivery Address
                </h2>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      {...register('deliveryAddress.street', { required: 'Street address is required' })}
                    />
                    {errors.deliveryAddress?.street && (
                      <p className="text-red-600 text-sm mt-1">{errors.deliveryAddress.street.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        {...register('deliveryAddress.city', { required: 'City is required' })}
                      />
                      {errors.deliveryAddress?.city && (
                        <p className="text-red-600 text-sm mt-1">{errors.deliveryAddress.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        {...register('deliveryAddress.state', { required: 'State is required' })}
                      />
                      {errors.deliveryAddress?.state && (
                        <p className="text-red-600 text-sm mt-1">{errors.deliveryAddress.state.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      className="input w-full"
                      {...register('deliveryAddress.zipCode', { required: 'ZIP code is required' })}
                    />
                    {errors.deliveryAddress?.zipCode && (
                      <p className="text-red-600 text-sm mt-1">{errors.deliveryAddress.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Special Instructions</h2>
              </div>
              <div className="card-content">
                <textarea
                  className="input w-full h-24 resize-none"
                  placeholder="Any special delivery instructions..."
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Payment Method
                </h2>
              </div>
              <div className="card-content">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💳</div>
                    <div>
                      <p className="font-medium text-green-800">Cash on Delivery</p>
                      <p className="text-sm text-green-600">Pay when the robot arrives</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="card-header">
                <h2 className="card-title">Order Summary</h2>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {/* Items by Vendor */}
                  {Object.entries(itemsByVendor).map(([vendorId, vendorData]: [string, any]) => (
                    <div key={vendorId} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {vendorData.vendor?.businessName || 'Vendor'}
                      </h3>
                      <div className="space-y-2">
                        {vendorData.items.map((cartItem: any) => (
                          <div key={cartItem.item._id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {cartItem.quantity}x {cartItem.item.name}
                            </span>
                            <span className="font-medium">
                              ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium text-green-600">FREE 🤖</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Place Order'}
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card mt-6">
              <div className="card-content">
                <div className="text-center">
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Robot Delivery</h3>
                  <p className="text-sm text-gray-600">
                    Estimated delivery time: 20-30 minutes
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive an OTP to confirm delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
