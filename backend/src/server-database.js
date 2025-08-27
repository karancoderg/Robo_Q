const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { OAuth2Client } = require('google-auth-library');

// Load environment variables
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.FRONTEND_URL || "https://your-app-name.vercel.app",
      /\.vercel\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

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
  needsPasswordSetup: {
    type: Boolean,
    default: false
  },
  needsRoleSelection: {
    type: Boolean,
    default: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
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
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
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
    const salt = await bcrypt.genSalt(12);
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

// Models
const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const Item = mongoose.model('Item', itemSchema);
const Order = mongoose.model('Order', orderSchema);
const Robot = mongoose.model('Robot', robotSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
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

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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
        token
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
      subject: 'Your Login OTP - RoboQ',
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
      message: 'OTP sent to your email'
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
        token
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
    const { name, email, password, role = 'user' } = req.body;
    
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
      isVerified: false
    });
    
    await newUser.save();
    
    const token = generateToken(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toJSON(),
        token
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

    res.json({
      success: true,
      data: { user: user.toJSON() }
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
          token: authToken,
          isNewUser: false
        }
      });
    }
    
    // Check if user exists with the same email
    user = await User.findOne({ email });
    
    if (user) {
      // User exists with email but no Google ID - link accounts
      user.googleId = googleId;
      if (picture) user.avatar = picture;
      await user.save();
      
      const authToken = generateToken(user);
      
      return res.json({
        success: true,
        message: 'Account linked successfully',
        data: {
          user: user.toJSON(),
          token: authToken,
          isNewUser: false
        }
      });
    }
    
    // New user - create account but require additional setup
    const newUser = new User({
      googleId,
      name: name || 'Google User',
      email,
      avatar: picture,
      isVerified: true, // Google accounts are pre-verified
      needsPasswordSetup: true,
      needsRoleSelection: true,
      role: 'user' // Default role, can be changed
    });
    
    await newUser.save();
    
    const authToken = generateToken(newUser);
    
    res.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser.toJSON(),
        token: authToken,
        isNewUser: true,
        needsSetup: true
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
      user.password = password;
    }
    
    if (role && ['user', 'vendor'].includes(role)) {
      user.role = role;
    }
    
    user.needsPasswordSetup = false;
    user.needsRoleSelection = false;
    
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
        token
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

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { vendorId, items, deliveryAddress, notes } = req.body;
    
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
      notes,
      status: 'pending'
    });
    
    await order.save();
    
    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName contactInfo');
    
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
app.get('/api/orders', authenticateToken, async (req, res) => {
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

// Get vendor orders (for vendors)
app.get('/api/vendor/orders', authenticateToken, async (req, res) => {
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
    
    const orders = await Order.find({ vendorId: vendor._id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { orders }
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

// Update order status (for vendors)
app.put('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with database connection`);
});

module.exports = app;
