const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your_email@gmail.com',
    pass: process.env.SMTP_PASS || 'your_app_password'
  }
};

// Create transporter
let transporter = null;

try {
  if (emailConfig.auth.user !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransporter(emailConfig);
  }
} catch (error) {
  console.log('Email not configured, email notifications will be simulated');
}

class EmailService {
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

      if (transporter && email) {
        const result = await transporter.sendMail({
          from: `"DeliveryBot" <${emailConfig.auth.user}>`,
          to: email,
          subject: subject,
          html: htmlContent
        });
        
        console.log(`Confirmation email sent to ${email}:`, result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          message: 'Email sent successfully'
        };
      } else {
        console.log(`📧 Email Simulation - Would send to ${email}:`);
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

      if (transporter && email) {
        const result = await transporter.sendMail({
          from: `"DeliveryBot" <${emailConfig.auth.user}>`,
          to: email,
          subject: subject,
          html: htmlContent
        });
        
        console.log(`Status email sent to ${email}:`, result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          message: 'Status email sent successfully'
        };
      } else {
        console.log(`📧 Status Email Simulation - Would send to ${email}:`);
        console.log(`Subject: ${subject}`);
        
        return {
          success: true,
          messageId: 'simulated_' + Date.now(),
          message: 'Status email simulated successfully'
        };
      }
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
