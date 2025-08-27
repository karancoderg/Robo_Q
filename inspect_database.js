#!/usr/bin/env node

const http = require('http');

console.log('🔍 DATABASE INSPECTION: Checking users, orders, and notifications');
console.log('=' .repeat(70));

async function inspectDatabase() {
  try {
    // Check if we can get any orders at all
    console.log('📋 STEP 1: Checking all orders in system...\n');
    
    const userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0NzgwNiwiZXhwIjoxNzU2ODUyNjA2fQ.oaWDT91dmYzvMFAWqoAJvbJq4E5-viRF2dsuBV-YBPs';
    
    // Try to get user orders
    const userOrders = await makeRequest('GET', '/api/orders', userToken);
    console.log('👤 User Orders Response:', userOrders.success ? 'SUCCESS' : 'FAILED');
    
    if (userOrders.success && userOrders.data && userOrders.data.orders) {
      console.log(`   Found ${userOrders.data.orders.length} orders for user`);
      userOrders.data.orders.forEach(order => {
        console.log(`   📦 Order ${order._id}:`);
        console.log(`      Status: ${order.status}`);
        console.log(`      User ID: ${order.userId}`);
        console.log(`      Vendor ID: ${order.vendorId}`);
        console.log(`      Total: ₹${order.totalAmount}`);
        console.log(`      Created: ${new Date(order.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('   No orders found for user or error occurred');
    }
    
    // Check notifications for this user
    console.log('\n📋 STEP 2: Checking notifications for user...\n');
    const notifications = await makeRequest('GET', '/api/notifications?limit=20', userToken);
    
    if (notifications.success && notifications.data && notifications.data.notifications) {
      console.log(`📊 Found ${notifications.data.notifications.length} notifications for user`);
      
      if (notifications.data.notifications.length > 0) {
        console.log('\n📋 Recent notifications:');
        notifications.data.notifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      Type: ${notif.type}`);
          console.log(`      Created: ${new Date(notif.createdAt).toLocaleString()}`);
          console.log(`      Read: ${notif.read}`);
          if (notif.data && notif.data.orderId) {
            console.log(`      Order ID: ${notif.data.orderId}`);
          }
          console.log('');
        });
      } else {
        console.log('   No notifications found');
      }
    } else {
      console.log('❌ Failed to fetch notifications:', notifications.message);
    }
    
    // Try to create a test order to see if notifications work
    console.log('📋 STEP 3: Creating a test order to check notification flow...\n');
    
    // First get available items
    const items = await makeRequest('GET', '/api/items?limit=5');
    
    if (items.success && items.data && items.data.items && items.data.items.length > 0) {
      console.log(`✅ Found ${items.data.items.length} available items`);
      
      const testItem = items.data.items[0];
      console.log(`   Using item: ${testItem.name} (₹${testItem.price})`);
      console.log(`   Vendor: ${testItem.vendorId?.businessName || 'Unknown'}`);
      
      // Create test order
      const orderData = {
        items: [{
          itemId: testItem._id,
          name: testItem.name,
          price: testItem.price,
          quantity: 1,
          totalPrice: testItem.price
        }],
        totalAmount: testItem.price,
        deliveryAddress: {
          street: "Test Street 123",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          coordinates: {
            lat: 31.7040,
            lng: 76.9194
          }
        },
        vendorAddress: {
          street: "Vendor Street 456",
          city: "Vendor City", 
          state: "Vendor State",
          zipCode: "67890",
          coordinates: {
            lat: 31.7040,
            lng: 76.9194
          }
        }
      };
      
      console.log('\n🛒 Creating test order...');
      const createOrderResult = await makeRequest('POST', '/api/orders', userToken, orderData);
      
      if (createOrderResult.success) {
        console.log('✅ Test order created successfully!');
        console.log(`   Order ID: ${createOrderResult.data.order._id}`);
        console.log(`   Status: ${createOrderResult.data.order.status}`);
        
        // Wait a moment and check for new notifications
        console.log('\n⏳ Waiting 2 seconds for notifications...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newNotifications = await makeRequest('GET', '/api/notifications?limit=5', userToken);
        
        if (newNotifications.success) {
          console.log(`\n📊 Notifications after order creation: ${newNotifications.data.notifications.length}`);
          
          // Check if any new notifications were created
          const recentNotifications = newNotifications.data.notifications.filter(notif => {
            const notifTime = new Date(notif.createdAt);
            const now = new Date();
            return (now - notifTime) < 10000; // Within last 10 seconds
          });
          
          if (recentNotifications.length > 0) {
            console.log(`🎉 Found ${recentNotifications.length} recent notification(s)!`);
            recentNotifications.forEach(notif => {
              console.log(`   ✅ ${notif.title}: ${notif.message}`);
            });
          } else {
            console.log('❌ No recent notifications found after order creation');
          }
        }
        
      } else {
        console.log('❌ Failed to create test order:', createOrderResult.message);
      }
      
    } else {
      console.log('❌ No items available to create test order');
    }
    
    console.log('\n📋 STEP 4: Summary and Analysis...\n');
    
    // Provide analysis
    if (notifications.success && notifications.data.notifications.length > 0) {
      console.log('✅ NOTIFICATION SYSTEM: Database storage is working');
      console.log('✅ NOTIFICATION API: Can retrieve notifications');
      console.log('\n💡 If you\'re not seeing notifications in real-time:');
      console.log('   1. Check Socket.IO connection in browser console');
      console.log('   2. Verify you\'re logged in with the correct user');
      console.log('   3. Check browser notification permissions');
      console.log('   4. Ensure frontend is listening to the correct Socket.IO events');
    } else {
      console.log('❌ NOTIFICATION SYSTEM: No notifications found in database');
      console.log('❌ This suggests notifications are not being created at all');
      console.log('\n🔍 Possible issues:');
      console.log('   1. NotificationService is not being called');
      console.log('   2. Database connection issues');
      console.log('   3. Notification schema/model problems');
      console.log('   4. Error in notification creation process');
    }
    
  } catch (error) {
    console.error('❌ Database inspection error:', error.message);
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

// Run the inspection
inspectDatabase();
