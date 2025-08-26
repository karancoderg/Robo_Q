import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { authAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import GoogleOAuthButton from '@/components/GoogleOAuthButton';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'vendor';
  agreeToTerms: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'user'
    }
  });

  const password = watch('password');

  const registerMutation = useMutation(authAPI.register, {
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data;
      login(user, accessToken);
      toast.success('Registration successful! Welcome to RoboQ!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join RoboQ for autonomous delivery services
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <div className="card-content">
            {/* Google OAuth Button */}
            <div className="mb-6">
              <GoogleOAuthButton 
                text="signup_with" 
                onSuccess={() => navigate('/dashboard')}
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter your full name"
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                />
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
                <input
                  type="email"
                  className="input w-full"
                  placeholder="Enter your email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LockClosedIcon className="inline h-4 w-4 mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input w-full pr-10"
                    placeholder="Create a password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LockClosedIcon className="inline h-4 w-4 mr-1" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input w-full pr-10"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="user"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      {...register('role')}
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">👤</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Customer</p>
                          <p className="text-xs text-gray-600">Order food and groceries</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="vendor"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      {...register('role')}
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🏪</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Vendor</p>
                          <p className="text-xs text-gray-600">Sell products and manage orders</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    {...register('agreeToTerms', { required: 'You must agree to the terms and conditions' })}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-600 text-sm mt-1">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {registerMutation.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Why choose RoboQ?</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="text-xl">🤖</span>
                <span>Autonomous robot delivery</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="text-xl">⚡</span>
                <span>Fast 30-minute delivery</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="text-xl">🆓</span>
                <span>Free delivery on all orders</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="text-xl">📱</span>
                <span>Real-time order tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
