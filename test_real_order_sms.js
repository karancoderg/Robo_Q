#!/usr/bin/env node

const http = require('http');

function testRealOrderSMS() {
  console.log('🎯 TESTING REAL ORDER APPROVAL WITH SMS');
  console.log('=' .repeat(55));

  const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';

  console.log('\n1️⃣ Fetching vendor orders for SMS test...');
  
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
          
          // Find an order with Indian phone number
          const testOrder = response.data.orders.find(order => 
            order.userId && order.userId.phone && order.userId.phone.includes('8198086300')
          ) || response.data.orders[0];
          
          console.log(`\n2️⃣ Selected order for SMS test:`);
          console.log(`   Order ID: ${testOrder._id}`);
          console.log(`   Customer: ${testOrder.userId.name}`);
          console.log(`   Email: ${testOrder.userId.email}`);
          console.log(`   Phone: ${testOrder.userId.phone || 'Not provided'}`);
          console.log(`   Status: ${testOrder.status}`);
          console.log(`   Total: $${testOrder.totalAmount}`);
          
          if (testOrder.deliveryAddress.fullAddress) {
            console.log(`   Address: ${testOrder.deliveryAddress.fullAddress}`);
          } else if (testOrder.deliveryAddress.name) {
            console.log(`   Address: ${testOrder.deliveryAddress.name}`);
          }
          
          if (!testOrder.userId.phone) {
            console.log('\n⚠️  WARNING: No phone number for this customer');
            console.log('   SMS will not be sent, but email should work');
          } else {
            console.log('\n✅ Phone number available for SMS test');
          }
          
          // Test approval with real SMS
          testApprovalWithSMS(testOrder._id, vendorToken, testOrder);
          
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

function testApprovalWithSMS(orderId, vendorToken, orderInfo) {
  console.log(`\n3️⃣ Approving order with REAL SMS notification...`);
  console.log('   🔔 This will send actual SMS to the customer phone!');
  
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
        
        console.log(`\n4️⃣ Order Approval Result:`);
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Message: ${response.message}`);
        
        if (response.success) {
          console.log('✅ Order approved successfully!');
          
          console.log('\n5️⃣ SMS & Email Notification Status:');
          console.log('   📱 SMS: Should be sent to customer phone');
          console.log('   📧 Email: Should be sent to customer email');
          console.log('   🔍 Check backend console for notification logs');
          
          if (orderInfo.userId.phone) {
            console.log(`\n📱 Expected SMS Details:`);
            console.log(`   Target: ${orderInfo.userId.phone} → +91${orderInfo.userId.phone}`);
            console.log(`   From: +15135404976 (Twilio)`);
            console.log(`   Content: Order confirmation with IIT Mandi address`);
            console.log(`   🎯 CHECK YOUR PHONE NOW!`);
          }
          
          if (orderInfo.userId.email) {
            console.log(`\n📧 Expected Email Details:`);
            console.log(`   Target: ${orderInfo.userId.email}`);
            console.log(`   Subject: Order Confirmed - #${orderId}`);
            console.log(`   Content: Professional HTML email with order details`);
          }
          
          console.log('\n6️⃣ Verification Steps:');
          console.log('   1. Check phone for SMS from +15135404976');
          console.log('   2. Check email inbox for order confirmation');
          console.log('   3. Verify addresses show IIT Mandi locations');
          console.log('   4. Confirm no "undefined, undefined" in messages');
          
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
console.log('🚀 STARTING REAL SMS TEST');
console.log('This will send actual SMS to customer phone numbers!');
console.log('Make sure you have permission to send SMS to test numbers.');
console.log('\nPress Ctrl+C to cancel, or wait 3 seconds to continue...');

setTimeout(() => {
  testRealOrderSMS();
}, 3000);
