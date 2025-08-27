// Network troubleshooting script for Google OAuth issues
const https = require('https');
const dns = require('dns');

console.log('🔍 Testing Google OAuth Network Connectivity\n');

// Test 1: DNS Resolution
console.log('1. Testing DNS resolution for accounts.google.com...');
dns.lookup('accounts.google.com', (err, address, family) => {
  if (err) {
    console.error('❌ DNS resolution failed:', err.message);
  } else {
    console.log(`✅ DNS resolved: ${address} (IPv${family})`);
  }
});

// Test 2: HTTPS Connection
console.log('\n2. Testing HTTPS connection to Google OAuth...');
const options = {
  hostname: 'accounts.google.com',
  port: 443,
  path: '/gsi/client',
  method: 'GET',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; OAuth-Test/1.0)'
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ HTTPS connection successful: ${res.statusCode} ${res.statusMessage}`);
  console.log('Response headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data.length > 0) {
      console.log(`✅ Received ${data.length} bytes of data`);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ HTTPS connection failed:', err.message);
  
  if (err.code === 'CERT_HAS_EXPIRED') {
    console.log('💡 Certificate has expired - this might be a system time issue');
  } else if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
    console.log('💡 Certificate verification failed - check system certificates');
  } else if (err.code === 'ENOTFOUND') {
    console.log('💡 DNS resolution failed - check internet connection');
  }
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
});

req.end();

// Test 3: System Time Check
console.log('\n3. Checking system time...');
const now = new Date();
console.log(`Current system time: ${now.toISOString()}`);
console.log(`Current timestamp: ${now.getTime()}`);

// Test 4: Certificate Store Check
console.log('\n4. Testing certificate validation...');
const testReq = https.request({
  hostname: 'www.google.com',
  port: 443,
  path: '/',
  method: 'HEAD',
  rejectUnauthorized: true
}, (res) => {
  console.log('✅ Certificate validation successful');
});

testReq.on('error', (err) => {
  if (err.code.includes('CERT')) {
    console.error('❌ Certificate validation failed:', err.message);
    console.log('💡 Try updating system certificates or check system time');
  }
});

testReq.end();

console.log('\n📋 Troubleshooting Tips:');
console.log('- If DNS fails: Check internet connection and DNS settings');
console.log('- If HTTPS fails: Check firewall and proxy settings');
console.log('- If certificate fails: Update system certificates or check system time');
console.log('- Try using a VPN if corporate firewall is blocking Google services');
console.log('- Clear browser cache and cookies for accounts.google.com');
