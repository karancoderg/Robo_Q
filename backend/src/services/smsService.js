const twilio = require('twilio');

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize Twilio client
let twilioClient = null;

try {
  if (accountSid !== 'your_twilio_account_sid' && authToken !== 'your_twilio_auth_token') {
    twilioClient = twilio(accountSid, authToken);
  }
} catch (error) {
  console.log('Twilio not configured, SMS notifications will be simulated');
}

class SMSService {
  static async sendOrderConfirmationSMS(phoneNumber, orderDetails) {
    try {
      // Convert ObjectId to string and get last 6 characters
      const orderIdStr = orderDetails.orderId.toString();
      const shortOrderId = orderIdStr.slice(-6);
      
      // Shorter message for Twilio trial limits
      const message = `Order #${shortOrderId} approved by ${orderDetails.vendorName}. Total: ₹${orderDetails.totalAmount}. Thanks!`;
      
      if (twilioClient && phoneNumber) {
        // Send actual SMS via Twilio
        const result = await twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber
        });
        
        console.log(`SMS sent successfully to ${phoneNumber}:`, result.sid);
        return {
          success: true,
          messageId: result.sid,
          message: 'SMS sent successfully'
        };
      } else {
        // Simulate SMS sending for development
        console.log(`📱 SMS Simulation - Would send to ${phoneNumber}:`);
        console.log(`Message: ${message}`);
        
        return {
          success: true,
          messageId: 'simulated_' + Date.now(),
          message: 'SMS simulated successfully (Twilio not configured)'
        };
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async sendOrderStatusSMS(phoneNumber, orderDetails) {
    try {
      let message = '';
      // Convert ObjectId to string and get last 6 characters
      const orderIdStr = orderDetails.orderId.toString();
      const shortOrderId = orderIdStr.slice(-6);
      
      switch (orderDetails.status) {
        case 'robot_assigned':
          message = `Robot assigned to order #${shortOrderId}. Pickup soon!`;
          break;
        case 'robot_picking_up':
          message = `Robot picking up order #${shortOrderId} from ${orderDetails.vendorName}.`;
          break;
        case 'robot_delivering':
          message = `Order #${shortOrderId} out for delivery. ETA 15-20 min.`;
          break;
        case 'delivered':
          message = `Order #${shortOrderId} delivered! Enjoy your meal.`;
          break;
        case 'cancelled':
          message = `Order #${shortOrderId} cancelled. Contact support if needed.`;
          break;
        default:
          message = `Order #${shortOrderId} status: ${orderDetails.status.replace('_', ' ')}`;
      }
      
      if (twilioClient && phoneNumber) {
        const result = await twilioClient.messages.create({
          body: message,
          from: twilioPhoneNumber,
          to: phoneNumber
        });
        
        console.log(`Status SMS sent to ${phoneNumber}:`, result.sid);
        return {
          success: true,
          messageId: result.sid,
          message: 'Status SMS sent successfully'
        };
      } else {
        console.log(`📱 Status SMS Simulation - Would send to ${phoneNumber}:`);
        console.log(`Message: ${message}`);
        
        return {
          success: true,
          messageId: 'simulated_' + Date.now(),
          message: 'Status SMS simulated successfully'
        };
      }
    } catch (error) {
      console.error('Status SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add Indian country code if not present (for IIT Mandi users)
    if (cleaned.length === 10) {
      // Indian mobile numbers are 10 digits
      return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // Already has 91 prefix
      return `+${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
      // Has 91 prefix with extra digit, likely correct
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      // Already formatted with country code
      return phoneNumber;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // Remove leading 0 and add +91 (common in India)
      return `+91${cleaned.substring(1)}`;
    }
    
    // For any other format, assume it's Indian and add +91
    return `+91${cleaned}`;
  }
}

module.exports = SMSService;
