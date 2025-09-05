const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const SMSService = require('./services/smsService');
const EmailService = require('./services/emailService');
const EnhancedSMSService = require('./services/enhancedSmsService');
const OTPService = require('./services/otpService');
const nodemailer = require('nodemailer');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { NotificationService } = require('./services/notificationService');
const { OAuth2Client } = require('google-auth-library');

// Helper function to format delivery address
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

// Load environment variables
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001", 
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:5173",
      /^http:\/\/localhost:\d+$/,  // Allow any localhost port
      process.env.FRONTEND_URL || "https://your-app-name.vercel.app",
      /\.vercel\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize notification service
const notificationService = new NotificationService(io);

const PORT = process.env.PORT || 5000;

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    required: function() {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  setupCompleted: {
    type: Boolean,
    default: false
  },
  needsPasswordSetup: {
    type: Boolean,
    default: false
  },
  needsPasswordChange: {
    type: Boolean,
    default: false
  },
  needsRoleSelection: {
    type: Boolean,
    default: false
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  loginMethods: {
    type: [String],
    enum: ['email', 'google'],
    default: ['email']
  },
  address: {
    // Traditional address format
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    // IIT Mandi address format
    id: String,
    name: String,
    category: {
      type: String,
      enum: ['hostels', 'academic', 'guest_house', 'mess']
    },
    fullAddress: String
  }
}, {
  timestamps: true
});

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contactInfo: {
    phone: String,
    email: String
  },
  operatingHours: {
    open: String,
    close: String,
    days: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const itemSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  image: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: Number,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String]
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    name: String,
    price: Number,
    quantity: Number,
    totalPrice: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'vendor_approved', 'vendor_rejected', 'robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    // Traditional address format
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    // IIT Mandi address format
    id: String,
    name: String,
    category: {
      type: String,
      enum: ['hostels', 'academic', 'guest_house', 'mess']
    },
    fullAddress: String
  },
  vendorAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  robotId: String,
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryOTP: String,
  otpExpiresAt: Date,
  customerPhone: String, // Mobile number for SMS notifications
  notes: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const robotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['idle', 'assigned', 'picking_up', 'delivering', 'maintenance', 'offline'],
    default: 'idle'
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  batteryLevel: {
    type: Number,
    default: 100
  },
  capacity: {
    weight: Number,
    volume: Number
  },
  currentLoad: {
    weight: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 0
    }
  },
  assignedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(8); // Reduced from 12 to 8 for faster hashing
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Robot assignment function
async function assignRobotToOrder(order, vendor) {
  try {
    // Check if robot API is available
    const robotAPIUrl = process.env.ROBOT_API_URL || 'http://localhost:8080/api';
    
    try {
      const healthCheck = await axios.get(`${robotAPIUrl}/health`, { timeout: 3000 });
      
      if (healthCheck.status === 200) {
        // Real robot API is available
        const assignmentResponse = await axios.post(`${robotAPIUrl}/robots/assign`, {
          orderId: order._id,
          vendorLocation: {
            lat: vendor.address.coordinates.lat,
            lng: vendor.address.coordinates.lng
          },
          customerLocation: {
            lat: order.deliveryAddress.coordinates?.lat || 40.7614,
            lng: order.deliveryAddress.coordinates?.lng || -73.9776
          }
        });
        
        return {
          success: true,
          robotId: assignmentResponse.data.robotId,
          estimatedDeliveryTime: new Date(assignmentResponse.data.estimatedDeliveryTime)
        };
      }
    } catch (apiError) {
      console.log('Robot API unavailable, using demo robot assignment');
    }
    
    // Fallback to demo robot assignment
    const demoRobots = ['RB-001', 'RB-002', 'RB-003'];
    const availableRobot = demoRobots[Math.floor(Math.random() * demoRobots.length)];
    
    // Calculate demo delivery time (15-30 minutes)
    const deliveryMinutes = 15 + Math.random() * 15;
    const estimatedDeliveryTime = new Date(Date.now() + deliveryMinutes * 60 * 1000);
    
    return {
      success: true,
      robotId: availableRobot,
      estimatedDeliveryTime,
      isDemo: true
    };
    
  } catch (error) {
    console.error('Robot assignment failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Models
const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const Item = mongoose.model('Item', itemSchema);
const Order = mongoose.model('Order', orderSchema);
const Robot = mongoose.model('Robot', robotSchema);

// Connect to MongoDB with optimized settings
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: true // Enable mongoose buffering to fix notification issues
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://your-app-name.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Utility functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In-memory OTP store (in production, use Redis or database)
global.otpStore = {};

// Auth middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Debug logging removed for performance optimization

    if (!token) {
      // Debug logging removed for performance optimization
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    // Debug logging removed for performance optimization
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // User authenticated successfully
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ AUTH ERROR:', error.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Setup-aware authentication middleware
const authenticateWithSetupCheck = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // CRITICAL FIX: Check if user has completed setup
    if (!user.setupCompleted) {
      return res.status(403).json({ 
        success: false, 
        message: 'Setup completion required',
        needsSetup: true,
        redirectTo: '/complete-setup'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ AUTH ERROR:', error.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running with database connection',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Regular login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken: token,  // Changed from 'token' to 'accessToken'
        refreshToken: token  // Add refreshToken for consistency
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// OTP login request
app.post('/api/auth/login/otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    global.otpStore[email] = {
      otp,
      userId: user._id,
      expiresAt,
      type: 'login'
    };

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Login OTP - NexDrop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Login OTP</h2>
          <p>Your OTP for login is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        userId: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

// OTP verification
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const storedOtp = global.otpStore[email];
    
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email'
      });
    }

    if (storedOtp.expiresAt < new Date()) {
      delete global.otpStore[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    const user = await User.findById(storedOtp.userId);
    delete global.otpStore[email];
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: user.toJSON(),
        accessToken: token,  // Changed from 'token' to 'accessToken'
        refreshToken: token  // Add refreshToken for consistency
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user', restaurantInfo } = req.body;
    
    // Validate role
    if (!['user', 'vendor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      isVerified: false,
      setupCompleted: true // Set to true for all users to skip setup page
    });
    
    await newUser.save();
    
    // If vendor role and restaurant info provided, create vendor profile
    if (role === 'vendor' && restaurantInfo) {
      try {
        const vendor = new Vendor({
          userId: newUser._id,
          businessName: restaurantInfo.name,
          description: `${restaurantInfo.cuisineType} restaurant`,
          category: 'restaurant',
          address: {
            street: restaurantInfo.address,
            city: 'Default City', // You can enhance this later
            state: 'Default State',
            zipCode: '00000',
            coordinates: {
              lat: 0,
              lng: 0
            }
          },
          contactInfo: {
            phone: restaurantInfo.phone,
            email: email
          },
          operatingHours: {
            open: '09:00',
            close: '22:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          },
          isActive: true,
          rating: 4.0,
          totalOrders: 0,
          totalRevenue: 0
        });
        
        await vendor.save();
        console.log('Vendor profile created successfully');
      } catch (vendorError) {
        console.error('Failed to create vendor profile:', vendorError);
        // Don't fail the registration if vendor profile creation fails
      }
    }
    
    const token = generateToken(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(),
        accessToken: token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert to JSON and ensure id field is set for frontend compatibility
    const userObj = user.toJSON();
    userObj.id = userObj._id.toString(); // Add id field for frontend

    res.json({
      success: true,
      data: { user: userObj }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Change password
app.put('/api/auth/change-password', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has a password (Google OAuth users might not have one initially)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'No password set. Please use the complete setup process.'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword; // Will be hashed by the pre-save middleware
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Google OAuth callback
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId });
    
    if (user) {
      // Existing Google user - direct login
      const authToken = generateToken(user);
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken: authToken,
          refreshToken: authToken,
          isNewUser: false,
          needsSetup: !(user.setupCompleted || false)
        }
      });
    }
    
    // Check if user exists with the same email
    user = await User.findOne({ email });
    
    if (user) {
      // User exists with email but no Google ID - link accounts
      user.googleId = googleId;
      if (picture) user.avatar = picture;
      
      // No need to generate password - user will set it in complete-setup if needed
      await user.save();
      
      const authToken = generateToken(user);
      
      // Send welcome email for account linking
      try {
        await EmailService.sendWelcomeEmail(email, name || user.name, true);
        console.log(`📧 Welcome email sent to ${email} for account linking`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
      
      return res.json({
        success: true,
        message: 'Account linked successfully with Google!',
        data: {
          user: user.toJSON(),
          accessToken: authToken,
          refreshToken: authToken,
          isNewUser: false,
          needsSetup: !(user.setupCompleted || false),
          accountLinked: true
        }
      });
    }
    
    // New user - create account without password (will be set in complete-setup)
    const newUser = new User({
      googleId,
      name: name || 'Google User',
      email,
      // No password - user will set it during complete-setup
      avatar: picture,
      isVerified: true, // Google accounts are pre-verified
      setupCompleted: false, // Require setup completion
      needsPasswordSetup: true, // User needs to set password in setup
      needsRoleSelection: true,
      role: 'user' // Default role, can be changed during setup
    });
    
    await newUser.save();
    
    // Send welcome email only (no password setup email)
    try {
      await EmailService.sendWelcomeEmail(email, name || 'Google User', true);
      console.log(`📧 Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    const authToken = generateToken(newUser);
    
    res.json({
      success: true,
      message: 'Welcome! Please complete your account setup.',
      data: {
        user: newUser.toJSON(),
        accessToken: authToken,
        refreshToken: authToken,
        isNewUser: true,
        needsSetup: true,
        needsPasswordSetup: true
      }
    });
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

// EMERGENCY BYPASS - Complete setup without auth for debugging
app.post('/api/auth/emergency-complete-setup', async (req, res) => {
  try {
    // Debug logging removed for performance optimization
    
    const { email, password, role, businessInfo } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for emergency setup'
      });
    }
    
    // Find user by email (bypass token verification)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // User found, proceeding with setup

    // Update user with password and role
    if (password) {
          // Let the User model's pre-save hook handle password hashing
          user.password = password;
    }
    
    if (role && ['user', 'vendor'].includes(role)) {
      user.role = role;
    }
    
    user.needsPasswordSetup = false;
    user.needsRoleSelection = false;
    user.setupCompleted = true; // KEY FIX: Mark setup as completed
    user.setupCompleted = true; // KEY FIX: Mark setup as completed
    
    await user.save();
    // User updated successfully

    // If user selected vendor role, create vendor profile
    if (role === 'vendor' && businessInfo) {
      const vendor = new Vendor({
        userId: user._id,
        businessName: businessInfo.businessName,
        description: businessInfo.description,
        category: businessInfo.category,
        address: businessInfo.address,
        contactInfo: {
          phone: businessInfo.phone,
          email: user.email
        },
        operatingHours: businessInfo.operatingHours
      });
      
      await vendor.save();
      // Vendor profile created successfully
    }

    const token = generateToken(user);
    // Token generated successfully
    
    res.json({
      success: true,
      message: 'Emergency setup completed successfully',
      data: {
        user: user.toJSON(),
        accessToken: token,
        refreshToken: token
      }
    });
  } catch (error) {
    console.error('🚨 EMERGENCY SETUP ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Emergency setup failed',
      error: error.message
    });
  }
});

// Complete user setup (for new Google OAuth users)
app.post('/api/auth/complete-setup', authenticateToken, async (req, res) => {
  try {
    const { password, role, businessInfo } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user with password and role
    if (password) {
          // Let the User model's pre-save hook handle password hashing
          user.password = password;
    }
    
    if (role && ['user', 'vendor'].includes(role)) {
      user.role = role;
    }
    
    user.needsPasswordSetup = false;
    user.needsRoleSelection = false;
    user.setupCompleted = true; // KEY FIX: Mark setup as completed
    
    await user.save();

    // If user selected vendor role, create vendor profile
    if (role === 'vendor' && businessInfo) {
      const vendor = new Vendor({
        userId: user._id,
        businessName: businessInfo.businessName,
        description: businessInfo.description,
        category: businessInfo.category,
        address: businessInfo.address,
        contactInfo: {
          phone: businessInfo.phone,
          email: user.email
        },
        operatingHours: businessInfo.operatingHours
      });
      
      await vendor.save();
    }

    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        user: user.toJSON(),
        accessToken: token,  // Changed from 'token' to 'accessToken'
        refreshToken: token  // Add refreshToken (same as accessToken for now)
      }
    });
  } catch (error) {
    console.error('Setup completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete setup',
      error: error.message
    });
  }
});

// Alternative endpoint for Google OAuth users with token in body
app.post('/api/auth/google-complete-setup', async (req, res) => {
  try {
    const { token, password, role, businessInfo } = req.body;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user with password and role
    if (password) {
          // Let the User model's pre-save hook handle password hashing
          user.password = password;
    }
    
    if (role && ['user', 'vendor'].includes(role)) {
      user.role = role;
    }
    
    user.needsPasswordSetup = false;
    user.needsRoleSelection = false;
    user.setupCompleted = true; // KEY FIX: Mark setup as completed
    
    await user.save();

    // If user selected vendor role, create vendor profile
    if (role === 'vendor' && businessInfo) {
      const vendor = new Vendor({
        userId: user._id,
        businessName: businessInfo.businessName,
        description: businessInfo.description,
        category: businessInfo.category,
        address: businessInfo.address,
        contactInfo: {
          phone: businessInfo.phone,
          email: user.email
        },
        operatingHours: businessInfo.operatingHours
      });
      
      await vendor.save();
    }

    const newToken = generateToken(user);
    
    res.json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        user: user.toJSON(),
        accessToken: newToken,
        refreshToken: newToken
      }
    });
  } catch (error) {
    console.error('Google setup completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete setup',
      error: error.message
    });
  }
});

// Get vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true })
      .populate('userId', 'name email avatar')
      .sort({ rating: -1 });
    
    res.json({
      success: true,
      data: { vendors }
    });
  } catch (error) {
    console.error('Vendors fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
});

// Get vendor items
app.get('/api/vendors/:vendorId/items', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const items = await Item.find({ 
      vendorId, 
      isAvailable: true 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    console.error('Items fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
});

// Get all items (with optional filtering)
app.get('/api/items', async (req, res) => {
  try {
    const { category, vendorId, search, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = { isAvailable: true };
    
    if (category) {
      query.category = category;
    }
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get items with vendor info (optimized)
    const items = await Item.find(query)
      .populate('vendorId', 'businessName rating') // Reduced populated fields
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const totalItems = await Item.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    
    res.json({
      success: true,
      data: { 
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Items fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
});

// Get IIT Mandi addresses
app.get('/api/addresses/iit-mandi', async (req, res) => {
  try {
    const addresses = [
      // Hostels
      {
        id: 'hostel_b10',
        name: 'B10 Hostel',
        category: 'hostels',
        fullAddress: 'B10 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7754, lng: 77.0269 }
      },
      {
        id: 'hostel_b12',
        name: 'B12 Hostel',
        category: 'hostels',
        fullAddress: 'B12 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7756, lng: 77.0271 }
      },
      {
        id: 'hostel_b15',
        name: 'B15 Hostel',
        category: 'hostels',
        fullAddress: 'B15 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7758, lng: 77.0273 }
      },
      {
        id: 'hostel_b8',
        name: 'B8 Hostel',
        category: 'hostels',
        fullAddress: 'B8 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7752, lng: 77.0267 }
      },
      {
        id: 'hostel_b9',
        name: 'B9 Hostel',
        category: 'hostels',
        fullAddress: 'B9 Hostel, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7753, lng: 77.0268 }
      },

      // Academic Areas
      {
        id: 'academic_a13',
        name: 'A13 Academic Block',
        category: 'academic',
        fullAddress: 'A13 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7760, lng: 77.0275 }
      },
      {
        id: 'academic_a11',
        name: 'A11 Academic Block',
        category: 'academic',
        fullAddress: 'A11 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7762, lng: 77.0277 }
      },
      {
        id: 'academic_a17',
        name: 'A17 Academic Block',
        category: 'academic',
        fullAddress: 'A17 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7764, lng: 77.0279 }
      },
      {
        id: 'academic_auditorium',
        name: 'Auditorium',
        category: 'academic',
        fullAddress: 'Auditorium, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7766, lng: 77.0281 }
      },
      {
        id: 'academic_a14',
        name: 'A14 Academic Block',
        category: 'academic',
        fullAddress: 'A14 Academic Block, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7768, lng: 77.0283 }
      },
      {
        id: 'academic_library',
        name: 'Library',
        category: 'academic',
        fullAddress: 'Library, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7770, lng: 77.0285 }
      },

      // Guest House
      {
        id: 'guest_cv_raman',
        name: 'CV Raman Guest House',
        category: 'guest_house',
        fullAddress: 'CV Raman Guest House, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7772, lng: 77.0287 }
      },

      // Mess
      {
        id: 'mess_pine',
        name: 'Pine Mess',
        category: 'mess',
        fullAddress: 'Pine Mess, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7774, lng: 77.0289 }
      },
      {
        id: 'mess_alder',
        name: 'Alder Mess',
        category: 'mess',
        fullAddress: 'Alder Mess, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7776, lng: 77.0291 }
      },
      {
        id: 'mess_tulsi',
        name: 'Tulsi Mess',
        category: 'mess',
        fullAddress: 'Tulsi Mess, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7778, lng: 77.0293 }
      },
      {
        id: 'mess_peepal',
        name: 'Peepal Mess',
        category: 'mess',
        fullAddress: 'Peepal Mess, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7780, lng: 77.0295 }
      },
      {
        id: 'mess_oak',
        name: 'Oak Mess',
        category: 'mess',
        fullAddress: 'Oak Mess, IIT Mandi North Campus, Kamand, HP 175005',
        coordinates: { lat: 31.7782, lng: 77.0297 }
      }
    ];

    const { category } = req.query;
    
    let filteredAddresses = addresses;
    if (category) {
      filteredAddresses = addresses.filter(addr => addr.category === category);
    }

    res.json({
      success: true,
      data: {
        addresses: filteredAddresses,
        categories: {
          hostels: 'Hostels',
          academic: 'Academic Areas',
          guest_house: 'Guest House',
          mess: 'Mess'
        }
      }
    });
  } catch (error) {
    console.error('IIT Mandi addresses fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
});

// Create order
app.post('/api/orders', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { vendorId, items, deliveryAddress, notes, customerPhone } = req.body;
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const dbItem = await Item.findById(item.itemId);
      if (!dbItem || !dbItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Item ${item.name} is not available`
        });
      }
      
      const itemTotal = dbItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        itemId: item.itemId,
        name: dbItem.name,
        price: dbItem.price,
        quantity: item.quantity,
        totalPrice: itemTotal
      });
    }
    
    // Get vendor address
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    const order = new Order({
      userId: req.user._id,
      vendorId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      vendorAddress: vendor.address,
      customerPhone: customerPhone || req.user.phone, // Use provided phone or user's phone
      notes,
      status: 'pending'
    });
    
    await order.save();
    
    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName contactInfo');
    
    // 🔔 Send notification to vendor about new order
    try {
      await notificationService.notifyVendorNewOrder(populatedOrder);
    } catch (notificationError) {
      console.error('❌ Failed to send new order notification:', notificationError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get user orders
app.get('/api/orders', authenticateWithSetupCheck, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('vendorId', 'businessName contactInfo')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get vendor items (for vendor management)
app.get('/api/vendor/items', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { category, search, isAvailable } = req.query;
    
    // Build query
    const query = { vendorId: vendor._id };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const items = await Item.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: { items }
    });

  } catch (error) {
    console.error('Vendor items fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor items',
      error: error.message
    });
  }
});

// Create vendor item
app.post('/api/vendor/items', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { name, description, price, category, preparationTime, weight, tags, isAvailable } = req.body;

    const item = new Item({
      vendorId: vendor._id,
      name,
      description,
      price,
      category,
      preparationTime,
      weight,
      tags: tags || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: { item }
    });

  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message
    });
  }
});

// Update vendor item
app.put('/api/vendor/items/:itemId', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item belongs to vendor
    if (!item.vendorId.equals(vendor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This item does not belong to your restaurant.'
      });
    }

    // Update item
    Object.assign(item, req.body);
    await item.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });

  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
});

// Delete vendor item
app.delete('/api/vendor/items/:itemId', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item belongs to vendor
    if (!item.vendorId.equals(vendor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This item does not belong to your restaurant.'
      });
    }

    await Item.findByIdAndDelete(itemId);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
});

// Toggle vendor item availability
app.put('/api/vendor/items/:itemId/toggle-availability', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const { itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item belongs to vendor
    if (!item.vendorId.equals(vendor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This item does not belong to your restaurant.'
      });
    }

    // Toggle availability
    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `Item ${item.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: { item }
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle item availability',
      error: error.message
    });
  }
});

// Get vendor dashboard stats
app.get('/api/vendor/dashboard/stats', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Get all orders for this vendor
    const orders = await Order.find({ vendorId: vendor._id });

    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todayRevenue,
      averageOrderValue
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

// Get vendor orders (for vendors)
app.get('/api/vendor/orders', authenticateWithSetupCheck, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default to 20 orders per page
    const skip = (page - 1) * limit;
    
    const vendor = await Vendor.findOne({ userId: req.user._id }).select('_id');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }
    
    // Optimized query with pagination and limited population
    const orders = await Order.find({ vendorId: vendor._id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination info
    const totalOrders = await Order.countDocuments({ vendorId: vendor._id });
    
    res.json({
      success: true,
      data: { 
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Vendor orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor orders',
      error: error.message
    });
  }
});

// Get single order by ID
app.get('/api/orders/:orderId', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('vendorId', 'businessName contactInfo')
      .populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user has permission to view this order
    if (req.user.role === 'user' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor || order.vendorId._id.toString() !== vendor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Update order status (for robot operations)
app.put('/api/orders/:orderId/status', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['robot_assigned', 'robot_picking_up', 'robot_delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    const oldStatus = order.status;
    order.status = status;
    
    // Update timestamps based on status
    switch (status) {
      case 'robot_assigned':
        order.robotAssignedAt = new Date();
        break;
      case 'robot_picking_up':
        order.pickupStartedAt = new Date();
        break;
      case 'robot_delivering':
        order.deliveryStartedAt = new Date();
        break;
      case 'delivered':
        order.deliveredAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        break;
    }
    
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName contactInfo');

    // 🔔 Send real-time notification for status change
    try {
      await notificationService.notifyOrderStatusChange(updatedOrder, status, oldStatus);
      
      // Special notifications for vendors
      if (status === 'delivered') {
        await notificationService.notifyVendorOrderCompleted(updatedOrder);
      }
    } catch (notificationError) {
      console.error('❌ Failed to send status change notification:', notificationError);
    }

    // 🚀 AUTOMATIC SMS NOTIFICATIONS FOR ALL STATUS CHANGES
    console.log(`📱 Triggering automatic SMS for status change: ${oldStatus} → ${status}`);
    
    try {
      let smsEventType = null;
      let additionalData = {};

      // Map status to SMS event type
      switch (status) {
        case 'robot_assigned':
          smsEventType = 'robot_assigned';
          break;
        case 'robot_picking_up':
          smsEventType = 'pickup_successful';
          break;
        case 'robot_delivering':
          smsEventType = 'out_for_delivery';
          break;
        case 'delivered':
          // Generate OTP for delivery verification
          const otp = OTPService.generateOTP();
          OTPService.storeOTP(updatedOrder._id, otp);
          smsEventType = 'delivery_otp';
          additionalData = { otp };
          break;
        case 'cancelled':
          smsEventType = 'order_cancelled';
          additionalData = { reason: 'Order cancelled by system' };
          break;
      }

      if (smsEventType) {
        const smsResult = await EnhancedSMSService.triggerAutomaticSMS(updatedOrder, smsEventType, additionalData);
        console.log(`✅ Automatic SMS [${smsEventType}] result:`, smsResult);
        
        // Store OTP in response for delivered status
        if (status === 'delivered' && additionalData.otp) {
          console.log(`🔐 OTP generated for delivery verification: ${additionalData.otp}`);
        }
      }
    } catch (smsError) {
      console.error('❌ Automatic SMS failed:', smsError);
    }

    // Send email notification for significant status changes
    if (updatedOrder.userId && ['robot_assigned', 'robot_delivering', 'delivered'].includes(status)) {
      const customer = updatedOrder.userId;
      const vendor = updatedOrder.vendorId;
      
      const orderDetails = {
        orderId: updatedOrder._id,
        customerName: customer.name,
        vendorName: vendor.businessName,
        totalAmount: updatedOrder.totalAmount,
        items: updatedOrder.items,
        deliveryAddress: formatDeliveryAddress(updatedOrder.deliveryAddress),
        status: updatedOrder.status
      };

      if (customer.email) {
        try {
          const emailResult = await EmailService.sendOrderStatusEmail(customer.email, orderDetails);
          console.log('Status email notification result:', emailResult);
        } catch (emailError) {
          console.error('Status email notification failed:', emailError);
        }
      }
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { 
        order: updatedOrder,
        previousStatus: oldStatus,
        newStatus: status
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get robot tracking data for order
app.get('/api/orders/:orderId/robot-tracking', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName address');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user has permission to view this order
    if (req.user.role === 'user' && !order.userId._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor || !order.vendorId._id.equals(vendor._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    if (!order.robotId) {
      return res.status(404).json({
        success: false,
        message: 'No robot assigned to this order'
      });
    }
    
    // Try to get real robot data
    const robotAPIUrl = process.env.ROBOT_API_URL || 'http://localhost:8080/api';
    let robotData = null;
    let isDemo = false;
    
    try {
      const robotResponse = await axios.get(`${robotAPIUrl}/robots/${order.robotId}/location`, { timeout: 3000 });
      robotData = robotResponse.data;
    } catch (apiError) {
      // Fallback to demo data
      isDemo = true;
      robotData = generateDemoRobotData(order);
    }
    
    res.json({
      success: true,
      data: {
        order: {
          id: order._id,
          status: order.status,
          robotId: order.robotId,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          vendorLocation: {
            lat: order.vendorAddress.coordinates?.lat || 40.7505,
            lng: order.vendorAddress.coordinates?.lng || -73.9934,
            name: order.vendorId.businessName
          },
          customerLocation: {
            lat: order.deliveryAddress.coordinates?.lat || 40.7614,
            lng: order.deliveryAddress.coordinates?.lng || -73.9776,
            name: 'Delivery Address'
          }
        },
        robot: robotData,
        isDemo
      }
    });
    
  } catch (error) {
    console.error('Robot tracking fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch robot tracking data',
      error: error.message
    });
  }
});

function generateDemoRobotData(order) {
  const statuses = ['assigned', 'picking_up', 'delivering'];
  const currentStatus = statuses[Math.min(statuses.length - 1, Math.floor((Date.now() - order.robotAssignedAt) / (5 * 60 * 1000)))];
  
  // Generate demo location based on order progress
  const vendorLat = order.vendorAddress.coordinates?.lat || 40.7505;
  const vendorLng = order.vendorAddress.coordinates?.lng || -73.9934;
  const customerLat = order.deliveryAddress.coordinates?.lat || 40.7614;
  const customerLng = order.deliveryAddress.coordinates?.lng || -73.9776;
  
  const progress = Math.min(0.9, (Date.now() - order.robotAssignedAt) / (20 * 60 * 1000)); // 20 min total
  const currentLat = vendorLat + (customerLat - vendorLat) * progress;
  const currentLng = vendorLng + (customerLng - vendorLng) * progress;
  
  return {
    id: order.robotId,
    name: `RoboBot ${order.robotId.split('-')[1]}`,
    status: currentStatus,
    batteryLevel: 85 + Math.random() * 10,
    currentLocation: {
      lat: currentLat,
      lng: currentLng,
      timestamp: new Date()
    },
    speed: 2.5 + Math.random() * 1.5,
    estimatedArrival: order.estimatedDeliveryTime
  };
}

// 🔐 OTP VERIFICATION ENDPOINTS

// Verify delivery OTP
app.post('/api/orders/:orderId/verify-otp', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    // Verify OTP
    const otpResult = OTPService.verifyOTP(orderId, otp);

    if (otpResult.success) {
      // Update order status to delivered_confirmed
      const order = await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('vendorId', 'businessName contactInfo');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.status = 'delivered_confirmed';
      order.deliveryConfirmedAt = new Date();
      await order.save();

      // Send delivery confirmation SMS
      try {
        const smsResult = await EnhancedSMSService.triggerAutomaticSMS(order, 'delivery_confirmed');
        console.log('✅ Delivery confirmation SMS result:', smsResult);
      } catch (smsError) {
        console.error('❌ Delivery confirmation SMS failed:', smsError);
      }

      res.json({
        success: true,
        message: 'Delivery verified successfully',
        data: { order }
      });

    } else {
      res.status(400).json({
        success: false,
        message: otpResult.error,
        code: otpResult.code,
        remainingAttempts: otpResult.remainingAttempts
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

// Get OTP status for order
app.get('/api/orders/:orderId/otp-status', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    const otpStatus = OTPService.getOTPStatus(orderId);

    res.json({
      success: true,
      data: otpStatus
    });

  } catch (error) {
    console.error('OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get OTP status',
      error: error.message
    });
  }
});

// Resend OTP for order
app.post('/api/orders/:orderId/resend-otp', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName contactInfo');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'OTP can only be resent for delivered orders'
      });
    }

    // Generate new OTP
    const newOTP = OTPService.resendOTP(orderId);

    // Send new OTP via SMS
    try {
      const smsResult = await EnhancedSMSService.triggerAutomaticSMS(order, 'delivery_otp', { otp: newOTP });
      console.log('✅ OTP resend SMS result:', smsResult);

      res.json({
        success: true,
        message: 'New OTP sent successfully'
      });

    } catch (smsError) {
      console.error('❌ OTP resend SMS failed:', smsError);
      res.status(500).json({
        success: false,
        message: 'Failed to send new OTP'
      });
    }

  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

// Vendor approve order
app.put('/api/vendor/orders/:orderId/approve', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if this order belongs to the vendor
    if (!order.vendorId.equals(vendor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not belong to your restaurant.'
      });
    }

    // Update order status to approved
    order.status = 'vendor_approved';
    order.approvedAt = new Date();
    await order.save();

    // Try to assign robot after approval
    try {
      const robotAssignment = await assignRobotToOrder(order, vendor);
      if (robotAssignment.success) {
        order.robotId = robotAssignment.robotId;
        order.status = 'robot_assigned';
        order.robotAssignedAt = new Date();
        order.estimatedDeliveryTime = robotAssignment.estimatedDeliveryTime;
        await order.save();
        console.log(`✅ Robot ${robotAssignment.robotId} assigned to order ${orderId}`);
      } else {
        console.log(`⚠️ Robot assignment failed for order ${orderId}: ${robotAssignment.error}`);
      }
    } catch (robotError) {
      console.error('❌ Robot assignment error:', robotError);
      // Continue without robot assignment - order remains vendor_approved
    }

    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName contactInfo');

    // 🔔 Send notification to customer about approval
    try {
      await notificationService.notifyOrderStatusChange(updatedOrder, 'vendor_approved', 'pending');
      console.log('✅ Notification service called successfully');
    } catch (notificationError) {
      console.error('❌ Failed to send approval notification:', notificationError);
    }

    // Send notifications to customer
    if (updatedOrder.userId) {
      const customer = updatedOrder.userId;
      const vendor = updatedOrder.vendorId;
      
      const orderDetails = {
        orderId: updatedOrder._id,
        customerName: customer.name,
        vendorName: vendor.businessName,
        totalAmount: updatedOrder.totalAmount,
        items: updatedOrder.items,
        deliveryAddress: formatDeliveryAddress(updatedOrder.deliveryAddress),
        status: updatedOrder.status
      };

      // 🚀 AUTOMATIC SMS NOTIFICATION - Order Approved
      console.log('📱 Triggering automatic SMS for order approval...');
      try {
        const smsResult = await EnhancedSMSService.triggerAutomaticSMS(updatedOrder, 'order_approved');
        console.log('✅ Automatic SMS result:', smsResult);
      } catch (smsError) {
        console.error('❌ Automatic SMS failed:', smsError);
        // Don't fail the request if SMS fails
      }

      // Send email notification if email is available
      if (customer.email) {
        try {
          const emailResult = await EmailService.sendOrderConfirmationEmail(customer.email, orderDetails);
          console.log('Email notification result:', emailResult);
        } catch (emailError) {
          console.error('Email notification failed:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    res.json({
      success: true,
      message: 'Order approved successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve order',
      error: error.message
    });
  }
});

// Vendor reject order
app.put('/api/vendor/orders/:orderId/reject', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if this order belongs to the vendor
    if (!order.vendorId.equals(vendor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not belong to your restaurant.'
      });
    }

    // Update order status to rejected
    order.status = 'vendor_rejected';
    if (reason) {
      order.rejectionReason = reason;
    }
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName contactInfo');

    // 🔔 Send notification to customer about rejection
    try {
      await notificationService.notifyOrderStatusChange(updatedOrder, 'vendor_rejected', 'pending');
    } catch (notificationError) {
      console.error('❌ Failed to send rejection notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Order rejected successfully',
      data: { order: updatedOrder }
    });

  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order',
      error: error.message
    });
  }
});

// Update order status (for vendors)
app.put('/api/orders/:orderId/status', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user has permission to update this order
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      if (!vendor || !order.vendorId.equals(vendor._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    order.status = status;
    await order.save();
    
    // Emit real-time update
    io.emit('orderUpdate', {
      orderId: order._id,
      status: order.status,
      userId: order.userId
    });
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get robots
app.get('/api/robots', async (req, res) => {
  try {
    const robots = await Robot.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: { robots }
    });
  } catch (error) {
    console.error('Robots fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch robots',
      error: error.message
    });
  }
});

// Get user notifications
app.get('/api/notifications', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const notifications = await notificationService.getUserNotifications(req.user._id, parseInt(limit));
    
    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', authenticateWithSetupCheck, async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.notificationId);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateWithSetupCheck, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  // Debug logging removed for performance optimization
  
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    // User joined notification room
  });
  
  socket.on('joinRoom', (userId) => {
    socket.join(`user_${userId}`);
    // User joined room (legacy support)
  });
  
  socket.on('disconnect', () => {
    // User disconnected
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// 🧪 SMS TESTING ENDPOINT
app.post('/api/test-sms', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { phoneNumber, testType } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    console.log(`🧪 Testing SMS type: ${testType || 'all'} to ${phoneNumber}`);

    if (testType === 'all') {
      // Test all SMS types
      await EnhancedSMSService.testAllSMSTypes(phoneNumber);
      res.json({
        success: true,
        message: 'All SMS types tested successfully'
      });
    } else {
      // Test specific SMS type
      const testOrder = {
        _id: '68ae3ccc514df80701fe626e',
        userId: { name: 'Test User', phone: phoneNumber },
        vendorId: { businessName: 'Test Restaurant' },
        totalAmount: 299.99,
        status: 'pending'
      };

      const result = await EnhancedSMSService.triggerAutomaticSMS(testOrder, testType || 'order_approved');
      
      res.json({
        success: true,
        message: `SMS test completed for ${testType}`,
        data: result
      });
    }

  } catch (error) {
    console.error('SMS test error:', error);
    res.status(500).json({
      success: false,
      message: 'SMS test failed',
      error: error.message
    });
  }
});

// 📧 EMAIL TESTING ENDPOINT
app.post('/api/test-email', authenticateWithSetupCheck, async (req, res) => {
  try {
    const { email, testType } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    console.log(`📧 Testing email type: ${testType || 'welcome'} to ${email}`);

    let result;

    switch (testType) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(email, 'Test User', false);
        break;
        
      case 'welcome-google':
        result = await EmailService.sendWelcomeEmail(email, 'Test User', true);
        break;
        
      case 'password-setup':
        result = await EmailService.sendPasswordSetupEmail(email, 'Test User', 'TempPass123');
        break;
        
      case 'order-confirmation':
        const testOrder = {
          orderId: 'TEST-' + Date.now(),
          vendorName: 'Test Restaurant',
          totalAmount: 299.99,
          customerName: 'Test User',
          items: [
            { name: 'Test Pizza', quantity: 1, price: 199.99 },
            { name: 'Test Drink', quantity: 2, price: 50.00 }
          ],
          deliveryAddress: '123 Test Street, Test City'
        };
        result = await EmailService.sendOrderConfirmationEmail(email, testOrder);
        break;
        
      case 'order-status':
        const statusOrder = {
          orderId: 'TEST-' + Date.now(),
          vendorName: 'Test Restaurant',
          totalAmount: 299.99,
          status: 'robot_delivering'
        };
        result = await EmailService.sendOrderStatusEmail(email, statusOrder);
        break;
        
      case 'config-test':
        result = await EmailService.testEmailConfiguration();
        break;
        
      default:
        result = await EmailService.sendWelcomeEmail(email, 'Test User', false);
    }

    res.json({
      success: true,
      message: `Email test completed for ${testType || 'welcome'}`,
      data: result
    });

  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// Initialize email service on startup
EmailService.testEmailConfiguration().then(result => {
  if (result.success) {
    console.log('📧 Email service ready');
  } else {
    console.log('📧 Email service in simulation mode');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with database connection`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Simulation mode'}`);
  console.log(`📱 SMS service: ${process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Simulation mode'}`);
});

module.exports = app;
