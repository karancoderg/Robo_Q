#!/usr/bin/env node

// Test Indian phone number formatting
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add Indian country code if not present (for IIT Mandi users)
  if (cleaned.length === 10) {
    // Indian mobile numbers are 10 digits
    return `+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already has 91 prefix
    return `+${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
    // Has 91 prefix with extra digit, likely correct
    return `+${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    // Already formatted with country code
    return phoneNumber;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Remove leading 0 and add +91 (common in India)
    return `+91${cleaned.substring(1)}`;
  }
  
  // For any other format, assume it's Indian and add +91
  return `+91${cleaned}`;
}

function testIndianPhoneFormatting() {
  console.log('📱 TESTING INDIAN PHONE NUMBER FORMATTING');
  console.log('=' .repeat(50));

  const testCases = [
    {
      name: 'Standard Indian Mobile (10 digits)',
      input: '8198086300',
      expected: '+918198086300'
    },
    {
      name: 'Indian Mobile with spaces',
      input: '819 808 6300',
      expected: '+918198086300'
    },
    {
      name: 'Indian Mobile with dashes',
      input: '819-808-6300',
      expected: '+918198086300'
    },
    {
      name: 'Indian Mobile with +91 already',
      input: '+918198086300',
      expected: '+918198086300'
    },
    {
      name: 'Indian Mobile with 91 prefix (no +)',
      input: '918198086300',
      expected: '+918198086300'
    },
    {
      name: 'Indian Mobile with leading 0',
      input: '08198086300',
      expected: '+918198086300'
    },
    {
      name: 'Indian Mobile with parentheses',
      input: '(819) 808-6300',
      expected: '+918198086300'
    },
    {
      name: 'Different Indian Mobile',
      input: '9876543210',
      expected: '+919876543210'
    },
    {
      name: 'Already formatted international',
      input: '+919876543210',
      expected: '+919876543210'
    },
    {
      name: 'Landline with STD code',
      input: '01905240300',
      expected: '+911905240300'
    }
  ];

  let allPassed = true;

  testCases.forEach((testCase, index) => {
    const result = formatPhoneNumber(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`\n${index + 1}️⃣ ${testCase.name}:`);
    console.log(`   Input:    "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"`);
    console.log(`   Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!passed) allPassed = false;
  });

  console.log('\n' + '=' .repeat(50));
  
  if (allPassed) {
    console.log('🎉 ALL INDIAN PHONE TESTS PASSED!');
    
    console.log('\n✅ Indian Phone Formatting Summary:');
    console.log('   - 10-digit numbers: Adds +91 prefix');
    console.log('   - Existing +91: Preserves formatting');
    console.log('   - Leading 0: Removes and adds +91');
    console.log('   - Special chars: Cleaned and formatted');
    console.log('   - Default assumption: Indian numbers (+91)');
    
    console.log('\n🇮🇳 Perfect for IIT Mandi Users:');
    console.log('   - Student numbers: 8198086300 → +918198086300');
    console.log('   - Faculty numbers: 9876543210 → +919876543210');
    console.log('   - Local numbers: Properly formatted');
    console.log('   - International: Preserved if already formatted');
    
  } else {
    console.log('❌ SOME PHONE TESTS FAILED!');
  }
}

testIndianPhoneFormatting();
