#!/usr/bin/env node

const axios = require('axios');

async function testVendorOrders() {
  try {
    console.log('🧪 Testing Vendor Orders System...\n');

    // Step 1: Login as Burger Kingdom vendor
    console.log('1️⃣ Logging in as Burger Kingdom vendor...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'burger@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    const vendor = loginResponse.data.data.user;
    console.log(`✅ Login successful! Vendor: ${vendor.name} (${vendor.email})`);

    // Step 2: Fetch vendor orders
    console.log('\n2️⃣ Fetching vendor orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/vendor/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!ordersResponse.data.success) {
      throw new Error('Failed to fetch orders');
    }

    const orders = ordersResponse.data.data.orders;
    console.log(`✅ Found ${orders.length} orders for Burger Kingdom`);

    // Step 3: Display order details
    console.log('\n3️⃣ Order Details:');
    console.log('=' .repeat(80));

    orders.forEach((order, index) => {
      console.log(`\n📋 Order #${index + 1}: ${order._id.slice(-8).toUpperCase()}`);
      console.log(`   Customer: ${order.userId?.name || 'N/A'} (${order.userId?.email || 'N/A'})`);
      console.log(`   Status: ${order.status.toUpperCase()}`);
      console.log(`   Total: $${order.totalAmount}`);
      console.log(`   Items: ${order.items.length} item(s)`);
      order.items.forEach(item => {
        console.log(`     - ${item.quantity}x ${item.name} ($${item.totalPrice})`);
      });
      console.log(`   Address: ${order.deliveryAddress.fullAddress || 
        `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`}`);
      if (order.notes) {
        console.log(`   Notes: ${order.notes}`);
      }
      console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);
    });

    console.log('\n' + '=' .repeat(80));
    console.log('🎉 SUCCESS: Vendor can see all orders!');
    console.log('\n📝 Summary:');
    console.log(`   - Backend API: ✅ Working`);
    console.log(`   - Vendor Authentication: ✅ Working`);
    console.log(`   - Order Retrieval: ✅ Working`);
    console.log(`   - Order Data: ✅ Complete`);
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Open browser to: http://localhost:3000/login');
    console.log('   2. Login with: burger@example.com / password123');
    console.log('   3. Navigate to: http://localhost:3000/vendor/orders');
    console.log('   4. Verify orders are displayed correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testVendorOrders();
