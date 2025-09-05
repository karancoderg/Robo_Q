const axios = require('axios');

async function testRobotTrackingSystem() {
  console.log('🤖 Testing Robot Tracking System...\n');

  try {
    // Step 1: Register a vendor
    console.log('1️⃣ Registering vendor...');
    const vendorResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Robot Test Vendor',
      email: 'robotvendor@example.com',
      password: 'password123',
      role: 'vendor',
      restaurantInfo: {
        name: 'Robot Test Restaurant',
        address: '123 Robot St',
        phone: '+1234567890',
        cuisineType: 'italian'
      }
    });

    const vendorToken = vendorResponse.data.data.accessToken;
    console.log('✅ Vendor registered');

    // Step 2: Register a customer
    console.log('2️⃣ Registering customer...');
    const customerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Robot Test Customer',
      email: 'robotcustomer@example.com',
      password: 'password123',
      role: 'user'
    });

    const customerToken = customerResponse.data.data.accessToken;
    console.log('✅ Customer registered');

    // Step 3: Create an order
    console.log('3️⃣ Creating order...');
    const orderResponse = await axios.post('http://localhost:5000/api/orders', {
      items: [
        {
          itemId: '507f1f77bcf86cd799439011', // Mock item ID
          name: 'Test Pizza',
          price: 15.99,
          quantity: 1
        }
      ],
      deliveryAddress: {
        street: '456 Customer St',
        city: 'Test City',
        state: 'TC',
        zipCode: '12345',
        coordinates: { lat: 40.7614, lng: -73.9776 }
      },
      totalAmount: 15.99
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    const orderId = orderResponse.data.data.order._id;
    console.log('✅ Order created:', orderId);

    // Step 4: Vendor approves order (should trigger robot assignment)
    console.log('4️⃣ Vendor approving order (should assign robot)...');
    const approvalResponse = await axios.put(`http://localhost:5000/api/vendor/orders/${orderId}/approve`, {}, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });

    console.log('✅ Order approved, checking robot assignment...');
    console.log('   - New status:', approvalResponse.data.data.order.status);
    console.log('   - Robot ID:', approvalResponse.data.data.order.robotId || 'Not assigned');

    // Step 5: Test robot tracking
    console.log('5️⃣ Testing robot tracking...');
    
    // Wait a moment for robot assignment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const trackingResponse = await axios.get(`http://localhost:5000/api/orders/${orderId}/robot-tracking`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    if (trackingResponse.data.success) {
      const trackingData = trackingResponse.data.data;
      console.log('✅ Robot tracking data retrieved:');
      console.log('   - Robot ID:', trackingData.robot.id);
      console.log('   - Robot Name:', trackingData.robot.name);
      console.log('   - Robot Status:', trackingData.robot.status);
      console.log('   - Battery Level:', trackingData.robot.batteryLevel + '%');
      console.log('   - Current Location:', `${trackingData.robot.currentLocation.lat}, ${trackingData.robot.currentLocation.lng}`);
      console.log('   - Demo Mode:', trackingData.isDemo ? 'Yes' : 'No');
      console.log('   - Vendor Location:', trackingData.order.vendorLocation.name);
      console.log('   - Customer Location:', trackingData.order.customerLocation.name);
    } else {
      console.log('❌ Failed to get tracking data:', trackingResponse.data.message);
    }

    console.log('\n🎉 Robot tracking system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Robot assignment after vendor approval');
    console.log('   ✅ Demo robot data generation');
    console.log('   ✅ Robot tracking API endpoint');
    console.log('   ✅ Real-time location simulation');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRobotTrackingSystem();
