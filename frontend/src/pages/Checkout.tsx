import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderAPI } from '@/services/api';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddressSelector from '@/components/AddressSelector';
import { Address } from '@/constants/addresses';
import toast from 'react-hot-toast';
import { MapPinIcon, CreditCardIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface CheckoutFormData {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  mobileNumber: string;
  notes: string;
}

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [useIITMandiAddress, setUseIITMandiAddress] = useState(false);
  const [selectedIITAddress, setSelectedIITAddress] = useState<Address | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      deliveryAddress: {
        street: (user?.address && 'street' in user.address) ? user.address.street : '',
        city: (user?.address && 'city' in user.address) ? user.address.city : '',
        state: (user?.address && 'state' in user.address) ? user.address.state : '',
        zipCode: (user?.address && 'zipCode' in user.address) ? user.address.zipCode : '',
      },
      mobileNumber: user?.phone || '',
      notes: ''
    }
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/items');
    }
  }, [items.length, navigate]);

  if (!isAuthenticated || items.length === 0) {
    return <LoadingSpinner />;
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
    // Validate mobile number
    if (!data.mobileNumber || !/^[6-9]\d{9}$/.test(data.mobileNumber)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    // Validate address selection
    if (useIITMandiAddress && !selectedIITAddress) {
      toast.error('Please select a delivery location on campus');
      return;
    }
    
    if (!useIITMandiAddress && (!data.deliveryAddress.street || !data.deliveryAddress.city || !data.deliveryAddress.state || !data.deliveryAddress.zipCode)) {
      toast.error('Please fill in all address fields');
      return;
    }

    setLoading(true);
    
    try {
      // Update user profile with mobile number if it's different
      if (data.mobileNumber !== user?.phone) {
        try {
          await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              phone: data.mobileNumber
            })
          });
        } catch (profileError) {
          console.warn('Failed to update profile with mobile number:', profileError);
          // Continue with order creation even if profile update fails
        }
      }

      // Determine which address to use
      const deliveryAddress = useIITMandiAddress && selectedIITAddress 
        ? {
            ...selectedIITAddress,
            coordinates: selectedIITAddress.coordinates || { lat: 31.7754, lng: 77.0269 }
          }
        : {
            ...data.deliveryAddress,
            coordinates: {
              lat: user?.address?.coordinates?.lat || 40.7128,
              lng: user?.address?.coordinates?.lng || -74.0060
            }
          };

      // Create separate orders for each vendor
      const orderPromises = Object.entries(itemsByVendor).map(async ([vendorId, vendorData]: [string, any]) => {
        const orderItems = vendorData.items.map((cartItem: any) => ({
          itemId: cartItem.item._id,
          quantity: cartItem.quantity
        }));

        return orderAPI.create({
          vendorId,
          items: orderItems,
          deliveryAddress,
          notes: data.notes
        });
      });

      await Promise.all(orderPromises);
      
      clearCart();
      toast.success('Orders placed successfully! You will receive SMS updates on your mobile.');
      navigate('/orders');
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Review your order and complete your purchase</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4">
            {Object.entries(itemsByVendor).map(([vendorId, vendorData]: [string, any]) => (
              <div key={vendorId} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-medium text-gray-900 mb-2">
                  {vendorData.vendor?.businessName || 'Vendor'}
                </h3>
                <div className="space-y-2">
                  {vendorData.items.map((cartItem: any) => (
                    <div key={cartItem.item._id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cartItem.item.image || '/placeholder-food.jpg'}
                          alt={cartItem.item.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{cartItem.item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {cartItem.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">₹{total.toFixed(2)}</span>
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
                
                {/* Address Type Toggle */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="addressType"
                        checked={!useIITMandiAddress}
                        onChange={() => setUseIITMandiAddress(false)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Custom Address</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="addressType"
                        checked={useIITMandiAddress}
                        onChange={() => setUseIITMandiAddress(true)}
                        className="mr-2"
                      />
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">IIT Mandi Campus</span>
                    </label>
                  </div>
                </div>

                {/* Mobile Number Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">+91</span>
                    </div>
                    <input
                      type="tel"
                      {...register('mobileNumber', { 
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: 'Please enter a valid 10-digit Indian mobile number'
                        }
                      })}
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="8198086300"
                      maxLength={10}
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    📱 Required for SMS notifications about your order status
                  </p>
                </div>

                {useIITMandiAddress ? (
                  /* IIT Mandi Address Selector */
                  <div>
                    <AddressSelector
                      selectedAddressId={selectedIITAddress?.id}
                      onAddressSelect={setSelectedIITAddress}
                      placeholder="Select delivery location on campus"
                      className="w-full"
                    />
                    {selectedIITAddress && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start space-x-2">
                          <AcademicCapIcon className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">
                              Delivery to: {selectedIITAddress.name}
                            </p>
                            <p className="text-sm text-green-600 capitalize">
                              {selectedIITAddress.category.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-green-600">
                              {selectedIITAddress.fullAddress}
                            </p>
                            {selectedIITAddress.coordinates && (
                              <p className="text-xs text-green-500 mt-1">
                                📍 GPS: {selectedIITAddress.coordinates.lat}, {selectedIITAddress.coordinates.lng}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Traditional Address Form */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        {...register('deliveryAddress.street', { 
                          required: !useIITMandiAddress ? 'Street address is required' : false 
                        })}
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
                        {...register('deliveryAddress.city', { 
                          required: !useIITMandiAddress ? 'City is required' : false 
                        })}
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
                        {...register('deliveryAddress.state', { 
                          required: !useIITMandiAddress ? 'State is required' : false 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="NY"
                      />
                      {errors.deliveryAddress?.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.state.message}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        {...register('deliveryAddress.zipCode', { 
                          required: !useIITMandiAddress ? 'ZIP code is required' : false 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="10001"
                      />
                      {errors.deliveryAddress?.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                )}
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
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₹29.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-medium">₹{(total * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">₹{(total + 29.00 + (total * 0.18)).toFixed(2)}</span>
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
