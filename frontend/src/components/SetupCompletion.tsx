import React, { useState } from 'react';
import { User, Building2, ShoppingBag, MapPin, Clock, Phone } from 'lucide-react';

interface SetupCompletionProps {
  user: any;
  onComplete: (setupData: any) => void;
  onSkip?: () => void;
}

const SetupCompletion: React.FC<SetupCompletionProps> = ({ user, onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    role: '',
    businessInfo: {
      businessName: '',
      description: '',
      category: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      operatingHours: {
        open: '09:00',
        close: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    }
  });
  
  const [errors, setErrors] = useState<any>({});

  const categories = [
    'Restaurant',
    'Grocery',
    'Pharmacy',
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Other'
  ];

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const validateStep1 = () => {
    const newErrors: any = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.role !== 'vendor') return true;
    
    const newErrors: any = {};
    
    if (!formData.businessInfo.businessName) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData.businessInfo.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.businessInfo.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.businessInfo.address.street) {
      newErrors.street = 'Street address is required';
    }
    
    if (!formData.businessInfo.address.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.businessInfo.address.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.businessInfo.address.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      if (formData.role === 'user') {
        handleComplete();
      } else {
        setStep(2);
      }
    } else if (step === 2 && validateStep2()) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const setupData = {
      password: formData.password,
      role: formData.role,
      ...(formData.role === 'vendor' && { businessInfo: formData.businessInfo })
    };
    
    onComplete(setupData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBusinessInfoChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }));
    
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        address: {
          ...prev.businessInfo.address,
          [field]: value
        }
      }
    }));
    
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev: any) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        operatingHours: {
          ...prev.businessInfo.operatingHours,
          days: prev.businessInfo.operatingHours.days.includes(day)
            ? prev.businessInfo.operatingHours.days.filter((d: string) => d !== day)
            : [...prev.businessInfo.operatingHours.days, day]
        }
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to RoboQ, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Let's complete your account setup to get started
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Security & Role
            </h2>
            
            {/* Password Setup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter a secure password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to use RoboQ as a:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => handleInputChange('role', 'user')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'user'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Customer</h3>
                      <p className="text-sm text-gray-600">Order items for delivery</p>
                    </div>
                  </div>
                </div>
                
                <div
                  onClick={() => handleInputChange('role', 'vendor')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'vendor'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Vendor</h3>
                      <p className="text-sm text-gray-600">Sell items and manage orders</p>
                    </div>
                  </div>
                </div>
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && formData.role === 'vendor' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Information
            </h2>
            
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessInfo.businessName}
                onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.businessName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                value={formData.businessInfo.description}
                onChange={(e) => handleBusinessInfoChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your business..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.businessInfo.category}
                onChange={(e) => handleBusinessInfoChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Business Phone
              </label>
              <input
                type="tel"
                value={formData.businessInfo.phone}
                onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter business phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Business Address
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={formData.businessInfo.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Street address"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.businessInfo.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.businessInfo.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.businessInfo.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ZIP Code"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Operating Hours
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Open</label>
                  <input
                    type="time"
                    value={formData.businessInfo.operatingHours.open}
                    onChange={(e) => setFormData((prev: any) => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        operatingHours: {
                          ...prev.businessInfo.operatingHours,
                          open: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Close</label>
                  <input
                    type="time"
                    value={formData.businessInfo.operatingHours.close}
                    onChange={(e) => setFormData((prev: any) => ({
                      ...prev,
                      businessInfo: {
                        ...prev.businessInfo,
                        operatingHours: {
                          ...prev.businessInfo.operatingHours,
                          close: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-2">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => handleDayToggle(day.key)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.businessInfo.operatingHours.days.includes(day.key)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {step === 1 && formData.role === 'user' ? 'Complete Setup' : 
               step === 1 ? 'Next' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupCompletion;
