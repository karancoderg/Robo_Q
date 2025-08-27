# 🔍 Order 401 Unauthorized Error - Debugging Guide

## 🚨 **Current Issue**
```
POST http://localhost:5000/api/orders 401 (Unauthorized)
Order placement error: AxiosError {message: 'Request failed with status code 401'...}
```

## 🔧 **Debugging Tools Added**

I've added comprehensive debugging to help identify the root cause:

### **1. Authentication State Debugging**
- User object validation
- Token presence verification
- Authentication status checking

### **2. API Request Debugging**
- Token validation before requests
- JWT expiration checking
- Request headers logging

### **3. Token Management**
- Automatic token refresh before order placement
- Invalid token cleanup
- Storage synchronization

## 🧪 **How to Debug**

### **Step 1: Check Console Output**
When you try to place an order, look for these debug messages:

```
=== CHECKOUT COMPONENT DEBUG ===
User: {id: "...", email: "...", role: "user"}
Is Authenticated: true
Items in cart: 2

=== ORDER PLACEMENT DEBUG ===
User: {id: "...", email: "...", role: "user"}
Is Authenticated: true
Access Token: Present/Missing
Refresh Token: Present/Missing
Token validation result: true/false
API Request: POST /orders with valid token
```

### **Step 2: Identify the Issue**
Based on the console output, you'll see one of these scenarios:

#### **Scenario A: No Tokens**
```
Access Token: Missing
Refresh Token: Missing
API Request: POST /orders WITHOUT TOKEN
```
**Solution**: User needs to log in again

#### **Scenario B: Expired Token**
```
Access Token: Present
Token validation result: false
API Request: POST /orders with INVALID/EXPIRED token
```
**Solution**: Token refresh should happen automatically

#### **Scenario C: Invalid User State**
```
User: null
Is Authenticated: false
```
**Solution**: Authentication context issue

#### **Scenario D: Backend Issue**
```
Access Token: Present
Token validation result: true
API Request: POST /orders with valid token
401 Unauthorized
```
**Solution**: Backend authentication issue

## 🔧 **Fixes Applied**

### **1. Enhanced Token Validation**
```typescript
const validateToken = (token: string): boolean => {
  // Validates JWT structure and expiration
  const payload = JSON.parse(atob(parts[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp && payload.exp >= currentTime;
};
```

### **2. Pre-flight Authentication Check**
```typescript
// Check if user is authenticated
if (!user) {
  toast.error('Please log in to place your order');
  navigate('/login', { state: { from: location } });
  return;
}

// Check if tokens are present
if (!accessToken || !refreshToken) {
  toast.error('Authentication tokens missing. Please log in again.');
  navigate('/login', { state: { from: location } });
  return;
}
```

### **3. Automatic Token Refresh**
```typescript
// Try to refresh token before placing order
const refreshResponse = await fetch('/api/auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken }),
});
```

### **4. Enhanced Error Handling**
```typescript
if (error.response?.status === 401) {
  toast.error('Your session has expired. Please log in again.');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  navigate('/login', { state: { from: location } });
}
```

## 🎯 **Next Steps**

### **1. Test the Order Flow**
1. Open browser console
2. Navigate to checkout
3. Try to place an order
4. Check the debug output

### **2. Common Solutions**

#### **If tokens are missing:**
- Log out and log back in
- Clear browser storage and re-authenticate

#### **If token is expired:**
- The system should automatically refresh
- If it fails, log in again

#### **If backend returns 401 with valid token:**
- Check backend server is running on `http://localhost:5000`
- Verify backend authentication middleware
- Check if user role is correct (should be 'user' for orders)

### **3. Manual Token Check**
You can manually check your token in browser console:
```javascript
// Check if tokens exist
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Decode token payload (if exists)
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
}
```

## 🚀 **Expected Resolution**

After running the debug version:

1. **If authentication issue**: Clear error messages will guide you to log in
2. **If token issue**: Automatic refresh will fix it
3. **If backend issue**: Debug logs will show valid token but 401 response
4. **If successful**: Order will be placed without errors

## 📋 **Files Modified for Debugging**

1. **`src/pages/Checkout.tsx`** - Added comprehensive debugging
2. **`src/services/api.ts`** - Added token validation and request logging

## ✅ **Build Status**
```bash
✓ 514 modules transformed.
✓ built in 3.93s
```

**Ready for testing!** 🧪

Run the application and check the console output when placing an order to identify the exact cause of the 401 error.
