#!/usr/bin/env node

const http = require('http');

function emergencyDebugTest() {
  console.log('🚨 EMERGENCY DEBUG: ORDERS PAGE BROKEN');
  console.log('=' .repeat(50));

  const userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0Njc3MCwiZXhwIjoxNzU2ODUxNTcwfQ.vC8JxoZe0xCBhfgfR6DaTLbLvoNYM8Fmv3bP3sWkwzA';

  console.log('\n🔍 TESTING DIRECT API CALL...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
    headers: {
      'Authorization': userToken,
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
        
        console.log('\n🔍 RESPONSE STRUCTURE ANALYSIS:');
        console.log('   Raw response keys:', Object.keys(response));
        console.log('   response.data exists:', !!response.data);
        
        if (response.data) {
          console.log('   response.data keys:', Object.keys(response.data));
          console.log('   response.data.orders exists:', !!response.data.orders);
          console.log('   response.data.data exists:', !!response.data.data);
          
          if (response.data.orders) {
            console.log('   response.data.orders length:', response.data.orders.length);
            console.log('   response.data.orders is array:', Array.isArray(response.data.orders));
          }
          
          if (response.data.data) {
            console.log('   response.data.data keys:', Object.keys(response.data.data));
            if (response.data.data.orders) {
              console.log('   response.data.data.orders length:', response.data.data.orders.length);
            }
          }
        }
        
        console.log('\n🎯 CORRECT PATHS TO TEST:');
        
        // Test path 1: response.data.orders
        const path1 = response.data?.orders;
        console.log('   Path 1 (response.data.orders):');
        console.log('     Exists:', !!path1);
        console.log('     Is Array:', Array.isArray(path1));
        console.log('     Length:', path1 ? path1.length : 'N/A');
        
        // Test path 2: response.data.data.orders
        const path2 = response.data?.data?.orders;
        console.log('   Path 2 (response.data.data.orders):');
        console.log('     Exists:', !!path2);
        console.log('     Is Array:', Array.isArray(path2));
        console.log('     Length:', path2 ? path2.length : 'N/A');
        
        console.log('\n🔧 SOLUTION:');
        if (path1 && Array.isArray(path1) && path1.length > 0) {
          console.log('   ✅ Use: response.data.orders');
          console.log('   📦 Sample order:', path1[0]._id);
        } else if (path2 && Array.isArray(path2) && path2.length > 0) {
          console.log('   ✅ Use: response.data.data.orders');
          console.log('   📦 Sample order:', path2[0]._id);
        } else {
          console.log('   ❌ Neither path works!');
        }
        
      } catch (error) {
        console.log('   ❌ Parse Error:', error.message);
        console.log('   Raw response:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (error) => {
    console.log('   ❌ Request Error:', error.message);
  });

  req.end();
}

// Run emergency debug
console.log('🚀 Starting Emergency Debug...\n');
emergencyDebugTest();
