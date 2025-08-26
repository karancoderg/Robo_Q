import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginResponse } from '@/types';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (email: string) => Promise<{ success: boolean; userId?: string }>;
  verifyLoginOTP: (userId: string, otp: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
  isVendor: boolean;
  isUser: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  address?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        try {
          // First, try to get profile with current token
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.data!.user);
          }
        } catch (error: any) {
          // If token is expired or invalid, try to refresh
          if (error.response?.status === 401) {
            try {
              const refreshResponse = await authAPI.refreshToken();
              if (refreshResponse.data.success) {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data!;
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                // Try to get profile again with new token
                const profileResponse = await authAPI.getProfile();
                if (profileResponse.data.success) {
                  setUser(profileResponse.data.data!.user);
                }
              } else {
                throw new Error('Refresh failed');
              }
            } catch (refreshError) {
              // If refresh fails, clear tokens and logout
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
            }
          } else {
            // For other errors, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const loginWithOTP = async (email: string): Promise<{ success: boolean; userId?: string }> => {
    try {
      const response = await authAPI.loginWithOTP({ email });
      if (response.data.success) {
        toast.success('OTP sent to your email');
        return { 
          success: true, 
          userId: response.data.data?.userId 
        };
      }
      return { success: false };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      return { success: false };
    }
  };

  const verifyLoginOTP = async (userId: string, otp: string): Promise<boolean> => {
    try {
      const response = await authAPI.verifyLoginOTP({ userId, otp });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      return false;
    }
  };

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      const response = await authAPI.loginWithGoogle({ credential });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        toast.success('Google login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google login failed');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await authAPI.register(data);
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        toast.success('Registration successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        setUser(response.data.data!.user);
        toast.success('Profile updated successfully');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithOTP,
    verifyLoginOTP,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isVendor: user?.role === 'vendor',
    isUser: user?.role === 'user',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
