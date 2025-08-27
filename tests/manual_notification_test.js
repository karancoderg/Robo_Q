#!/usr/bin/env node

const axios = require('axios');

async function testNotification() {
  try {
    console.log('🧪 MANUAL NOTIFICATION TEST');
    console.log('=' .repeat(40));

    // Your auth token (replace with current token)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMTk3N2UwOWI5MjAzMmQzYTA4ZDgiLCJlbWFpbCI6ImtzOTYzNzE0OEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NjI0Njc3MCwiZXhwIjoxNzU2ODUxNTcwfQ.vC8JxoZe0xCBhfgfR6DaTLbLvoNYM8Fmv3bP3sWkwzA';

    // Get a pending order to approve
    console.log('📋 Fetching pending orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (ordersResponse.data.success) {
      const orders = ordersResponse.data.data.orders;
      const pendingOrder = orders.find(order => order.status === 'pending');
      
      if (pendingOrder) {
        console.log(`✅ Found pending order: ${pendingOrder._id}`);
        console.log(`   Vendor: ${pendingOrder.vendorId.businessName}`);
        console.log(`   Amount: ₹${pendingOrder.totalAmount}`);
        
        // Now we need to approve this order as a vendor
        // First, let's get the vendor token for this order's vendor
        console.log('\n🏪 This would normally be done by the vendor...');
        console.log('   The vendor would approve the order, triggering the notification');
        console.log('   Check your browser console for Socket.IO connection logs');
        console.log('   Then approve an order from the vendor dashboard');
        
      } else {
        console.log('❌ No pending orders found to test with');
        console.log('   Create a new order first, then approve it as a vendor');
      }
    }

    // Test notification API endpoint
    console.log('\n📡 Testing notification API...');
    const notificationsResponse = await axios.get('http://localhost:5000/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (notificationsResponse.data.success) {
      const notifications = notificationsResponse.data.data.notifications;
      console.log(`✅ Found ${notifications.length} notifications in database`);
      
      if (notifications.length > 0) {
        console.log('\n📝 Latest notification:');
        const latest = notifications[0];
        console.log(`   Title: ${latest.title}`);
        console.log(`   Message: ${latest.message}`);
        console.log(`   Type: ${latest.type}`);
        console.log(`   Created: ${latest.createdAt}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testNotification();
