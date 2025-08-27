#!/usr/bin/env node

const http = require('http');

function testFrontendAPI() {
  console.log('🔍 TESTING FRONTEND API ISSUE');
  console.log('=' .repeat(50));

  const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0Njc3MCwiZXhwIjoxNzU2ODUxNTcwfQ.vC8JxoZe0xCBhfgfR6DaTLbLvoNYM8Fmv3bP3sWkwzA';

  console.log('\n🔍 DIRECT API CALL TEST:');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userToken}`,
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
        
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Data exists: ${!!response.data}`);
        console.log(`   Data keys: ${response.data ? Object.keys(response.data).join(', ') : 'None'}`);
        console.log(`   Orders exists: ${!!response.data?.orders}`);
        console.log(`   Orders type: ${typeof response.data?.orders}`);
        console.log(`   Orders is array: ${Array.isArray(response.data?.orders)}`);
        console.log(`   Orders count: ${response.data?.orders ? response.data.orders.length : 0}`);
        
        if (response.data?.orders && response.data.orders.length > 0) {
          const firstOrder = response.data.orders[0];
          console.log('\n   First Order Sample:');
          console.log(`     ID: ${firstOrder._id}`);
          console.log(`     Total: ₹${firstOrder.totalAmount}`);
          console.log(`     Status: ${firstOrder.status}`);
          console.log(`     Vendor: ${firstOrder.vendorId?.businessName}`);
          console.log(`     Created: ${new Date(firstOrder.createdAt).toLocaleString()}`);
        }
        
        console.log('\n🔍 FRONTEND DEBUGGING HINTS:');
        console.log('   1. Check browser console for API request logs');
        console.log('   2. Check Network tab for actual request/response');
        console.log('   3. Verify localStorage has accessToken');
        console.log('   4. Check if CORS is blocking the request');
        console.log('   5. Verify frontend is calling correct URL');
        
        console.log('\n🔧 EXPECTED FRONTEND BEHAVIOR:');
        console.log('   • orderAPI.getAll() should return same data');
        console.log('   • response.data.orders should be array with ' + (response.data?.orders?.length || 0) + ' items');
        console.log('   • Debug info should show Orders Count: ' + (response.data?.orders?.length || 0));
        console.log('   • Debug info should show Is Array: ✅');
        
        console.log('\n🎯 TROUBLESHOOTING STEPS:');
        console.log('   1. Open browser dev tools');
        console.log('   2. Go to Orders page');
        console.log('   3. Check Console tab for API logs');
        console.log('   4. Check Network tab for /api/orders request');
        console.log('   5. Compare frontend response with this test');
        
      } catch (error) {
        console.log('   ❌ Parse Error:', error.message);
        console.log('   Raw response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.log('   ❌ Request Error:', error.message);
  });

  req.end();
}

// Run the test
console.log('🚀 Starting Frontend API Debug Test...\n');
testFrontendAPI();
