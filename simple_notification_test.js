#!/usr/bin/env node

// Simple test to check notification system integration
console.log('🔍 SIMPLE NOTIFICATION SYSTEM TEST');
console.log('=' .repeat(40));

// Test 1: Check if notification service file exists and loads
try {
  const { NotificationService } = require('./backend/src/services/notificationService');
  console.log('✅ NotificationService loads successfully');
  
  // Test 2: Check if the service has required methods
  const methods = Object.getOwnPropertyNames(NotificationService.prototype);
  const requiredMethods = ['notifyOrderStatusChange', 'notifyVendorNewOrder', 'sendNotification'];
  
  const hasAllMethods = requiredMethods.every(method => methods.includes(method));
  console.log('✅ Required methods present:', hasAllMethods);
  
  if (hasAllMethods) {
    console.log('📋 Available methods:', methods.filter(m => m !== 'constructor').join(', '));
  }
  
} catch (error) {
  console.log('❌ NotificationService failed to load:', error.message);
}

// Test 3: Check server integration
console.log('\n🔍 CHECKING SERVER INTEGRATION...');

const fs = require('fs');
const serverFile = './backend/src/server.js';

if (fs.existsSync(serverFile)) {
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  
  const checks = [
    { name: 'NotificationService import', pattern: /require.*notificationService/ },
    { name: 'NotificationService initialization', pattern: /new NotificationService/ },
    { name: 'Order approved notification', pattern: /notifyOrderStatusChange.*vendor_approved/ },
    { name: 'Socket.IO integration', pattern: /io.*new Server/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(serverContent);
    console.log(found ? '✅' : '❌', check.name, found ? 'FOUND' : 'MISSING');
  });
} else {
  console.log('❌ Server file not found');
}

// Test 4: Check frontend integration
console.log('\n🔍 CHECKING FRONTEND INTEGRATION...');

const socketContextFile = './frontend/src/contexts/SocketContext.tsx';
if (fs.existsSync(socketContextFile)) {
  const contextContent = fs.readFileSync(socketContextFile, 'utf8');
  
  const frontendChecks = [
    { name: 'Socket connection', pattern: /io.*connect/ },
    { name: 'Notification listener', pattern: /socket.*on.*notification/ },
    { name: 'Join user room', pattern: /join_user_room/ }
  ];
  
  frontendChecks.forEach(check => {
    const found = check.pattern.test(contextContent);
    console.log(found ? '✅' : '❌', check.name, found ? 'FOUND' : 'MISSING');
  });
} else {
  console.log('❌ SocketContext file not found');
}

console.log('\n🎯 QUICK DIAGNOSIS:');
console.log('1. Check browser console for Socket.IO connection errors');
console.log('2. Verify you\'re logged in and socket connects to your user room');
console.log('3. Test by approving an order and checking browser network tab');
console.log('4. Look for "notification" events in browser dev tools');

console.log('\n✅ Test completed - check results above!');
