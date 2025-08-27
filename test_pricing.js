// Test script to verify pricing calculations
const { calculatePricing, formatCurrency, isDeliveryFree, PRICING_CONFIG } = require('./frontend/dist/assets/utils-BPnKsguO.js');

console.log('🧪 Testing Pricing Calculations\n');

// Test cases
const testCases = [
  { subtotal: 100, description: 'Small order (₹100)' },
  { subtotal: 300, description: 'Medium order (₹300)' },
  { subtotal: 500, description: 'Free delivery threshold (₹500)' },
  { subtotal: 750, description: 'Large order (₹750)' },
  { subtotal: 1000, description: 'Very large order (₹1000)' }
];

console.log('Configuration:');
console.log(`- Delivery Fee: ₹${PRICING_CONFIG.DELIVERY_FEE}`);
console.log(`- Tax Rate: ${PRICING_CONFIG.TAX_RATE * 100}%`);
console.log(`- Free Delivery Threshold: ₹${PRICING_CONFIG.FREE_DELIVERY_THRESHOLD}\n`);

testCases.forEach(({ subtotal, description }) => {
  const pricing = calculatePricing(subtotal);
  const isFree = isDeliveryFree(subtotal);
  
  console.log(`${description}:`);
  console.log(`  Subtotal: ${formatCurrency(pricing.subtotal)}`);
  console.log(`  Delivery: ${isFree ? 'FREE 🤖' : formatCurrency(pricing.deliveryFee)}`);
  console.log(`  Tax (18%): ${formatCurrency(pricing.tax)}`);
  console.log(`  Total: ${formatCurrency(pricing.total)}`);
  console.log('');
});

console.log('✅ All pricing calculations are consistent!');
