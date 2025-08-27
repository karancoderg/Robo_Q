#!/usr/bin/env node

require('dotenv').config({ path: './backend/.env' });
const EnhancedSMSService = require('./backend/src/services/enhancedSmsService');

async function testEnhancedSMSDirect() {
  console.log('🚀 TESTING ENHANCED SMS SERVICE DIRECTLY');
  console.log('=' .repeat(50));

  const testPhone = '8198086300';
  
  console.log('\n1️⃣ Testing Order Approved SMS...');
  
  const testOrder = {
    _id: '68ae3ccc514df80701fe626e',
    userId: { 
      name: 'Karandeep Singh', 
      phone: testPhone,
      email: 'ks9637148@gmail.com'
    },
    vendorId: { businessName: 'IIT Mandi Cafeteria' },
    totalAmount: 299.99,
    status: 'vendor_approved'
  };

  try {
    const result = await EnhancedSMSService.triggerAutomaticSMS(testOrder, 'order_approved');
    console.log('✅ Order Approved SMS Result:', result);
    
    if (result.success) {
      console.log('📱 SMS sent successfully!');
      console.log(`   Phone: ${result.phone}`);
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.log('❌ SMS failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n2️⃣ Testing All SMS Types...');
  
  try {
    await EnhancedSMSService.testAllSMSTypes(testPhone);
    console.log('✅ All SMS types tested!');
  } catch (error) {
    console.log('❌ All SMS test failed:', error.message);
  }

  console.log('\n🎉 Enhanced SMS Direct Test Complete!');
  console.log('📱 Check your phone for SMS messages from +15135404976');
}

testEnhancedSMSDirect().catch(console.error);
