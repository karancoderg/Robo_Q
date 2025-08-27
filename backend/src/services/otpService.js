class OTPService {
  constructor() {
    // Store OTPs in memory (in production, use Redis or database)
    this.otpStore = new Map();
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
  }

  // Generate 4-digit OTP
  generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Store OTP for order
  storeOTP(orderId, otp) {
    const expiryTime = Date.now() + this.otpExpiry;
    this.otpStore.set(orderId.toString(), {
      otp,
      expiryTime,
      attempts: 0,
      maxAttempts: 3
    });
    
    console.log(`🔐 OTP stored for order ${orderId}: ${otp} (expires in 10 min)`);
    
    // Auto-cleanup expired OTP
    setTimeout(() => {
      this.cleanupExpiredOTP(orderId);
    }, this.otpExpiry);
  }

  // Verify OTP for order
  verifyOTP(orderId, providedOTP) {
    const orderIdStr = orderId.toString();
    const otpData = this.otpStore.get(orderIdStr);

    if (!otpData) {
      return {
        success: false,
        error: 'OTP not found or expired',
        code: 'OTP_NOT_FOUND'
      };
    }

    // Check if expired
    if (Date.now() > otpData.expiryTime) {
      this.otpStore.delete(orderIdStr);
      return {
        success: false,
        error: 'OTP expired',
        code: 'OTP_EXPIRED'
      };
    }

    // Check attempts
    if (otpData.attempts >= otpData.maxAttempts) {
      this.otpStore.delete(orderIdStr);
      return {
        success: false,
        error: 'Maximum attempts exceeded',
        code: 'MAX_ATTEMPTS'
      };
    }

    // Verify OTP
    if (otpData.otp === providedOTP.toString()) {
      this.otpStore.delete(orderIdStr);
      console.log(`✅ OTP verified successfully for order ${orderId}`);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      // Increment attempts
      otpData.attempts++;
      this.otpStore.set(orderIdStr, otpData);
      
      const remainingAttempts = otpData.maxAttempts - otpData.attempts;
      console.log(`❌ Invalid OTP for order ${orderId}. Attempts remaining: ${remainingAttempts}`);
      
      return {
        success: false,
        error: `Invalid OTP. ${remainingAttempts} attempts remaining`,
        code: 'INVALID_OTP',
        remainingAttempts
      };
    }
  }

  // Get OTP status for order
  getOTPStatus(orderId) {
    const orderIdStr = orderId.toString();
    const otpData = this.otpStore.get(orderIdStr);

    if (!otpData) {
      return {
        exists: false,
        message: 'No OTP found for this order'
      };
    }

    const isExpired = Date.now() > otpData.expiryTime;
    const timeRemaining = Math.max(0, otpData.expiryTime - Date.now());

    return {
      exists: true,
      expired: isExpired,
      attempts: otpData.attempts,
      maxAttempts: otpData.maxAttempts,
      timeRemaining: Math.ceil(timeRemaining / 1000), // seconds
      message: isExpired ? 'OTP expired' : `OTP active, ${Math.ceil(timeRemaining / 60000)} minutes remaining`
    };
  }

  // Cleanup expired OTP
  cleanupExpiredOTP(orderId) {
    const orderIdStr = orderId.toString();
    const otpData = this.otpStore.get(orderIdStr);
    
    if (otpData && Date.now() > otpData.expiryTime) {
      this.otpStore.delete(orderIdStr);
      console.log(`🧹 Cleaned up expired OTP for order ${orderId}`);
    }
  }

  // Resend OTP (generate new one)
  resendOTP(orderId) {
    const newOTP = this.generateOTP();
    this.storeOTP(orderId, newOTP);
    return newOTP;
  }

  // Get all active OTPs (for debugging)
  getActiveOTPs() {
    const active = [];
    for (const [orderId, otpData] of this.otpStore.entries()) {
      if (Date.now() <= otpData.expiryTime) {
        active.push({
          orderId,
          otp: otpData.otp,
          attempts: otpData.attempts,
          timeRemaining: Math.ceil((otpData.expiryTime - Date.now()) / 1000)
        });
      }
    }
    return active;
  }

  // Clear all OTPs (for testing)
  clearAllOTPs() {
    this.otpStore.clear();
    console.log('🧹 All OTPs cleared');
  }
}

// Create singleton instance
const otpService = new OTPService();

module.exports = otpService;
