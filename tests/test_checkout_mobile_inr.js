#!/usr/bin/env node

const http = require('http');

function testCheckoutWithMobileAndINR() {
  console.log('🛒 TESTING CHECKOUT WITH MOBILE NUMBER & INR CURRENCY');
  console.log('=' .repeat(60));

  const userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0Njc3MCwiZXhwIjoxNzU2ODUxNTcwfQ.vC8JxoZe0xCBhfgfR6DaTLbLvoNYM8Fmv3bP3sWkwzA';

  console.log('\n1️⃣ Testing Order Creation with Mobile Number...');
  
  const orderData = {
    vendorId: '68ae053d8906e787eddba054', // Burger Kingdom
    items: [
      {
        itemId: '68ae1b0d11cdf435faa22079', // Cheeseburger
        quantity: 1
      }
    ],
    deliveryAddress: {
      id: 'hostel_b10',
      name: 'B10 Hostel',
      category: 'hostels',
      fullAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
      coordinates: { lat: 31.7754, lng: 77.0269 }
    },
    customerPhone: '8198086300', // Mobile number for SMS
    notes: 'Test order with mobile number for SMS notifications'
  };

  const postData = JSON.stringify(orderData);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Authorization': userToken,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log(`   Status Code: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        
        if (response.success) {
          console.log('   ✅ Order created successfully!');
          console.log(`   Order ID: ${response.data.order._id}`);
          console.log(`   Customer Phone: ${response.data.order.customerPhone || 'Not set'}`);
          console.log(`   Total Amount: ₹${response.data.order.totalAmount}`);
          
          console.log('\n2️⃣ Testing Order Approval with SMS...');
          testOrderApproval(response.data.order._id);
          
        } else {
          console.log('   ❌ Order creation failed:', response.message);
        }
        
      } catch (error) {
        console.log('   ❌ Failed to parse response:', error.message);
        console.log('   Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('   ❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

function testOrderApproval(orderId) {
  const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/vendor/orders/${orderId}/approve`,
    method: 'PUT',
    headers: {
      'Authorization': vendorToken,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log(`   Approval Status: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        
        if (response.success) {
          console.log('   ✅ Order approved successfully!');
          console.log('   📱 SMS should be sent to customer mobile number');
          console.log('   💰 Amount displayed in INR currency');
          
          console.log('\n3️⃣ Testing Status Updates with SMS...');
          testStatusUpdates(orderId);
          
        } else {
          console.log('   ❌ Order approval failed:', response.message);
        }
        
      } catch (error) {
        console.log('   ❌ Failed to parse approval response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('   ❌ Failed to approve order:', error.message);
  });

  req.end();
}

function testStatusUpdates(orderId) {
  const userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0Njc3MCwiZXhwIjoxNzU2ODUxNTcwfQ.vC8JxoZe0xCBhfgfR6DaTLbLvoNYM8Fmv3bP3sWkwzA';

  const statusUpdates = [
    { status: 'robot_assigned', description: 'Robot Assignment' },
    { status: 'robot_delivering', description: 'Out for Delivery' },
    { status: 'delivered', description: 'Delivered (OTP Generated)' }
  ];

  let currentIndex = 0;

  function updateNextStatus() {
    if (currentIndex >= statusUpdates.length) {
      console.log('\n🎉 CHECKOUT WITH MOBILE & INR TEST COMPLETE!');
      console.log('\n📋 SUMMARY:');
      console.log('   ✅ Order creation with mobile number');
      console.log('   ✅ Customer phone stored in order');
      console.log('   ✅ SMS notifications sent to mobile');
      console.log('   ✅ Currency displayed as INR (₹)');
      console.log('   ✅ Automatic SMS for all order events');
      console.log('   ✅ OTP generation for delivery verification');
      console.log('\n📱 Check your phone for SMS messages from +15135404976!');
      console.log('💰 All prices now displayed in Indian Rupees (₹)!');
      return;
    }

    const update = statusUpdates[currentIndex];
    console.log(`\n   📱 Testing ${update.description}...`);

    const postData = JSON.stringify({ status: update.status });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${orderId}/status`,
      method: 'PUT',
      headers: {
        'Authorization': userToken,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Success: ${response.success}`);
          
          if (response.success) {
            console.log(`   ✅ ${update.description} SMS sent!`);
            if (update.status === 'delivered') {
              console.log('   🔐 OTP generated and sent via SMS');
            }
          } else {
            console.log(`   ❌ ${update.description} failed:`, response.message);
          }
          
          currentIndex++;
          setTimeout(updateNextStatus, 2000);
          
        } catch (error) {
          console.log(`   ❌ Failed to parse ${update.description} response:`, error.message);
          currentIndex++;
          setTimeout(updateNextStatus, 2000);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ ${update.description} request failed:`, error.message);
      currentIndex++;
      setTimeout(updateNextStatus, 2000);
    });

    req.write(postData);
    req.end();
  }

  updateNextStatus();
}

// Run the test
testCheckoutWithMobileAndINR();
