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

async function testNotificationSystem() {
  try {
    console.log('🔍 TESTING NOTIFICATION SYSTEM');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/robo_q');
    console.log('✅ Connected to MongoDB');

    // Initialize notification service
    const notificationService = new NotificationService(mockIO);
    console.log('✅ NotificationService initialized');

    // Test user ID (replace with actual user ID)
    const testUserId = '68ae1977e09b92032d3a08d8';

    // Test notification
    console.log('\n📢 Testing Order Approved Notification...');
    
    const mockOrder = {
      _id: '68ae4d1f1c5970ac46725e56',
      userId: testUserId,
      totalAmount: 299,
      vendorId: {
        businessName: 'Burger Kingdom',
        _id: 'vendor123'
      },
      items: [
        { name: 'Cheeseburger', quantity: 1 }
      ]
    };

    // Test order approved notification
    await notificationService.notifyOrderStatusChange(mockOrder, 'vendor_approved', 'pending');
    
    console.log('\n📋 Checking saved notifications...');
    const notifications = await notificationService.getUserNotifications(testUserId, 5);
    console.log(`Found ${notifications.length} notifications for user`);
    
    if (notifications.length > 0) {
      console.log('\n📝 Latest notification:');
      const latest = notifications[0];
      console.log(`  Title: ${latest.title}`);
      console.log(`  Message: ${latest.message}`);
      console.log(`  Type: ${latest.type}`);
      console.log(`  Read: ${latest.read}`);
      console.log(`  Created: ${latest.createdAt}`);
    }

    console.log('\n✅ Notification test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testNotificationSystem();
