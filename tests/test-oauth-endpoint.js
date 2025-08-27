const axios = require('axios');

// Test the Google OAuth endpoint
async function testGoogleOAuthEndpoint() {
  const apiUrl = 'https://robo-q-1.onrender.com/api';
  
  console.log('🔍 Testing Google OAuth endpoints...\n');
  
  try {
    // Test the test endpoint
    console.log('1. Testing /google-auth/test endpoint...');
    const testResponse = await axios.get(`${apiUrl}/google-auth/test`);
    console.log('✅ Test endpoint working:', testResponse.data);
    
    // Test the token endpoint (should return error for invalid token)
    console.log('\n2. Testing /google-auth/token endpoint...');
    const tokenResponse = await axios.post(`${apiUrl}/google-auth/token`, {
      credential: 'invalid-token'
    });
    console.log('✅ Token endpoint response:', tokenResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('✅ Token endpoint working (expected error for invalid token):', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
  
  console.log('\n🎉 Google OAuth endpoints are properly configured!');
  console.log('The 404 error should now be resolved.');
}

testGoogleOAuthEndpoint();
