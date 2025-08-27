#!/usr/bin/env node

const mongoose = require('mongoose');
const { NotificationService } = require('./backend/src/services/notificationService');

// Mock Socket.IO for testing
const mockIO = {
  to: (room) => ({
    emit: (event, data) => {
      console.log(`📡 Socket.IO: Emitting '${event}' to room '${room}'`);
      console.log('📦 Data:', JSON.stringify(data, null, 2));
    }
  })
};

async function triggerTestNotification() {
  try {
    console.log('🧪 MANUAL NOTIFICATION TRIGGER TEST');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/robo_q');
    console.log('✅ Connected to MongoDB');

    // Initialize notification service
    const notificationService = new NotificationService(mockIO);
    console.log('✅ NotificationService initialized');

    // Your actual user ID from the JWT token
    const userId = '68ae1977e09b92032d3a08d8';

    console.log('\n📢 Triggering test notification...');
    
    // Send a test notification
    await notificationService.sendNotification(userId, {
      title: 'Test Order Approved! 🎉',
      message: 'Your order from Burger Kingdom has been approved and is being prepared.',
      type: 'order_update',
      data: {
        orderId: 'test-order-123',
        orderTotal: 299,
        vendorName: 'Burger Kingdom'
      }
    });

    console.log('\n📋 Checking notifications in database...');
    
    // Check if notification was saved
    const notifications = await notificationService.getUserNotifications(userId, 5);
    console.log(`✅ Found ${notifications.length} notifications for user`);
    
    if (notifications.length > 0) {
      const latest = notifications[0];
      console.log('\n📝 Latest notification:');
      console.log(`  Title: ${latest.title}`);
      console.log(`  Message: ${latest.message}`);
      console.log(`  Type: ${latest.type}`);
      console.log(`  Read: ${latest.read}`);
      console.log(`  Created: ${latest.createdAt}`);
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Refresh your browser');
    console.log('2. Check the notification bell icon in header');
    console.log('3. Look for the red badge with notification count');
    console.log('4. Click the bell to see the notification dropdown');

    console.log('\n✅ Test notification sent successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

triggerTestNotification();
