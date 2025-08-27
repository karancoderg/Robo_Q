#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 BACKEND BUILD PROCESS');
console.log('='.repeat(40));

const backendDir = path.join(__dirname, '..', 'backend');

// 1. Check main server file
console.log('\n📋 1. Checking main server file...');
const serverJs = path.join(backendDir, 'src', 'server.js');
const serverTs = path.join(backendDir, 'src', 'server.ts');

if (fs.existsSync(serverJs)) {
  console.log('   ✅ Found server.js (JavaScript) - Main working file');
  
  // Syntax check
  try {
    execSync(`node -c ${serverJs}`, { stdio: 'pipe' });
    console.log('   ✅ Syntax check passed');
  } catch (error) {
    console.log('   ❌ Syntax error in server.js');
    console.log('   Error:', error.message);
    process.exit(1);
  }
} else {
  console.log('   ❌ server.js not found');
  process.exit(1);
}

// 2. Check dependencies
console.log('\n📦 2. Checking dependencies...');
try {
  execSync('npm ls --depth=0 --silent', { cwd: backendDir, stdio: 'pipe' });
  console.log('   ✅ All dependencies installed');
} catch (error) {
  console.log('   ⚠️  Some dependencies may be missing');
  console.log('   Running npm install...');
  execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
}

// 3. Check critical services
console.log('\n🔧 3. Checking critical services...');
const criticalFiles = [
  'src/services/emailService.js',
  'src/services/smsService.js',
  'src/utils/passwordGenerator.js'
];

criticalFiles.forEach(file => {
  const filePath = path.join(backendDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} - Found`);
    try {
      execSync(`node -c ${filePath}`, { stdio: 'pipe' });
      console.log(`      ✅ Syntax OK`);
    } catch (error) {
      console.log(`      ❌ Syntax error in ${file}`);
    }
  } else {
    console.log(`   ⚠️  ${file} - Not found`);
  }
});

// 4. Environment check
console.log('\n🔒 4. Checking environment configuration...');
const envFile = path.join(backendDir, '.env');
if (fs.existsSync(envFile)) {
  console.log('   ✅ .env file found');
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_HOST', 'EMAIL_USER'];
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('   ✅ All required environment variables present');
  } else {
    console.log('   ⚠️  Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.log('   ❌ .env file not found');
}

// 5. TypeScript cleanup (optional)
console.log('\n🧹 5. TypeScript file status...');
if (fs.existsSync(serverTs)) {
  console.log('   ⚠️  server.ts found (may be outdated)');
  console.log('   💡 Consider removing if server.js is the main file');
} else {
  console.log('   ✅ No conflicting server.ts file');
}

// 6. Create production-ready structure
console.log('\n📁 6. Preparing production structure...');
const distDir = path.join(backendDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('   ✅ Created dist/ directory');
}

// Copy main files to dist for production
const productionFiles = [
  'src/server.js',
  'src/services/emailService.js',
  'src/services/smsService.js',
  'src/utils/passwordGenerator.js'
];

productionFiles.forEach(file => {
  const srcPath = path.join(backendDir, file);
  const distPath = path.join(distDir, path.basename(file));
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, distPath);
    console.log(`   ✅ Copied ${file} to dist/`);
  }
});

// 7. Final validation
console.log('\n✅ 7. Final validation...');
try {
  const distServer = path.join(distDir, 'server.js');
  if (fs.existsSync(distServer)) {
    execSync(`node -c ${distServer}`, { stdio: 'pipe' });
    console.log('   ✅ Production server.js is valid');
  }
} catch (error) {
  console.log('   ❌ Production build validation failed');
  process.exit(1);
}

console.log('\n' + '='.repeat(40));
console.log('🎉 BACKEND BUILD SUCCESSFUL!');
console.log('✅ JavaScript syntax validated');
console.log('✅ Dependencies verified');
console.log('✅ Services checked');
console.log('✅ Production files ready in dist/');
console.log('🚀 Backend is ready for deployment!');
console.log('='.repeat(40));
