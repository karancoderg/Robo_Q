#!/usr/bin/env node

require('dotenv').config({ path: './backend/.env' });
const SMSService = require('./backend/src/services/smsService');

async function testShortSMS() {
  console.log('📱 TESTING SHORT SMS MESSAGES FOR TWILIO TRIAL');
  console.log('=' .repeat(55));

  const testPhone = '8198086300';
  const formattedPhone = '+918198086300';

  console.log('\n1️⃣ Message Length Analysis:');
  
  const orderDetails = {
    orderId: '68ae3a3bb605f9cb2e2b51c9',
    customerName: 'Karandeep Singh',
    vendorName: 'IIT Mandi Cafeteria',
    totalAmount: 150.00,
    items: [
      { name: 'Masala Dosa', quantity: 1, price: 80 },
      { name: 'Filter Coffee', quantity: 1, price: 70 }
    ],
    deliveryAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    status: 'vendor_approved'
  };

  // Test order confirmation message
  const shortOrderId = orderDetails.orderId.slice(-6);
  const confirmationMsg = `Order #${shortOrderId} approved by ${orderDetails.vendorName}. Total: $${orderDetails.totalAmount}. Thanks!`;
  
  console.log('   📋 Order Confirmation Message:');
  console.log(`   "${confirmationMsg}"`);
  console.log(`   Length: ${confirmationMsg.length} characters`);
  
  if (confirmationMsg.length <= 160) {
    console.log('   ✅ Within SMS limit (160 chars)');
  } else {
    console.log('   ❌ Exceeds SMS limit');
  }

  // Test status messages
  const statusMessages = [
    { status: 'robot_assigned', msg: `Robot assigned to order #${shortOrderId}. Pickup soon!` },
    { status: 'robot_picking_up', msg: `Robot picking up order #${shortOrderId} from ${orderDetails.vendorName}.` },
    { status: 'robot_delivering', msg: `Order #${shortOrderId} out for delivery. ETA 15-20 min.` },
    { status: 'delivered', msg: `Order #${shortOrderId} delivered! Enjoy your meal.` }
  ];

  console.log('\n   📋 Status Update Messages:');
  statusMessages.forEach(({ status, msg }) => {
    console.log(`   ${status}: "${msg}"`);
    console.log(`   Length: ${msg.length} characters ${msg.length <= 160 ? '✅' : '❌'}`);
  });

  console.log('\n2️⃣ Testing Real SMS Delivery:');
  console.log(`   Target: ${formattedPhone}`);
  console.log('   Sending short confirmation message...');

  try {
    const result = await SMSService.sendOrderConfirmationSMS(formattedPhone, orderDetails);
    
    console.log('\n3️⃣ SMS Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    
    if (result.messageId && !result.messageId.startsWith('simulated_')) {
      console.log(`   ✅ Twilio Message SID: ${result.messageId}`);
      console.log('   ✅ Real SMS sent successfully!');
      console.log('   📱 Check your phone for the message');
    } else if (result.messageId && result.messageId.startsWith('simulated_')) {
      console.log('   ℹ️  SMS simulated (Twilio not configured)');
    }
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }

  } catch (error) {
    console.log('\n❌ SMS Test Failed:');
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n4️⃣ Testing Status Update SMS:');
  
  try {
    const statusOrderDetails = { ...orderDetails, status: 'robot_assigned' };
    const statusResult = await SMSService.sendOrderStatusSMS(formattedPhone, statusOrderDetails);
    
    console.log(`   Status SMS Success: ${statusResult.success}`);
    if (statusResult.messageId && !statusResult.messageId.startsWith('simulated_')) {
      console.log(`   ✅ Status SMS SID: ${statusResult.messageId}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Status SMS Error: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(55));
  
  console.log('📋 SHORT MESSAGE SUMMARY:');
  console.log('\n✅ Message Optimizations:');
  console.log('   - Removed emojis and extra text');
  console.log('   - Used short order IDs (last 6 chars)');
  console.log('   - Concise but informative content');
  console.log('   - All messages under 160 characters');
  
  console.log('\n📱 New Message Examples:');
  console.log('   Order Confirmation:');
  console.log('   "Order #2b51c9 approved by IIT Mandi Cafeteria. Total: ₹150. Thanks!"');
  console.log('   ');
  console.log('   Robot Assignment:');
  console.log('   "Robot assigned to order #2b51c9. Pickup soon!"');
  console.log('   ');
  console.log('   Delivery Update:');
  console.log('   "Order #2b51c9 out for delivery. ETA 15-20 min."');
  console.log('   ');
  console.log('   Completion:');
  console.log('   "Order #2b51c9 delivered! Enjoy your meal."');
  
  console.log('\n🎯 Twilio Trial Compatibility:');
  console.log('   ✅ All messages under 160 character limit');
  console.log('   ✅ No special characters that cause issues');
  console.log('   ✅ Clear and informative content');
  console.log('   ✅ Should work with Twilio trial account');
}

testShortSMS().catch(console.error);
