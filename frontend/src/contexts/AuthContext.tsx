import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (email: string) => Promise<{ success: boolean; userId?: string }>;
  verifyLoginOTP: (userId: string, otp: string) => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<{ success: boolean; needsSetup?: boolean; user?: User }>;
  completeSetup: (data: SetupData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  clearAuth: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  setUserFromRegistration: (userData: User, accessToken: string) => void;
  checkAuthStatus: () => Promise<boolean>;
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
  role?: 'user' | 'vendor';
  address?: any;
}

interface SetupData {
  password: string;
  role: 'user' | 'vendor';
  businessInfo?: any;
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
          console.error('Profile fetch error:', error);
          // If token is expired or invalid, try to refresh
          if (error.response?.status === 401) {
            try {
              const refreshResponse = await authAPI.refreshToken();
              if (refreshResponse.data.success) {
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data!;
                localStorage.setItem('accessToken', newAccessToken);
                if (newRefreshToken) {
                  localStorage.setItem('refreshToken', newRefreshToken);
                }
                
                // Try to get profile again with new token
                const profileResponse = await authAPI.getProfile();
                if (profileResponse.data.success) {
                  setUser(profileResponse.data.data!.user);
                }
              } else {
                throw new Error('Refresh failed');
              }
            } catch (refreshError) {
              console.error('Token refresh failed during init:', refreshError);
              // If refresh fails, clear tokens but don't show error to user
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
            }
          } else {
            // For other errors, clear tokens
            console.error('Non-401 error during profile fetch:', error);
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

  const loginWithGoogle = async (token: string): Promise<{ success: boolean; needsSetup?: boolean; user?: User }> => {
    try {
      const response = await authAPI.loginWithGoogle({ token });
      if (response.data.success) {
        const { user, accessToken, refreshToken, isNewUser, needsSetup } = response.data.data!;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Store user email as backup for emergency setup
        if (user.email) {
          localStorage.setItem('userEmail', user.email);
        }
        
        setUser(user);
        
        if (isNewUser && needsSetup) {
          // Google OAuth - New user needs setup
          return { success: true, needsSetup: true, user };
        } else {
          toast.success('Google login successful!');
          return { success: true, needsSetup: false, user };
        }
      }
      return { success: false };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
      return { success: false };
    }
  };

  const completeSetup = async (data: SetupData): Promise<boolean> => {
    try {
      // Try multiple ways to get user email
      const userEmail = user?.email || 
                       localStorage.getItem('userEmail') || 
                       localStorage.getItem('googleUserEmail');
      
      // Emergency Setup - processing user data
      
      if (!userEmail) {
        toast.error('User email not found. Please login again.');
        return false;
      }
      
      const response = await fetch('http://localhost:5000/api/auth/emergency-complete-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          ...data
        })
      });
      
      const result = await response.json();
      // Emergency Setup - Response received
      
      if (result.success) {
        const { user: updatedUser, accessToken, refreshToken } = result.data;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        setUser(updatedUser);
        toast.success('Setup completed successfully!');
        return true;
      } else {
        toast.error(result.message || 'Setup completion failed');
        return false;
      }
    } catch (error: any) {
      console.error('🔧 Emergency Setup Error:', error);
      toast.error('Setup completion failed');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const registerData = {
        ...data,
        role: data.role || 'user' as 'user' | 'vendor'
      };
      const response = await authAPI.register(registerData);
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

  // Helper function to safely clear authentication
  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const updateData = { ...data };
      // Filter out admin role for frontend updates
      if (updateData.role === 'admin') {
        delete updateData.role;
      }
      const response = await authAPI.updateProfile(updateData);
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

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      if (response.data.success) {
        toast.success('Password changed successfully');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      return false;
    }
  };

  // Helper function to check if user is still authenticated
  const checkAuthStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token || !refreshToken) {
      return false;
    }
    
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data!.user);
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Try to refresh token
        try {
          const refreshResponse = await authAPI.refreshToken();
          if (refreshResponse.data.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data!;
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            
            // Try to get profile again
            const profileResponse = await authAPI.getProfile();
            if (profileResponse.data.success) {
              setUser(profileResponse.data.data!.user);
              return true;
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      return false;
    }
  };

  // PERMANENT FIX: Simple and reliable session persistence
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only clear user when access token is explicitly removed by logout
      if (e.key === 'accessToken' && !e.newValue && e.oldValue) {
        // Access token removed from storage, logging out user
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Periodically check auth status for Google OAuth users
  useEffect(() => {
    if (user && user.email) {
      const interval = setInterval(async () => {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error('Periodic auth check failed:', error);
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user, checkAuthStatus]);

  const setUserFromRegistration = (userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithOTP,
    verifyLoginOTP,
    loginWithGoogle,
    completeSetup,
    register,
    logout,
    clearAuth,
    updateProfile,
    changePassword,
    setUserFromRegistration,
    checkAuthStatus,
    isAuthenticated: !!user, // Simple: if user exists, they're authenticated
    isVendor: user?.role === 'vendor',
    isUser: user?.role === 'user',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
