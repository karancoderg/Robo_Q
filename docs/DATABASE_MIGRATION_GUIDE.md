# RoboQ Database Migration Guide

## Overview

This guide documents the migration from mock data to a real MongoDB database with enhanced Google OAuth functionality. The migration preserves all existing functionality while adding robust data persistence and improved user onboarding.

## 🚀 Quick Start

### Switch to Database Mode
```bash
./switch-to-database.sh
```

### Revert to Mock Data (if needed)
```bash
./revert-to-mock.sh
```

## 📋 What's New

### 1. Real Database Integration
- **MongoDB Connection**: Full MongoDB integration with Mongoose ODM
- **Data Persistence**: All user data, orders, and vendor information now persists
- **Real-time Updates**: Socket.io integration for live order tracking
- **Scalable Architecture**: Production-ready database schema

### 2. Enhanced Google OAuth Flow
- **Smart User Detection**: Automatically detects new vs existing Google users
- **Setup Completion**: New users complete password and role selection
- **Account Linking**: Links Google accounts with existing email accounts
- **Role Selection**: Users choose between Customer or Vendor during setup

### 3. Vendor Onboarding
- **Business Information**: Complete business profile setup for vendors
- **Operating Hours**: Configurable business hours and days
- **Address Management**: Full address with coordinates support
- **Category Selection**: Business category classification

### 4. Sample Data
- **Test Users**: Pre-populated with sample customers and vendors
- **Menu Items**: Sample restaurant items with categories
- **Robots**: Mock delivery robots for testing
- **Orders**: Ready for order processing and tracking

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  googleId: String (unique, sparse),
  avatar: String,
  role: 'user' | 'vendor' | 'admin',
  isVerified: Boolean,
  needsPasswordSetup: Boolean,
  needsRoleSelection: Boolean,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: { lat: Number, lng: Number }
  },
  timestamps: true
}
```

### Vendors Collection
```javascript
{
  userId: ObjectId (ref: User),
  businessName: String,
  description: String,
  category: String,
  address: AddressSchema,
  contactInfo: {
    phone: String,
    email: String
  },
  operatingHours: {
    open: String,
    close: String,
    days: [String]
  },
  isActive: Boolean,
  rating: Number,
  totalOrders: Number,
  timestamps: true
}
```

### Items Collection
```javascript
{
  vendorId: ObjectId (ref: Vendor),
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  isAvailable: Boolean,
  preparationTime: Number,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  timestamps: true
}
```

### Orders Collection
```javascript
{
  userId: ObjectId (ref: User),
  vendorId: ObjectId (ref: Vendor),
  items: [{
    itemId: ObjectId (ref: Item),
    name: String,
    price: Number,
    quantity: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  status: 'pending' | 'vendor_approved' | 'vendor_rejected' | 'robot_assigned' | 'robot_picking_up' | 'robot_delivering' | 'delivered' | 'cancelled',
  deliveryAddress: AddressSchema,
  vendorAddress: AddressSchema,
  robotId: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryOTP: String,
  otpExpiresAt: Date,
  notes: String,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  timestamps: true
}
```

### Robots Collection
```javascript
{
  name: String,
  status: 'idle' | 'assigned' | 'picking_up' | 'delivering' | 'maintenance' | 'offline',
  currentLocation: { lat: Number, lng: Number },
  batteryLevel: Number,
  capacity: { weight: Number, volume: Number },
  currentLoad: { weight: Number, volume: Number },
  assignedOrderId: ObjectId (ref: Order),
  lastMaintenance: Date,
  timestamps: true
}
```

## 🔐 Authentication Flow

### Regular Login/Registration
1. **Email/Password**: Traditional authentication with JWT tokens
2. **OTP Login**: Email-based OTP for passwordless login
3. **Password Security**: Bcrypt hashing with salt rounds

### Google OAuth Flow
1. **New Users**:
   - Google authentication
   - Account creation with Google profile
   - Password setup prompt
   - Role selection (User/Vendor)
   - Business setup (if Vendor)
   - Complete onboarding

2. **Existing Users**:
   - Google authentication
   - Account linking (if email matches)
   - Direct login
   - No additional setup required

## 🧪 Test Accounts

### Pre-created Users
```
Customer Accounts:
- john@example.com / password123
- jane@example.com / password123

Vendor Accounts:
- pizza@example.com / password123 (Pizza Palace)
- burger@example.com / password123 (Burger Kingdom)
```

### Sample Vendors
1. **Pizza Palace**
   - Category: Restaurant
   - Items: Margherita Pizza, Pepperoni Pizza, Caesar Salad
   - Rating: 4.5/5
   - Hours: 11:00 AM - 11:00 PM (Daily)

2. **Burger Kingdom**
   - Category: Restaurant
   - Items: Classic Cheeseburger, Chicken Deluxe, French Fries
   - Rating: 4.2/5
   - Hours: 10:00 AM - 10:00 PM (Mon-Sat)

## 🔧 Configuration

### Environment Variables
```bash
# Database
MONGODB_URI="mongodb+srv://user:password@cluster0.gcnua.mongodb.net/"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Application Settings
MOCK_MODE=false
FRONTEND_URL=http://localhost:3000
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - Regular login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/complete-setup` - Complete user setup
- `POST /api/auth/login/otp` - Request OTP login
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/profile` - Get user profile

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details
- `GET /api/vendors/:id/items` - Get vendor items
- `GET /api/vendor/orders` - Get vendor orders (auth required)
- `PUT /api/orders/:id/status` - Update order status (vendor)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Robots
- `GET /api/robots` - List all robots
- `GET /api/robots/:id` - Get robot details

## 🔄 Migration Process

### What Happens During Migration
1. **Dependency Installation**: Installs MongoDB and related packages
2. **Database Initialization**: Creates sample data and indexes
3. **Server Switch**: Replaces mock server with database server
4. **Configuration Update**: Updates environment variables
5. **Service Restart**: Restarts with new configuration

### Preserved Functionality
- ✅ All existing API endpoints
- ✅ User authentication and authorization
- ✅ Order management and tracking
- ✅ Vendor dashboard and management
- ✅ Real-time updates via Socket.io
- ✅ Email notifications
- ✅ OTP functionality

### New Features Added
- ✅ Data persistence across server restarts
- ✅ Enhanced Google OAuth with setup flow
- ✅ Role-based user onboarding
- ✅ Vendor business profile management
- ✅ Scalable database architecture
- ✅ Production-ready data models

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB URI in .env file
   # Ensure network access is allowed
   # Verify credentials
   ```

2. **Google OAuth Not Working**
   ```bash
   # Verify GOOGLE_CLIENT_ID in .env
   # Check Google Console configuration
   # Ensure callback URL is correct
   ```

3. **Server Won't Start**
   ```bash
   # Check if port 5000 is available
   # Verify all environment variables
   # Check MongoDB connection
   ```

4. **Setup Flow Not Appearing**
   ```bash
   # Clear browser cache and localStorage
   # Check frontend API configuration
   # Verify Google OAuth response format
   ```

### Logs and Debugging
```bash
# Backend logs
tail -f backend/logs/app.log

# Server console output
npm run dev

# Database connection test
node -e "require('./backend/src/init-database.js')"
```

## 🔒 Security Considerations

### Password Security
- Bcrypt hashing with 12 salt rounds
- JWT tokens with expiration
- Refresh token rotation
- Secure password requirements

### Google OAuth Security
- Token verification with Google
- Secure credential handling
- Account linking validation
- CSRF protection

### Database Security
- Connection string encryption
- Input validation and sanitization
- MongoDB injection prevention
- Proper indexing for performance

## 📈 Performance Optimizations

### Database Indexes
- Email uniqueness index
- Geospatial index for coordinates
- Compound indexes for queries
- Sparse indexes for optional fields

### Caching Strategy
- JWT token caching
- User session management
- API response optimization
- Static asset caching

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Update MongoDB URI for production
- [ ] Configure proper JWT secrets
- [ ] Set up email service credentials
- [ ] Configure Google OAuth for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting

### Environment-Specific Configuration
```bash
# Development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/roboq-dev

# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roboq-prod
```

## 📞 Support

For issues or questions regarding the database migration:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Verify environment configuration
4. Test with the provided sample accounts
5. Use the revert script if needed: `./revert-to-mock.sh`

## 🎯 Next Steps

After successful migration, consider:

1. **Data Backup**: Set up regular database backups
2. **Monitoring**: Implement application monitoring
3. **Analytics**: Add user behavior tracking
4. **Performance**: Optimize database queries
5. **Security**: Regular security audits
6. **Scaling**: Plan for horizontal scaling

---

**Migration completed successfully! Your RoboQ application now uses a real database with enhanced Google OAuth functionality while preserving all existing features.**
