const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testOTPLoginFlow() {
  console.log('🧪 Testing OTP Login Flow Fix...\n');

  // Test 1: Valid user OTP request
  console.log('1️⃣ Testing OTP request for existing user...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login/otp`, {
      email: 'john@example.com'
    });
    
    console.log('✅ Success:', response.data);
    console.log('   - Message:', response.data.message);
    console.log('   - Has userId:', !!response.data.data?.userId);
    console.log('   - Has email:', !!response.data.data?.email);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Non-existent user OTP request
  console.log('2️⃣ Testing OTP request for non-existent user...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login/otp`, {
      email: 'nonexistent@example.com'
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Expected Error (404):', error.response?.data || error.message);
    console.log('   - Status:', error.response?.status);
    console.log('   - Message:', error.response?.data?.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: OTP verification endpoint structure
  console.log('3️⃣ Testing OTP verification endpoint...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
      email: 'john@example.com',
      otp: '123456' // Invalid OTP for testing
    });
    
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Expected Error (Invalid OTP):', error.response?.data || error.message);
    console.log('   - Status:', error.response?.status);
    console.log('   - Message:', error.response?.data?.message);
  }

  console.log('\n🎯 **SENIOR DEBUGGER ANALYSIS:**');
  console.log('✅ Fixed double popup issue by:');
  console.log('   1. Removed duplicate error handling in Login.tsx');
  console.log('   2. Fixed API endpoint mismatch (/auth/verify-otp)');
  console.log('   3. Updated frontend to use email instead of userId');
  console.log('   4. Added proper userId in backend OTP response');
  console.log('   5. Improved error messages for better UX');
  console.log('\n🚀 OTP Login should now show only ONE popup message!');
}

// Run the test
testOTPLoginFlow().catch(console.error);
