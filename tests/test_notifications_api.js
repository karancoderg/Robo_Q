#!/usr/bin/env node

const http = require('http');

console.log('🔍 NOTIFICATION API TEST: Direct API call');
console.log('=' .repeat(50));

async function testNotificationAPI() {
  const userToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0NzgwNiwiZXhwIjoxNzU2ODUyNjA2fQ.oaWDT91dmYzvMFAWqoAJvbJq4E5-viRF2dsuBV-YBPs';
  
  console.log('📋 Making direct API call to /api/notifications...');
  
  const result = await makeRequest('GET', '/api/notifications?limit=20', userToken);
  
  console.log('📊 API Response:');
  console.log('   Success:', result.success);
  console.log('   Message:', result.message);
  
  if (result.success && result.data) {
    console.log('   Notifications count:', result.data.notifications.length);
    
    if (result.data.notifications.length > 0) {
      console.log('\n📋 Notifications found:');
      result.data.notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title}`);
        console.log(`      Message: ${notif.message}`);
        console.log(`      Type: ${notif.type}`);
        console.log(`      User ID: ${notif.userId}`);
        console.log(`      Created: ${new Date(notif.createdAt).toLocaleString()}`);
        console.log(`      Read: ${notif.read}`);
        if (notif.data) {
          console.log(`      Order ID: ${notif.data.orderId}`);
        }
        console.log('');
      });
    } else {
      console.log('\n❌ No notifications found in API response');
    }
  } else {
    console.log('❌ API call failed:', result.message);
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

testNotificationAPI();
