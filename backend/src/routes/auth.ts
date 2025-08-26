import { Router } from 'express';
// import passport from 'passport';
import {
  register,
  login,
  loginWithOTP,
  verifyLoginOTP,
  verifyEmail,
  resendOTP,
  getProfile,
  updateProfile,
  changePassword,
  googleTokenAuth,
  refreshToken
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/login/otp', loginWithOTP);
router.post('/login/otp/verify', validate(schemas.verifyLoginOTP), verifyLoginOTP);
router.post('/refresh-token', refreshToken);

// Google OAuth routes (temporarily disabled)
// router.get('/google', 
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
//   googleCallback
// );

// Protected routes
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/verify-email', validate(schemas.verifyOTP), verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/change-password', changePassword);

// Export router
export default router;
