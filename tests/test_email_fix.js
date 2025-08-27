const EmailService = require('./backend/src/services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  // Test 1: Configuration Test
  console.log('1. Testing email configuration...');
  const configResult = await EmailService.testEmailConfiguration();
  console.log('   Result:', configResult);
  
  // Test 2: Send a test email (if configuration is working)
  if (configResult.success) {
    console.log('\n2. Sending test welcome email...');
    const emailResult = await EmailService.sendWelcomeEmail(
      'ks9637148@gmail.com', 
      'Test User', 
      false
    );
    console.log('   Result:', emailResult);
  } else {
    console.log('\n2. Skipping email send test - configuration failed');
  }
  
  console.log('\n✅ Email service test completed!');
}

testEmailService().catch(console.error);
