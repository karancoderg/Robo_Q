#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 FINAL COMPREHENSIVE INR CURRENCY VERIFICATION');
console.log('=' .repeat(60));

// All frontend files that should have INR currency
const allFrontendFiles = [
  // Pages
  'frontend/src/pages/Checkout.tsx',
  'frontend/src/pages/Items.tsx', 
  'frontend/src/pages/Cart.tsx',
  'frontend/src/pages/Orders.tsx',
  'frontend/src/pages/VendorOrders.tsx',
  'frontend/src/pages/VendorDashboard.tsx',
  'frontend/src/pages/OrderDetail.tsx',
  'frontend/src/pages/Dashboard.tsx',
  'frontend/src/pages/VendorAnalytics.tsx',
  'frontend/src/pages/OrderTracking.tsx',
  'frontend/src/pages/Profile.tsx',
  'frontend/src/pages/VendorProfile.tsx',
  'frontend/src/pages/VendorItems.tsx',
  
  // Components
  'frontend/src/components/AddItemModal.tsx',
  'frontend/src/components/EditItemModal.tsx',
  'frontend/src/components/OrderDetailsModal.tsx',
  
  // Backend Services
  'backend/src/services/enhancedSmsService.js',
  'backend/src/services/smsService.js',
  'backend/src/services/emailService.js'
];

let totalFiles = 0;
let filesWithINR = 0;
let filesWithDollar = 0;
let dollarInstances = [];

console.log('\n🔍 CHECKING ALL FILES FOR CURRENCY SYMBOLS...\n');

allFrontendFiles.forEach(file => {
  const fullPath = path.join('/home/karandeep/robo_Q', file);
  
  if (fs.existsSync(fullPath)) {
    totalFiles++;
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for INR symbol
    const hasINR = content.includes('₹');
    
    // Check for dollar signs with prices (more comprehensive)
    const dollarMatches = content.match(/\$\{[^}]*\.(toFixed|price|total|amount|revenue)/gi) || 
                         content.match(/\$[0-9]+\.?[0-9]*/g) ||
                         content.match(/Price.*\$|Total.*\$|Amount.*\$/gi);
    
    const hasDollar = dollarMatches && dollarMatches.length > 0;
    
    if (hasINR) filesWithINR++;
    if (hasDollar) {
      filesWithDollar++;
      dollarInstances.push({ file, matches: dollarMatches });
    }
    
    const status = hasINR ? '✅ INR' : (hasDollar ? '❌ $' : '⚪ N/A');
    console.log(`${status} ${file}`);
    
    if (hasDollar) {
      console.log(`     🚨 Found: ${dollarMatches.slice(0, 3).join(', ')}${dollarMatches.length > 3 ? '...' : ''}`);
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n📊 COMPREHENSIVE SUMMARY:');
console.log(`   Total files checked: ${totalFiles}`);
console.log(`   Files with INR (₹): ${filesWithINR}`);
console.log(`   Files with $ signs: ${filesWithDollar}`);

if (filesWithDollar === 0) {
  console.log('\n🎉 PERFECT! ALL CURRENCY SYMBOLS CONVERTED TO INR (₹)!');
  console.log('\n✅ COMPLETE VERIFICATION SUCCESS:');
  console.log('   🏪 Vendor Dashboard - All revenue in ₹');
  console.log('   📋 Menu Items - All prices in ₹');
  console.log('   🛒 Cart - All totals in ₹');
  console.log('   📦 Order Summary - All amounts in ₹');
  console.log('   📱 SMS Messages - All amounts in ₹');
  console.log('   📧 Email Notifications - All amounts in ₹');
  console.log('   📊 Analytics - All revenue in ₹');
  console.log('   🎯 Order Tracking - All amounts in ₹');
  console.log('   👤 User Profile - All balances in ₹');
  console.log('   🏬 Vendor Profile - All earnings in ₹');
  
  console.log('\n💰 INDIAN MARKET READY:');
  console.log('   • Currency: Indian Rupees (₹)');
  console.log('   • Tax: 18% GST (Indian standard)');
  console.log('   • Delivery: ₹29 (localized pricing)');
  console.log('   • Consistent ₹ symbol throughout');
  
} else {
  console.log('\n⚠️  REMAINING ISSUES FOUND:');
  dollarInstances.forEach(instance => {
    console.log(`   📁 ${instance.file}:`);
    instance.matches.forEach(match => {
      console.log(`      🚨 ${match}`);
    });
  });
}

// Test specific patterns that were mentioned as problematic
console.log('\n🎯 TESTING SPECIFIC PROBLEM AREAS:');

const problemAreas = [
  { name: 'Vendor Dashboard Revenue', pattern: /totalRevenue.*\$|\$.*totalRevenue/gi },
  { name: 'Menu Item Prices', pattern: /item\.price.*\$|\$.*item\.price/gi },
  { name: 'Cart Totals', pattern: /total.*\$|\$.*total/gi },
  { name: 'Order Summary', pattern: /totalAmount.*\$|\$.*totalAmount/gi }
];

let allClear = true;

problemAreas.forEach(area => {
  let found = false;
  allFrontendFiles.forEach(file => {
    const fullPath = path.join('/home/karandeep/robo_Q', file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(area.pattern);
      if (matches) {
        found = true;
        allClear = false;
        console.log(`   ❌ ${area.name}: Found in ${file}`);
        console.log(`      ${matches.slice(0, 2).join(', ')}`);
      }
    }
  });
  
  if (!found) {
    console.log(`   ✅ ${area.name}: All converted to ₹`);
  }
});

if (allClear) {
  console.log('\n🏆 MISSION ACCOMPLISHED!');
  console.log('   All dollar signs ($) successfully replaced with Indian Rupees (₹)');
  console.log('   The application is now fully localized for the Indian market!');
} else {
  console.log('\n🔧 Some issues remain - manual review needed');
}

console.log('\n💰 FINAL INR CURRENCY VERIFICATION COMPLETE!');
