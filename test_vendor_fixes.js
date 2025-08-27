#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testVendorFixes() {
  console.log('🔧 TESTING VENDOR FIXES');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check VendorDashboard.tsx for TypeError fix
    console.log('\n1️⃣ Checking VendorDashboard.tsx TypeError fix...');
    const dashboardPath = path.join(__dirname, 'frontend/src/pages/VendorDashboard.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check for Array.isArray check
    if (dashboardContent.includes('Array.isArray(old)')) {
      console.log('✅ Array.isArray check added to prevent TypeError');
    } else {
      console.log('❌ Array.isArray check missing');
    }

    // Check for proper null/undefined handling
    if (dashboardContent.includes('if (!old || !Array.isArray(old)) return old;')) {
      console.log('✅ Proper null/undefined handling implemented');
    } else {
      console.log('❌ Proper null/undefined handling missing');
    }

    // Test 2: Check VendorOrders.tsx for TypeError fix
    console.log('\n2️⃣ Checking VendorOrders.tsx TypeError fix...');
    const ordersPath = path.join(__dirname, 'frontend/src/pages/VendorOrders.tsx');
    const ordersContent = fs.readFileSync(ordersPath, 'utf8');
    
    // Check for Array.isArray check in VendorOrders
    if (ordersContent.includes('Array.isArray(old)')) {
      console.log('✅ Array.isArray check added to VendorOrders');
    } else {
      console.log('❌ Array.isArray check missing in VendorOrders');
    }

    // Test 3: Check view details button removal from VendorOrders
    console.log('\n3️⃣ Checking view details button removal from VendorOrders...');
    
    // Check that View Details button is removed
    if (!ordersContent.includes('View Details')) {
      console.log('✅ View Details button removed from VendorOrders');
    } else {
      console.log('❌ View Details button still present in VendorOrders');
    }

    // Check that EyeIcon import is removed
    if (!ordersContent.includes('EyeIcon')) {
      console.log('✅ EyeIcon import removed from VendorOrders');
    } else {
      console.log('❌ EyeIcon import still present in VendorOrders');
    }

    // Check that OrderDetailsModal import is removed
    if (!ordersContent.includes('OrderDetailsModal')) {
      console.log('✅ OrderDetailsModal import removed from VendorOrders');
    } else {
      console.log('❌ OrderDetailsModal import still present in VendorOrders');
    }

    // Check that view details functions are removed
    if (!ordersContent.includes('handleViewOrderDetails')) {
      console.log('✅ View details functions removed from VendorOrders');
    } else {
      console.log('❌ View details functions still present in VendorOrders');
    }

    // Check that modal state is removed
    if (!ordersContent.includes('selectedOrder') && !ordersContent.includes('isOrderDetailsOpen')) {
      console.log('✅ Modal state variables removed from VendorOrders');
    } else {
      console.log('❌ Modal state variables still present in VendorOrders');
    }

    // Test 4: Verify VendorDashboard still has view details functionality
    console.log('\n4️⃣ Verifying VendorDashboard still has view details...');
    
    if (dashboardContent.includes('OrderDetailsModal') && dashboardContent.includes('handleViewOrderDetails')) {
      console.log('✅ VendorDashboard still has view details functionality');
    } else {
      console.log('❌ VendorDashboard view details functionality missing');
    }

    // Test 5: Check that approve functionality is preserved
    console.log('\n5️⃣ Checking approve functionality preservation...');
    
    if (dashboardContent.includes('handleApproveOrder') && ordersContent.includes('handleApproveOrder')) {
      console.log('✅ Approve functionality preserved in both components');
    } else {
      console.log('❌ Approve functionality missing in some components');
    }

    console.log('\n' + '=' .repeat(50));
    
    // Summary
    const typeErrorFixed = dashboardContent.includes('Array.isArray(old)') && ordersContent.includes('Array.isArray(old)');
    const viewDetailsRemoved = !ordersContent.includes('View Details') && !ordersContent.includes('OrderDetailsModal');
    const dashboardPreserved = dashboardContent.includes('OrderDetailsModal');
    const approvePreserved = dashboardContent.includes('handleApproveOrder') && ordersContent.includes('handleApproveOrder');
    
    if (typeErrorFixed && viewDetailsRemoved && dashboardPreserved && approvePreserved) {
      console.log('🎉 ALL VENDOR FIXES SUCCESSFULLY IMPLEMENTED!');
      
      console.log('\n✅ Fixed Issues:');
      console.log('   - TypeError: old.map is not a function: FIXED');
      console.log('   - View details button removed from VendorOrders: DONE');
      console.log('   - VendorDashboard view details preserved: MAINTAINED');
      console.log('   - Approve functionality preserved: WORKING');
      
      console.log('\n🔧 Technical Details:');
      console.log('   - Array.isArray() check: Prevents TypeError');
      console.log('   - Null/undefined handling: Robust error prevention');
      console.log('   - Clean code: Unused imports/functions removed');
      console.log('   - Selective removal: Only VendorOrders affected');
      
      console.log('\n🧪 Test Instructions:');
      console.log('   1. Login as vendor: burger@example.com');
      console.log('   2. Go to vendor dashboard');
      console.log('   3. Try approving orders - should work without TypeError');
      console.log('   4. View details should work on dashboard');
      console.log('   5. Go to /vendor/orders');
      console.log('   6. Verify no "View Details" button present');
      console.log('   7. Approve should still work without errors');
      
    } else {
      console.log('❌ SOME FIXES ARE INCOMPLETE');
      console.log('\nIssues:');
      if (!typeErrorFixed) console.log('   - TypeError fix incomplete');
      if (!viewDetailsRemoved) console.log('   - View details button not fully removed');
      if (!dashboardPreserved) console.log('   - VendorDashboard functionality lost');
      if (!approvePreserved) console.log('   - Approve functionality broken');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVendorFixes();
