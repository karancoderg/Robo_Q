import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/LoadingSpinner';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import {
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface VendorProfileFormData {
  businessName: string;
  description: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

const VendorProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Mock vendor data
  const vendorData = {
    businessName: 'Pizza Palace',
    description: 'Authentic Italian pizzas made with fresh ingredients and traditional recipes',
    phone: '+1-555-0123',
    address: {
      street: '789 Pizza St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003'
    },
    contactInfo: {
      phone: '+1-555-0123',
      email: user?.email || 'pizza@example.com'
    },
    businessHours: {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '22:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '11:00', close: '23:00', closed: false },
      sunday: { open: '12:00', close: '21:00', closed: false }
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VendorProfileFormData>({
    defaultValues: vendorData
  });

  const onSubmit = async (_data: VendorProfileFormData) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert('Profile updated successfully!');
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
        <p className="text-gray-600">Manage your business information and settings</p>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Business Information</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingStorefrontIcon className="inline h-4 w-4 mr-1" />
                    Business Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input w-full"
                      {...register('businessName', { required: 'Business name is required' })}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorData.businessName}</p>
                  )}
                  {errors.businessName && (
                    <p className="text-red-600 text-sm mt-1">{errors.businessName.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  {isEditing ? (
                    <textarea
                      className="input w-full h-24 resize-none"
                      {...register('description')}
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{vendorData.description}</p>
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
                    <p className="text-gray-900 py-2">{vendorData.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="inline h-4 w-4 mr-1" />
                    Business Address
                  </label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Street Address"
                        className="input w-full"
                        {...register('address.street')}
                      />
                      <div className="grid grid-cols-3 gap-3">
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
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          className="input"
                          {...register('address.zipCode')}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-900 py-2">
                      <p>{vendorData.address.street}</p>
                      <p>{vendorData.address.city}, {vendorData.address.state} {vendorData.address.zipCode}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="md:col-span-2 flex space-x-3 pt-4">
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

        {/* Business Hours */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Business Hours</h2>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {Object.entries(vendorData.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900 w-20">
                      {dayNames[day as keyof typeof dayNames]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {hours.closed ? (
                      <span className="text-red-600">Closed</span>
                    ) : (
                      <span>{hours.open} - {hours.close}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                    <p className="text-sm text-gray-600">Receive order notifications via email</p>
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

        {/* Business Statistics */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Business Statistics</h2>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">$1,247.50</p>
                <p className="text-sm text-blue-700">Total Revenue</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <BuildingStorefrontIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">47</p>
                <p className="text-sm text-green-700">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">15 min</p>
                <p className="text-sm text-purple-700">Avg Prep Time</p>
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

export default VendorProfile;
