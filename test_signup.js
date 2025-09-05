const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSignup() {
  console.log('🧪 Testing Signup Fixes...\n');

  // Test 1: User signup
  console.log('1️⃣ Testing User Signup...');
  try {
    const userResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });
    
    console.log('✅ User signup successful');
    console.log('   - Role:', userResponse.data.data.user.role);
    console.log('   - Setup completed:', userResponse.data.data.user.setupCompleted);
    console.log('   - Access token provided:', !!userResponse.data.data.accessToken);
  } catch (error) {
    console.log('❌ User signup failed:', error.response?.data?.message || error.message);
  }

  // Test 2: Vendor signup with restaurant info
  console.log('\n2️⃣ Testing Vendor Signup with Restaurant Info...');
  try {
    const vendorResponse = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test Vendor',
      email: 'testvendor@example.com',
      password: 'password123',
      role: 'vendor',
      restaurantInfo: {
        name: 'Test Restaurant',
        address: '123 Main St, City',
        phone: '+1234567890',
        cuisineType: 'italian'
      }
    });
    
    console.log('✅ Vendor signup successful');
    console.log('   - Role:', vendorResponse.data.data.user.role);
    console.log('   - Setup completed:', vendorResponse.data.data.user.setupCompleted);
    console.log('   - Access token provided:', !!vendorResponse.data.data.accessToken);
  } catch (error) {
    console.log('❌ Vendor signup failed:', error.response?.data?.message || error.message);
  }

  // Test 3: Duplicate email
  console.log('\n3️⃣ Testing Duplicate Email...');
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      name: 'Another User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });
    console.log('❌ Should have failed for duplicate email');
  } catch (error) {
    console.log('✅ Correctly rejected duplicate email:', error.response?.data?.message);
  }

  console.log('\n🎉 Signup tests completed!');
}

// Start backend and run tests
const { spawn } = require('child_process');

console.log('🚀 Starting backend server...');
const backend = spawn('node', ['src/server.js'], { 
  cwd: '/home/karandeep/DP/robo_Q/backend',
  stdio: 'pipe'
});

// Wait for server to start
setTimeout(async () => {
  try {
    await testSignup();
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    backend.kill();
    process.exit(0);
  }
}, 3000);

backend.on('error', (error) => {
  console.error('Backend error:', error);
  process.exit(1);
});
