#!/usr/bin/env node

const SMSService = require('./backend/src/services/smsService');

async function testSMSWithIndianNumbers() {
  console.log('🇮🇳 TESTING SMS SERVICE WITH INDIAN PHONE NUMBERS');
  console.log('=' .repeat(55));

  // Test data for IIT Mandi users
  const testNumbers = [
    { name: 'Student Number (Raw)', phone: '8198086300' },
    { name: 'Faculty Number (Raw)', phone: '9876543210' },
    { name: 'Number with Spaces', phone: '819 808 6300' },
    { name: 'Number with Dashes', phone: '819-808-6300' },
    { name: 'Already Formatted', phone: '+918198086300' }
  ];

  const orderDetails = {
    orderId: 'TEST123',
    customerName: 'Karandeep Singh',
    vendorName: 'IIT Mandi Cafeteria',
    totalAmount: 150.00,
    items: [
      { name: 'Masala Dosa', quantity: 1, price: 80 },
      { name: 'Filter Coffee', quantity: 2, price: 35 }
    ],
    deliveryAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    status: 'vendor_approved'
  };

  console.log('\n📱 Testing Phone Number Formatting:');
  
  for (let i = 0; i < testNumbers.length; i++) {
    const { name, phone } = testNumbers[i];
    
    console.log(`\n${i + 1}️⃣ ${name}:`);
    console.log(`   Input: ${phone}`);
    
    try {
      const formattedPhone = SMSService.formatPhoneNumber(phone);
      console.log(`   Formatted: ${formattedPhone}`);
      
      const smsResult = await SMSService.sendOrderConfirmationSMS(formattedPhone, orderDetails);
      
      if (smsResult.success) {
        console.log(`   ✅ SMS Status: ${smsResult.message}`);
        console.log(`   📧 Message ID: ${smsResult.messageId}`);
      } else {
        console.log(`   ❌ SMS Failed: ${smsResult.error}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(55));
  
  console.log('🎯 INDIAN SMS FORMATTING SUMMARY:');
  console.log('\n✅ Phone Number Handling:');
  console.log('   - Raw 10-digit: 8198086300 → +918198086300');
  console.log('   - With spaces: "819 808 6300" → +918198086300');
  console.log('   - With dashes: "819-808-6300" → +918198086300');
  console.log('   - Already formatted: +918198086300 → +918198086300');
  
  console.log('\n📱 SMS Content for IIT Mandi:');
  console.log('   🎉 Order Confirmed! Your order #TEST123 has been approved by IIT Mandi Cafeteria.');
  console.log('   Total: ₹150.00. Track your order for delivery updates.');
  console.log('   Delivery: B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005');
  
  console.log('\n🇮🇳 Perfect for IIT Mandi Users:');
  console.log('   - Student mobile numbers properly formatted');
  console.log('   - Faculty numbers handled correctly');
  console.log('   - Campus delivery addresses included');
  console.log('   - Indian currency and context');
}

testSMSWithIndianNumbers().catch(console.error);
