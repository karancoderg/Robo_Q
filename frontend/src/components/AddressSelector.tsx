import React, { useState } from 'react';
import { 
  ADDRESS_CATEGORIES, 
  getAddressesByCategory, 
  getAddressById,
  Address 
} from '@/constants/addresses';

interface AddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
  placeholder?: string;
  className?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  placeholder = "Select delivery address",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ADDRESS_CATEGORIES | null>(null);

  const selectedAddress = selectedAddressId ? getAddressById(selectedAddressId) : null;

  const handleAddressSelect = (address: Address) => {
    onAddressSelect(address);
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: keyof typeof ADDRESS_CATEGORIES) => {
    setSelectedCategory(category);
  };

  const goBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Address Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          !selectedAddress ? 'text-gray-500' : 'text-gray-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            {selectedAddress ? (
              <div>
                <div className="font-medium">{selectedAddress.name}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {ADDRESS_CATEGORIES[selectedAddress.category]}
                </div>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {!selectedCategory ? (
            // Category Selection
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b">
                Select Category
              </div>
              {Object.entries(ADDRESS_CATEGORIES).map(([key, label]) => {
                const categoryKey = key as keyof typeof ADDRESS_CATEGORIES;
                const addresses = getAddressesByCategory(categoryKey);
                
                return (
                  <button
                    key={key}
                    onClick={() => handleCategorySelect(categoryKey)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{label}</div>
                        <div className="text-sm text-gray-500">
                          {addresses.length} location{addresses.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Address Selection within Category
            <div className="p-2">
              <div className="flex items-center px-3 py-2 border-b">
                <button
                  onClick={goBack}
                  className="mr-2 p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {ADDRESS_CATEGORIES[selectedCategory]}
                </span>
              </div>
              
              {getAddressesByCategory(selectedCategory).map((address) => (
                <button
                  key={address.id}
                  onClick={() => handleAddressSelect(address)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                    selectedAddressId === address.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{address.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {address.fullAddress}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default AddressSelector;
