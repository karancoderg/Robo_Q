import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email: string, otp: string, type: string): Promise<boolean> {
    try {
      const subject = this.getOTPSubject(type);
      const html = this.getOTPTemplate(otp, type);

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      logger.info(`OTP email sent to ${email} for ${type}`);
      return true;
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      return false;
    }
  }

  async sendOrderNotification(email: string, orderData: any): Promise<boolean> {
    try {
      const subject = `Order Update - ${orderData.status}`;
      const html = this.getOrderTemplate(orderData);

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      logger.info(`Order notification sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send order notification:', error);
      return false;
    }
  }

  private getOTPSubject(type: string): string {
    switch (type) {
      case 'email_verification':
        return 'Verify Your Email - Delivery Robot';
      case 'login':
        return 'Login OTP - Delivery Robot';
      case 'delivery_confirmation':
        return 'Delivery Confirmation OTP';
      default:
        return 'OTP Verification - Delivery Robot';
    }
  }

  private getOTPTemplate(otp: string, type: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .otp { font-size: 32px; font-weight: bold; color: #3B82F6; text-align: center; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 Delivery Robot</h1>
          </div>
          <div class="content">
            <h2>Your OTP Code</h2>
            <p>Use the following OTP to complete your ${type.replace('_', ' ')}:</p>
            <div class="otp">${otp}</div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Delivery Robot Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOrderTemplate(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .status { font-size: 24px; font-weight: bold; color: #3B82F6; margin: 20px 0; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤖 Delivery Robot</h1>
          </div>
          <div class="content">
            <h2>Order Update</h2>
            <div class="status">Status: ${orderData.status.replace('_', ' ').toUpperCase()}</div>
            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderData._id}</p>
              <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
              <p><strong>Items:</strong> ${orderData.items.length} item(s)</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Delivery Robot Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
