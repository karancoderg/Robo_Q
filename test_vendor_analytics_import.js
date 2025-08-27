#!/usr/bin/env node

// Simple test to check if the VendorAnalytics component can be imported
// This will help verify the Heroicons import issue is fixed

const fs = require('fs');
const path = require('path');

function testVendorAnalyticsImports() {
  console.log('🔍 TESTING VENDOR ANALYTICS HEROICONS IMPORTS');
  console.log('=' .repeat(50));

  try {
    // Read the VendorAnalytics file
    const filePath = path.join(__dirname, 'frontend/src/pages/VendorAnalytics.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    console.log('\n1️⃣ Checking Heroicons imports...');
    
    // Check for problematic imports
    const problematicImports = [
      'TrendingUpIcon',
      'TrendingDownIcon'
    ];

    const correctImports = [
      'ArrowTrendingUpIcon',
      'ArrowTrendingDownIcon'
    ];

    let hasProblems = false;

    problematicImports.forEach(importName => {
      // Use word boundary regex to match exact import names only
      const regex = new RegExp(`\\b${importName}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        console.log(`❌ Found problematic import: ${importName} (${matches.length} times)`);
        hasProblems = true;
      }
    });

    correctImports.forEach(importName => {
      if (content.includes(importName)) {
        console.log(`✅ Found correct import: ${importName}`);
      } else {
        console.log(`❌ Missing correct import: ${importName}`);
        hasProblems = true;
      }
    });

    console.log('\n2️⃣ Checking import statement...');
    const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]@heroicons\/react\/24\/outline['"];/);
    
    if (importMatch) {
      const imports = importMatch[1].split(',').map(i => i.trim());
      console.log('✅ Found Heroicons import statement');
      console.log('   Imported icons:', imports.join(', '));
    } else {
      console.log('❌ Could not find Heroicons import statement');
      hasProblems = true;
    }

    console.log('\n3️⃣ Checking icon usage in component...');
    const arrowTrendingUpUsage = (content.match(/ArrowTrendingUpIcon/g) || []).length;
    const arrowTrendingDownUsage = (content.match(/ArrowTrendingDownIcon/g) || []).length;
    
    console.log(`   ArrowTrendingUpIcon used: ${arrowTrendingUpUsage} times`);
    console.log(`   ArrowTrendingDownIcon used: ${arrowTrendingDownUsage} times`);

    if (arrowTrendingUpUsage >= 2 && arrowTrendingDownUsage >= 1) {
      console.log('✅ Icon usage looks correct');
    } else {
      console.log('❌ Icon usage might be incorrect');
      hasProblems = true;
    }

    console.log('\n' + '=' .repeat(50));
    
    if (!hasProblems) {
      console.log('🎉 HEROICONS IMPORT FIX SUCCESSFUL!');
      console.log('\n✅ All checks passed:');
      console.log('   - No problematic imports found');
      console.log('   - Correct imports present');
      console.log('   - Import statement valid');
      console.log('   - Icon usage correct');
      
      console.log('\n🔗 Ready for testing:');
      console.log('   1. Start frontend: npm run dev');
      console.log('   2. Login as vendor: burger@example.com');
      console.log('   3. Click Analytics button');
      console.log('   4. Should load without import errors');
    } else {
      console.log('❌ ISSUES FOUND - Need to fix imports');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVendorAnalyticsImports();
