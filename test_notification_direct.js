#!/usr/bin/env node

const http = require('http');

console.log('🔍 DIRECT NOTIFICATION TEST: Testing notification creation directly');
console.log('=' .repeat(70));

async function testNotificationDirect() {
  try {
    // Get a pending order first
    console.log('📋 STEP 1: Getting a pending order to approve...\n');
    
    const userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0NzgwNiwiZXhwIjoxNzU2ODUyNjA2fQ.oaWDT91dmYzvMFAWqoAJvbJq4E5-viRF2dsuBV-YBPs';
    const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';
    
    // Get user orders to find a pending one
    const userOrders = await makeRequest('GET', '/api/orders', userToken);
    
    if (!userOrders.success || !userOrders.data.orders) {
      console.log('❌ Failed to get user orders');
      return;
    }
    
    const pendingOrder = userOrders.data.orders.find(order => order.status === 'pending');
    
    if (!pendingOrder) {
      console.log('❌ No pending orders found');
      console.log('📋 Available orders:');
      userOrders.data.orders.slice(0, 5).forEach(order => {
        console.log(`   Order ${order._id}: ${order.status}`);
      });
      return;
    }
    
    console.log(`✅ Found pending order: ${pendingOrder._id}`);
    console.log(`   User ID: ${pendingOrder.userId}`);
    console.log(`   Status: ${pendingOrder.status}`);
    console.log(`   Total: ₹${pendingOrder.totalAmount}`);
    
    // Check notifications BEFORE approval
    console.log('\\n📋 STEP 2: Checking notifications BEFORE approval...');
    const notificationsBefore = await makeRequest('GET', '/api/notifications?limit=5', userToken);
    const beforeCount = notificationsBefore.success ? notificationsBefore.data.notifications.length : 0;
    console.log(`   Notifications before: ${beforeCount}`);
    
    // Now approve the order using vendor token
    console.log('\\n📋 STEP 3: Approving the order...');
    
    // First, let's get vendor orders to make sure we can approve
    const vendorOrders = await makeRequest('GET', '/api/vendor/orders', vendorToken);
    
    if (!vendorOrders.success) {
      console.log('❌ Failed to get vendor orders:', vendorOrders.message);
      return;
    }
    
    console.log(`✅ Vendor has ${vendorOrders.data.orders.length} orders`);
    
    // Find the same order in vendor's list
    const vendorOrder = vendorOrders.data.orders.find(order => order._id === pendingOrder._id);
    
    if (!vendorOrder) {
      console.log('❌ Order not found in vendor orders');
      return;
    }
    
    console.log(`✅ Found order in vendor list: ${vendorOrder._id}`);
    console.log(`   Customer: ${vendorOrder.userId?.name || 'Unknown'}`);
    console.log(`   Customer ID: ${vendorOrder.userId?._id || vendorOrder.userId}`);
    
    // Approve the order
    const approvalResult = await makeRequest('PUT', `/api/vendor/orders/${pendingOrder._id}/approve`, vendorToken);
    
    if (!approvalResult.success) {
      console.log('❌ Order approval failed:', approvalResult.message);
      return;
    }
    
    console.log('✅ Order approved successfully!');
    console.log(`   New status: ${approvalResult.data.order.status}`);
    
    // Wait for notification processing
    console.log('\\n⏳ Waiting 3 seconds for notification processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check notifications AFTER approval
    console.log('\\n📋 STEP 4: Checking notifications AFTER approval...');
    const notificationsAfter = await makeRequest('GET', '/api/notifications?limit=10', userToken);
    
    if (notificationsAfter.success) {
      const afterCount = notificationsAfter.data.notifications.length;
      console.log(`   Notifications after: ${afterCount}`);
      
      const newNotifications = afterCount - beforeCount;
      
      if (newNotifications > 0) {
        console.log(`\\n🎉 SUCCESS: ${newNotifications} new notification(s) created!`);
        
        // Show the new notifications
        notificationsAfter.data.notifications.slice(0, newNotifications).forEach(notif => {
          console.log(`\\n   ✅ NEW NOTIFICATION:`);
          console.log(`      Title: ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      Type: ${notif.type}`);
          console.log(`      Created: ${new Date(notif.createdAt).toLocaleString()}`);
          console.log(`      User ID: ${notif.userId}`);
          if (notif.data) {
            console.log(`      Order ID: ${notif.data.orderId}`);
            console.log(`      Status: ${notif.data.status}`);
          }
        });
        
        console.log('\\n🎉 NOTIFICATION SYSTEM IS WORKING!');
        console.log('✅ Notifications are being saved to database');
        console.log('✅ Order approval triggers notifications correctly');
        
      } else {
        console.log('\\n❌ PROBLEM: No new notifications were created!');
        console.log('\\n🔍 This means the notification service is failing silently');
        console.log('   Possible causes:');
        console.log('   1. NotificationService.notifyOrderStatusChange() is not being called');
        console.log('   2. Error in notification service but not being logged');
        console.log('   3. Database save operation is failing');
        console.log('   4. User ID mismatch between order and notification');
        
        // Let's check the server logs
        console.log('\\n📋 Check the server console for any error messages');
        console.log('   Look for: "✅ Notification service called successfully"');
        console.log('   Or: "❌ Failed to send approval notification:"');
      }
    } else {
      console.log('❌ Failed to fetch notifications after approval');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, path, authToken, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (authToken) {
      options.headers.Authorization = authToken;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          resolve({ success: false, message: 'Invalid JSON response', data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, message: error.message });
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Run the test
testNotificationDirect();
