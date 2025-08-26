const axios = require('axios');

async function testOTPEmail() {
  try {
    console.log('🧪 Testing OTP email functionality...');
    
    // Test the login with OTP endpoint
    const response = await axios.post('http://localhost:5000/api/auth/login/otp', {
      email: 'karancoderg@gmail.com'
    });
    
    console.log('✅ OTP Request Response:', response.data);
    console.log('📧 Check your email at karancoderg@gmail.com for the OTP!');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

testOTPEmail();
