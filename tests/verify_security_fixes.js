const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api';

async function verifySecurityFixes() {
  console.log('🔒 Verifying Security Fixes...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Privilege Escalation Fix
  console.log('1. Testing Privilege Escalation Fix...');
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/register`, {
      name: 'Test Admin Attempt',
      email: `testadmin${Date.now()}@example.com`,
      password: 'TestPass123!',
      role: 'admin' // This should be ignored
    });
    
    if (response.data.success && response.data.data.user.role === 'user') {
      console.log('   ✅ PASS: Role forced to "user", admin escalation prevented');
    } else if (response.data.data.user.role === 'admin') {
      console.log('   ❌ FAIL: Still allows admin role assignment');
      allTestsPassed = false;
    } else {
      console.log('   ⚠️  UNKNOWN: Unexpected response format');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Server not running - restart server to test fixes');
      return false;
    } else {
      console.log(`   ❌ FAIL: Registration error - ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  // Test 2: Rate Limiting
  console.log('\n2. Testing Rate Limiting...');
  try {
    const promises = [];
    for (let i = 0; i < 7; i++) {
      promises.push(
        axios.post(`${BACKEND_URL}/auth/login`, {
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }).catch(e => e.response)
      );
    }
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r?.status === 429);
    
    if (rateLimited) {
      console.log('   ✅ PASS: Rate limiting active (429 Too Many Requests)');
    } else {
      console.log('   ❌ FAIL: No rate limiting detected');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ FAIL: Rate limiting test error - ${error.message}`);
    allTestsPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL SECURITY FIXES VERIFIED!');
    console.log('✅ Privilege escalation prevented');
    console.log('✅ Rate limiting implemented');
    console.log('✅ Application is more secure');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review implementation');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
}

if (require.main === module) {
  verifySecurityFixes().catch(console.error);
}

module.exports = verifySecurityFixes;
