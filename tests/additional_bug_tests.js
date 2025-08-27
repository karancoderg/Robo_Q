const axios = require('axios');
const fs = require('fs');

const BACKEND_URL = 'http://localhost:5000/api';

class AdditionalBugTests {
  constructor() {
    this.bugs = [];
    this.bugId = 5; // Continue from previous report
  }

  reportBug(category, severity, priority, title, description, steps, expected, actual, impact, fix) {
    const bug = {
      id: `BUG-${String(this.bugId).padStart(3, '0')}`,
      category,
      severity,
      priority,
      title,
      description,
      steps,
      expected,
      actual,
      impact,
      suggestedFix: fix,
      timestamp: new Date().toISOString()
    };
    
    this.bugs.push(bug);
    this.bugId++;
    return bug;
  }

  async testErrorHandling() {
    console.log('🔍 Testing Error Handling...');
    
    // Test 404 endpoints
    try {
      await axios.get(`${BACKEND_URL}/nonexistent-endpoint`);
    } catch (error) {
      if (error.response?.status === 404) {
        if (!error.response.data || !error.response.data.message) {
          this.reportBug(
            'Functional',
            'Medium',
            'P2',
            'Poor 404 Error Response Format',
            '404 errors not returning proper error format',
            ['1. Access non-existent API endpoint', '2. Check error response format'],
            'Structured error response with message',
            'Unstructured or missing error message',
            'Poor developer experience and debugging',
            'Implement consistent error response format for all endpoints'
          );
        }
      }
    }

    // Test malformed JSON
    try {
      await axios.post(`${BACKEND_URL}/auth/login`, 'invalid json', {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      if (error.response?.status !== 400) {
        this.reportBug(
          'Functional',
          'Medium',
          'P2',
          'Poor Malformed JSON Handling',
          'Server not properly handling malformed JSON requests',
          ['1. Send malformed JSON to API', '2. Check response'],
          '400 Bad Request with clear error message',
          `Unexpected response: ${error.response?.status}`,
          'Poor error handling may expose server details',
          'Add proper JSON parsing error handling middleware'
        );
      }
    }
  }

  async testInputValidation() {
    console.log('🔍 Testing Input Validation...');
    
    // Test extremely long inputs
    const longString = 'A'.repeat(10000);
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, {
        name: longString,
        email: 'test@test.com',
        password: 'password',
        role: 'user'
      });
    } catch (error) {
      if (error.response?.status !== 400) {
        this.reportBug(
          'Security',
          'Medium',
          'P2',
          'Missing Input Length Validation',
          'Server accepts extremely long input values',
          ['1. Submit form with very long strings', '2. Check if accepted'],
          'Input validation rejecting overly long strings',
          'Long strings accepted without validation',
          'Potential DoS attack vector, database bloat',
          'Implement input length validation on all form fields'
        );
      }
    }

    // Test special characters in email
    try {
      await axios.post(`${BACKEND_URL}/auth/register`, {
        name: 'Test',
        email: 'test<script>alert(1)</script>@test.com',
        password: 'password',
        role: 'user'
      });
    } catch (error) {
      if (error.response?.status !== 400) {
        this.reportBug(
          'Security',
          'High',
          'P1',
          'Insufficient Email Validation',
          'Email field accepts potentially malicious content',
          ['1. Register with malicious email format', '2. Check if accepted'],
          'Proper email validation rejecting malicious content',
          'Malicious email content accepted',
          'Potential XSS vulnerability in email display',
          'Implement strict email validation and sanitization'
        );
      }
    }
  }

  async testRateLimiting() {
    console.log('🔍 Testing Rate Limiting...');
    
    // Test rapid requests
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        axios.post(`${BACKEND_URL}/auth/login`, {
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }).catch(e => e.response)
      );
    }
    
    try {
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r?.status === 429);
      
      if (!rateLimited) {
        this.reportBug(
          'Security',
          'High',
          'P1',
          'Missing Rate Limiting',
          'No rate limiting on authentication endpoints',
          ['1. Make 20 rapid login attempts', '2. Check for rate limiting'],
          'Rate limiting after several attempts (429 status)',
          'All requests processed without rate limiting',
          'Vulnerable to brute force attacks',
          'Implement rate limiting on authentication and sensitive endpoints'
        );
      }
    } catch (error) {
      console.log('Rate limiting test error:', error.message);
    }
  }

  async testDataExposure() {
    console.log('🔍 Testing Data Exposure...');
    
    // Check if sensitive data is exposed in responses
    try {
      const response = await axios.get(`${BACKEND_URL}/vendors`);
      const vendors = response.data.data?.vendors || [];
      
      if (vendors.length > 0) {
        const vendor = vendors[0];
        if (vendor.userId && typeof vendor.userId === 'object' && vendor.userId.password) {
          this.reportBug(
            'Security',
            'Critical',
            'P1',
            'Password Hash Exposure',
            'User password hashes exposed in vendor data',
            ['1. Fetch vendors list', '2. Check for password fields in response'],
            'No sensitive data in API responses',
            'Password hashes visible in vendor user data',
            'Critical security breach - passwords exposed',
            'Remove sensitive fields from API responses using select() or projection'
          );
        }
      }
    } catch (error) {
      console.log('Data exposure test error:', error.message);
    }
  }

  async testCORSConfiguration() {
    console.log('🔍 Testing CORS Configuration...');
    
    // Test CORS headers
    try {
      const response = await axios.get(`${BACKEND_URL}/vendors`);
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (corsHeader === '*') {
        this.reportBug(
          'Security',
          'Medium',
          'P2',
          'Overly Permissive CORS Policy',
          'CORS allows requests from any origin',
          ['1. Make API request', '2. Check Access-Control-Allow-Origin header'],
          'Specific allowed origins or proper CORS configuration',
          'Access-Control-Allow-Origin: *',
          'Potential security risk from malicious websites',
          'Configure CORS to allow only trusted domains'
        );
      }
    } catch (error) {
      console.log('CORS test error:', error.message);
    }
  }

  async testFileStructure() {
    console.log('🔍 Testing File Structure...');
    
    // Check for sensitive files
    const sensitiveFiles = [
      '.env',
      'backend/.env',
      'package-lock.json',
      'node_modules'
    ];
    
    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        if (file.includes('.env')) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('password') || content.includes('secret')) {
            // Check if it's in gitignore
            const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
            if (!gitignore.includes('.env')) {
              this.reportBug(
                'Security',
                'High',
                'P1',
                'Environment File Not in .gitignore',
                'Sensitive environment file may be committed to version control',
                ['1. Check .gitignore file', '2. Look for .env exclusion'],
                '.env files excluded from version control',
                '.env not found in .gitignore',
                'Sensitive credentials could be exposed in repository',
                'Add .env to .gitignore and remove from any existing commits'
              );
            }
          }
        }
      }
    }
  }

  async testDependencyVulnerabilities() {
    console.log('🔍 Testing Dependencies...');
    
    // Check package.json for known vulnerable packages
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Check for commonly vulnerable packages
      const vulnerablePackages = ['lodash', 'moment', 'request'];
      const foundVulnerable = [];
      
      for (const [name, version] of Object.entries(deps)) {
        if (vulnerablePackages.includes(name)) {
          foundVulnerable.push(`${name}@${version}`);
        }
      }
      
      if (foundVulnerable.length > 0) {
        this.reportBug(
          'Security',
          'Medium',
          'P2',
          'Potentially Vulnerable Dependencies',
          'Project uses packages with known security issues',
          ['1. Check package.json', '2. Run npm audit'],
          'No vulnerable dependencies',
          `Found: ${foundVulnerable.join(', ')}`,
          'Security vulnerabilities in dependencies',
          'Update vulnerable packages and run npm audit regularly'
        );
      }
    }
  }

  async testPerformanceIssues() {
    console.log('🔍 Testing Performance Issues...');
    
    // Test large data requests
    const startTime = Date.now();
    try {
      await axios.get(`${BACKEND_URL}/items?limit=1000`);
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 5000) {
        this.reportBug(
          'Performance',
          'Medium',
          'P2',
          'Slow Large Data Queries',
          'Large data requests taking too long',
          ['1. Request large dataset', '2. Measure response time'],
          'Response time under 2 seconds',
          `Response time: ${responseTime}ms`,
          'Poor user experience with large datasets',
          'Implement pagination, indexing, and query optimization'
        );
      }
    } catch (error) {
      console.log('Performance test error:', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Running Additional Bug Tests...\n');
    
    await this.testErrorHandling();
    await this.testInputValidation();
    await this.testRateLimiting();
    await this.testDataExposure();
    await this.testCORSConfiguration();
    await this.testFileStructure();
    await this.testDependencyVulnerabilities();
    await this.testPerformanceIssues();
    
    console.log(`\n✅ Additional testing complete! Found ${this.bugs.length} additional issues.`);
    return this.bugs;
  }
}

async function main() {
  const tester = new AdditionalBugTests();
  const additionalBugs = await tester.runAllTests();
  
  // Load existing report
  let existingReport = {};
  try {
    existingReport = JSON.parse(fs.readFileSync('bug_detection_report.json', 'utf8'));
  } catch (error) {
    console.log('No existing report found, creating new one');
  }
  
  // Merge bugs
  const allBugs = [...(existingReport.bugs || []), ...additionalBugs];
  
  // Update report
  const updatedReport = {
    ...existingReport,
    totalBugs: allBugs.length,
    additionalBugs,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync('bug_detection_report_complete.json', JSON.stringify(updatedReport, null, 2));
  
  console.log('\n' + '='.repeat(80));
  console.log('🐛 ADDITIONAL BUGS FOUND');
  console.log('='.repeat(80));
  additionalBugs.forEach(bug => {
    console.log(`${bug.id}: [${bug.severity}] ${bug.title}`);
  });
  console.log('='.repeat(80));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdditionalBugTests;
