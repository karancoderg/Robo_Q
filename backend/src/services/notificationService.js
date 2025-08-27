const mongoose = require('mongoose');

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['order_update', 'delivery_update', 'system', 'promotion', 'vendor_order'], 
    required: true 
  },
  data: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send notification to user
  async sendNotification(userId, notification) {
    try {
      // Handle case where userId might be a populated user object
      const actualUserId = userId._id || userId;
      
      console.log(`🔔 Sending notification to user ${actualUserId}:`, notification.title);
      
      // Save to database
      const newNotification = new Notification({
        userId: actualUserId,
        ...notification
      });
      await newNotification.save();
      console.log(`💾 Notification saved to database with ID: ${newNotification._id}`);

      // Send via socket if user is connected
      const roomName = `user_${actualUserId}`;
      console.log(`📡 Emitting notification to room: ${roomName}`);
      this.io.to(roomName).emit('notification', notification);

      console.log(`✅ Notification sent successfully to user ${actualUserId}: ${notification.title}`);
      return newNotification;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      console.error('❌ Error details:', error.message);
    }
  }

  // Order status change notifications for customers
  async notifyOrderStatusChange(order, newStatus, oldStatus) {
    const notifications = {
      'vendor_approved': {
        title: '✅ Order Approved!',
        message: `Your order from ${order.vendorId.businessName} has been approved and is being prepared.`,
        type: 'order_update'
      },
      'vendor_rejected': {
        title: '❌ Order Rejected',
        message: `Unfortunately, your order from ${order.vendorId.businessName} has been rejected. You will be refunded shortly.`,
        type: 'order_update'
      },
      'robot_assigned': {
        title: '🤖 Robot Assigned!',
        message: `A delivery robot has been assigned to your order from ${order.vendorId.businessName}.`,
        type: 'delivery_update'
      },
      'robot_picking_up': {
        title: '📦 Order Being Picked Up',
        message: `Your order from ${order.vendorId.businessName} is being picked up by our delivery robot.`,
        type: 'delivery_update'
      },
      'robot_delivering': {
        title: '🚚 Out for Delivery!',
        message: `Your order from ${order.vendorId.businessName} is on its way to you!`,
        type: 'delivery_update'
      },
      'delivered': {
        title: '🎉 Order Delivered!',
        message: `Your order from ${order.vendorId.businessName} has been successfully delivered. Enjoy your meal!`,
        type: 'delivery_update'
      },
      'cancelled': {
        title: '❌ Order Cancelled',
        message: `Your order from ${order.vendorId.businessName} has been cancelled.`,
        type: 'order_update'
      }
    };

    const notification = notifications[newStatus];
    if (notification) {
      console.log('🔔 Sending order status notification:', newStatus);
      
      await this.sendNotification(order.userId, {
        ...notification,
        data: {
          orderId: order._id,
          orderTotal: order.totalAmount,
          vendorName: order.vendorId.businessName,
          status: newStatus,
          previousStatus: oldStatus
        }
      });
    } else {
      console.log('❌ No notification template found for status:', newStatus);
    }
  }

  // New order notifications for vendors
  async notifyVendorNewOrder(order) {
    await this.sendNotification(order.vendorId._id, {
      title: '🔔 New Order Received!',
      message: `New order #${order._id.toString().slice(-6)} for ₹${order.totalAmount} with ${order.items.length} item(s).`,
      type: 'vendor_order',
      data: {
        orderId: order._id,
        orderTotal: order.totalAmount,
        itemCount: order.items.length,
        customerAddress: order.deliveryAddress.name || order.deliveryAddress.fullAddress,
        items: order.items.map(item => `${item.name} (${item.quantity})`)
      }
    });
  }

  // Order completion notifications for vendors
  async notifyVendorOrderCompleted(order) {
    await this.sendNotification(order.vendorId._id, {
      title: '✅ Order Completed!',
      message: `Order #${order._id.toString().slice(-6)} has been successfully delivered to the customer.`,
      type: 'vendor_order',
      data: {
        orderId: order._id,
        orderTotal: order.totalAmount,
        completedAt: new Date()
      }
    });
  }

  // Payment notifications
  async notifyPaymentReceived(userId, order) {
    await this.sendNotification(userId, {
      title: '💳 Payment Confirmed',
      message: `Payment of ₹${order.totalAmount} for your order has been confirmed.`,
      type: 'order_update',
      data: {
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: 'Online'
      }
    });
  }

  // Promotional notifications
  async notifyPromotion(userId, promotion) {
    await this.sendNotification(userId, {
      title: '🎉 Special Offer!',
      message: promotion.message,
      type: 'promotion',
      data: promotion.data
    });
  }

  // System notifications
  async notifySystemUpdate(userId, message) {
    await this.sendNotification(userId, {
      title: '📢 System Update',
      message: message,
      type: 'system'
    });
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
        
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany({ userId, read: false }, { read: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Delete old notifications (cleanup)
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true
      });
      
      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

module.exports = { NotificationService, Notification };
