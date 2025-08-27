#!/usr/bin/env node

const http = require('http');

function testOrderApproval() {
  console.log('🎯 TESTING ORDER APPROVAL NOTIFICATIONS');
  console.log('=' .repeat(50));

  // Get a pending order first
  const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';

  console.log('\n1️⃣ Fetching vendor orders...');
  
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
          
          // Find a pending order or use the first one
          const testOrder = response.data.orders.find(order => order.status === 'pending') || response.data.orders[0];
          
          console.log(`\n2️⃣ Testing with order: ${testOrder._id}`);
          console.log(`   Customer: ${testOrder.userId.name} (${testOrder.userId.email})`);
          console.log(`   Phone: ${testOrder.userId.phone || 'Not provided'}`);
          console.log(`   Status: ${testOrder.status}`);
          console.log(`   Address Type: ${testOrder.deliveryAddress.fullAddress ? 'IIT Mandi' : 'Traditional'}`);
          
          if (testOrder.deliveryAddress.fullAddress) {
            console.log(`   Address: ${testOrder.deliveryAddress.fullAddress}`);
          } else if (testOrder.deliveryAddress.name) {
            console.log(`   Address: ${testOrder.deliveryAddress.name}`);
          } else {
            console.log(`   Address: ${testOrder.deliveryAddress.street || 'N/A'}, ${testOrder.deliveryAddress.city || 'N/A'}`);
          }
          
          // Now test approval
          testApproval(testOrder._id, vendorToken);
          
        } else {
          console.log('❌ No orders found for testing');
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

function testApproval(orderId, vendorToken) {
  console.log(`\n3️⃣ Approving order ${orderId}...`);
  
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
        
        console.log(`\n4️⃣ Approval Response:`);
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Message: ${response.message}`);
        
        if (response.success) {
          console.log('✅ Order approved successfully!');
          console.log('\n5️⃣ Check the backend console for notification logs:');
          console.log('   - Look for "SMS notification result:"');
          console.log('   - Look for "Email notification result:"');
          console.log('   - Should show simulation messages with proper address');
          
          console.log('\n🎯 EXPECTED NOTIFICATION CONTENT:');
          console.log('   📱 SMS: "🎉 Order Confirmed! Your order #[ID] has been approved..."');
          console.log('   📧 Email: "Order Confirmed - #[ID]" with full order details');
          console.log('   📍 Address: Should show proper IIT Mandi address, not "undefined, undefined"');
          
        } else {
          console.log('❌ Order approval failed:', response.message);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse approval response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Failed to approve order:', error.message);
  });

  req.end();
}

// Run the test
testOrderApproval();
