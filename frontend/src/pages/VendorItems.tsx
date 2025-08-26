import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vendorAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const VendorItems: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  // Fetch items
  const { data: itemsData, isLoading } = useQuery(
    ['vendor-items', searchTerm, categoryFilter],
    () => vendorAPI.getItems({
      search: searchTerm || undefined,
      category: categoryFilter || undefined,
    }),
    {
      select: (response) => response.data.data.items,
    }
  );

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation(vendorAPI.toggleItemAvailability, {
    onSuccess: () => {
      toast.success('Item availability updated!');
      queryClient.invalidateQueries('vendor-items');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation(vendorAPI.deleteItem, {
    onSuccess: () => {
      toast.success('Item deleted successfully!');
      queryClient.invalidateQueries('vendor-items');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });

  const menuItems = itemsData || [];
  const categories = ['food', 'beverages', 'groceries', 'other'];

  // Filter items (additional client-side filtering if needed)
  const filteredItems = menuItems;

  const toggleAvailability = (itemId: string) => {
    toggleAvailabilityMutation.mutate(itemId);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  if (isLoading) {
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
      {/* Header */}
      <div className="mb-8">
        <Link to="/vendor/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Items</h1>
            <p className="text-gray-600">Manage your restaurant's menu items and availability</p>
          </div>
          <button
            onClick={handleAddItem}
            className="btn btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Items
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              className="input w-full"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content text-center">
            <p className="text-2xl font-bold text-primary-600">{menuItems.length}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <p className="text-2xl font-bold text-green-600">
              {menuItems.filter((item: any) => item.isAvailable).length}
            </p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <p className="text-2xl font-bold text-red-600">
              {menuItems.filter((item: any) => !item.isAvailable).length}
            </p>
            <p className="text-sm text-gray-600">Unavailable</p>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <p className="text-2xl font-bold text-blue-600">
              ${(menuItems.reduce((sum: any, item: any) => sum + item.price, 0) / menuItems.length).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Avg Price</p>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🍕</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter 
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first menu item'
            }
          </p>
          {!searchTerm && !categoryFilter && (
            <button
              onClick={handleAddItem}
              className="btn btn-primary"
            >
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <div key={item._id} className="card hover:shadow-md transition-shadow">
              <div className="card-header">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="card-title text-lg">{item.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="badge badge-secondary text-xs">
                        {item.category}
                      </span>
                      <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-error'} text-xs`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="card-content">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.slice(0, 3).map((tag: any) => (
                    <span key={tag} className="badge badge-outline text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                  <div>
                    <span className="font-medium">Prep Time:</span>
                    <p>⏱️ {item.preparationTime} min</p>
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span>
                    <p>📦 {item.weight}g</p>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="flex items-center justify-between w-full">
                  {/* Availability Toggle */}
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.isAvailable}
                        onChange={() => toggleAvailability(item._id)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                    <span className="text-sm text-gray-600">
                      {item.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="btn btn-outline btn-sm p-2"
                      title="Edit Item"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id, item.name)}
                      className="btn btn-error btn-sm p-2"
                      title="Delete Item"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        item={editingItem}
      />
    </div>
  );
};

export default VendorItems;
