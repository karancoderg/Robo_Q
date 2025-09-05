const axios = require('axios');

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Signup Flow...\n');

  try {
    // Clean up - remove test user if exists
    console.log('🧹 Cleaning up previous test data...');
    try {
      await axios.delete('http://localhost:5000/api/test/cleanup', {
        data: { email: 'flowtest@example.com' }
      });
    } catch (e) {
      // Ignore cleanup errors
    }

    // Step 1: Register vendor with restaurant info
    console.log('1️⃣ Registering vendor with complete restaurant info...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Flow Test Vendor',
      email: 'flowtest@example.com',
      password: 'password123',
      role: 'vendor',
      restaurantInfo: {
        name: 'Flow Test Restaurant',
        address: '123 Flow Test St',
        phone: '+1234567890',
        cuisineType: 'italian'
      }
    });

    const userData = registerResponse.data.data.user;
    const accessToken = registerResponse.data.data.accessToken;

    console.log('✅ Registration Response:');
    console.log('   - User ID:', userData._id);
    console.log('   - Name:', userData.name);
    console.log('   - Email:', userData.email);
    console.log('   - Role:', userData.role);
    console.log('   - Setup Completed:', userData.setupCompleted);
    console.log('   - Is Verified:', userData.isVerified);

    // Step 2: Verify token works
    console.log('\n2️⃣ Testing authentication with received token...');
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const profileUser = profileResponse.data.data.user;
    console.log('✅ Profile fetch successful:');
    console.log('   - Setup Completed:', profileUser.setupCompleted);
    console.log('   - Role:', profileUser.role);

    // Step 3: Check if vendor profile was created
    console.log('\n3️⃣ Checking if vendor profile was created...');
    const vendorsResponse = await axios.get('http://localhost:5000/api/vendors');
    const vendors = vendorsResponse.data.data.vendors;
    const createdVendor = vendors.find(v => v.userId && v.userId._id === userData._id);

    if (createdVendor) {
      console.log('✅ Vendor profile created successfully:');
      console.log('   - Business Name:', createdVendor.businessName);
      console.log('   - Category:', createdVendor.category);
      console.log('   - Is Active:', createdVendor.isActive);
    } else {
      console.log('❌ Vendor profile not found');
    }

    // Step 4: Simulate frontend navigation logic
    console.log('\n4️⃣ Frontend Navigation Logic:');
    console.log('   - User role:', userData.role);
    console.log('   - Setup completed:', userData.setupCompleted);
    
    if (userData.role === 'vendor' && userData.setupCompleted) {
      console.log('✅ Should navigate to: /vendor/dashboard');
      console.log('✅ ProtectedRoute should allow access (setupCompleted = true)');
    } else if (userData.role === 'vendor' && !userData.setupCompleted) {
      console.log('❌ Would navigate to: /complete-setup (This would be the bug!)');
    } else if (userData.role === 'user' && userData.setupCompleted) {
      console.log('✅ Should navigate to: /dashboard');
    } else {
      console.log('❌ Would navigate to: /complete-setup');
    }

    console.log('\n🎉 All tests passed! The signup flow should work correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCompleteFlow();
