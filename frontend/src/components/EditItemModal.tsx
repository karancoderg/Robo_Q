import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { vendorAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

interface EditItemFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  weight: number;
  tags: string;
  isAvailable: boolean;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, item }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditItemFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'food',
      preparationTime: 15,
      weight: 300,
      tags: '',
      isAvailable: true
    }
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      reset({
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        category: item.category || 'food',
        preparationTime: item.preparationTime || 15,
        weight: item.weight || 300,
        tags: item.tags?.join(', ') || '',
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
      });
    }
  }, [item, reset]);

  const editItemMutation = useMutation(
    (data: any) => vendorAPI.updateItem(item._id, data),
    {
      onSuccess: () => {
        toast.success('Item updated successfully!');
        queryClient.invalidateQueries('vendor-items');
        queryClient.invalidateQueries('vendor-dashboard-items');
        reset();
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update item');
      },
    }
  );

  const onSubmit = (data: EditItemFormData) => {
    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    editItemMutation.mutate({
      ...data,
      tags: tagsArray,
      price: Number(data.price),
      preparationTime: Number(data.preparationTime),
      weight: Number(data.weight)
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Menu Item</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              className="input w-full"
              {...register('name', { 
                required: 'Item name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              className="input w-full h-24 resize-none"
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input w-full"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' }
                })}
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                className="input w-full"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="food">Food</option>
                <option value="beverages">Beverages</option>
                <option value="groceries">Groceries</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                className="input w-full"
                {...register('preparationTime', { 
                  required: 'Preparation time is required',
                  min: { value: 1, message: 'Must be at least 1 minute' },
                  max: { value: 120, message: 'Must be less than 120 minutes' }
                })}
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (grams) *
              </label>
              <input
                type="number"
                min="1"
                className="input w-full"
                {...register('weight', { 
                  required: 'Weight is required',
                  min: { value: 1, message: 'Weight must be greater than 0' }
                })}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              className="input w-full"
              {...register('tags')}
            />
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('isAvailable')}
              />
              <span className="text-sm font-medium text-gray-700">
                Item is available
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={editItemMutation.isLoading}
              className="btn btn-primary flex-1"
            >
              {editItemMutation.isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Update Item'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
