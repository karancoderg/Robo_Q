#!/usr/bin/env node

const http = require('http');

console.log('🚀 PERFORMANCE TEST: Testing site loading speed after optimization');
console.log('=' .repeat(60));

// Test multiple endpoints to measure performance
const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/auth/verify', name: 'Auth Verification' },
  { path: '/api/vendor/orders', name: 'Vendor Orders' },
  { path: '/api/items', name: 'Items List' }
];

const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMDUzYzg5MDZlNzg3ZWRkYmEwNGUiLCJlbWFpbCI6ImJ1cmdlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ2ZW5kb3IiLCJpYXQiOjE3NTYyNDQ3MzMsImV4cCI6MTc1Njg0OTUzM30.7n5sezTRBVNLKz0BnXDnJtjK39ZhAaJ-D_iqI_-nvLQ',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          endpoint: endpoint.name,
          path: endpoint.path,
          statusCode: res.statusCode,
          responseTime: responseTime,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        endpoint: endpoint.name,
        path: endpoint.path,
        statusCode: 'ERROR',
        responseTime: responseTime,
        success: false,
        error: error.message
      });
    });

    req.end();
  });
};

async function runPerformanceTest() {
  console.log('📊 Testing endpoint response times...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}: ${result.responseTime}ms (${result.statusCode})`);
  }
  
  console.log('\n📈 PERFORMANCE SUMMARY:');
  console.log('=' .repeat(40));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  if (successfulTests.length > 0) {
    const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
    const minResponseTime = Math.min(...successfulTests.map(r => r.responseTime));
    const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTime));
    
    console.log(`✅ Successful requests: ${successfulTests.length}/${results.length}`);
    console.log(`⚡ Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Fastest response: ${minResponseTime}ms`);
    console.log(`🐌 Slowest response: ${maxResponseTime}ms`);
    
    if (avgResponseTime < 100) {
      console.log('🎉 EXCELLENT: Average response time under 100ms!');
    } else if (avgResponseTime < 500) {
      console.log('👍 GOOD: Average response time under 500ms');
    } else if (avgResponseTime < 1000) {
      console.log('⚠️  MODERATE: Response time could be improved');
    } else {
      console.log('🚨 SLOW: Response time needs optimization');
    }
  }
  
  if (failedTests.length > 0) {
    console.log(`\n❌ Failed requests: ${failedTests.length}`);
    failedTests.forEach(test => {
      console.log(`   ${test.endpoint}: ${test.error || test.statusCode}`);
    });
  }
  
  console.log('\n🔧 OPTIMIZATION APPLIED:');
  console.log('- Removed excessive authentication debug logging');
  console.log('- Removed emergency setup debug logging');
  console.log('- Removed notification debug logging');
  console.log('- Removed Socket.IO debug logging');
  console.log('- Reduced console.log overhead on every request');
}

// Run the test
runPerformanceTest().catch(console.error);
