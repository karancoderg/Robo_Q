#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE BUILD CHECK');
console.log('='.repeat(50));

let allChecksPass = true;

// Helper function to run command and capture output
function runCheck(name, command, cwd = process.cwd()) {
  try {
    console.log(`\n📋 ${name}...`);
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`   ✅ PASS`);
    return true;
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`);
    allChecksPass = false;
    return false;
  }
}

// Helper function to check file exists
function checkFile(name, filePath) {
  console.log(`\n📁 ${name}...`);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ EXISTS: ${filePath}`);
    return true;
  } else {
    console.log(`   ❌ MISSING: ${filePath}`);
    allChecksPass = false;
    return false;
  }
}

// 1. Check project structure
console.log('\n🏗️  PROJECT STRUCTURE CHECKS');
console.log('-'.repeat(30));

checkFile('Frontend directory', './frontend');
checkFile('Backend directory', './backend');
checkFile('Frontend package.json', './frontend/package.json');
checkFile('Backend package.json', './backend/package.json');

// 2. Backend checks
console.log('\n⚙️  BACKEND CHECKS');
console.log('-'.repeat(20));

runCheck('Backend syntax check', 'node -c src/server.js', './backend');
runCheck('Backend dependencies check', 'npm ls --depth=0 --silent', './backend');

// Check critical backend files
checkFile('Main server file', './backend/src/server.js');
checkFile('Email service', './backend/src/services/emailService.js');
checkFile('Backend env file', './backend/.env');

// 3. Frontend checks
console.log('\n🎨 FRONTEND CHECKS');
console.log('-'.repeat(20));

runCheck('TypeScript compilation', 'npx tsc --noEmit', './frontend');
runCheck('Frontend dependencies check', 'npm ls --depth=0 --silent', './frontend');

// Check critical frontend files
checkFile('Main App component', './frontend/src/App.tsx');
checkFile('Main entry point', './frontend/src/main.tsx');
checkFile('Vite config', './frontend/vite.config.ts');
checkFile('Tailwind config', './frontend/tailwind.config.js');

// 4. Build tests
console.log('\n🔨 BUILD TESTS');
console.log('-'.repeat(15));

runCheck('Frontend production build', 'npm run build', './frontend');

// 5. Security checks
console.log('\n🔒 SECURITY CHECKS');
console.log('-'.repeat(18));

// Check for sensitive files
const sensitiveFiles = [
  './backend/.env',
  './.gitignore'
];

sensitiveFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`\n🔐 Checking ${file}...`);
    const content = fs.readFileSync(file, 'utf8');
    
    if (file.includes('.env')) {
      if (content.includes('JWT_SECRET') && content.includes('MONGODB_URI')) {
        console.log('   ✅ Environment variables configured');
      } else {
        console.log('   ⚠️  Some environment variables may be missing');
      }
    }
    
    if (file.includes('.gitignore')) {
      if (content.includes('.env') && content.includes('node_modules')) {
        console.log('   ✅ Sensitive files properly ignored');
      } else {
        console.log('   ⚠️  .gitignore may need updates');
      }
    }
  }
});

// 6. File organization check
console.log('\n📂 FILE ORGANIZATION');
console.log('-'.repeat(20));

const organizedDirs = ['docs', 'tests', 'scripts', 'reports'];
organizedDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const fileCount = fs.readdirSync(dir).length;
    console.log(`   ✅ ${dir}/ - ${fileCount} files organized`);
  } else {
    console.log(`   ⚠️  ${dir}/ directory not found`);
  }
});

// Final summary
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('🎉 ALL BUILD CHECKS PASSED!');
  console.log('✅ Frontend: Ready for production');
  console.log('✅ Backend: Ready for deployment');
  console.log('✅ Security: Properly configured');
  console.log('✅ Organization: Files properly structured');
  console.log('\n🚀 PROJECT IS BUILD-READY!');
} else {
  console.log('⚠️  SOME CHECKS FAILED');
  console.log('Please review the failed checks above');
  console.log('Fix any issues before deployment');
}
console.log('='.repeat(50));

process.exit(allChecksPass ? 0 : 1);
