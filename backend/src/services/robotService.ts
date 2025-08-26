import Robot from '../models/Robot';
import Order from '../models/Order';
import notificationService from './notificationService';
import { logger } from '../config/logger';

class RobotService {
  private mockMode: boolean;

  constructor() {
    this.mockMode = process.env.MOCK_MODE === 'true';
  }

  async assignRobotToOrder(orderId: string): Promise<boolean> {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        logger.error(`Order not found: ${orderId}`);
        return false;
      }

      // Find available robot
      const robot = await Robot.findOne({
        status: 'idle',
        batteryLevel: { $gt: 20 }
      });

      if (!robot) {
        logger.warn('No available robots found');
        return false;
      }

      // Assign robot to order
      robot.status = 'assigned';
      robot.assignedOrderId = orderId;
      await robot.save();

      // Update order status
      order.status = 'robot_assigned';
      order.robotId = robot._id;
      await order.save();

      // Send notification
      await notificationService.sendOrderStatusUpdate(
        orderId,
        order.userId,
        'robot_assigned',
        order
      );

      logger.info(`Robot ${robot.name} assigned to order ${orderId}`);

      // Start pickup process in mock mode
      if (this.mockMode) {
        setTimeout(() => this.simulatePickup(orderId), 2000);
      }

      return true;
    } catch (error) {
      logger.error('Failed to assign robot to order:', error);
      return false;
    }
  }

  async simulatePickup(orderId: string): Promise<void> {
    try {
      const order = await Order.findById(orderId);
      const robot = await Robot.findById(order?.robotId);

      if (!order || !robot) return;

      // Update status to picking up
      robot.status = 'picking_up';
      order.status = 'robot_picking_up';
      
      await robot.save();
      await order.save();

      await notificationService.sendOrderStatusUpdate(
        orderId,
        order.userId,
        'robot_picking_up',
        order
      );

      logger.info(`Robot ${robot.name} started picking up order ${orderId}`);

      // Simulate pickup completion
      setTimeout(() => this.simulateDelivery(orderId), 5000);
    } catch (error) {
      logger.error('Failed to simulate pickup:', error);
    }
  }

  async simulateDelivery(orderId: string): Promise<void> {
    try {
      const order = await Order.findById(orderId);
      const robot = await Robot.findById(order?.robotId);

      if (!order || !robot) return;

      // Update status to delivering
      robot.status = 'delivering';
      order.status = 'robot_delivering';
      
      // Set estimated delivery time
      order.estimatedDeliveryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await robot.save();
      await order.save();

      await notificationService.sendOrderStatusUpdate(
        orderId,
        order.userId,
        'robot_delivering',
        order
      );

      // Send delivery OTP
      if (order.deliveryOTP) {
        await notificationService.sendDeliveryOTP(
          order.userId,
          order.deliveryOTP,
          orderId
        );
      }

      logger.info(`Robot ${robot.name} started delivering order ${orderId}`);

      // Simulate location updates during delivery
      this.simulateLocationUpdates(robot._id, orderId);
    } catch (error) {
      logger.error('Failed to simulate delivery:', error);
    }
  }

  async simulateLocationUpdates(robotId: string, orderId: string): Promise<void> {
    const updateInterval = setInterval(async () => {
      try {
        const robot = await Robot.findById(robotId);
        const order = await Order.findById(orderId);

        if (!robot || !order || order.status !== 'robot_delivering') {
          clearInterval(updateInterval);
          return;
        }

        // Simulate movement towards delivery location
        const targetLat = order.deliveryAddress.coordinates.lat;
        const targetLng = order.deliveryAddress.coordinates.lng;
        
        // Move robot slightly towards target
        const currentLat = robot.currentLocation.lat;
        const currentLng = robot.currentLocation.lng;
        
        const latDiff = (targetLat - currentLat) * 0.1;
        const lngDiff = (targetLng - currentLng) * 0.1;
        
        robot.currentLocation.lat += latDiff;
        robot.currentLocation.lng += lngDiff;
        
        await robot.save();

        // Broadcast location update
        await notificationService.broadcastRobotLocation(robotId, robot.currentLocation);

        // Check if robot reached destination (within 0.001 degrees)
        const distance = Math.sqrt(
          Math.pow(targetLat - robot.currentLocation.lat, 2) +
          Math.pow(targetLng - robot.currentLocation.lng, 2)
        );

        if (distance < 0.001) {
          clearInterval(updateInterval);
          logger.info(`Robot ${robot.name} reached delivery location for order ${orderId}`);
        }
      } catch (error) {
        logger.error('Error in location update simulation:', error);
        clearInterval(updateInterval);
      }
    }, 3000); // Update every 3 seconds
  }

  async completeDelivery(orderId: string, otp: string): Promise<boolean> {
    try {
      const order = await Order.findById(orderId);
      if (!order) return false;

      // Verify OTP
      if (order.deliveryOTP !== otp || !order.otpExpiresAt || order.otpExpiresAt < new Date()) {
        return false;
      }

      const robot = await Robot.findById(order.robotId);
      if (!robot) return false;

      // Update order status
      order.status = 'delivered';
      order.actualDeliveryTime = new Date();
      order.deliveryOTP = undefined;
      order.otpExpiresAt = undefined;
      await order.save();

      // Update robot status
      robot.status = 'idle';
      robot.assignedOrderId = undefined;
      robot.currentLoad = { weight: 0, volume: 0 };
      await robot.save();

      // Send completion notification
      await notificationService.sendOrderStatusUpdate(
        orderId,
        order.userId,
        'delivered',
        order
      );

      logger.info(`Order ${orderId} delivered successfully by robot ${robot.name}`);
      return true;
    } catch (error) {
      logger.error('Failed to complete delivery:', error);
      return false;
    }
  }

  async getRobotStatus(robotId: string) {
    return await Robot.findById(robotId);
  }

  async getAllRobots() {
    return await Robot.find({});
  }

  async updateRobotLocation(robotId: string, location: { lat: number; lng: number }) {
    const robot = await Robot.findById(robotId);
    if (robot) {
      robot.currentLocation = location;
      await robot.save();
      
      // Broadcast location update
      await notificationService.broadcastRobotLocation(robotId, location);
      
      return robot;
    }
    return null;
  }
}

export default new RobotService();
