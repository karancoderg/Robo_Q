import { Document } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Optional for Google OAuth users
  googleId?: string;
  avatar?: string;
  role: 'user' | 'vendor' | 'admin';
  isVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IVendor extends Document {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  category: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IItem extends Document {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  weight: number; // in grams
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  _id: string;
  userId: string;
  vendorId: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'vendor_approved' | 'vendor_rejected' | 'robot_assigned' | 'robot_picking_up' | 'robot_delivering' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  vendorAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  robotId?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  deliveryOTP?: string;
  otpExpiresAt?: Date;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface IRobot extends Document {
  _id: string;
  name: string;
  status: 'idle' | 'assigned' | 'picking_up' | 'delivering' | 'maintenance' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
  };
  batteryLevel: number;
  capacity: {
    weight: number; // max weight in grams
    volume: number; // max volume in cubic cm
  };
  currentLoad: {
    weight: number;
    volume: number;
  };
  assignedOrderId?: string;
  lastMaintenance: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOTP extends Document {
  _id: string;
  userId: string;
  otp: string;
  type: 'email_verification' | 'phone_verification' | 'delivery_confirmation' | 'login';
  expiresAt: Date;
  isUsed: boolean;
  orderId?: string;
  createdAt: Date;
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

export interface AuthRequest extends Request {
  user?: IUser;
}

// Type helper for route handlers
export type AuthRequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void> | void;

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters extends PaginationQuery {
  status?: string;
  vendorId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RobotLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  robotId: string;
  orderId?: string;
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'order_update' | 'delivery_update' | 'system' | 'promotion';
  data?: any;
}
