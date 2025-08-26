import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const orderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  vendorId: {
    type: String,
    required: true,
    ref: 'Vendor'
  },
  items: [{
    itemId: {
      type: String,
      required: true,
      ref: 'Item'
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'vendor_approved', 'vendor_rejected', 'robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  vendorAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  robotId: {
    type: String,
    ref: 'Robot',
    default: null
  },
  estimatedDeliveryTime: {
    type: Date,
    default: null
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  },
  deliveryOTP: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
orderSchema.index({ robotId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });

// Pre-save middleware to generate OTP when status changes to robot_delivering
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'robot_delivering') {
    // Generate 6-digit OTP
    this.deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
    // Set OTP expiry to 30 minutes from now
    this.otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema);
