import axios, { AxiosResponse } from 'axios';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor';
  isVerified: boolean;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // Increased to 30 seconds for Render.com cold starts
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  // Special handling for Google OAuth - it doesn't need our access token
  if (config.url?.includes('google-auth') || config.url?.includes('/auth/google')) {
    // Google OAuth request - no token needed
    return config;
  }

  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Token added to request
  } else {
    // No token available
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
            refreshToken
          });
          
          if (refreshResponse.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Only clear tokens, don't redirect here - let components handle it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear tokens but don't redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'vendor';
    restaurantInfo?: {
      name: string;
      address: string;
      phone: string;
      cuisineType: string;
    };
  }): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/register', data),

  login: (data: {
    email: string;
    password: string;
  }): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/login', data),

  loginWithOTP: (data: {
    email: string;
  }): Promise<AxiosResponse<ApiResponse<{ userId: string; email: string }>>> =>
    api.post('/auth/login/otp', data),

  verifyOTP: (data: {
    email: string;
    otp: string;
  }): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/verify-otp', data),

  verifyLoginOTP: (data: {
    email: string;
    otp: string;
  }): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/verify-otp', data),

  loginWithGoogle: (data: {
    token: string;
  }): Promise<AxiosResponse<ApiResponse<LoginResponse & { isNewUser?: boolean; needsSetup?: boolean }>>> =>
    api.post('/auth/google', data),

  completeSetup: (data: {
    email: string;
    password: string;
    role: 'user' | 'vendor';
    businessInfo?: any;
  }): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/complete-setup', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put('/auth/change-password', data),

  getProfile: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.get('/auth/profile'),

  updateProfile: (data: any): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.put('/auth/profile', data),

  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/logout'),

  refreshToken: (): Promise<AxiosResponse<ApiResponse<LoginResponse>>> =>
    api.post('/auth/refresh-token', {
      refreshToken: localStorage.getItem('refreshToken')
    }),
};

// Public Vendor API (for customers to browse vendors)
export const publicVendorAPI = {
  getAll: (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/vendors', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/vendors/${id}`),

  getItems: (vendorId: string, params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/vendors/${vendorId}/items`, { params }),
};

// For backward compatibility, also export as vendorAPI
export const vendorAPI = {
  // Public methods (for browsing)
  getAll: (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/vendors', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/vendors/${id}`),

  // Dashboard methods (for vendor management)
  getDashboardStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/vendor/dashboard/stats'),

  // Orders
  getOrders: (params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/vendor/orders', { params }),

  approveOrder: (orderId: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/vendor/orders/${orderId}/approve`),

  rejectOrder: (orderId: string, data: { reason?: string }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/vendor/orders/${orderId}/reject`, data),

  updateOrderStatus: (orderId: string, status: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/vendor/orders/${orderId}/status`, { status }),

  getRobotTracking: (orderId: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/orders/${orderId}/robot-tracking`),

  // Menu Items
  getItems: (params?: {
    category?: string;
    search?: string;
    isAvailable?: boolean;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/vendor/items', { params }),

  createItem: (data: {
    name: string;
    description: string;
    price: number;
    category: string;
    preparationTime: number;
    weight: number;
    tags: string[];
    isAvailable: boolean;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/vendor/items', data),

  updateItem: (itemId: string, data: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/vendor/items/${itemId}`, data),

  deleteItem: (itemId: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.delete(`/vendor/items/${itemId}`),

  toggleItemAvailability: (itemId: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/vendor/items/${itemId}/toggle-availability`),

  // Profile
  getProfile: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/vendor/profile'),

  updateProfile: (data: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put('/vendor/profile', data),

  updateBusinessHours: (data: any): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put('/vendor/profile/business-hours', data),
};

// Item API
export const itemAPI = {
  getAll: (params?: {
    category?: string;
    search?: string;
    vendorId?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/items', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/items/${id}`),

  getByVendor: (vendorId: string, params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/vendors/${vendorId}/items`, { params }),
};

// Order API
export const orderAPI = {
  create: (data: {
    vendorId: string;
    items: Array<{
      itemId: string;
      quantity: number;
    }>;
    deliveryAddress: any;
    notes?: string;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/orders', data),

  getAll: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/orders', { params }),

  getMyOrders: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/orders', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/orders/${id}`),

  updateStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/orders/${id}/status`, { status }),

  confirmDelivery: (id: string, otp: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post(`/orders/${id}/confirm-delivery`, { otp }),

  getRobotTracking: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/orders/${id}/robot-tracking`)
};

// Robot API
export const robotAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/robots'),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/robots/${id}`),

  getLocation: (id: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get(`/robots/${id}/location`),
};

// Addresses API
export const addressesAPI = {
  getIITMandiAddresses: (category?: string): Promise<AxiosResponse<ApiResponse<{
    addresses: any[];
    categories: Record<string, string>;
  }>>> =>
    api.get('/addresses/iit-mandi', { params: category ? { category } : {} }),
};

// Health check
export const healthAPI = {
  check: (): Promise<AxiosResponse<ApiResponse>> =>
    api.get('/health'),
};

// Notification API
export const notificationAPI = {
  getAll: (params?: {
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/notifications', { params }),

  markAsRead: (notificationId: string): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put(`/notifications/${notificationId}/read`),

  markAllAsRead: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.put('/notifications/read-all'),
};

export default api;
