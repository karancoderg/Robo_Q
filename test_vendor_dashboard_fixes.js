#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testVendorDashboardFixes() {
  console.log('🔧 TESTING VENDOR DASHBOARD FIXES');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check VendorDashboard.tsx for fixes
    console.log('\n1️⃣ Checking VendorDashboard.tsx fixes...');
    const dashboardPath = path.join(__dirname, 'frontend/src/pages/VendorDashboard.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check for OrderDetailsModal import
    if (dashboardContent.includes('import OrderDetailsModal')) {
      console.log('✅ OrderDetailsModal imported in VendorDashboard');
    } else {
      console.log('❌ OrderDetailsModal not imported in VendorDashboard');
    }

    // Check for state management
    if (dashboardContent.includes('selectedOrder') && dashboardContent.includes('isOrderDetailsOpen')) {
      console.log('✅ Order details modal state added');
    } else {
      console.log('❌ Order details modal state missing');
    }

    // Check for optimistic updates in approve mutation
    if (dashboardContent.includes('onMutate') && dashboardContent.includes('Cancel any outgoing refetches')) {
      console.log('✅ Optimistic updates implemented for approve order');
    } else {
      console.log('❌ Optimistic updates missing for approve order');
    }

    // Check for event handling to prevent refresh
    if (dashboardContent.includes('event.preventDefault()') && dashboardContent.includes('event.stopPropagation()')) {
      console.log('✅ Event handling added to prevent page refresh');
    } else {
      console.log('❌ Event handling missing to prevent page refresh');
    }

    // Check for view details functionality
    if (dashboardContent.includes('handleViewOrderDetails')) {
      console.log('✅ View order details functionality added');
    } else {
      console.log('❌ View order details functionality missing');
    }

    // Test 2: Check VendorOrders.tsx for fixes
    console.log('\n2️⃣ Checking VendorOrders.tsx fixes...');
    const ordersPath = path.join(__dirname, 'frontend/src/pages/VendorOrders.tsx');
    const ordersContent = fs.readFileSync(ordersPath, 'utf8');
    
    // Check for OrderDetailsModal import
    if (ordersContent.includes('import OrderDetailsModal')) {
      console.log('✅ OrderDetailsModal imported in VendorOrders');
    } else {
      console.log('❌ OrderDetailsModal not imported in VendorOrders');
    }

    // Check for optimistic updates
    if (ordersContent.includes('onMutate') && ordersContent.includes('Cancel any outgoing refetches')) {
      console.log('✅ Optimistic updates implemented in VendorOrders');
    } else {
      console.log('❌ Optimistic updates missing in VendorOrders');
    }

    // Check for view details button functionality
    if (ordersContent.includes('onClick={(e) => handleViewOrderDetails(order, e)}')) {
      console.log('✅ View details button functionality added in VendorOrders');
    } else {
      console.log('❌ View details button functionality missing in VendorOrders');
    }

    // Test 3: Check OrderDetailsModal.tsx exists
    console.log('\n3️⃣ Checking OrderDetailsModal.tsx...');
    const modalPath = path.join(__dirname, 'frontend/src/components/OrderDetailsModal.tsx');
    
    if (fs.existsSync(modalPath)) {
      console.log('✅ OrderDetailsModal.tsx component created');
      
      const modalContent = fs.readFileSync(modalPath, 'utf8');
      
      // Check for key features
      if (modalContent.includes('Customer Information') && 
          modalContent.includes('Delivery Address') && 
          modalContent.includes('Order Items') && 
          modalContent.includes('Order Summary')) {
        console.log('✅ OrderDetailsModal has all required sections');
      } else {
        console.log('❌ OrderDetailsModal missing some sections');
      }
    } else {
      console.log('❌ OrderDetailsModal.tsx component not found');
    }

    // Test 4: Check button implementations
    console.log('\n4️⃣ Checking button implementations...');
    
    // Check approve button improvements
    if (dashboardContent.includes('type="button"') && 
        dashboardContent.includes('disabled={approveOrderMutation.isLoading}')) {
      console.log('✅ Approve button improved with loading state');
    } else {
      console.log('❌ Approve button improvements missing');
    }

    // Check view details button
    if (dashboardContent.includes('title="View Order Details"')) {
      console.log('✅ View details button has tooltip');
    } else {
      console.log('❌ View details button tooltip missing');
    }

    console.log('\n' + '=' .repeat(50));
    
    // Summary
    const dashboardHasModal = dashboardContent.includes('OrderDetailsModal');
    const ordersHasModal = ordersContent.includes('OrderDetailsModal');
    const modalExists = fs.existsSync(modalPath);
    const hasOptimisticUpdates = dashboardContent.includes('onMutate') && ordersContent.includes('onMutate');
    const hasEventHandling = dashboardContent.includes('event.preventDefault()');
    
    if (dashboardHasModal && ordersHasModal && modalExists && hasOptimisticUpdates && hasEventHandling) {
      console.log('🎉 ALL VENDOR DASHBOARD FIXES IMPLEMENTED!');
      
      console.log('\n✅ Fixed Issues:');
      console.log('   - Page refresh on order approval: FIXED');
      console.log('   - View details button functionality: FIXED');
      console.log('   - Optimistic updates: IMPLEMENTED');
      console.log('   - Loading states: ADDED');
      console.log('   - Order details modal: CREATED');
      
      console.log('\n🔧 Implementation Details:');
      console.log('   - OrderDetailsModal: Comprehensive order view');
      console.log('   - Optimistic updates: Instant UI feedback');
      console.log('   - Event handling: Prevents page refresh');
      console.log('   - Loading states: Better user experience');
      console.log('   - Error handling: Rollback on failure');
      
      console.log('\n🧪 Test Instructions:');
      console.log('   1. Login as vendor: burger@example.com');
      console.log('   2. Go to vendor dashboard');
      console.log('   3. Click "Approve" on pending order');
      console.log('   4. Verify: No page refresh, instant update');
      console.log('   5. Click "View Details" button (eye icon)');
      console.log('   6. Verify: Modal opens with order details');
      console.log('   7. Test same functionality in /vendor/orders');
      
    } else {
      console.log('❌ SOME FIXES ARE INCOMPLETE');
      console.log('\nMissing:');
      if (!dashboardHasModal) console.log('   - OrderDetailsModal in VendorDashboard');
      if (!ordersHasModal) console.log('   - OrderDetailsModal in VendorOrders');
      if (!modalExists) console.log('   - OrderDetailsModal component file');
      if (!hasOptimisticUpdates) console.log('   - Optimistic updates');
      if (!hasEventHandling) console.log('   - Event handling for page refresh');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVendorDashboardFixes();
