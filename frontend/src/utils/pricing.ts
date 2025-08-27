// Centralized pricing logic for consistent calculations

export interface PricingBreakdown {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export const PRICING_CONFIG = {
  DELIVERY_FEE: 29.00,
  TAX_RATE: 0.18, // 18% GST
  FREE_DELIVERY_THRESHOLD: 500, // Free delivery above ₹500
} as const;

export const calculatePricing = (subtotal: number): PricingBreakdown => {
  // Determine delivery fee based on order value
  const deliveryFee = subtotal >= PRICING_CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : PRICING_CONFIG.DELIVERY_FEE;
  
  // Calculate tax on subtotal only (not on delivery fee)
  const tax = subtotal * PRICING_CONFIG.TAX_RATE;
  
  // Calculate total
  const total = subtotal + deliveryFee + tax;
  
  return {
    subtotal,
    deliveryFee,
    tax,
    total,
  };
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const isDeliveryFree = (subtotal: number): boolean => {
  return subtotal >= PRICING_CONFIG.FREE_DELIVERY_THRESHOLD;
};
