const crypto = require('crypto');

class PasswordGenerator {
  /**
   * Generate a secure temporary password
   * @param {number} length - Password length (default: 12)
   * @param {object} options - Password options
   * @returns {string} Generated password
   */
  static generateSecurePassword(length = 12, options = {}) {
    const defaults = {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true, // Exclude similar looking characters like 0, O, l, 1
      readable: true // Make it more readable by avoiding confusing characters
    };

    const config = { ...defaults, ...options };
    
    let charset = '';
    
    if (config.includeLowercase) {
      charset += config.excludeSimilar ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    
    if (config.includeUppercase) {
      charset += config.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    if (config.includeNumbers) {
      charset += config.excludeSimilar ? '23456789' : '0123456789';
    }
    
    if (config.includeSymbols) {
      charset += config.readable ? '!@#$%&*+=' : '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (charset === '') {
      throw new Error('At least one character type must be included');
    }

    let password = '';
    const charsetLength = charset.length;
    
    // Use crypto.randomBytes for cryptographically secure random generation
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes[i] % charsetLength;
      password += charset[randomIndex];
    }

    // Ensure password meets minimum requirements
    if (config.includeUppercase && !/[A-Z]/.test(password)) {
      const upperChars = config.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      password = this.replaceRandomChar(password, upperChars);
    }
    
    if (config.includeLowercase && !/[a-z]/.test(password)) {
      const lowerChars = config.excludeSimilar ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
      password = this.replaceRandomChar(password, lowerChars);
    }
    
    if (config.includeNumbers && !/[0-9]/.test(password)) {
      const numberChars = config.excludeSimilar ? '23456789' : '0123456789';
      password = this.replaceRandomChar(password, numberChars);
    }

    return password;
  }

  /**
   * Generate a user-friendly temporary password
   * @returns {string} User-friendly password
   */
  static generateUserFriendlyPassword() {
    return this.generateSecurePassword(10, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false, // No symbols for user-friendliness
      excludeSimilar: true,
      readable: true
    });
  }

  /**
   * Generate a high-security password
   * @returns {string} High-security password
   */
  static generateHighSecurityPassword() {
    return this.generateSecurePassword(16, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      readable: false
    });
  }

  /**
   * Replace a random character in the password with a character from the given charset
   * @private
   */
  static replaceRandomChar(password, charset) {
    const randomIndex = Math.floor(Math.random() * password.length);
    const randomChar = charset[Math.floor(Math.random() * charset.length)];
    return password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result
   */
  static validatePasswordStrength(password) {
    const result = {
      isValid: false,
      score: 0,
      feedback: [],
      strength: 'weak'
    };

    if (!password || password.length < 6) {
      result.feedback.push('Password must be at least 6 characters long');
      return result;
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 1; // No repeated characters
    if (!/123|abc|qwe|password|admin/i.test(password)) score += 1; // No common patterns

    result.score = score;

    if (score >= 7) {
      result.strength = 'strong';
      result.isValid = true;
    } else if (score >= 5) {
      result.strength = 'medium';
      result.isValid = true;
    } else if (score >= 3) {
      result.strength = 'weak';
      result.isValid = true;
    } else {
      result.strength = 'very weak';
      result.feedback.push('Password is too weak');
    }

    return result;
  }
}

module.exports = PasswordGenerator;
