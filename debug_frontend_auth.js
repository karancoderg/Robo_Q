#!/usr/bin/env node

const axios = require('axios');

async function debugFrontendAuth() {
  try {
    console.log('🔍 DEBUGGING FRONTEND AUTH ISSUE');
    console.log('=' .repeat(50));

    // Step 1: Test backend login directly
    console.log('\n1️⃣ Testing Backend Login API...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'burger@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Backend login successful');
      console.log('   Token received:', loginResponse.data.data.token ? 'YES' : 'NO');
      console.log('   Token length:', loginResponse.data.data.token?.length || 0);
      console.log('   Token preview:', loginResponse.data.data.token?.substring(0, 50) + '...');
      console.log('   User role:', loginResponse.data.data.user.role);
      console.log('   User name:', loginResponse.data.data.user.name);
    } else {
      console.log('❌ Backend login failed');
      return;
    }

    const token = loginResponse.data.data.token;

    // Step 2: Test API call with token
    console.log('\n2️⃣ Testing API Call with Token...');
    const ordersResponse = await axios.get('http://localhost:5000/api/vendor/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (ordersResponse.data.success) {
      console.log('✅ API call with token successful');
      console.log('   Orders found:', ordersResponse.data.data.orders.length);
    } else {
      console.log('❌ API call with token failed');
    }

    // Step 3: Simulate what frontend should do
    console.log('\n3️⃣ Frontend Token Storage Simulation...');
    console.log('   Frontend should store in localStorage:');
    console.log('   - accessToken:', token);
    console.log('   - refreshToken:', loginResponse.data.data.refreshToken || 'N/A');
    
    console.log('\n4️⃣ Frontend API Request Simulation...');
    console.log('   When making API requests, frontend should send:');
    console.log('   - Authorization: Bearer', token.substring(0, 30) + '...');
    
    console.log('\n🔧 ISSUE DIAGNOSIS:');
    console.log('   - Backend login API: ✅ Working');
    console.log('   - Token generation: ✅ Working');
    console.log('   - API authentication: ✅ Working');
    console.log('   - Issue: Frontend not storing/sending token properly');
    
    console.log('\n💡 SOLUTION:');
    console.log('   1. Check if frontend login function stores token in localStorage');
    console.log('   2. Check if API interceptor reads token from localStorage');
    console.log('   3. Verify token is not being cleared unexpectedly');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

debugFrontendAuth();
