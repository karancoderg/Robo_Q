#!/usr/bin/env node

const SMSService = require('./backend/src/services/smsService');
const EmailService = require('./backend/src/services/emailService');

async function debugNotifications() {
  console.log('🔍 DEBUGGING NOTIFICATION SYSTEM');
  console.log('=' .repeat(50));

  // Test data similar to actual order
  const orderDetails = {
    orderId: '68ae3749d755f12017707d99',
    customerName: 'karandeep singh',
    vendorName: 'Burger Palace',
    totalAmount: 21.98,
    items: [
      { name: 'Chicken Burger', quantity: 1, price: 11.99 },
      { name: 'Classic Burger', quantity: 1, price: 9.99 }
    ],
    deliveryAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
    status: 'vendor_approved'
  };

  const customerPhone = '8198086300';
  const customerEmail = 'ks9637148@gmail.com';

  console.log('\n1️⃣ Testing SMS Service...');
  try {
    const formattedPhone = SMSService.formatPhoneNumber(customerPhone);
    console.log(`📱 Formatted Phone: ${formattedPhone}`);
    
    const smsResult = await SMSService.sendOrderConfirmationSMS(formattedPhone, orderDetails);
    console.log('✅ SMS Result:', smsResult);
  } catch (error) {
    console.log('❌ SMS Error:', error.message);
    console.log('❌ SMS Stack:', error.stack);
  }

  console.log('\n2️⃣ Testing Email Service...');
  try {
    const emailResult = await EmailService.sendOrderConfirmationEmail(customerEmail, orderDetails);
    console.log('✅ Email Result:', emailResult);
  } catch (error) {
    console.log('❌ Email Error:', error.message);
    console.log('❌ Email Stack:', error.stack);
  }

  console.log('\n3️⃣ Testing Address Handling...');
  
  // Test the problematic address handling
  const mockOrder = {
    deliveryAddress: {
      coordinates: { lat: 31.7754, lng: 77.0269 },
      id: "hostel_b10",
      name: "B10 Hostel",
      category: "hostels",
      fullAddress: "B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005"
    }
  };

  // This is what the current code does (WRONG)
  const wrongAddress = mockOrder.deliveryAddress ? 
    `${mockOrder.deliveryAddress.street}, ${mockOrder.deliveryAddress.city}` : 
    'Not provided';
  
  console.log('❌ Wrong Address Handling:', wrongAddress);

  // This is what it should do (CORRECT)
  const correctAddress = mockOrder.deliveryAddress ? 
    (mockOrder.deliveryAddress.fullAddress || 
     mockOrder.deliveryAddress.name || 
     `${mockOrder.deliveryAddress.street || ''}, ${mockOrder.deliveryAddress.city || ''}`.trim()) : 
    'Not provided';
  
  console.log('✅ Correct Address Handling:', correctAddress);

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 DIAGNOSIS COMPLETE');
}

debugNotifications().catch(console.error);
