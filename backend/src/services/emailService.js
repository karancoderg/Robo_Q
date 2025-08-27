const nodemailer = require('nodemailer');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Email configuration using correct environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
};

// Create transporter
let transporter = null;

try {
  if (emailConfig.auth.user !== 'your_email@gmail.com' && emailConfig.auth.pass !== 'your_app_password') {
    transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ Email service configured successfully');
  } else {
    console.log('⚠️ Email service not configured - using simulation mode');
  }
} catch (error) {
  console.log('❌ Email configuration error:', error.message);
  console.log('📧 Email notifications will be simulated');
}

class EmailService {
  // Test email configuration
  static async testEmailConfiguration() {
    try {
      if (!transporter) {
        return {
          success: false,
          message: 'Email transporter not configured'
        };
      }

      await transporter.verify();
      console.log('✅ Email server connection verified');
      return {
        success: true,
        message: 'Email configuration is working'
      };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Send welcome email for new Google OAuth users
  static async sendWelcomeEmail(email, name, isGoogleUser = false) {
    try {
      const subject = `Welcome to NexDrop! ${isGoogleUser ? '🎉' : ''}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .welcome-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }
            .setup-box { background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #F59E0B; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .btn { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 Welcome to NexDrop!</h1>
              <p>Your autonomous delivery service</p>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2>Hello ${name}! 👋</h2>
                <p>Thank you for joining NexDrop${isGoogleUser ? ' via Google' : ''}! We're excited to have you on board.</p>
                ${isGoogleUser ? '<p><strong>🚀 Next Step:</strong> Complete your account setup to start ordering!</p>' : ''}
              </div>
              
              ${isGoogleUser ? `
              <div class="setup-box">
                <h3>📋 Complete Your Setup</h3>
                <p>To get started with NexDrop, please:</p>
                <ul style="text-align: left; margin: 10px 0;">
                  <li>✅ Set your password for email login</li>
                  <li>✅ Choose your account type (Customer or Vendor)</li>
                  <li>✅ Add your delivery address</li>
                </ul>
                <p><strong>This will only take 2 minutes!</strong></p>
              </div>
              ` : ''}
              
              <div class="feature-list">
                <h3>What you can do with NexDrop:</h3>
                <ul style="text-align: left;">
                  <li>🍕 Order food from local restaurants</li>
                  <li>🛒 Get groceries delivered</li>
                  <li>🤖 Track your robot delivery in real-time</li>
                  <li>📱 Receive SMS and email updates</li>
                  <li>⭐ Rate and review your experience</li>
                </ul>
              </div>
              
              <div class="welcome-box">
                <p>${isGoogleUser ? 'Complete your setup to start browsing!' : 'Ready to place your first order?'}</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${isGoogleUser ? '/complete-setup' : '/items'}" class="btn">
                  ${isGoogleUser ? 'Complete Setup' : 'Browse Items'}
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@nexdrop.com</p>
              <p>This is an automated message from NexDrop.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send password setup notification for Google users
  static async sendPasswordSetupEmail(email, name, temporaryPassword) {
    try {
      const subject = 'Your DeliveryBot Password Setup';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .password-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; border: 2px solid #10B981; }
            .warning-box { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #F59E0B; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .password { font-family: monospace; font-size: 18px; font-weight: bold; color: #059669; background: #ECFDF5; padding: 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Setup Complete!</h1>
              <p>You can now login with email and password</p>
            </div>
            <div class="content">
              <div class="password-box">
                <h2>Hello ${name}!</h2>
                <p>Great news! We've set up email/password login for your Google account.</p>
                <p><strong>Your login credentials:</strong></p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong></p>
                <div class="password">${temporaryPassword}</div>
              </div>
              
              <div class="warning-box">
                <h3>🔒 Important Security Notice:</h3>
                <ul style="text-align: left;">
                  <li>Please change this password after your first login</li>
                  <li>You can still login using Google OAuth</li>
                  <li>Keep your password secure and don't share it</li>
                  <li>Use a strong, unique password for better security</li>
                </ul>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <h3>Login Options:</h3>
                <p>✅ <strong>Google OAuth:</strong> Click "Sign in with Google"</p>
                <p>✅ <strong>Email/Password:</strong> Use the credentials above</p>
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request this, please contact support immediately.</p>
              <p>This is an automated message from DeliveryBot.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      console.error('Password setup email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generic email sending method
  static async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (transporter && to) {
        const mailOptions = {
          from: `"DeliveryBot" <${emailConfig.auth.user}>`,
          to: to,
          subject: subject,
          html: htmlContent
        };

        if (textContent) {
          mailOptions.text = textContent;
        }

        const result = await transporter.sendMail(mailOptions);
        
        console.log(`📧 Email sent to ${to}: ${subject}`);
        return {
          success: true,
          messageId: result.messageId,
          message: 'Email sent successfully'
        };
      } else {
        console.log(`📧 Email Simulation - Would send to ${to}:`);
        console.log(`Subject: ${subject}`);
        
        return {
          success: true,
          messageId: 'simulated_' + Date.now(),
          message: 'Email simulated successfully (SMTP not configured)'
        };
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  // Send order confirmation email
  static async sendOrderConfirmationEmail(email, orderDetails) {
    try {
      const subject = `Order Confirmed - #${orderDetails.orderId}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .status-badge { background: #10B981; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
              <p>Your order has been approved and is being prepared</p>
            </div>
            <div class="content">
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
                <p><strong>Restaurant:</strong> ${orderDetails.vendorName}</p>
                <p><strong>Status:</strong> <span class="status-badge">Approved</span></p>
                <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
                <p><strong>Customer:</strong> ${orderDetails.customerName}</p>
              </div>
              
              <div class="order-details">
                <h3>Order Items</h3>
                ${orderDetails.items.map(item => `
                  <p>${item.quantity}x ${item.name} - ₹${(item.quantity * item.price).toFixed(2)}</p>
                `).join('')}
              </div>
              
              <div class="order-details">
                <h3>Delivery Information</h3>
                <p><strong>Address:</strong> ${orderDetails.deliveryAddress || 'Not provided'}</p>
                <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
              </div>
              
              <p>We'll keep you updated via SMS and email as your order progresses through preparation, pickup, and delivery.</p>
              <p>Thank you for choosing our delivery service!</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      console.error('Order confirmation email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send order status update email
  static async sendOrderStatusEmail(email, orderDetails) {
    try {
      let subject = '';
      let statusColor = '#4F46E5';
      let statusIcon = '📋';
      
      switch (orderDetails.status) {
        case 'robot_assigned':
          subject = `Robot Assigned - Order #${orderDetails.orderId}`;
          statusColor = '#F59E0B';
          statusIcon = '🤖';
          break;
        case 'robot_picking_up':
          subject = `Pickup in Progress - Order #${orderDetails.orderId}`;
          statusColor = '#3B82F6';
          statusIcon = '📦';
          break;
        case 'robot_delivering':
          subject = `Out for Delivery - Order #${orderDetails.orderId}`;
          statusColor = '#8B5CF6';
          statusIcon = '🚚';
          break;
        case 'delivered':
          subject = `Delivered - Order #${orderDetails.orderId}`;
          statusColor = '#10B981';
          statusIcon = '✅';
          break;
        case 'cancelled':
          subject = `Order Cancelled - #${orderDetails.orderId}`;
          statusColor = '#EF4444';
          statusIcon = '❌';
          break;
        default:
          subject = `Order Update - #${orderDetails.orderId}`;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .status-update { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusIcon} Order Update</h1>
              <p>Your order status has been updated</p>
            </div>
            <div class="content">
              <div class="status-update">
                <h2>Order #${orderDetails.orderId}</h2>
                <h3 style="color: ${statusColor};">${orderDetails.status.replace('_', ' ').toUpperCase()}</h3>
                <p><strong>Restaurant:</strong> ${orderDetails.vendorName}</p>
                <p><strong>Total:</strong> ₹${orderDetails.totalAmount}</p>
              </div>
              
              ${this.getStatusMessage(orderDetails.status)}
              
              <p>Thank you for your patience!</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      console.error('Status email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static getStatusMessage(status) {
    switch (status) {
      case 'robot_assigned':
        return '<p>Great news! A delivery robot has been assigned to your order and will be picking it up from the restaurant soon.</p>';
      case 'robot_picking_up':
        return '<p>Your order is currently being picked up by our delivery robot from the restaurant.</p>';
      case 'robot_delivering':
        return '<p>Your order is now on its way to you! Expected delivery time is 15-20 minutes.</p>';
      case 'delivered':
        return '<p>Your order has been successfully delivered! We hope you enjoy your meal. Please consider rating your experience.</p>';
      case 'cancelled':
        return '<p>Unfortunately, your order has been cancelled. If you have any questions, please contact our support team.</p>';
      default:
        return '<p>Your order status has been updated. We\'ll continue to keep you informed of any changes.</p>';
    }
  }
}

module.exports = EmailService;
