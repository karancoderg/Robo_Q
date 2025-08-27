# 🔧 Complete Setup 403 Error - Solution

## 🚨 **Issue Identified**
The `/api/auth/complete-setup` endpoint is returning **403 Forbidden** error.

## 🔍 **Root Cause Analysis**

### ✅ **What's Working**
- ✅ Server is running correctly
- ✅ Database connection is stable
- ✅ Authentication middleware works for other endpoints
- ✅ JWT tokens are being generated correctly
- ✅ Other protected endpoints work fine

### ❌ **The Problem**
The `complete-setup` endpoint has an issue with:
1. **Password hashing** taking too long (bcrypt with salt 12)
2. **Request timeout** during user.save() operation
3. **Frontend token handling** for this specific endpoint

## 🛠️ **Solutions**

### **Solution 1: Frontend Token Fix**
The frontend might not be sending the token correctly for this endpoint.

**Check in `/frontend/src/services/api.ts`:**
```typescript
// Make sure complete-setup is not excluded from token
api.interceptors.request.use((config) => {
  // Don't exclude complete-setup from token
  if (config.url?.includes('google-auth') || config.url?.includes('/auth/google')) {
    return config; // Only exclude Google OAuth
  }
  
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Solution 2: Server Optimization**
Reduce bcrypt salt rounds for faster hashing:

**In `/backend/src/server.js`:**
```javascript
// Change from salt 12 to salt 10 for faster hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10); // Reduced from 12 to 10
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
```

### **Solution 3: Alternative Endpoint**
Create a simpler endpoint for Google OAuth users:

```javascript
// Simplified setup for Google OAuth users (no password needed)
app.post('/api/auth/google-complete-setup', authenticateToken, async (req, res) => {
  try {
    const { role, businessInfo } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only update role and flags (no password for Google users)
    if (role && ['user', 'vendor'].includes(role)) {
      user.role = role;
    }
    
    user.needsPasswordSetup = false;
    user.needsRoleSelection = false;
    
    await user.save();

    // Create vendor profile if needed
    if (role === 'vendor' && businessInfo) {
      const vendor = new Vendor({
        userId: user._id,
        businessName: businessInfo.businessName,
        description: businessInfo.description,
        category: businessInfo.category,
        address: businessInfo.address,
        contactInfo: { phone: businessInfo.phone, email: user.email },
        operatingHours: businessInfo.operatingHours
      });
      await vendor.save();
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Setup completed successfully',
      data: { user: user.toJSON(), token }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete setup',
      error: error.message
    });
  }
});
```

## 🧪 **Testing**

### **Test Accounts Available**
- **testsetup@example.com** - User that needs setup
- **Token**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlMGQyOGYyNWE5ODcxZTk0YmNmNjkiLCJlbWFpbCI6InRlc3RzZXR1cEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU2MjM3MDk2LCJleHAiOjE3NTY4NDE4OTZ9.O1czFJiQXo6sjHE1m1LTJLsDJfAo_8izPjjINdOYW38`

### **Test Command**
```bash
curl -X POST http://localhost:5000/api/auth/complete-setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_HERE" \
  -d '{"password":"testpassword123","role":"user"}'
```

## 🎯 **Recommended Fix**

**For immediate resolution:**
1. Use **Solution 3** - Create the `google-complete-setup` endpoint
2. Update frontend to use the new endpoint for Google OAuth users
3. Keep the original endpoint for regular email/password users

**For long-term:**
1. Implement **Solution 2** - Optimize bcrypt performance
2. Add request timeout handling
3. Improve error messages

## 📝 **Status**
- ✅ Issue identified
- ✅ Solutions provided
- ⏳ Implementation needed
- ⏳ Testing required

---

**The complete-setup endpoint needs optimization for password hashing performance and better error handling.**
