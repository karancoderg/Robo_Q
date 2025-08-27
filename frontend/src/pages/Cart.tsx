import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const Cart: React.FC = () => {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Discover delicious food and fresh groceries from our vendors
          </p>
          <Link to="/items" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="card-title">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {items.map((cartItem) => {
                  const { item, quantity } = cartItem;
                  const vendor = typeof item.vendorId === 'object' ? item.vendorId : null;
                  
                  return (
                    <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {vendor && (
                          <p className="text-sm text-gray-600">{vendor.businessName}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-bold text-primary-600">
                            ₹{item.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">each</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, quantity - 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, quantity + 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-gray-900">
                            ₹{(item.price * quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium text-green-600">FREE 🤖</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button
                onClick={handleCheckout}
                className="btn btn-primary btn-lg w-full"
              >
                Proceed to Checkout
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
                  Your order will be delivered by our autonomous robots within 30 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
