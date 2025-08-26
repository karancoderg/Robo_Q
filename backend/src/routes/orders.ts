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
router.use(authenticate);

// User routes
router.post('/', authorize('user'), validate(schemas.createOrder), createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/cancel', authorize('user'), cancelOrder);
router.post('/:orderId/confirm-delivery', authorize('user'), validate(schemas.confirmDelivery), confirmDelivery);
router.get('/:orderId/tracking', authorize('user'), getOrderTracking);

// Vendor routes
router.put('/:orderId/status', authorize('vendor'), validate(schemas.updateOrderStatus), updateOrderStatus);

export default router;
