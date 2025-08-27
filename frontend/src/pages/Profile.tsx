import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/LoadingSpinner';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import AddressSelector from '@/components/AddressSelector';
import { Address } from '@/constants/addresses';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface ProfileFormData {
  name: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [useIITMandiAddress, setUseIITMandiAddress] = useState(false);
  const [selectedIITAddress, setSelectedIITAddress] = useState<Address | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: {
        street: (user?.address && 'street' in user.address) ? user.address.street : '',
        city: (user?.address && 'city' in user.address) ? user.address.city : '',
        state: (user?.address && 'state' in user.address) ? user.address.state : '',
        zipCode: (user?.address && 'zipCode' in user.address) ? user.address.zipCode : '',
      }
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    
    // Use IIT Mandi address if selected, otherwise use traditional address
    const addressData = useIITMandiAddress && selectedIITAddress 
      ? selectedIITAddress 
      : data.address;
    
    const success = await updateProfile({
      ...data,
      address: addressData
    });
    
    if (success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-outline btn-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input w-full"
                      {...register('name', { required: 'Name is required' })}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.name}</p>
                  )}
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900 py-2">{user.email}</p>
                    {user.isVerified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : (
                      <span className="badge badge-warning">Unverified</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      className="input w-full"
                      placeholder="+1 (555) 123-4567"
                      {...register('phone')}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${user.role === 'vendor' ? 'badge-primary' : 'badge-secondary'}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="inline h-4 w-4 mr-1" />
                    Delivery Address
                  </label>
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Address Type Toggle */}
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

                      {useIITMandiAddress ? (
                        /* IIT Mandi Address Selector */
                        <div>
                          <AddressSelector
                            selectedAddressId={selectedIITAddress?.id}
                            onAddressSelect={setSelectedIITAddress}
                            placeholder="Select your campus location"
                            className="w-full"
                          />
                          {selectedIITAddress && (
                            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-800">
                                Selected: {selectedIITAddress.name}
                              </p>
                              <p className="text-xs text-green-600">
                                {selectedIITAddress.fullAddress}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Traditional Address Form */
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Street Address"
                            className="input w-full"
                            {...register('address.street')}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="City"
                              className="input"
                              {...register('address.city')}
                            />
                            <input
                              type="text"
                              placeholder="State"
                              className="input"
                              {...register('address.state')}
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            className="input w-full"
                            {...register('address.zipCode')}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-900 py-2">
                      {user.address ? (
                        <div>
                          {/* Check if it's an IIT Mandi address */}
                          {(user.address as any).name ? (
                            <div className="flex items-start space-x-2">
                              <AcademicCapIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-medium">{(user.address as any).name}</p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {(user.address as any).category?.replace('_', ' ')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(user.address as any).fullAddress}
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Traditional address display */
                            <div>
                              <p>{(user.address as any).street}</p>
                              <p>{(user.address as any).city}, {(user.address as any).state} {(user.address as any).zipCode}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No address provided</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Account Settings</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChangePasswordModal(true)}
                  className="btn btn-outline btn-sm"
                >
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive order updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Account Statistics</h2>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">0</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">₹0.00</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

export default Profile;
