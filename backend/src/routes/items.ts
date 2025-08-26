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
router.get('/', optionalAuth, getItems);
router.get('/categories', getCategories);
router.get('/:itemId', getItemById);

// Protected routes
router.use(authenticate);

// Vendor-only routes
router.post('/', authorize('vendor'), validate(schemas.createItem), createItem);
router.get('/vendor/me', authorize('vendor'), getMyItems);
router.put('/:itemId', authorize('vendor'), updateItem);
router.delete('/:itemId', authorize('vendor'), deleteItem);
router.patch('/:itemId/toggle-availability', authorize('vendor'), toggleItemAvailability);

export default router;
