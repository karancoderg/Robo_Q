export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  googleId?: string;
  avatar?: string;
  role: 'user' | 'vendor' | 'admin';
  isVerified: boolean;
  needsPasswordSetup?: boolean;
  needsRoleSelection?: boolean;
  address?: Address | IITMandiAddress;
  createdAt?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IITMandiAddress {
  id: string;
  name: string;
  category: 'hostels' | 'academic' | 'guest_house' | 'mess';
  fullAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Vendor {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  address: Address;
  contactInfo: {
    phone: string;
    email: string;
  };
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  isActive: boolean;
  rating: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  _id: string;
  vendorId: string | Vendor;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  userId: string | User;
  vendorId: string | Vendor;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'vendor_approved' | 'vendor_rejected' | 'robot_assigned' | 'robot_picking_up' | 'robot_delivering' | 'delivered' | 'cancelled';
  deliveryAddress: Address;
  vendorAddress: Address;
  robotId?: string | Robot;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryOTP?: string;
  otpExpiresAt?: string;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Robot {
  _id: string;
  name: string;
  status: 'idle' | 'assigned' | 'picking_up' | 'delivering' | 'maintenance' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
  };
  batteryLevel: number;
  capacity: {
    weight: number;
    volume: number;
  };
  currentLoad: {
    weight: number;
    volume: number;
  };
  assignedOrderId?: string;
  lastMaintenance: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items?: T[];
  orders?: T[];
  vendors?: T[];
  robots?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order_update' | 'delivery_update' | 'system' | 'promotion' | 'vendor_order';
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface OrderTracking {
  orderId: string;
  status: string;
  estimatedDeliveryTime?: string;
  deliveryAddress: Address;
  vendorAddress: Address;
  robot?: {
    name: string;
    status: string;
    currentLocation: {
      lat: number;
      lng: number;
    };
    batteryLevel: number;
  };
  timeline: {
    status: string;
    timestamp?: string;
    completed: boolean;
  }[];
}

export interface VendorStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalItems: number;
  activeItems: number;
  rating: number;
}
