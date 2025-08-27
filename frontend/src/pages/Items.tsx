import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { itemAPI, vendorAPI } from '@/services/api';
import { Item, Vendor } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Items: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [viewMode, setViewMode] = useState<'vendors' | 'items'>('vendors');
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  
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
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery(
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

  // Group items by vendor
  const vendorItemsMap = useMemo(() => {
    const map = new Map<string, Item[]>();
    
    items.forEach((item: Item) => {
      const vendorId = typeof item.vendorId === 'string' ? item.vendorId : item.vendorId._id;
      if (!map.has(vendorId)) {
        map.set(vendorId, []);
      }
      map.get(vendorId)!.push(item);
    });
    
    return map;
  }, [items]);

  // Filter vendors that have items matching current filters
  const filteredVendors = useMemo(() => {
    if (selectedVendor) {
      return vendors.filter((vendor: Vendor) => vendor._id === selectedVendor);
    }
    
    return vendors.filter((vendor: Vendor) => {
      const hasItems = vendorItemsMap.has(vendor._id);
      if (!hasItems) return false;
      
      // If search term exists, check if vendor name matches or has matching items
      if (searchTerm) {
        const vendorNameMatch = vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingItems = vendorItemsMap.get(vendor._id)?.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return vendorNameMatch || hasMatchingItems;
      }
      
      return true;
    });
  }, [vendors, vendorItemsMap, selectedVendor, searchTerm]);

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

  const toggleVendorExpansion = (vendorId: string) => {
    const newExpanded = new Set(expandedVendors);
    if (newExpanded.has(vendorId)) {
      newExpanded.delete(vendorId);
    } else {
      newExpanded.add(vendorId);
    }
    setExpandedVendors(newExpanded);
  };

  const expandAllVendors = () => {
    setExpandedVendors(new Set(filteredVendors.map((v: Vendor) => v._id)));
  };

  const collapseAllVendors = () => {
    setExpandedVendors(new Set());
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  const renderItemCard = (item: Item) => {
    const quantity = getItemQuantity(item._id);
    
    return (
      <div key={item._id} className="card hover:shadow-md transition-shadow">
        <div className="card-header">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {item.description}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="text-lg font-bold text-primary-600">₹{item.price}</p>
              {!item.isAvailable && (
                <span className="badge badge-error text-xs">Unavailable</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-content">
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge badge-secondary text-xs">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {item.preparationTime} min
            </span>
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
  };

  if (itemsLoading || vendorsLoading) {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items or vendors..."
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

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('vendors')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'vendors'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              By Vendors
            </button>
            <button
              onClick={() => setViewMode('items')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'items'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Items
            </button>
          </div>
        </div>

        {/* Expand/Collapse Controls for Vendor View */}
        {viewMode === 'vendors' && filteredVendors.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={expandAllVendors}
              className="btn btn-secondary btn-sm"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllVendors}
              className="btn btn-secondary btn-sm"
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'vendors' ? (
        /* Vendor-grouped View */
        <div className="space-y-6">
          {filteredVendors.map((vendor: Vendor) => {
            const vendorItems = vendorItemsMap.get(vendor._id) || [];
            const isExpanded = expandedVendors.has(vendor._id);
            
            return (
              <div key={vendor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Vendor Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleVendorExpansion(vendor._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{vendor.businessName}</h2>
                          <p className="text-gray-600 mt-1">{vendor.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center">
                              {renderStars(vendor.rating)}
                              <span className="ml-1 text-sm text-gray-600">
                                ({vendor.rating.toFixed(1)})
                              </span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {vendor.category}
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {vendor.operatingHours.open} - {vendor.operatingHours.close}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {vendorItems.length} item{vendorItems.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vendorItems.filter(item => item.isAvailable).length} available
                        </p>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Vendor Items */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {vendorItems.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No items available from this vendor
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vendorItems.map(renderItemCard)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Traditional Items Grid View */
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
                      <p className="text-lg font-bold text-primary-600">₹{item.price}</p>
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
