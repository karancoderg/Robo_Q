import { Router } from 'express';
import { googleTokenAuth } from '../controllers/authController';

const router = Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Google auth route working' });
});

// Google token verification (for frontend)
router.post('/token', googleTokenAuth);

export default router;
