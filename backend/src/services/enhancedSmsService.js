require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('🔍 Twilio Config Check:');
console.log(`   Account SID: ${accountSid ? 'SET' : 'NOT SET'}`);
console.log(`   Auth Token: ${authToken ? 'SET' : 'NOT SET'}`);
console.log(`   Phone Number: ${twilioPhoneNumber || 'NOT SET'}`);

let twilioClient = null;
if (accountSid && authToken && twilioPhoneNumber) {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Enhanced Twilio SMS client initialized successfully');
} else {
  console.log('⚠️ Twilio credentials not configured - Enhanced SMS will run in simulation mode');
}

class EnhancedSMSService {
  
  // Generate OTP for delivery verification
  static generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  }

  // Format phone number for Indian users
  static formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      return phoneNumber;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return `+91${cleaned.substring(1)}`;
    }
    
    return `+91${cleaned}`;
  }

  // Send SMS with automatic retry and logging
  static async sendSMS(phoneNumber, message, eventType = 'general') {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      if (!formattedPhone) {
        throw new Error('Invalid phone number');
      }

      // Ensure message is under 160 characters for trial
      if (message.length > 160) {
        message = message.substring(0, 157) + '...';
      }

      console.log(`📱 SMS [${eventType}] to ${formattedPhone}: "${message}"`);

      if (twilioClient) {
        const result = await twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: formattedPhone
        });
        
        console.log(`✅ SMS sent successfully - SID: ${result.sid}`);
        return {
          success: true,
          messageId: result.sid,
          message: 'SMS sent successfully',
          phone: formattedPhone,
          eventType
        };
      } else {
        // Simulation mode
        console.log(`📱 SMS SIMULATION [${eventType}] - Would send to ${formattedPhone}:`);
        console.log(`Message: ${message}`);
        
        return {
          success: true,
          messageId: 'simulated_' + Date.now(),
          message: 'SMS simulated successfully (Twilio not configured)',
          phone: formattedPhone,
          eventType
        };
      }
    } catch (error) {
      console.error(`❌ SMS [${eventType}] failed:`, error.message);
      return {
        success: false,
        error: error.message,
        eventType
      };
    }
  }

  // 1. Order Approved SMS
  static async sendOrderApprovedSMS(phoneNumber, orderDetails) {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Order #${shortOrderId} approved by ${orderDetails.vendorName}. Total: ₹${orderDetails.totalAmount}. Thanks!`;
    
    return await this.sendSMS(phoneNumber, message, 'order_approved');
  }

  // 2. Robot Assigned SMS
  static async sendRobotAssignedSMS(phoneNumber, orderDetails) {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Robot assigned to order #${shortOrderId}. Pickup starting soon!`;
    
    return await this.sendSMS(phoneNumber, message, 'robot_assigned');
  }

  // 3. Pickup Successful SMS
  static async sendPickupSuccessfulSMS(phoneNumber, orderDetails) {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Order #${shortOrderId} picked up successfully. On the way to you!`;
    
    return await this.sendSMS(phoneNumber, message, 'pickup_successful');
  }

  // 4. Out for Delivery SMS
  static async sendOutForDeliverySMS(phoneNumber, orderDetails) {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Order #${shortOrderId} out for delivery. ETA 15-20 min.`;
    
    return await this.sendSMS(phoneNumber, message, 'out_for_delivery');
  }

  // 5. Delivery OTP SMS
  static async sendDeliveryOTPSMS(phoneNumber, orderDetails, otp) {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Order #${shortOrderId} arrived! Your OTP: ${otp}. Share with delivery robot.`;
    
    return await this.sendSMS(phoneNumber, message, 'delivery_otp');
  }

  // 6. Delivery Confirmed SMS
  static async sendDeliveryConfirmedSMS(phoneNumber, orderDetails) {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Order #${shortOrderId} delivered successfully! Enjoy your meal. Rate us!`;
    
    return await this.sendSMS(phoneNumber, message, 'delivery_confirmed');
  }

  // 7. Order Cancelled SMS
  static async sendOrderCancelledSMS(phoneNumber, orderDetails, reason = '') {
    const orderIdStr = orderDetails.orderId.toString();
    const shortOrderId = orderIdStr.slice(-6);
    
    const message = `Order #${shortOrderId} cancelled. ${reason} Contact support if needed.`;
    
    return await this.sendSMS(phoneNumber, message, 'order_cancelled');
  }

  // Automatic SMS trigger based on order status
  static async triggerAutomaticSMS(order, eventType, additionalData = {}) {
    try {
      // Get customer phone number - prioritize order's customerPhone, then user's phone
      let customerPhone = null;
      
      if (order.customerPhone) {
        customerPhone = order.customerPhone;
      } else if (order.userId && typeof order.userId === 'object' && order.userId.phone) {
        customerPhone = order.userId.phone;
      }

      if (!customerPhone) {
        console.log(`⚠️ No phone number available for order ${order._id} - skipping SMS`);
        return { success: false, error: 'No phone number available' };
      }

      const orderDetails = {
        orderId: order._id,
        customerName: order.userId?.name || 'Customer',
        vendorName: order.vendorId?.businessName || 'Restaurant',
        totalAmount: order.totalAmount,
        items: order.items,
        status: order.status
      };

      let result;

      switch (eventType) {
        case 'order_approved':
          result = await this.sendOrderApprovedSMS(customerPhone, orderDetails);
          break;
          
        case 'robot_assigned':
          result = await this.sendRobotAssignedSMS(customerPhone, orderDetails);
          break;
          
        case 'pickup_successful':
          result = await this.sendPickupSuccessfulSMS(customerPhone, orderDetails);
          break;
          
        case 'out_for_delivery':
          result = await this.sendOutForDeliverySMS(customerPhone, orderDetails);
          break;
          
        case 'delivery_otp':
          const otp = additionalData.otp || this.generateOTP();
          result = await this.sendDeliveryOTPSMS(customerPhone, orderDetails, otp);
          break;
          
        case 'delivery_confirmed':
          result = await this.sendDeliveryConfirmedSMS(customerPhone, orderDetails);
          break;
          
        case 'order_cancelled':
          result = await this.sendOrderCancelledSMS(customerPhone, orderDetails, additionalData.reason);
          break;
          
        default:
          console.log(`⚠️ Unknown SMS event type: ${eventType}`);
          return { success: false, error: 'Unknown event type' };
      }

      console.log(`📱 Automatic SMS [${eventType}] result:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Automatic SMS [${eventType}] failed:`, error);
      return { success: false, error: error.message };
    }
  }

  // Test all SMS types
  static async testAllSMSTypes(phoneNumber = '8198086300') {
    console.log('🧪 TESTING ALL SMS TYPES');
    console.log('=' .repeat(40));

    const testOrder = {
      _id: '68ae3ccc514df80701fe626e',
      userId: { name: 'Test User', phone: phoneNumber },
      vendorId: { businessName: 'Test Restaurant' },
      totalAmount: 299.99,
      status: 'pending'
    };

    const tests = [
      { type: 'order_approved', data: {} },
      { type: 'robot_assigned', data: {} },
      { type: 'pickup_successful', data: {} },
      { type: 'out_for_delivery', data: {} },
      { type: 'delivery_otp', data: { otp: '1234' } },
      { type: 'delivery_confirmed', data: {} },
      { type: 'order_cancelled', data: { reason: 'Test cancellation' } }
    ];

    for (const test of tests) {
      console.log(`\n📱 Testing ${test.type}...`);
      const result = await this.triggerAutomaticSMS(testOrder, test.type, test.data);
      console.log(`Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
      
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 All SMS tests completed!');
  }
}

module.exports = EnhancedSMSService;
