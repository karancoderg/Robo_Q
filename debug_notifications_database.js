#!/usr/bin/env node

const http = require('http');

console.log('🔍 NOTIFICATION DATABASE DEBUG: Checking if notifications are saved');
console.log('=' .repeat(70));

// Test the complete flow: Get orders -> Approve order -> Check notifications
async function debugNotificationFlow() {
  console.log('📋 STEP 1: Getting vendor orders to find one to approve...\n');
  
  const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';
  
  try {
    // Step 1: Get vendor orders
    const orders = await makeRequest('GET', '/api/vendor/orders', vendorToken);
    
    if (!orders.success || !orders.data.orders || orders.data.orders.length === 0) {
      console.log('❌ No orders found for vendor');
      return;
    }
    
    console.log(`✅ Found ${orders.data.orders.length} orders`);
    
    // Find a pending order to approve
    const pendingOrder = orders.data.orders.find(order => order.status === 'pending');
    
    if (!pendingOrder) {
      console.log('❌ No pending orders found to approve');
      console.log('📋 Available orders:');
      orders.data.orders.forEach(order => {
        console.log(`   Order ${order._id}: Status = ${order.status}, User = ${order.userId?._id || order.userId}`);
      });
      return;
    }
    
    console.log(`\n📋 STEP 2: Found pending order to approve:`);
    console.log(`   Order ID: ${pendingOrder._id}`);
    console.log(`   Customer ID: ${pendingOrder.userId?._id || pendingOrder.userId}`);
    console.log(`   Customer Name: ${pendingOrder.userId?.name || 'Unknown'}`);
    console.log(`   Customer Email: ${pendingOrder.userId?.email || 'Unknown'}`);
    console.log(`   Status: ${pendingOrder.status}`);
    console.log(`   Total: ₹${pendingOrder.totalAmount}`);
    
    const customerId = pendingOrder.userId?._id || pendingOrder.userId;
    
    // Step 2: Check notifications BEFORE approval
    console.log(`\n📋 STEP 3: Checking notifications BEFORE approval for user ${customerId}...\n`);
    const notificationsBefore = await makeRequest('GET', '/api/notifications?limit=10', 
      `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0NzgwNiwiZXhwIjoxNzU2ODUyNjA2fQ.oaWDT91dmYzvMFAWqoAJvbJq4E5-viRF2dsuBV-YBPs`);
    
    if (notificationsBefore.success) {
      console.log(`📊 Notifications BEFORE approval: ${notificationsBefore.data.notifications.length}`);
      if (notificationsBefore.data.notifications.length > 0) {
        console.log('   Recent notifications:');
        notificationsBefore.data.notifications.slice(0, 3).forEach(notif => {
          console.log(`   - ${notif.title} (${new Date(notif.createdAt).toLocaleString()})`);
        });
      }
    }
    
    // Step 3: Approve the order
    console.log(`\n📋 STEP 4: Approving order ${pendingOrder._id}...\n`);
    const approvalResult = await makeRequest('PUT', `/api/vendor/orders/${pendingOrder._id}/approve`, vendorToken);
    
    if (!approvalResult.success) {
      console.log('❌ Order approval failed:', approvalResult.message);
      return;
    }
    
    console.log('✅ Order approved successfully!');
    console.log(`   New status: ${approvalResult.data.order.status}`);
    
    // Wait a moment for notification to be processed
    console.log('\n⏳ Waiting 2 seconds for notification to be processed...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Check notifications AFTER approval
    console.log(`📋 STEP 5: Checking notifications AFTER approval for user ${customerId}...\n`);
    const notificationsAfter = await makeRequest('GET', '/api/notifications?limit=10', 
      `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0NzgwNiwiZXhwIjoxNzU2ODUyNjA2fQ.oaWDT91dmYzvMFAWqoAJvbJq4E5-viRF2dsuBV-YBPs`);
    
    if (notificationsAfter.success) {
      console.log(`📊 Notifications AFTER approval: ${notificationsAfter.data.notifications.length}`);
      
      // Check if new notification was added
      const newNotificationCount = notificationsAfter.data.notifications.length - (notificationsBefore.success ? notificationsBefore.data.notifications.length : 0);
      
      if (newNotificationCount > 0) {
        console.log(`🎉 SUCCESS: ${newNotificationCount} new notification(s) created!`);
        console.log('\n📋 New notifications:');
        notificationsAfter.data.notifications.slice(0, newNotificationCount).forEach(notif => {
          console.log(`   ✅ ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      Type: ${notif.type}`);
          console.log(`      Created: ${new Date(notif.createdAt).toLocaleString()}`);
          console.log(`      Read: ${notif.read}`);
          if (notif.data) {
            console.log(`      Order ID: ${notif.data.orderId}`);
            console.log(`      Status: ${notif.data.status}`);
          }
        });
      } else {
        console.log('❌ PROBLEM: No new notifications were created!');
        console.log('\n🔍 DEBUGGING INFO:');
        console.log(`   Order approved for user: ${customerId}`);
        console.log(`   Notification service should have been called`);
        console.log(`   Check server logs for notification errors`);
      }
      
      console.log('\n📋 All current notifications:');
      notificationsAfter.data.notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} - ${new Date(notif.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('❌ Failed to fetch notifications after approval:', notificationsAfter.message);
    }
    
    // Step 5: Check database directly via API
    console.log(`\n📋 STEP 6: Summary and recommendations...\n`);
    
    if (newNotificationCount > 0) {
      console.log('🎉 NOTIFICATION SYSTEM IS WORKING!');
      console.log('✅ Notifications are being saved to database');
      console.log('✅ Order approval triggers notifications');
      console.log('\n💡 If you\'re not receiving notifications in the frontend:');
      console.log('   1. Check if Socket.IO is connected in browser console');
      console.log('   2. Verify user is joined to the correct room');
      console.log('   3. Check browser notifications permissions');
    } else {
      console.log('❌ NOTIFICATION SYSTEM HAS ISSUES!');
      console.log('❌ Notifications are NOT being saved to database');
      console.log('\n🔍 Possible causes:');
      console.log('   1. NotificationService.notifyOrderStatusChange() is failing');
      console.log('   2. Database connection issues');
      console.log('   3. User ID mismatch in order population');
      console.log('   4. Error in notification service implementation');
    }
    
  } catch (error) {
    console.error('❌ Debug flow error:', error.message);
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

// Run the debug flow
debugNotificationFlow();
