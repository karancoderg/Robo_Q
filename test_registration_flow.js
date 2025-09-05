const axios = require('axios');

async function testRegistrationFlow() {
  console.log('🧪 Testing Registration Flow Issue...\n');

  try {
    // Test vendor registration with restaurant info
    console.log('1️⃣ Registering vendor with restaurant info...');
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Vendor Flow',
      email: 'vendorflow@example.com',
      password: 'password123',
      role: 'vendor',
      restaurantInfo: {
        name: 'Flow Test Restaurant',
        address: '123 Flow St',
        phone: '+1234567890',
        cuisineType: 'italian'
      }
    });

    const userData = response.data.data.user;
    const accessToken = response.data.data.accessToken;

    console.log('✅ Registration successful');
    console.log('   - User ID:', userData._id);
    console.log('   - Role:', userData.role);
    console.log('   - Setup Completed:', userData.setupCompleted);
    console.log('   - Access Token:', accessToken ? 'Present' : 'Missing');

    // Simulate what frontend should do
    console.log('\n2️⃣ Simulating frontend navigation logic...');
    
    if (userData.role === 'vendor') {
      if (userData.setupCompleted) {
        console.log('✅ Should navigate to: /vendor/dashboard');
      } else {
        console.log('❌ Would navigate to: /complete-setup (This is the problem!)');
      }
    } else {
      if (userData.setupCompleted) {
        console.log('✅ Should navigate to: /dashboard');
      } else {
        console.log('❌ Would navigate to: /complete-setup');
      }
    }

    // Test authentication with the token
    console.log('\n3️⃣ Testing authentication with token...');
    const authResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Authentication successful');
    console.log('   - Authenticated user:', authResponse.data.data.user.name);
    console.log('   - Setup completed:', authResponse.data.data.user.setupCompleted);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testRegistrationFlow();
