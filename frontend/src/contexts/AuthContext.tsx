import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (email: string) => Promise<{ success: boolean }>;
  verifyLoginOTP: (email: string, otp: string) => Promise<boolean>;
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
  const [skipInitAuth, setSkipInitAuth] = useState(false); // Flag to skip initAuth after registration

  useEffect(() => {
    const initAuth = async () => {
      // Skip initAuth if we just completed registration
      if (skipInitAuth) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        try {
          // First, try to get profile with current token
          const response = await authAPI.getProfile();
          if (response.data.success) {
            const profileUser = response.data.data!.user as User;
            setUser(profileUser);
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
                  const refreshedUser = profileResponse.data.data!.user as User;
                  setUser(refreshedUser);
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
        setUser({ ...user, setupCompleted: (user as any).setupCompleted ?? true });
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const loginWithOTP = async (email: string): Promise<{ success: boolean }> => {
    try {
      const response = await authAPI.loginWithOTP({ email });
      if (response.data.success) {
        toast.success('OTP sent to your email');
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      // Provide more user-friendly error messages
      if (error.response?.status === 404) {
        toast.error('Account not found. Please register first or check your email address.', {
          duration: 5000,
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to send OTP');
      }
      return { success: false };
    }
  };

  const verifyLoginOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authAPI.verifyLoginOTP({ email, otp });
      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser({ ...user, setupCompleted: (user as any).setupCompleted ?? true });
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
        
        setUser({ ...user, setupCompleted: (user as any).setupCompleted ?? true });
        
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
      // Get user email from current user or localStorage
      const userEmail = user?.email || 
                       localStorage.getItem('userEmail') || 
                       localStorage.getItem('googleUserEmail');
      
      if (!userEmail) {
        toast.error('User email not found. Please login again.');
        return false;
      }
      
      const response = await authAPI.completeSetup({
        email: userEmail,
        ...data
      });
      
      if (response.data.success) {
        const { user: updatedUser, accessToken, refreshToken } = response.data.data!;
        
        // Update tokens first
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // CRITICAL FIX: Ensure setupCompleted is explicitly set to true
        const userWithSetupCompleted = {
          ...updatedUser,
          setupCompleted: true
        };
        
        // Update user state with explicit setup completion
        setUser(userWithSetupCompleted);
        
        // Also store in localStorage for immediate access
        localStorage.setItem('user', JSON.stringify(userWithSetupCompleted));
        
        toast.success('Setup completed successfully!');
        
        // Small delay to ensure state update is processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
      } else {
        toast.error(response.data.message || 'Setup completion failed');
        return false;
      }
    } catch (error: any) {
      console.error('Setup completion error:', error);
      toast.error(error.response?.data?.message || 'Setup completion failed');
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
        setUser({ ...user, setupCompleted: (user as any).setupCompleted ?? true });
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
    console.log('AuthContext: Setting user from registration:', {
      userId: userData.id,
      role: userData.role,
      setupCompleted: userData.setupCompleted,
      name: userData.name
    });
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
    setLoading(false);
    setSkipInitAuth(true); // Prevent initAuth from overriding this data
    console.log('AuthContext: User state updated, isAuthenticated will be:', !!userData);
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
