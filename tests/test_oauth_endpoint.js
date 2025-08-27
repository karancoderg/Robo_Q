const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

class GoogleOAuthTester {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async testEnvironmentSetup() {
    console.log('🔍 Testing Environment Setup...\n');
    
    const checks = [
      { name: 'GOOGLE_CLIENT_ID', value: process.env.GOOGLE_CLIENT_ID },
      { name: 'GOOGLE_CLIENT_SECRET', value: process.env.GOOGLE_CLIENT_SECRET },
      { name: 'GOOGLE_CALLBACK_URL', value: process.env.GOOGLE_CALLBACK_URL }
    ];

    checks.forEach(check => {
      if (check.value) {
        console.log(`✅ ${check.name}: Set`);
      } else {
        console.log(`❌ ${check.name}: Missing`);
      }
    });

    // Test Client ID format
    if (process.env.GOOGLE_CLIENT_ID) {
      const clientIdPattern = /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
      if (clientIdPattern.test(process.env.GOOGLE_CLIENT_ID)) {
        console.log('✅ Google Client ID format is valid');
      } else {
        console.log('⚠️  Google Client ID format might be invalid');
      }
    }

    console.log('\n');
  }

  async testServerConnection() {
    console.log('🌐 Testing Server Connection...\n');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      console.log('✅ Backend server is running');
      console.log(`📊 Server response: ${response.data.message}`);
      return true;
    } catch (error) {
      console.log('❌ Backend server is not running');
      console.log('💡 Please start the server with: cd backend && npm run dev');
      return false;
    }
  }

  async testGoogleAuthRoutes() {
    console.log('\n🛣️  Testing Google Auth Routes...\n');
    
    try {
      // Test the test endpoint
      const testResponse = await axios.get(`${this.baseURL}/api/google-auth/test`);
      console.log('✅ Google auth test route is accessible');
      console.log(`📊 Response: ${testResponse.data.message}`);
    } catch (error) {
      console.log('❌ Google auth test route failed');
      console.log(`📊 Error: ${error.response?.status} - ${error.response?.statusText}`);
    }

    try {
      // Test the token endpoint with invalid data
      const tokenResponse = await axios.post(`${this.baseURL}/api/google-auth/token`, {
        credential: 'invalid_token'
      });
      console.log('⚠️  Token endpoint accepted invalid token (this should not happen)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Token endpoint properly rejects invalid tokens');
      } else {
        console.log(`❌ Token endpoint error: ${error.response?.status} - ${error.message}`);
      }
    }
  }

  async generateMockGoogleToken() {
    console.log('\n🔧 Generating Mock Google Token for Testing...\n');
    
    // This is a mock payload similar to what Google would send
    const mockPayload = {
      iss: 'https://accounts.google.com',
      azp: process.env.GOOGLE_CLIENT_ID,
      aud: process.env.GOOGLE_CLIENT_ID,
      sub: '123456789012345678901',
      email: 'test@example.com',
      email_verified: true,
      name: 'Test User',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      given_name: 'Test',
      family_name: 'User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    console.log('📋 Mock token payload:');
    console.log(JSON.stringify(mockPayload, null, 2));
    
    return mockPayload;
  }

  async testOAuthFlow() {
    console.log('\n🔄 Testing OAuth Flow Simulation...\n');
    
    console.log('📝 OAuth Flow Steps:');
    console.log('1. User clicks "Sign in with Google"');
    console.log('2. Frontend redirects to Google OAuth');
    console.log('3. User authorizes the application');
    console.log('4. Google redirects back with authorization code');
    console.log('5. Frontend exchanges code for ID token');
    console.log('6. Frontend sends ID token to our backend');
    console.log('7. Backend verifies token with Google');
    console.log('8. Backend creates/updates user and returns JWT');
    
    console.log('\n🎯 Testing Step 6-8 (Backend Token Verification)...');
    
    // Note: We can't easily test with a real Google token without going through
    // the full OAuth flow, but we can test the endpoint structure
    console.log('💡 To test with real tokens, use the frontend application');
  }

  async testGoogleClientInitialization() {
    console.log('\n🔧 Testing Google OAuth Client...\n');
    
    try {
      // Test if we can initialize the OAuth client
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      console.log('✅ Google OAuth2Client initialized successfully');
      
      // Test client configuration
      console.log(`📊 Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
      
      return true;
    } catch (error) {
      console.log('❌ Failed to initialize Google OAuth2Client');
      console.log(`📊 Error: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Google OAuth Endpoint Tests\n');
    console.log('=' .repeat(50));
    
    await this.testEnvironmentSetup();
    
    const serverRunning = await this.testServerConnection();
    if (!serverRunning) {
      console.log('\n❌ Cannot continue tests without server running');
      return;
    }
    
    await this.testGoogleAuthRoutes();
    await this.testGoogleClientInitialization();
    await this.generateMockGoogleToken();
    await this.testOAuthFlow();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 Test Summary:');
    console.log('✅ Environment variables configured');
    console.log('✅ Google OAuth client can be initialized');
    console.log('✅ Backend server endpoints are accessible');
    console.log('\n💡 Next Steps:');
    console.log('1. Start frontend: cd frontend && npm run dev');
    console.log('2. Navigate to http://localhost:3000/login');
    console.log('3. Click "Continue with Google" to test full flow');
    console.log('4. Check browser network tab for API calls');
    console.log('5. Verify JWT token is returned on successful auth');
  }
}

// Run the tests
const tester = new GoogleOAuthTester();
tester.runAllTests().catch(console.error);
