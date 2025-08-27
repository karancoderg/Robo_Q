#!/usr/bin/env node

// Test the address formatting function
function formatDeliveryAddress(deliveryAddress) {
  if (!deliveryAddress) return 'Not provided';
  
  // Handle IIT Mandi addresses (have fullAddress or name)
  if (deliveryAddress.fullAddress) {
    return deliveryAddress.fullAddress;
  }
  
  if (deliveryAddress.name) {
    return deliveryAddress.name;
  }
  
  // Handle traditional addresses (have street and city)
  if (deliveryAddress.street || deliveryAddress.city) {
    const parts = [deliveryAddress.street, deliveryAddress.city].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address provided';
  }
  
  return 'Address provided';
}

function testAddressFix() {
  console.log('🔧 TESTING ADDRESS FIX');
  console.log('=' .repeat(40));

  // Test cases
  const testCases = [
    {
      name: 'IIT Mandi Address (fullAddress)',
      address: {
        coordinates: { lat: 31.7754, lng: 77.0269 },
        id: "hostel_b10",
        name: "B10 Hostel",
        category: "hostels",
        fullAddress: "B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005"
      },
      expected: "B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005"
    },
    {
      name: 'IIT Mandi Address (name only)',
      address: {
        coordinates: { lat: 31.7754, lng: 77.0269 },
        id: "hostel_b10",
        name: "B10 Hostel",
        category: "hostels"
      },
      expected: "B10 Hostel"
    },
    {
      name: 'Traditional Address',
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001"
      },
      expected: "123 Main St, New York"
    },
    {
      name: 'Partial Traditional Address',
      address: {
        city: "New York",
        state: "NY"
      },
      expected: "New York"
    },
    {
      name: 'Empty Address',
      address: null,
      expected: "Not provided"
    },
    {
      name: 'Broken Address (old format)',
      address: {
        street: undefined,
        city: undefined
      },
      expected: "Address provided"
    }
  ];

  let allPassed = true;

  testCases.forEach((testCase, index) => {
    const result = formatDeliveryAddress(testCase.address);
    const passed = result === testCase.expected;
    
    console.log(`\n${index + 1}️⃣ ${testCase.name}:`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"`);
    console.log(`   Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!passed) allPassed = false;
  });

  console.log('\n' + '=' .repeat(40));
  
  if (allPassed) {
    console.log('🎉 ALL ADDRESS TESTS PASSED!');
    console.log('\n✅ Address Fix Summary:');
    console.log('   - IIT Mandi addresses: Uses fullAddress or name');
    console.log('   - Traditional addresses: Uses street, city');
    console.log('   - Broken addresses: Graceful fallback');
    console.log('   - Null addresses: "Not provided"');
  } else {
    console.log('❌ SOME ADDRESS TESTS FAILED!');
  }
}

testAddressFix();
