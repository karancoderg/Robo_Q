import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { itemAPI, vendorAPI } from '@/services/api';
import { Item, Vendor } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Items: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  
  const { addItem, getItemQuantity } = useCart();
  const { isAuthenticated, isUser } = useAuth();

  // Fetch items
  const { data: itemsData, isLoading: itemsLoading } = useQuery(
    ['items', selectedCategory, selectedVendor, searchTerm],
    () => itemAPI.getAll({
      category: selectedCategory || undefined,
      vendorId: selectedVendor || undefined,
      search: searchTerm || undefined,
    }),
    {
      select: (response) => response.data.data,
    }
  );

  // Fetch vendors
  const { data: vendorsData } = useQuery(
    'vendors',
    () => vendorAPI.getAll(),
    {
      select: (response) => response.data.data,
    }
  );

  const items = itemsData?.items || [];
  const vendors = vendorsData?.vendors || [];

  const categories = [
    'food',
    'beverages', 
    'groceries',
    'medicines',
    'electronics',
    'books',
    'clothing',
    'other'
  ];

  const handleAddToCart = (item: Item) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (!isUser) {
      toast.error('Only customers can add items to cart');
      return;
    }
    addItem(item, 1);
  };

  if (itemsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
        <p className="text-gray-600">Discover delicious food and fresh groceries delivered by robots</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Vendor Filter */}
          <select
            className="input"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor: Vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.businessName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item: Item) => {
            const vendor = typeof item.vendorId === 'object' ? item.vendorId : null;
            const quantity = getItemQuantity(item._id);
            
            return (
              <div key={item._id} className="card hover:shadow-md transition-shadow">
                <div className="card-header">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title text-lg">{item.name}</h3>
                      {vendor && (
                        <p className="text-sm text-gray-600">{vendor.businessName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">${item.price}</p>
                      {!item.isAvailable && (
                        <span className="badge badge-error text-xs">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge badge-secondary text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>⏱️ {item.preparationTime} min</span>
                    <span>📦 {item.weight}g</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  {isAuthenticated && isUser ? (
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.isAvailable}
                        className="btn btn-primary btn-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                      {quantity > 0 && (
                        <span className="badge badge-primary">
                          {quantity} in cart
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {!isAuthenticated ? 'Login to order' : 'Customer account required'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Items;
