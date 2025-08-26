import { Server } from 'socket.io';
import emailService from './emailService';
import smsService from './smsService';
import User from '../models/User';
import { NotificationPayload } from '../types';
import { logger } from '../config/logger';

class NotificationService {
  private io: Server | null = null;

  setSocketIO(io: Server) {
    this.io = io;
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Send real-time notification via WebSocket
      if (this.io) {
        this.io.to(`user_${payload.userId}`).emit('notification', payload);
      }

      // Get user details for email/SMS
      const user = await User.findById(payload.userId);
      if (!user) {
        logger.warn(`User not found for notification: ${payload.userId}`);
        return;
      }

      // Send email notification for important updates
      if (payload.type === 'order_update' || payload.type === 'delivery_update') {
        await emailService.sendOrderNotification(user.email, payload.data);
      }

      // Send SMS notification if phone number is available
      if (user.phone && (payload.type === 'delivery_update' || payload.type === 'order_update')) {
        await smsService.sendOrderNotification(user.phone, payload.data);
      }

      logger.info(`Notification sent to user ${payload.userId}: ${payload.title}`);
    } catch (error) {
      logger.error('Failed to send notification:', error);
    }
  }

  async sendOrderStatusUpdate(orderId: string, userId: string, status: string, orderData: any): Promise<void> {
    const statusMessages = {
      'vendor_approved': 'Your order has been approved by the vendor!',
      'vendor_rejected': 'Your order has been rejected by the vendor.',
      'robot_assigned': 'A robot has been assigned to your order.',
      'robot_picking_up': 'Robot is picking up your order from the vendor.',
      'robot_delivering': 'Robot is on the way to deliver your order!',
      'delivered': 'Your order has been delivered successfully!',
      'cancelled': 'Your order has been cancelled.'
    };

    const payload: NotificationPayload = {
      userId,
      title: 'Order Update',
      message: statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`,
      type: 'order_update',
      data: { ...orderData, orderId }
    };

    await this.sendNotification(payload);
  }

  async sendDeliveryOTP(userId: string, otp: string, orderId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    // Send OTP via email
    await emailService.sendOTP(user.email, otp, 'delivery_confirmation');

    // Send OTP via SMS if phone is available
    if (user.phone) {
      await smsService.sendOTP(user.phone, otp, 'delivery_confirmation');
    }

    // Send real-time notification
    const payload: NotificationPayload = {
      userId,
      title: 'Delivery Confirmation',
      message: `Your delivery OTP is: ${otp}`,
      type: 'delivery_update',
      data: { otp, orderId }
    };

    await this.sendNotification(payload);
  }

  async sendWelcomeNotification(userId: string): Promise<void> {
    const payload: NotificationPayload = {
      userId,
      title: 'Welcome to Delivery Robot!',
      message: 'Your account has been created successfully. Start ordering now!',
      type: 'system',
      data: {}
    };

    await this.sendNotification(payload);
  }

  async broadcastRobotLocation(robotId: string, location: { lat: number; lng: number }): Promise<void> {
    if (this.io) {
      this.io.emit('robot_location_update', {
        robotId,
        location,
        timestamp: new Date()
      });
    }
  }
}

export default new NotificationService();
