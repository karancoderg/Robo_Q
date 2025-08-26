import { Router } from 'express';
import {
  createVendor,
  getVendorProfile,
  updateVendorProfile,
  getAllVendors,
  getVendorById,
  getVendorItems,
  getVendorOrders,
  getVendorStats
} from '../controllers/vendorController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllVendors);
router.get('/:vendorId', getVendorById);
router.get('/:vendorId/items', getVendorItems);

// Protected routes
router.use(authenticate);

// Vendor-only routes
router.post('/', authorize('vendor'), validate(schemas.createVendor), createVendor);
router.get('/profile/me', authorize('vendor'), getVendorProfile);
router.put('/profile/me', authorize('vendor'), updateVendorProfile);
router.get('/orders/me', authorize('vendor'), getVendorOrders);
router.get('/stats/me', authorize('vendor'), getVendorStats);

export default router;
