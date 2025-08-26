import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  confirmDelivery,
  getOrderTracking
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// User routes
router.post('/', authorize('user') as any, validate(schemas.createOrder), createOrder as any);
router.get('/my-orders', getMyOrders as any);
router.get('/:orderId', getOrderById as any);
router.post('/:orderId/cancel', authorize('user') as any, cancelOrder as any);
router.post('/:orderId/confirm-delivery', authorize('user') as any, validate(schemas.confirmDelivery), confirmDelivery as any);
router.get('/:orderId/tracking', authorize('user') as any, getOrderTracking as any);

// Vendor routes
router.put('/:orderId/status', authorize('vendor') as any, validate(schemas.updateOrderStatus), updateOrderStatus as any);

export default router;
