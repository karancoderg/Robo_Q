import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { createOTP, verifyOTP } from '../utils/otp';
import emailService from '../services/emailService';
import smsService from '../services/smsService';
import notificationService from '../services/notificationService';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, IUser } from '../types';
import { logger } from '../config/logger';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    address
  });

  // Generate tokens
  const tokens = generateTokens(user);

  // Send verification OTP
  const otp = await createOTP(user._id, 'email_verification');
  await emailService.sendOTP(email, otp, 'email_verification');

  // Send welcome notification
  await notificationService.sendWelcomeNotification(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your email.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      ...tokens
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokens = generateTokens(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      ...tokens
    }
  });
});

export const loginWithOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createError('Invalid email address. Please check your email or register first.', 404);
  }

  // Generate and send OTP
  const otp = await createOTP(user._id, 'login');
  await emailService.sendOTP(email, otp, 'login');

  if (user.phone) {
    await smsService.sendOTP(user.phone, otp, 'login');
  }

  res.json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      userId: user._id,
      email: user.email
    }
  });
});

export const verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  const isValid = await verifyOTP(userId, otp, 'login');
  if (!isValid) {
    throw createError('Invalid or expired OTP', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  // Generate tokens
  const tokens = generateTokens(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      ...tokens
    }
  });
});

export const verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;
  const userId = req.user!._id;

  const isValid = await verifyOTP(userId, otp, 'email_verification');
  if (!isValid) {
    throw createError('Invalid or expired OTP', 400);
  }

  // Update user verification status
  await User.findByIdAndUpdate(userId, { isVerified: true });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

export const resendOTP = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type } = req.body;
  const user = req.user!;

  const otp = await createOTP(user._id, type);

  if (type === 'email_verification' || type === 'login') {
    await emailService.sendOTP(user.email, otp, type);
  }

  if (user.phone && (type === 'phone_verification' || type === 'login')) {
    await smsService.sendOTP(user.phone, otp, type);
  }

  res.json({
    success: true,
    message: 'OTP sent successfully'
  });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        address: user.address,
        createdAt: user.createdAt
      }
    }
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, address } = req.body;
  const userId = req.user!._id;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, phone, address },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser!._id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        phone: updatedUser!.phone,
        role: updatedUser!.role,
        isVerified: updatedUser!.isVerified,
        address: updatedUser!.address
      }
    }
  });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!._id;

  // Get user with password
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw createError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw createError('Invalid refresh token - user not found', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar
        },
        ...tokens
      }
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error);
    throw createError('Invalid or expired refresh token', 401);
  }
});

export const googleAuth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // This will be handled by Passport middleware
  // Just a placeholder for the route
  res.status(501).json({
    success: false,
    message: 'Google OAuth redirect flow not implemented'
  });
});

export const googleTokenAuth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body;
  
  if (!credential) {
    throw createError('Google credential is required', 400);
  }

  try {
    // Verify the Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw createError('Invalid Google token', 400);
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw createError('No email provided by Google', 400);
    }

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });
    
    if (user) {
      // User exists, generate tokens and return
      const tokens = generateTokens(user);
      
      logger.info(`Google login successful for existing user: ${email}`);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            setupCompleted: user.setupCompleted || false,
            avatar: user.avatar
          },
          isNewUser: false,
          needsSetup: !(user.setupCompleted || false), // Check if setup is needed
          ...tokens
        }
      });
      return;
    }
    
    // Check if user exists with the same email
    user = await User.findOne({ email });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isVerified = true;
      if (picture) user.avatar = picture;
      await user.save();
      
      const tokens = generateTokens(user);
      
      logger.info(`Google account linked to existing user: ${email}`);
      
      res.json({
        success: true,
        message: 'Account linked and login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            setupCompleted: user.setupCompleted || false,
            avatar: user.avatar
          },
          isNewUser: false,
          needsSetup: !(user.setupCompleted || false),
          ...tokens
        }
      });
      return;
    }
    
    // Create new user in PENDING SETUP state
    const newUser = await User.create({
      googleId,
      name: name || 'Google User',
      email,
      role: 'user', // Default role, can be changed during setup
      isVerified: true,
      setupCompleted: false, // KEY FIX: User needs to complete setup
      avatar: picture,
    });
    
    const tokens = generateTokens(newUser);
    
    logger.info(`New user created via Google OAuth: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Account created and login successful',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
          setupCompleted: newUser.setupCompleted,
          avatar: newUser.avatar
        },
        isNewUser: true,
        needsSetup: !newUser.setupCompleted, // Always true for new Google users
        ...tokens
      }
    });
    
  } catch (error: any) {
    logger.error('Google token verification error:', error);
    
    if (error.message.includes('Token used too early') || error.message.includes('Token used too late')) {
      throw createError('Google token has expired or is not yet valid', 400);
    }
    
    if (error.message.includes('Invalid token signature')) {
      throw createError('Invalid Google token signature', 400);
    }
    
    throw createError('Failed to verify Google token', 400);
  }
});

export const completeSetup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, businessInfo } = req.body;
  
  if (!email) {
    throw createError('Email is required for setup completion', 400);
  }
  
  if (!password || password.length < 6) {
    throw createError('Password must be at least 6 characters long', 400);
  }
  
  if (!role || !['user', 'vendor'].includes(role)) {
    throw createError('Valid role (user or vendor) is required', 400);
  }
  
  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      throw createError('User not found', 404);
    }
    
    if (user.setupCompleted) {
      throw createError('User setup already completed', 400);
    }
    
    // Update user with setup information
    user.password = password; // Will be hashed by pre-save middleware
    user.role = role;
    user.setupCompleted = true;
    
    // If vendor role, validate business info
    if (role === 'vendor' && businessInfo) {
      // Additional vendor setup can be handled here
      // For now, just mark setup as complete
    }
    
    await user.save();
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    logger.info(`Setup completed for user: ${email}`);
    
    res.json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          setupCompleted: user.setupCompleted,
          avatar: user.avatar
        },
        ...tokens
      }
    });
    
  } catch (error: any) {
    logger.error('Setup completion error:', error);
    throw createError('Failed to complete setup', 500);
  }
});
