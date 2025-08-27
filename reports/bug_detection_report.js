const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000/api';

class BugDetectionFramework {
  constructor() {
    this.bugs = [];
    this.bugId = 1;
    this.testResults = {
      functional: [],
      ui: [],
      performance: [],
      security: [],
      accessibility: []
    };
  }

  // Bug reporting utility
  reportBug(category, severity, priority, title, description, steps, expected, actual, impact, fix, browser = 'All') {
    const bug = {
      id: `BUG-${String(this.bugId).padStart(3, '0')}`,
      category,
      severity,
      priority,
      title,
      description,
      browser,
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

  // 1. FUNCTIONAL TESTING
  async testFunctionalComponents() {
    console.log('🔍 Starting Functional Testing...');
    
    try {
      // Test Backend Health
      await this.testBackendHealth();
      
      // Test API Endpoints
      await this.testAPIEndpoints();
      
      // Test Authentication
      await this.testAuthentication();
      
      // Test Database Operations
      await this.testDatabaseOperations();
      
    } catch (error) {
      console.error('Functional testing error:', error);
    }
  }

  async testBackendHealth() {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      if (response.status !== 200) {
        this.reportBug(
          'Functional',
          'Critical',
          'P1',
          'Backend Health Check Failed',
          'Backend health endpoint not responding correctly',
          ['1. Navigate to /api/health', '2. Check response'],
          'Status 200 with health data',
          `Status ${response.status}`,
          'Backend may be unstable, affecting all functionality',
          'Check server configuration and database connection'
        );
      }
    } catch (error) {
      this.reportBug(
        'Functional',
        'Critical',
        'P1',
        'Backend Connection Failed',
        'Cannot connect to backend server',
        ['1. Start application', '2. Try to access backend'],
        'Successful connection to backend',
        `Connection error: ${error.message}`,
        'Complete application failure',
        'Check if backend server is running on port 5000'
      );
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      { path: '/vendors', method: 'GET', auth: false },
      { path: '/items', method: 'GET', auth: false },
      { path: '/auth/profile', method: 'GET', auth: true },
      { path: '/orders', method: 'GET', auth: true }
    ];

    for (const endpoint of endpoints) {
      try {
        const config = { timeout: 10000 };
        if (endpoint.auth) {
          // Skip auth endpoints for now - would need valid token
          continue;
        }
        
        const response = await axios[endpoint.method.toLowerCase()](`${BACKEND_URL}${endpoint.path}`, config);
        
        if (!response.data || typeof response.data.success === 'undefined') {
          this.reportBug(
            'Functional',
            'Medium',
            'P2',
            `API Response Format Issue - ${endpoint.path}`,
            'API response missing standard format',
            [`1. Call ${endpoint.method} ${endpoint.path}`, '2. Check response format'],
            'Response with success field and proper structure',
            'Response missing standard API format',
            'Inconsistent API responses may break frontend',
            'Standardize API response format across all endpoints'
          );
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          this.reportBug(
            'Functional',
            'Critical',
            'P1',
            `API Endpoint Unreachable - ${endpoint.path}`,
            'Cannot connect to API endpoint',
            [`1. Call ${endpoint.method} ${endpoint.path}`],
            'Successful API response',
            `Connection refused: ${error.message}`,
            'API functionality completely broken',
            'Check backend server status and routing configuration'
          );
        } else if (error.response?.status >= 500) {
          this.reportBug(
            'Functional',
            'High',
            'P1',
            `Server Error - ${endpoint.path}`,
            'API endpoint returning server error',
            [`1. Call ${endpoint.method} ${endpoint.path}`],
            'Successful response or proper error handling',
            `Server error ${error.response.status}: ${error.response.statusText}`,
            'Core functionality affected',
            'Debug server-side error and fix underlying issue'
          );
        }
      }
    }
  }

  async testAuthentication() {
    // Test registration endpoint
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123!',
        role: 'user'
      };
      
      const response = await axios.post(`${BACKEND_URL}/auth/register`, testUser, { timeout: 10000 });
      
      if (!response.data.success) {
        this.reportBug(
          'Functional',
          'High',
          'P1',
          'User Registration Failed',
          'Registration endpoint not working properly',
          ['1. Submit valid registration form', '2. Check response'],
          'Successful registration with user data',
          `Registration failed: ${response.data.message}`,
          'Users cannot create accounts',
          'Debug registration logic and validation'
        );
      }
    } catch (error) {
      if (error.response?.status === 400) {
        // Expected for duplicate email, this is fine
      } else {
        this.reportBug(
          'Functional',
          'High',
          'P1',
          'Registration Endpoint Error',
          'Registration endpoint throwing unexpected errors',
          ['1. Submit registration form with valid data'],
          'Proper error handling or successful registration',
          `Unexpected error: ${error.message}`,
          'User registration completely broken',
          'Fix registration endpoint error handling'
        );
      }
    }
  }

  async testDatabaseOperations() {
    // Test if we can fetch vendors (indicates DB connection)
    try {
      const response = await axios.get(`${BACKEND_URL}/vendors`, { timeout: 10000 });
      
      if (!response.data.data || !Array.isArray(response.data.data.vendors)) {
        this.reportBug(
          'Functional',
          'High',
          'P1',
          'Database Query Structure Issue',
          'Vendor data not returned in expected format',
          ['1. Fetch vendors from API', '2. Check data structure'],
          'Array of vendor objects in data.vendors',
          'Unexpected data structure or missing vendors array',
          'Frontend cannot display vendor data properly',
          'Check database query and response formatting'
        );
      }
    } catch (error) {
      this.reportBug(
        'Functional',
        'Critical',
        'P1',
        'Database Connection Issue',
        'Cannot fetch data from database',
        ['1. Try to load any page with data'],
        'Data loaded successfully from database',
        `Database error: ${error.message}`,
        'No data can be displayed to users',
        'Check MongoDB connection and database configuration'
      );
    }
  }

  // 2. UI/UX TESTING
  async testUIComponents() {
    console.log('🎨 Starting UI/UX Testing...');
    
    // Check frontend files structure
    await this.checkFrontendStructure();
    await this.checkCSSAndStyling();
    await this.checkResponsiveDesign();
  }

  async checkFrontendStructure() {
    const criticalFiles = [
      'frontend/src/App.tsx',
      'frontend/src/main.tsx',
      'frontend/src/index.css',
      'frontend/package.json',
      'frontend/vite.config.ts'
    ];

    for (const file of criticalFiles) {
      if (!fs.existsSync(path.join(process.cwd(), file))) {
        this.reportBug(
          'UI',
          'Critical',
          'P1',
          `Missing Critical File - ${file}`,
          'Essential frontend file is missing',
          [`1. Check for ${file}`, '2. Try to build/run frontend'],
          'File exists and is accessible',
          'File not found',
          'Frontend cannot build or run properly',
          `Restore missing ${file} from backup or recreate`
        );
      }
    }
  }

  async checkCSSAndStyling() {
    // Check if Tailwind CSS is properly configured
    const tailwindConfig = path.join(process.cwd(), 'frontend/tailwind.config.js');
    if (!fs.existsSync(tailwindConfig)) {
      this.reportBug(
        'UI',
        'Medium',
        'P2',
        'Missing Tailwind Configuration',
        'Tailwind CSS configuration file missing',
        ['1. Check for tailwind.config.js', '2. Try to build styles'],
        'Tailwind config exists and is properly configured',
        'tailwind.config.js not found',
        'Styling may not work correctly',
        'Create proper Tailwind configuration file'
      );
    }

    // Check main CSS file
    const mainCSS = path.join(process.cwd(), 'frontend/src/index.css');
    if (fs.existsSync(mainCSS)) {
      const cssContent = fs.readFileSync(mainCSS, 'utf8');
      if (!cssContent.includes('@tailwind')) {
        this.reportBug(
          'UI',
          'Medium',
          'P2',
          'Tailwind Directives Missing',
          'Main CSS file missing Tailwind directives',
          ['1. Check index.css', '2. Look for @tailwind directives'],
          'CSS file contains @tailwind base, components, utilities',
          'Missing Tailwind directives in CSS',
          'Tailwind styles will not be applied',
          'Add @tailwind directives to index.css'
        );
      }
    }
  }

  async checkResponsiveDesign() {
    // Check if responsive classes are used in components
    const componentsDir = path.join(process.cwd(), 'frontend/src/pages');
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir);
      let responsiveClassesFound = false;
      
      for (const file of files.slice(0, 3)) { // Check first 3 files
        if (file.endsWith('.tsx')) {
          const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
          if (content.includes('md:') || content.includes('lg:') || content.includes('sm:')) {
            responsiveClassesFound = true;
            break;
          }
        }
      }
      
      if (!responsiveClassesFound) {
        this.reportBug(
          'UI',
          'Medium',
          'P3',
          'Limited Responsive Design Implementation',
          'Components may not be fully responsive',
          ['1. Check component files', '2. Look for responsive CSS classes'],
          'Components use responsive breakpoint classes (md:, lg:, sm:)',
          'Limited or no responsive classes found',
          'Poor mobile/tablet experience',
          'Add responsive classes to improve mobile experience'
        );
      }
    }
  }

  // 3. PERFORMANCE ANALYSIS
  async testPerformance() {
    console.log('⚡ Starting Performance Testing...');
    
    await this.checkBundleSize();
    await this.checkDependencies();
    await this.checkAPIPerformance();
  }

  async checkBundleSize() {
    const packageJson = path.join(process.cwd(), 'frontend/package.json');
    if (fs.existsSync(packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      const depCount = Object.keys(pkg.dependencies || {}).length;
      const devDepCount = Object.keys(pkg.devDependencies || {}).length;
      
      if (depCount > 50) {
        this.reportBug(
          'Performance',
          'Medium',
          'P3',
          'High Dependency Count',
          'Large number of dependencies may impact bundle size',
          ['1. Check package.json', '2. Count dependencies'],
          'Reasonable number of dependencies (< 30)',
          `${depCount} dependencies found`,
          'Larger bundle size, slower loading',
          'Review and remove unused dependencies'
        );
      }
    }
  }

  async checkDependencies() {
    // Check for potential security vulnerabilities in dependencies
    const nodeModules = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModules)) {
      this.reportBug(
        'Performance',
        'High',
        'P1',
        'Missing Dependencies',
        'Node modules not installed',
        ['1. Check for node_modules directory', '2. Try npm install'],
        'Dependencies installed in node_modules',
        'node_modules directory missing',
        'Application cannot run',
        'Run npm install to install dependencies'
      );
    }
  }

  async checkAPIPerformance() {
    const startTime = Date.now();
    try {
      await axios.get(`${BACKEND_URL}/vendors`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 3000) {
        this.reportBug(
          'Performance',
          'Medium',
          'P2',
          'Slow API Response Time',
          'API responses taking too long',
          ['1. Make API request', '2. Measure response time'],
          'Response time under 1 second',
          `Response time: ${responseTime}ms`,
          'Poor user experience, slow page loads',
          'Optimize database queries and add caching'
        );
      }
    } catch (error) {
      // Already handled in functional tests
    }
  }

  // 4. SECURITY TESTING
  async testSecurity() {
    console.log('🔒 Starting Security Testing...');
    
    await this.checkEnvironmentVariables();
    await this.checkAPIEndpointSecurity();
    await this.checkInputValidation();
  }

  async checkEnvironmentVariables() {
    const envFile = path.join(process.cwd(), 'backend/.env');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      
      // Check for exposed secrets
      if (envContent.includes('JWT_SECRET=') && envContent.includes('JWT_SECRET="')) {
        const jwtSecret = envContent.match(/JWT_SECRET="([^"]+)"/)?.[1];
        if (jwtSecret && jwtSecret.length < 32) {
          this.reportBug(
            'Security',
            'High',
            'P1',
            'Weak JWT Secret',
            'JWT secret is too short and potentially weak',
            ['1. Check .env file', '2. Examine JWT_SECRET length'],
            'JWT secret with at least 32 characters',
            `JWT secret length: ${jwtSecret.length}`,
            'Tokens can be easily compromised',
            'Generate a stronger JWT secret with at least 32 characters'
          );
        }
      }
      
      // Check if sensitive data might be exposed
      if (envContent.includes('password') || envContent.includes('secret')) {
        this.reportBug(
          'Security',
          'Medium',
          'P2',
          'Sensitive Data in Environment File',
          'Environment file contains sensitive information',
          ['1. Check .env file contents'],
          'No sensitive data in version control',
          'Sensitive data found in .env',
          'Credentials could be exposed if file is committed',
          'Ensure .env is in .gitignore and use secure credential management'
        );
      }
    }
  }

  async checkAPIEndpointSecurity() {
    // Test for unprotected endpoints
    try {
      const response = await axios.get(`${BACKEND_URL}/vendor/orders`, { timeout: 5000 });
      if (response.status === 200) {
        this.reportBug(
          'Security',
          'Critical',
          'P1',
          'Unprotected Vendor Endpoint',
          'Vendor orders endpoint accessible without authentication',
          ['1. Access /api/vendor/orders without token'],
          '401 Unauthorized response',
          'Endpoint accessible without authentication',
          'Sensitive vendor data exposed to unauthorized users',
          'Add authentication middleware to protect vendor endpoints'
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Good - endpoint is protected
      } else if (error.response?.status !== 401) {
        // Unexpected error
      }
    }
  }

  async checkInputValidation() {
    // Test registration with malicious input
    try {
      const maliciousInput = {
        name: '<script>alert("xss")</script>',
        email: 'test@test.com',
        password: 'password',
        role: 'admin' // Try to escalate privileges
      };
      
      const response = await axios.post(`${BACKEND_URL}/auth/register`, maliciousInput, { timeout: 5000 });
      
      if (response.data.success && response.data.data.user.role === 'admin') {
        this.reportBug(
          'Security',
          'Critical',
          'P1',
          'Privilege Escalation Vulnerability',
          'Users can register with admin role',
          ['1. Register with role: "admin"', '2. Check assigned role'],
          'Role should be restricted to user/vendor',
          'Admin role assigned to new user',
          'Unauthorized admin access possible',
          'Validate and restrict role assignment in registration'
        );
      }
    } catch (error) {
      // Expected for validation errors
    }
  }

  // 5. ACCESSIBILITY TESTING
  async testAccessibility() {
    console.log('♿ Starting Accessibility Testing...');
    
    await this.checkSemanticHTML();
    await this.checkARIALabels();
    await this.checkKeyboardNavigation();
  }

  async checkSemanticHTML() {
    const componentsDir = path.join(process.cwd(), 'frontend/src/pages');
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir);
      
      for (const file of files.slice(0, 3)) {
        if (file.endsWith('.tsx')) {
          const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
          
          // Check for semantic HTML elements
          const hasSemanticElements = /\b(header|nav|main|section|article|aside|footer)\b/.test(content);
          if (!hasSemanticElements) {
            this.reportBug(
              'Accessibility',
              'Medium',
              'P3',
              `Missing Semantic HTML - ${file}`,
              'Component lacks semantic HTML elements',
              [`1. Review ${file}`, '2. Check for semantic elements'],
              'Use of header, nav, main, section, article elements',
              'Only generic div elements used',
              'Poor screen reader experience',
              'Replace divs with appropriate semantic HTML elements'
            );
          }
          
          // Check for alt attributes on images
          const hasImages = content.includes('<img');
          const hasAltText = content.includes('alt=');
          if (hasImages && !hasAltText) {
            this.reportBug(
              'Accessibility',
              'High',
              'P2',
              `Missing Alt Text - ${file}`,
              'Images missing alt attributes',
              [`1. Review ${file}`, '2. Check img tags for alt attributes'],
              'All images have descriptive alt text',
              'Images without alt attributes found',
              'Screen readers cannot describe images',
              'Add descriptive alt attributes to all images'
            );
          }
        }
      }
    }
  }

  async checkARIALabels() {
    // Check for ARIA labels in form components
    const formsDir = path.join(process.cwd(), 'frontend/src/pages');
    if (fs.existsSync(formsDir)) {
      const files = fs.readdirSync(formsDir);
      
      for (const file of files.slice(0, 2)) {
        if (file.includes('Login') || file.includes('Register')) {
          const content = fs.readFileSync(path.join(formsDir, file), 'utf8');
          
          const hasInputs = content.includes('<input');
          const hasLabels = content.includes('aria-label') || content.includes('<label');
          
          if (hasInputs && !hasLabels) {
            this.reportBug(
              'Accessibility',
              'High',
              'P2',
              `Missing Form Labels - ${file}`,
              'Form inputs lack proper labels',
              [`1. Review ${file}`, '2. Check input elements for labels'],
              'All inputs have associated labels or aria-label',
              'Inputs without proper labeling found',
              'Screen readers cannot identify form fields',
              'Add proper labels or aria-label attributes to form inputs'
            );
          }
        }
      }
    }
  }

  async checkKeyboardNavigation() {
    // Check for focus management in interactive components
    const componentsDir = path.join(process.cwd(), 'frontend/src/pages');
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir);
      let focusManagementFound = false;
      
      for (const file of files.slice(0, 3)) {
        if (file.endsWith('.tsx')) {
          const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
          
          if (content.includes('tabIndex') || content.includes('onKeyDown') || content.includes('focus()')) {
            focusManagementFound = true;
            break;
          }
        }
      }
      
      if (!focusManagementFound) {
        this.reportBug(
          'Accessibility',
          'Medium',
          'P3',
          'Limited Keyboard Navigation Support',
          'Components may not support keyboard navigation',
          ['1. Try navigating with Tab key', '2. Check for focus management'],
          'Proper keyboard navigation and focus management',
          'Limited keyboard navigation support found',
          'Keyboard users cannot navigate effectively',
          'Implement proper focus management and keyboard event handlers'
        );
      }
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      executiveSummary: this.generateExecutiveSummary(),
      criticalIssues: this.bugs.filter(bug => bug.severity === 'Critical'),
      bugInventory: this.categorizeBugs(),
      priorityMatrix: this.generatePriorityMatrix(),
      quickWins: this.bugs.filter(bug => bug.priority === 'P3' && bug.severity !== 'Critical'),
      recommendations: this.generateRecommendations(),
      totalBugs: this.bugs.length,
      timestamp: new Date().toISOString()
    };

    return report;
  }

  generateExecutiveSummary() {
    const critical = this.bugs.filter(b => b.severity === 'Critical').length;
    const high = this.bugs.filter(b => b.severity === 'High').length;
    const medium = this.bugs.filter(b => b.severity === 'Medium').length;
    const low = this.bugs.filter(b => b.severity === 'Low').length;

    return {
      totalIssues: this.bugs.length,
      criticalIssues: critical,
      highIssues: high,
      mediumIssues: medium,
      lowIssues: low,
      overallHealth: critical === 0 && high <= 2 ? 'Good' : critical > 0 ? 'Critical' : 'Needs Attention',
      primaryConcerns: this.bugs
        .filter(b => b.severity === 'Critical' || b.severity === 'High')
        .slice(0, 3)
        .map(b => b.title)
    };
  }

  categorizeBugs() {
    return {
      functional: this.bugs.filter(b => b.category === 'Functional'),
      ui: this.bugs.filter(b => b.category === 'UI'),
      performance: this.bugs.filter(b => b.category === 'Performance'),
      security: this.bugs.filter(b => b.category === 'Security'),
      accessibility: this.bugs.filter(b => b.category === 'Accessibility')
    };
  }

  generatePriorityMatrix() {
    return {
      p1: this.bugs.filter(b => b.priority === 'P1'),
      p2: this.bugs.filter(b => b.priority === 'P2'),
      p3: this.bugs.filter(b => b.priority === 'P3'),
      p4: this.bugs.filter(b => b.priority === 'P4')
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.bugs.some(b => b.category === 'Security' && b.severity === 'Critical')) {
      recommendations.push('URGENT: Address critical security vulnerabilities immediately');
    }
    
    if (this.bugs.some(b => b.category === 'Functional' && b.severity === 'Critical')) {
      recommendations.push('Fix critical functional issues blocking core user workflows');
    }
    
    if (this.bugs.filter(b => b.category === 'Accessibility').length > 3) {
      recommendations.push('Implement comprehensive accessibility improvements');
    }
    
    if (this.bugs.filter(b => b.category === 'Performance').length > 2) {
      recommendations.push('Optimize application performance and loading times');
    }
    
    recommendations.push('Establish automated testing pipeline to prevent regression');
    recommendations.push('Implement proper error handling and user feedback mechanisms');
    
    return recommendations;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Bug Detection Analysis...\n');
    
    await this.testFunctionalComponents();
    await this.testUIComponents();
    await this.testPerformance();
    await this.testSecurity();
    await this.testAccessibility();
    
    console.log('\n✅ Bug Detection Analysis Complete!');
    return this.generateReport();
  }
}

// Execute the testing framework
async function main() {
  const framework = new BugDetectionFramework();
  const report = await framework.runAllTests();
  
  // Save detailed report
  fs.writeFileSync(
    path.join(process.cwd(), 'bug_detection_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('🐛 BUG DETECTION REPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Issues Found: ${report.totalBugs}`);
  console.log(`Critical Issues: ${report.executiveSummary.criticalIssues}`);
  console.log(`High Priority Issues: ${report.executiveSummary.highIssues}`);
  console.log(`Overall Health: ${report.executiveSummary.overallHealth}`);
  
  if (report.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
    report.criticalIssues.forEach(bug => {
      console.log(`- ${bug.id}: ${bug.title}`);
    });
  }
  
  if (report.quickWins.length > 0) {
    console.log('\n⚡ QUICK WINS (Easy fixes for immediate improvement):');
    report.quickWins.slice(0, 5).forEach(bug => {
      console.log(`- ${bug.id}: ${bug.title}`);
    });
  }
  
  console.log('\n📊 Full detailed report saved to: bug_detection_report.json');
  console.log('='.repeat(80));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BugDetectionFramework;
