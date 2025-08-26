import crypto from 'crypto';
import OTP from '../models/OTP';
import { IOTP } from '../types';

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

export const generateSecureOTP = (length: number = 6): string => {
  const buffer = crypto.randomBytes(length);
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += (buffer[i] % 10).toString();
  }
  
  return otp;
};

export const createOTP = async (
  userId: string,
  type: IOTP['type'],
  expiryMinutes: number = 10,
  orderId?: string
): Promise<string> => {
  // Invalidate any existing OTPs of the same type for this user
  await OTP.updateMany(
    { userId, type, isUsed: false },
    { isUsed: true }
  );

  const otp = generateSecureOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await OTP.create({
    userId,
    otp,
    type,
    expiresAt,
    orderId
  });

  return otp;
};

export const verifyOTP = async (
  userId: string,
  otp: string,
  type: IOTP['type'],
  orderId?: string
): Promise<boolean> => {
  const query: any = {
    userId,
    otp,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  };

  if (orderId) {
    query.orderId = orderId;
  }

  const otpDoc = await OTP.findOne(query);

  if (!otpDoc) {
    return false;
  }

  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  return true;
};

export const isOTPValid = async (
  userId: string,
  otp: string,
  type: IOTP['type'],
  orderId?: string
): Promise<boolean> => {
  const query: any = {
    userId,
    otp,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  };

  if (orderId) {
    query.orderId = orderId;
  }

  const otpDoc = await OTP.findOne(query);
  return !!otpDoc;
};
