// Load environment variables first
require('dotenv').config();

console.log('🔍 Debugging Email Environment Variables...\n');

console.log('Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET');

console.log('\nEmail Config Object:');
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
};

console.log('emailConfig:', emailConfig);

console.log('\nCondition Check:');
console.log('emailConfig.auth.user !== "your_email@gmail.com":', emailConfig.auth.user !== 'your_email@gmail.com');
console.log('emailConfig.auth.pass !== "your_app_password":', emailConfig.auth.pass !== 'your_app_password');
console.log('Both conditions:', emailConfig.auth.user !== 'your_email@gmail.com' && emailConfig.auth.pass !== 'your_app_password');

// Test nodemailer
console.log('\nTesting nodemailer...');
const nodemailer = require('nodemailer');
try {
  const transporter = nodemailer.createTransport(emailConfig);
  console.log('✅ Transporter created successfully');
  
  // Test connection
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Connection test successful');
    }
  });
} catch (error) {
  console.log('❌ Transporter creation failed:', error.message);
}
