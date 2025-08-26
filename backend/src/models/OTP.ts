import mongoose, { Schema } from 'mongoose';
import { IOTP } from '../types';

const otpSchema = new Schema<IOTP>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'phone_verification', 'delivery_confirmation', 'login'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: String,
    ref: 'Order',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
otpSchema.index({ userId: 1, type: 1, isUsed: 1 });
otpSchema.index({ otp: 1, type: 1, isUsed: 1 });

export default mongoose.model<IOTP>('OTP', otpSchema);
