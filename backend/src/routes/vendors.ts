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
router.get('/', optionalAuth as any, getAllVendors as any);
router.get('/:vendorId', getVendorById as any);
router.get('/:vendorId/items', getVendorItems as any);

// Protected routes
router.use(authenticate as any);

// Vendor-only routes
router.post('/', authorize('vendor') as any, validate(schemas.createVendor), createVendor as any);
router.get('/profile/me', authorize('vendor') as any, getVendorProfile as any);
router.put('/profile/me', authorize('vendor') as any, updateVendorProfile as any);
router.get('/orders/me', authorize('vendor') as any, getVendorOrders as any);
router.get('/stats/me', authorize('vendor') as any, getVendorStats as any);

export default router;
