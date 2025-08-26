import { Router } from 'express';
import robotService from '../services/robotService';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Get all robots (admin only)
router.get('/', authorize('admin') as any, asyncHandler(async (req: any, res: any) => {
  const robots = await robotService.getAllRobots();
  
  res.json({
    success: true,
    data: { robots }
  });
}));

// Get robot status
router.get('/:robotId', asyncHandler(async (req: any, res: any) => {
  const { robotId } = req.params;
  const robot = await robotService.getRobotStatus(robotId);
  
  if (!robot) {
    return res.status(404).json({
      success: false,
      message: 'Robot not found'
    });
  }
  
  res.json({
    success: true,
    data: { robot }
  });
}));

// Update robot location (robot API or admin)
router.put('/:robotId/location', authorize('admin') as any, asyncHandler(async (req: any, res: any) => {
  const { robotId } = req.params;
  const { lat, lng } = req.body;
  
  const robot = await robotService.updateRobotLocation(robotId, { lat, lng });
  
  if (!robot) {
    return res.status(404).json({
      success: false,
      message: 'Robot not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Robot location updated successfully',
    data: { robot }
  });
}));

export default router;
