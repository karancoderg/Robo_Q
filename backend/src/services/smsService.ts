import twilio from 'twilio';
import { logger } from '../config/logger';

class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string = '';

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    } else {
      logger.warn('Twilio credentials not configured, SMS service disabled');
    }
  }

  async sendOTP(phoneNumber: string, otp: string, type: string): Promise<boolean> {
    if (!this.client) {
      logger.warn('SMS service not configured, skipping SMS');
      return false;
    }

    try {
      const message = this.getOTPMessage(otp, type);
      
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      logger.info(`OTP SMS sent to ${phoneNumber} for ${type}`);
      return true;
    } catch (error) {
      logger.error('Failed to send OTP SMS:', error);
      return false;
    }
  }

  async sendOrderNotification(phoneNumber: string, orderData: any): Promise<boolean> {
    if (!this.client) {
      logger.warn('SMS service not configured, skipping SMS');
      return false;
    }

    try {
      const message = this.getOrderMessage(orderData);
      
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });

      logger.info(`Order notification SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error('Failed to send order notification SMS:', error);
      return false;
    }
  }

  private getOTPMessage(otp: string, type: string): string {
    const typeText = type.replace('_', ' ');
    return `🤖 Delivery Robot\n\nYour OTP for ${typeText}: ${otp}\n\nThis code expires in 10 minutes.`;
  }

  private getOrderMessage(orderData: any): string {
    const status = orderData.status.replace('_', ' ').toUpperCase();
    let message = `🤖 RoboQ Delivery\n\n${status}\nOrder #${orderData._id}`;
    
    if (orderData.vendorName) {
      message += `\nFrom: ${orderData.vendorName}`;
    }
    
    if (orderData.totalAmount) {
      message += `\nTotal: ₹${orderData.totalAmount}`;
    }
    
    if (orderData.robotName) {
      message += `\nRobot: ${orderData.robotName}`;
    }
    
    if (status === 'ROBOT ASSIGNED') {
      message += `\n\n🚀 Your robot is on the way! Track your order in the app.`;
    } else if (status === 'ORDER PLACED') {
      message += `\n\n✅ We're preparing your order. You'll get updates via SMS.`;
    } else if (status === 'VENDOR APPROVED') {
      message += `\n\n👨‍🍳 Your order is being prepared. Robot assignment coming soon!`;
    } else if (status === 'ROBOT DELIVERING') {
      message += `\n\n🚚 Your order is out for delivery! ETA: 10-15 mins`;
    } else if (status === 'DELIVERED') {
      message += `\n\n✅ Order delivered successfully! Enjoy your meal!`;
    }
    
    return message;
  }
}

export default new SMSService();
