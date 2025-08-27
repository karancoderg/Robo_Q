#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

function testWithLogs() {
  console.log('🔍 REAL-TIME NOTIFICATION TEST WITH LOG MONITORING');
  console.log('=' .repeat(60));

  const vendorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ';

  console.log('\n1️⃣ Starting backend log monitoring...');
  
  // Monitor backend logs
  const logMonitor = spawn('tail', ['-f', '/home/karandeep/robo_Q/backend/server.log'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let logOutput = '';
  logMonitor.stdout.on('data', (data) => {
    const logLine = data.toString();
    logOutput += logLine;
    console.log('📋 LOG:', logLine.trim());
  });

  logMonitor.stderr.on('data', (data) => {
    console.log('📋 ERROR LOG:', data.toString().trim());
  });

  console.log('\n2️⃣ Fetching orders for approval test...');
  
  // Get orders
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
          const testOrder = response.data.orders[0];
          
          console.log('\n3️⃣ Order selected for approval test:');
          console.log(`   Order ID: ${testOrder._id}`);
          console.log(`   Customer: ${testOrder.userId.name}`);
          console.log(`   Email: ${testOrder.userId.email}`);
          console.log(`   Phone: ${testOrder.userId.phone}`);
          console.log(`   Status: ${testOrder.status}`);
          
          console.log('\n4️⃣ Approving order and monitoring logs...');
          console.log('   📋 Watch for notification logs below:');
          console.log('   ' + '-'.repeat(50));
          
          // Wait a moment then approve
          setTimeout(() => {
            approveOrderWithMonitoring(testOrder._id, vendorToken, logMonitor);
          }, 2000);
          
        } else {
          console.log('❌ No orders found');
          logMonitor.kill();
        }
        
      } catch (error) {
        console.log('❌ Failed to parse orders:', error.message);
        logMonitor.kill();
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Failed to fetch orders:', error.message);
    logMonitor.kill();
  });

  req.end();
}

function approveOrderWithMonitoring(orderId, vendorToken, logMonitor) {
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
        
        console.log('\n5️⃣ Approval result:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Message: ${response.message}`);
        
        if (response.success) {
          console.log('   ✅ Order approved successfully!');
          console.log('\n6️⃣ Waiting for notification logs...');
          console.log('   📋 Looking for:');
          console.log('   - "SMS notification result:"');
          console.log('   - "Email notification result:"');
          console.log('   - "SMS sent successfully to +918198086300"');
          console.log('   - Any error messages');
          
          // Wait for logs then analyze
          setTimeout(() => {
            console.log('\n7️⃣ Log analysis complete.');
            console.log('   📋 Check the logs above for notification attempts');
            logMonitor.kill();
            process.exit(0);
          }, 5000);
          
        } else {
          console.log('   ❌ Approval failed:', response.message);
          logMonitor.kill();
        }
        
      } catch (error) {
        console.log('   ❌ Failed to parse response:', error.message);
        logMonitor.kill();
      }
    });
  });

  req.on('error', (error) => {
    console.log('   ❌ Failed to approve order:', error.message);
    logMonitor.kill();
  });

  req.end();
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

// Run the test
testWithLogs();
