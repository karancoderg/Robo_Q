#!/usr/bin/env node

require('dotenv').config({ path: './backend/.env' });
const SMSService = require('./backend/src/services/smsService');

async function testTwilioSMS() {
  console.log('📱 TESTING TWILIO SMS TO INDIAN NUMBER');
  console.log('=' .repeat(50));

  // Test phone number
  const testPhone = '8198086300';
  const formattedPhone = '+918198086300';

  console.log('\n1️⃣ Configuration Check:');
  console.log(`   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET'}`);
  console.log(`   TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`   TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || 'NOT SET'}`);

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('\n⚠️  TWILIO CREDENTIALS NOT CONFIGURED');
    console.log('   SMS will run in SIMULATION MODE');
    console.log('\n   To test real SMS, add to backend/.env:');
    console.log('   TWILIO_ACCOUNT_SID=your_account_sid');
    console.log('   TWILIO_AUTH_TOKEN=your_auth_token');
    console.log('   TWILIO_PHONE_NUMBER=+1234567890');
  } else {
    console.log('\n✅ TWILIO CREDENTIALS CONFIGURED');
    console.log('   SMS will be sent via Twilio API');
  }

  console.log('\n2️⃣ Phone Number Formatting Test:');
  console.log(`   Input: ${testPhone}`);
  
  const formatted = SMSService.formatPhoneNumber(testPhone);
  console.log(`   Formatted: ${formatted}`);
  
  if (formatted === formattedPhone) {
    console.log('   ✅ Phone formatting: CORRECT');
  } else {
    console.log('   ❌ Phone formatting: INCORRECT');
    return;
  }

  console.log('\n3️⃣ SMS Content Test:');
  
  const orderDetails = {
    orderId: 'TEST_' + Date.now(),
    customerName: 'Karandeep Singh',
    vendorName: 'IIT Mandi Cafeteria',
    totalAmount: 250.00,
    items: [
      { name: 'Masala Dosa', quantity: 2, price: 80 },
      { name: 'Filter Coffee', quantity: 2, price: 45 }
    ],
    deliveryAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    status: 'vendor_approved'
  };

  console.log('   Order Details:');
  console.log(`   - Order ID: ${orderDetails.orderId}`);
  console.log(`   - Customer: ${orderDetails.customerName}`);
  console.log(`   - Restaurant: ${orderDetails.vendorName}`);
  console.log(`   - Total: ₹${orderDetails.totalAmount}`);
  console.log(`   - Address: ${orderDetails.deliveryAddress}`);

  console.log('\n4️⃣ Sending SMS Test:');
  console.log(`   Target: ${formatted}`);
  console.log('   Sending...');

  try {
    const result = await SMSService.sendOrderConfirmationSMS(formatted, orderDetails);
    
    console.log('\n5️⃣ SMS Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    
    if (result.messageId) {
      console.log(`   Message ID: ${result.messageId}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.success) {
      if (result.messageId.startsWith('simulated_')) {
        console.log('\n📱 SIMULATION MODE RESULT:');
        console.log('   ✅ SMS service is working correctly');
        console.log('   ✅ Phone number formatted properly');
        console.log('   ✅ Message content generated successfully');
        console.log('   ℹ️  To send real SMS, configure Twilio credentials');
      } else {
        console.log('\n📱 REAL SMS SENT SUCCESSFULLY!');
        console.log('   ✅ SMS delivered via Twilio');
        console.log('   ✅ Check your phone for the message');
        console.log(`   ✅ Twilio Message SID: ${result.messageId}`);
      }
    } else {
      console.log('\n❌ SMS SENDING FAILED');
      console.log(`   Error: ${result.error}`);
    }

  } catch (error) {
    console.log('\n❌ SMS TEST FAILED');
    console.log(`   Error: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  }

  console.log('\n' + '=' .repeat(50));
  
  // Instructions for real Twilio setup
  console.log('📋 TWILIO SETUP INSTRUCTIONS:');
  console.log('\n1️⃣ Get Twilio Account:');
  console.log('   - Sign up at https://www.twilio.com');
  console.log('   - Get Account SID and Auth Token');
  console.log('   - Get a Twilio phone number');
  
  console.log('\n2️⃣ Configure Environment:');
  console.log('   Add to backend/.env:');
  console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('   TWILIO_AUTH_TOKEN=your_auth_token_here');
  console.log('   TWILIO_PHONE_NUMBER=+1234567890');
  
  console.log('\n3️⃣ Test Real SMS:');
  console.log('   - Run this script again after configuration');
  console.log('   - SMS will be sent to +918198086300');
  console.log('   - Check your phone for the message');
  
  console.log('\n4️⃣ Production Usage:');
  console.log('   - Order approval will send real SMS');
  console.log('   - Status updates will notify customers');
  console.log('   - All Indian numbers properly formatted');
}

// Run the test
testTwilioSMS().catch(console.error);
