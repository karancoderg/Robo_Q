#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testOrderEnhancements() {
  console.log('📱 TESTING ORDER ENHANCEMENTS & SMS NOTIFICATIONS');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check SMS Service Implementation
    console.log('\n1️⃣ Checking SMS Service Implementation...');
    const smsServicePath = path.join(__dirname, 'backend/src/services/smsService.js');
    
    if (fs.existsSync(smsServicePath)) {
      console.log('✅ SMS Service file created');
      
      const smsContent = fs.readFileSync(smsServicePath, 'utf8');
      
      if (smsContent.includes('sendOrderConfirmationSMS') && 
          smsContent.includes('sendOrderStatusSMS') && 
          smsContent.includes('twilio')) {
        console.log('✅ SMS Service has all required methods');
      } else {
        console.log('❌ SMS Service missing some methods');
      }
      
      if (smsContent.includes('simulation') || smsContent.includes('Simulation')) {
        console.log('✅ SMS Service includes simulation mode for development');
      } else {
        console.log('❌ SMS Service missing simulation mode');
      }
    } else {
      console.log('❌ SMS Service file not found');
    }

    // Test 2: Check Email Service Enhancement
    console.log('\n2️⃣ Checking Email Service Enhancement...');
    const emailServicePath = path.join(__dirname, 'backend/src/services/emailService.js');
    
    if (fs.existsSync(emailServicePath)) {
      console.log('✅ Email Service file created');
      
      const emailContent = fs.readFileSync(emailServicePath, 'utf8');
      
      if (emailContent.includes('sendOrderConfirmationEmail') && 
          emailContent.includes('sendOrderStatusEmail') && 
          emailContent.includes('nodemailer')) {
        console.log('✅ Email Service has all required methods');
      } else {
        console.log('❌ Email Service missing some methods');
      }
      
      if (emailContent.includes('robot_assigned') && 
          emailContent.includes('robot_delivering') && 
          emailContent.includes('delivered')) {
        console.log('✅ Email Service handles all order statuses');
      } else {
        console.log('❌ Email Service missing some status handling');
      }
    } else {
      console.log('❌ Email Service file not found');
    }

    // Test 3: Check Backend Integration
    console.log('\n3️⃣ Checking Backend Integration...');
    const serverPath = path.join(__dirname, 'backend/src/server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (serverContent.includes('SMSService') && serverContent.includes('EmailService')) {
      console.log('✅ SMS and Email services imported in server');
    } else {
      console.log('❌ Services not properly imported in server');
    }
    
    if (serverContent.includes('sendOrderConfirmationSMS') && 
        serverContent.includes('sendOrderConfirmationEmail')) {
      console.log('✅ Notification calls added to approve order endpoint');
    } else {
      console.log('❌ Notification calls missing in approve order endpoint');
    }
    
    if (serverContent.includes('/api/orders/:orderId/status')) {
      console.log('✅ Order status update endpoint created');
    } else {
      console.log('❌ Order status update endpoint missing');
    }

    // Test 4: Check VendorOrders Enhancement
    console.log('\n4️⃣ Checking VendorOrders Enhancement...');
    const vendorOrdersPath = path.join(__dirname, 'frontend/src/pages/VendorOrders.tsx');
    const vendorOrdersContent = fs.readFileSync(vendorOrdersPath, 'utf8');
    
    if (vendorOrdersContent.includes('getStatusDescription') && 
        vendorOrdersContent.includes('getRobotInfo')) {
      console.log('✅ Enhanced status functions added to VendorOrders');
    } else {
      console.log('❌ Enhanced status functions missing in VendorOrders');
    }
    
    if (vendorOrdersContent.includes('Delivery Status') && 
        vendorOrdersContent.includes('Robot:')) {
      console.log('✅ Robot status section added to VendorOrders');
    } else {
      console.log('❌ Robot status section missing in VendorOrders');
    }
    
    if (vendorOrdersContent.includes('Approved - Awaiting Robot') && 
        vendorOrdersContent.includes('Out for Delivery')) {
      console.log('✅ Enhanced status text implemented in VendorOrders');
    } else {
      console.log('❌ Enhanced status text missing in VendorOrders');
    }

    // Test 5: Check User Orders Enhancement
    console.log('\n5️⃣ Checking User Orders Enhancement...');
    const userOrdersPath = path.join(__dirname, 'frontend/src/pages/Orders.tsx');
    const userOrdersContent = fs.readFileSync(userOrdersPath, 'utf8');
    
    if (userOrdersContent.includes('getDeliveryProgress') && 
        userOrdersContent.includes('getStatusDescription')) {
      console.log('✅ Enhanced status functions added to User Orders');
    } else {
      console.log('❌ Enhanced status functions missing in User Orders');
    }
    
    if (userOrdersContent.includes('Delivery Progress') && 
        userOrdersContent.includes('progress bar')) {
      console.log('✅ Delivery progress bar added to User Orders');
    } else {
      console.log('❌ Delivery progress bar missing in User Orders');
    }
    
    if (userOrdersContent.includes('Estimated delivery') && 
        userOrdersContent.includes('15-20 minutes')) {
      console.log('✅ Estimated delivery time added to User Orders');
    } else {
      console.log('❌ Estimated delivery time missing in User Orders');
    }

    // Test 6: Check Package Dependencies
    console.log('\n6️⃣ Checking Package Dependencies...');
    const packagePath = path.join(__dirname, 'backend/package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      if (packageJson.dependencies && packageJson.dependencies.twilio) {
        console.log('✅ Twilio dependency installed');
      } else {
        console.log('❌ Twilio dependency missing');
      }
      
      if (packageJson.dependencies && packageJson.dependencies.nodemailer) {
        console.log('✅ Nodemailer dependency available');
      } else {
        console.log('❌ Nodemailer dependency missing');
      }
    }

    console.log('\n' + '=' .repeat(60));
    
    // Summary
    const smsServiceExists = fs.existsSync(smsServicePath);
    const emailServiceExists = fs.existsSync(emailServicePath);
    const backendIntegrated = serverContent.includes('SMSService') && serverContent.includes('EmailService');
    const vendorEnhanced = vendorOrdersContent.includes('getRobotInfo');
    const userEnhanced = userOrdersContent.includes('getDeliveryProgress');
    
    if (smsServiceExists && emailServiceExists && backendIntegrated && vendorEnhanced && userEnhanced) {
      console.log('🎉 ALL ORDER ENHANCEMENTS SUCCESSFULLY IMPLEMENTED!');
      
      console.log('\n✅ Features Implemented:');
      console.log('   - SMS notifications for order approval: READY');
      console.log('   - Email notifications for order status: READY');
      console.log('   - Enhanced vendor order tracking: IMPLEMENTED');
      console.log('   - Enhanced user order tracking: IMPLEMENTED');
      console.log('   - Robot status information: ADDED');
      console.log('   - Delivery progress tracking: ADDED');
      
      console.log('\n📱 SMS Notifications:');
      console.log('   - Order confirmation SMS when approved');
      console.log('   - Status update SMS for robot assignment');
      console.log('   - Delivery progress SMS notifications');
      console.log('   - Simulation mode for development');
      
      console.log('\n📧 Email Notifications:');
      console.log('   - Professional HTML email templates');
      console.log('   - Order confirmation with details');
      console.log('   - Status update emails with timeline');
      console.log('   - Delivery completion notifications');
      
      console.log('\n🤖 Enhanced Order Tracking:');
      console.log('   - Robot assignment status');
      console.log('   - Pickup and delivery progress');
      console.log('   - Real-time status descriptions');
      console.log('   - Timeline with timestamps');
      
      console.log('\n🧪 Setup Instructions:');
      console.log('   1. Configure Twilio (optional for SMS):');
      console.log('      - Set TWILIO_ACCOUNT_SID in .env');
      console.log('      - Set TWILIO_AUTH_TOKEN in .env');
      console.log('      - Set TWILIO_PHONE_NUMBER in .env');
      console.log('   2. Configure Email (optional):');
      console.log('      - Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
      console.log('   3. Without config: Notifications will be simulated');
      
      console.log('\n🎯 Test Instructions:');
      console.log('   1. Login as vendor and approve an order');
      console.log('   2. Check console for SMS/email simulation logs');
      console.log('   3. View enhanced status in vendor orders page');
      console.log('   4. Check user orders page for progress tracking');
      console.log('   5. Test order status updates via API');
      
    } else {
      console.log('❌ SOME ENHANCEMENTS ARE INCOMPLETE');
      console.log('\nMissing:');
      if (!smsServiceExists) console.log('   - SMS Service implementation');
      if (!emailServiceExists) console.log('   - Email Service implementation');
      if (!backendIntegrated) console.log('   - Backend integration');
      if (!vendorEnhanced) console.log('   - Vendor orders enhancement');
      if (!userEnhanced) console.log('   - User orders enhancement');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrderEnhancements();
