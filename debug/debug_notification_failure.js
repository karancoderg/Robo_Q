#!/usr/bin/env node

const http = require('http');

function debugNotificationFailure() {
  console.log('🔍 GOD-LEVEL DEBUGGING: NOTIFICATION FAILURE ANALYSIS');
  console.log('=' .repeat(65));

  const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';

  console.log('\n🔍 PHASE 1: ANALYZING EXISTING ORDERS');
  
  // First, let's get vendor orders to see the structure
  const getOrdersOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/vendor/orders',
    method: 'GET',
    headers: {
      'Authorization': vendorToken,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(getOrdersOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success && response.data.orders.length > 0) {
          console.log(`✅ Found ${response.data.orders.length} orders`);
          
          // Analyze the first order structure
          const firstOrder = response.data.orders[0];
          console.log('\n🔍 PHASE 2: ORDER STRUCTURE ANALYSIS');
          console.log(`   Order ID: ${firstOrder._id}`);
          console.log(`   User ID Type: ${typeof firstOrder.userId}`);
          console.log(`   User ID Value: ${firstOrder.userId}`);
          console.log(`   Status: ${firstOrder.status}`);
          
          // Check if userId is populated or just an ID
          if (typeof firstOrder.userId === 'string') {
            console.log('   ❌ CRITICAL ISSUE: userId is STRING, not OBJECT');
            console.log('   ❌ This means user data is NOT populated in vendor orders');
            console.log('   ❌ Notifications will fail because no email/phone available');
          } else if (typeof firstOrder.userId === 'object' && firstOrder.userId) {
            console.log('   ✅ userId is populated object');
            console.log(`   User Name: ${firstOrder.userId.name || 'NOT SET'}`);
            console.log(`   User Email: ${firstOrder.userId.email || 'NOT SET'}`);
            console.log(`   User Phone: ${firstOrder.userId.phone || 'NOT SET'}`);
          }
          
          // Now test the approval process with detailed logging
          console.log('\n🔍 PHASE 3: TESTING APPROVAL WITH DETAILED LOGGING');
          testApprovalWithLogging(firstOrder._id, vendorToken);
          
        } else {
          console.log('❌ No orders found for analysis');
        }
        
      } catch (error) {
        console.log('❌ Failed to parse orders response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Failed to fetch orders:', error.message);
  });

  req.end();
}

function testApprovalWithLogging(orderId, vendorToken) {
  console.log(`   Testing approval for order: ${orderId}`);
  
  const approveOptions = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/vendor/orders/${orderId}/approve`,
    method: 'PUT',
    headers: {
      'Authorization': vendorToken,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(approveOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log('\n🔍 PHASE 4: APPROVAL RESPONSE ANALYSIS');
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Message: ${response.message}`);
        
        if (response.success) {
          console.log('   ✅ Order approval API call succeeded');
          
          // Check if the response contains populated user data
          if (response.data && response.data.order) {
            const order = response.data.order;
            console.log('\n🔍 PHASE 5: POPULATED ORDER DATA ANALYSIS');
            console.log(`   Order ID: ${order._id}`);
            console.log(`   User ID Type: ${typeof order.userId}`);
            
            if (typeof order.userId === 'object' && order.userId) {
              console.log('   ✅ User data is populated in response');
              console.log(`   Customer Name: ${order.userId.name || 'NOT SET'}`);
              console.log(`   Customer Email: ${order.userId.email || 'NOT SET'}`);
              console.log(`   Customer Phone: ${order.userId.phone || 'NOT SET'}`);
              
              if (!order.userId.email && !order.userId.phone) {
                console.log('   ❌ CRITICAL: No email or phone in user data');
                console.log('   ❌ This explains why notifications are not sent');
              } else {
                console.log('   ✅ User has contact information');
                console.log('   ❓ Notifications should have been sent');
                console.log('   🔍 Check backend console for notification logs');
              }
            } else {
              console.log('   ❌ CRITICAL: User data NOT populated in approval response');
              console.log('   ❌ This means the populate() call is failing');
            }
          }
          
          console.log('\n🔍 PHASE 6: BACKEND CONSOLE MONITORING');
          console.log('   📋 Check the backend console for these logs:');
          console.log('   - "SMS notification result:"');
          console.log('   - "Email notification result:"');
          console.log('   - "SMS notification failed:"');
          console.log('   - "Email notification failed:"');
          console.log('   - Any error messages');
          
          console.log('\n🔍 PHASE 7: NEXT DEBUGGING STEPS');
          console.log('   1. Check backend console output during approval');
          console.log('   2. Verify user exists in database with email/phone');
          console.log('   3. Test notification services directly');
          console.log('   4. Check if populate() is working correctly');
          
        } else {
          console.log('   ❌ Order approval failed:', response.message);
        }
        
      } catch (error) {
        console.log('   ❌ Failed to parse approval response:', error.message);
        console.log('   Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('   ❌ Failed to approve order:', error.message);
  });

  req.end();
}

// Run the diagnostic
debugNotificationFailure();
