import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

/**
 * Create error helper function
 */
const createError = (message: string, statusCode: number) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  return error;
};

/**
 * Middleware to check if user has completed setup
 * Redirects incomplete users to setup page
 */
export const requireSetupCompletion = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return next(createError('Authentication required', 401));
  }
  
  // Check if user has completed setup
  if (!user.setupCompleted) {
    return res.status(403).json({
      success: false,
      message: 'Setup completion required',
      data: {
        needsSetup: true,
        redirectTo: '/complete-setup'
      }
    });
  }
  
  next();
};

/**
 * Middleware to allow only incomplete setup users
 * Used for setup-related endpoints
 */
export const requireIncompleteSetup = (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return next(createError('Authentication required', 401));
  }
  
  // Check if user has already completed setup
  if (user.setupCompleted) {
    return res.status(400).json({
      success: false,
      message: 'Setup already completed',
      data: {
        setupCompleted: true,
        redirectTo: '/dashboard'
      }
    });
  }
  
  next();
};
