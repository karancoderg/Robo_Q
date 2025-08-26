import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems,
  toggleItemAvailability,
  getCategories
} from '../controllers/itemController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', optionalAuth as any, getItems as any);
router.get('/categories', getCategories as any);
router.get('/:itemId', getItemById as any);

// Protected routes
router.use(authenticate as any);

// Vendor-only routes
router.post('/', authorize('vendor') as any, validate(schemas.createItem), createItem as any);
router.get('/vendor/me', authorize('vendor') as any, getMyItems as any);
router.put('/:itemId', authorize('vendor') as any, updateItem as any);
router.delete('/:itemId', authorize('vendor') as any, deleteItem as any);
router.patch('/:itemId/toggle-availability', authorize('vendor') as any, toggleItemAvailability as any);

export default router;
