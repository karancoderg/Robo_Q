const nodemailer = require('nodemailer');
require('dotenv').config({ path: './backend/.env' });

async function sendTestEmail() {
  try {
    // Create transporter using the same config as your app
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'karancoderg@gmail.com',
      subject: 'Test Email from Robo_Q Application',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 Robo_Q Test Email</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>This is a test email sent from your Robo_Q application.</p>
              <p>Email sent from: <strong>${process.env.EMAIL_USER}</strong></p>
              <p>Timestamp: <strong>${new Date().toLocaleString()}</strong></p>
              <p>If you received this email, your email configuration is working correctly!</p>
            </div>
            <div class="footer">
              <p>© 2024 Robo_Q Platform</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('From:', process.env.EMAIL_USER);
    console.log('To: karancoderg@gmail.com');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

// Run the function
sendTestEmail();
