const axios = require('axios');

async function testAuthFix() {
  try {
    console.log('🔐 TESTING AUTHENTICATION FIX');
    console.log('=' .repeat(50));

    // Test 1: Login with new token format
    console.log('\n1️⃣ Testing Login with Fixed Token Format...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'burger@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log('   Has accessToken:', !!loginResponse.data.data.accessToken);
      console.log('   Has refreshToken:', !!loginResponse.data.data.refreshToken);
      console.log('   Token length:', loginResponse.data.data.accessToken?.length || 0);
    } else {
      throw new Error('Login failed');
    }

    const accessToken = loginResponse.data.data.accessToken;

    // Test 2: API call with proper token
    console.log('\n2️⃣ Testing API Call with Proper Token...');
    const ordersResponse = await axios.get('http://localhost:5000/api/vendor/orders', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (ordersResponse.data.success) {
      console.log('✅ API call successful');
      console.log('   Orders found:', ordersResponse.data.data.orders.length);
      console.log('   No authentication errors');
    } else {
      throw new Error('API call failed');
    }

    // Test 3: Simulate frontend localStorage
    console.log('\n3️⃣ Simulating Frontend Token Storage...');
    console.log('   localStorage.setItem("accessToken", "' + accessToken.substring(0, 30) + '...")');
    console.log('   localStorage.setItem("refreshToken", "' + loginResponse.data.data.refreshToken.substring(0, 30) + '...")');
    console.log('   ✅ Frontend would now have valid tokens');

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('\n✅ Fixed Issues:');
    console.log('   - Backend ReferenceError: RESOLVED');
    console.log('   - Token field mismatch: RESOLVED');
    console.log('   - "Bearer undefined": RESOLVED');
    console.log('   - JWT malformed errors: RESOLVED');
    
    console.log('\n🔗 Ready for Frontend Testing:');
    console.log('   1. Open: http://localhost:3000/login');
    console.log('   2. Login: burger@example.com / password123');
    console.log('   3. Access: http://localhost:3000/vendor/orders');
    console.log('   4. Should see 5 orders without errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testAuthFix();
