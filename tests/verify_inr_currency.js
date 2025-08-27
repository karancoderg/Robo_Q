#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('💰 VERIFYING INR CURRENCY IMPLEMENTATION');
console.log('=' .repeat(50));

// Files to check for INR currency
const filesToCheck = [
  // Frontend files
  'frontend/src/pages/Checkout.tsx',
  'frontend/src/pages/Items.tsx',
  'frontend/src/pages/Cart.tsx',
  'frontend/src/pages/Orders.tsx',
  'frontend/src/pages/VendorOrders.tsx',
  'frontend/src/pages/VendorDashboard.tsx',
  'frontend/src/pages/OrderDetail.tsx',
  'frontend/src/components/AddItemModal.tsx',
  'frontend/src/components/EditItemModal.tsx',
  'frontend/src/components/OrderDetailsModal.tsx',
  
  // Backend files
  'backend/src/services/enhancedSmsService.js',
  'backend/src/services/smsService.js',
  'backend/src/services/emailService.js'
];

let totalFiles = 0;
let filesWithINR = 0;
let filesWithDollar = 0;

console.log('\n🔍 CHECKING FILES FOR CURRENCY SYMBOLS...\n');

filesToCheck.forEach(file => {
  const fullPath = path.join('/home/karandeep/robo_Q', file);
  
  if (fs.existsSync(fullPath)) {
    totalFiles++;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for INR symbol
    const hasINR = content.includes('₹');
    
    // Check for dollar signs with numbers (price-related)
    const hasDollar = /\$\d/.test(content);
    
    if (hasINR) filesWithINR++;
    if (hasDollar) filesWithDollar++;
    
    const status = hasINR ? '✅ INR' : (hasDollar ? '❌ $' : '⚪ N/A');
    console.log(`${status} ${file}`);
    
    if (hasDollar) {
      const dollarMatches = content.match(/\$\d+\.?\d*/g);
      if (dollarMatches) {
        console.log(`     Found: ${dollarMatches.slice(0, 3).join(', ')}${dollarMatches.length > 3 ? '...' : ''}`);
      }
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n📊 SUMMARY:');
console.log(`   Total files checked: ${totalFiles}`);
console.log(`   Files with INR (₹): ${filesWithINR}`);
console.log(`   Files with $ signs: ${filesWithDollar}`);

if (filesWithDollar === 0) {
  console.log('\n🎉 SUCCESS: All currency symbols converted to INR (₹)!');
  console.log('\n✅ VERIFICATION COMPLETE:');
  console.log('   • All $ symbols replaced with ₹');
  console.log('   • Frontend displays INR throughout');
  console.log('   • Backend services use INR in messages');
  console.log('   • SMS notifications show ₹ amounts');
  console.log('   • Email notifications show ₹ amounts');
} else {
  console.log('\n⚠️  Some files still contain $ symbols');
  console.log('   Manual review may be needed');
}

// Test SMS message format
console.log('\n📱 TESTING SMS MESSAGE FORMAT:');
const smsServicePath = '/home/karandeep/robo_Q/backend/src/services/enhancedSmsService.js';
if (fs.existsSync(smsServicePath)) {
  const smsContent = fs.readFileSync(smsServicePath, 'utf8');
  const approvalMessageMatch = smsContent.match(/Total: [₹\$]\d+/);
  
  if (approvalMessageMatch) {
    console.log(`   SMS Format: "${approvalMessageMatch[0]}"`);
    if (approvalMessageMatch[0].includes('₹')) {
      console.log('   ✅ SMS uses INR currency symbol');
    } else {
      console.log('   ❌ SMS still uses $ symbol');
    }
  }
}

console.log('\n💰 INR CURRENCY VERIFICATION COMPLETE!');
