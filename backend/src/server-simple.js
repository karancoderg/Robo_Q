const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    }
  },
  {
    id: '2',
    name: 'Pizza Palace Owner',
    email: 'pizza@example.com',
    password: 'password123',
    role: 'vendor',
    isVerified: true
  },
  {
    id: '3',
    name: 'Fresh Grocery Owner',
    email: 'grocery@example.com',
    password: 'password123',
    role: 'vendor',
    isVerified: true
  }
];

const mockVendors = [
  {
    _id: '1',
    userId: '2',
    businessName: 'Pizza Palace',
    description: 'Authentic Italian pizzas made with fresh ingredients',
    category: 'restaurant',
    address: {
      street: '789 Pizza St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      coordinates: { lat: 40.7505, lng: -73.9934 }
    },
    contactInfo: {
      phone: '+1-555-0123',
      email: 'pizza@example.com'
    },
    operatingHours: {
      open: '10:00',
      close: '22:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isActive: true,
    rating: 4.5,
    totalOrders: 150
  },
  {
    _id: '2',
    userId: '3',
    businessName: 'Fresh Grocery',
    description: 'Fresh fruits, vegetables, and daily essentials',
    category: 'grocery',
    address: {
      street: '321 Market Rd',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      coordinates: { lat: 40.7282, lng: -74.0776 }
    },
    contactInfo: {
      phone: '+1-555-0456',
      email: 'grocery@example.com'
    },
    operatingHours: {
      open: '08:00',
      close: '20:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    isActive: true,
    rating: 4.2,
    totalOrders: 89
  }
];

const mockItems = [
  {
    _id: '1',
    vendorId: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    category: 'food',
    isAvailable: true,
    preparationTime: 15,
    weight: 500,
    tags: ['pizza', 'vegetarian', 'italian']
  },
  {
    _id: '2',
    vendorId: '1',
    name: 'Pepperoni Pizza',
    description: 'Traditional pizza with pepperoni and mozzarella cheese',
    price: 14.99,
    category: 'food',
    isAvailable: true,
    preparationTime: 15,
    weight: 550,
    tags: ['pizza', 'meat', 'italian']
  },
  {
    _id: '3',
    vendorId: '2',
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, 1 lb',
    price: 2.99,
    category: 'groceries',
    isAvailable: true,
    preparationTime: 2,
    weight: 454,
    tags: ['fruit', 'organic', 'healthy']
  }
];

let mockOrders = [];

// Generate JWT token (simplified)
const generateToken = (user) => {
  return Buffer.from(JSON.stringify({ userId: user.id, email: user.email, role: user.role })).toString('base64');
};

// Verify token (simplified)
const verifyToken = (token) => {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
};

// Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  const user = mockUsers.find(u => u.id === decoded.userId);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }
  
  req.user = user;
  next();
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken: token,
      refreshToken: token,
      expiresIn: '7d'
    }
  });
});

// OTP Login routes
app.post('/api/auth/login/otp', (req, res) => {
  const { email } = req.body;
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Generate a mock OTP (in real app, this would be sent via SMS/email)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP temporarily (in real app, use Redis or database)
  global.otpStore = global.otpStore || {};
  global.otpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    userId: user.id
  };
  
  console.log(`OTP for ${email}: ${otp}`); // In real app, send via SMS/email
  
  res.json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      email,
      expiresIn: 300 // 5 minutes
    }
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  if (!global.otpStore || !global.otpStore[email]) {
    return res.status(400).json({
      success: false,
      message: 'OTP not found or expired'
    });
  }
  
  const storedOtp = global.otpStore[email];
  
  if (Date.now() > storedOtp.expires) {
    delete global.otpStore[email];
    return res.status(400).json({
      success: false,
      message: 'OTP expired'
    });
  }
  
  if (storedOtp.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  }
  
  // OTP is valid, log in the user
  const user = mockUsers.find(u => u.id === storedOtp.userId);
  delete global.otpStore[email];
  
  const token = generateToken(user);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken: token,
      refreshToken: token,
      expiresIn: '7d'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }
  
  // Create new user
  const newUser = {
    id: (mockUsers.length + 1).toString(),
    name,
    email,
    password,
    role,
    isVerified: false,
    address: null
  };
  
  mockUsers.push(newUser);
  
  const token = generateToken(newUser);
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified
      },
      accessToken: token,
      refreshToken: token,
      expiresIn: '7d'
    }
  });
});

app.put('/api/auth/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }
  
  const user = mockUsers.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Verify current password
  if (user.password !== currentPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Update password
  user.password = newPassword;
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

app.get('/api/auth/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        address: req.user.address
      }
    }
  });
});

// Vendor routes
app.get('/api/vendors', (req, res) => {
  res.json({
    success: true,
    data: {
      vendors: mockVendors,
      pagination: {
        page: 1,
        limit: 10,
        total: mockVendors.length,
        pages: 1
      }
    }
  });
});

app.get('/api/vendors/:vendorId', (req, res) => {
  const vendor = mockVendors.find(v => v._id === req.params.vendorId);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }
  res.json({ success: true, data: { vendor } });
});

// Item routes
app.get('/api/items', (req, res) => {
  let items = [...mockItems];
  
  if (req.query.vendorId) {
    items = items.filter(item => item.vendorId === req.query.vendorId);
  }
  
  if (req.query.category) {
    items = items.filter(item => item.category === req.query.category);
  }
  
  // Add vendor info to items
  items = items.map(item => ({
    ...item,
    vendorId: mockVendors.find(v => v._id === item.vendorId)
  }));
  
  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: 1,
        limit: 20,
        total: items.length,
        pages: 1
      }
    }
  });
});

app.get('/api/items/:itemId', (req, res) => {
  const item = mockItems.find(i => i._id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }
  
  const itemWithVendor = {
    ...item,
    vendorId: mockVendors.find(v => v._id === item.vendorId)
  };
  
  res.json({ success: true, data: { item: itemWithVendor } });
});

// Order routes
app.post('/api/orders', authenticate, (req, res) => {
  const { vendorId, items, deliveryAddress, notes } = req.body;
  
  const vendor = mockVendors.find(v => v._id === vendorId);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }
  
  const orderItems = items.map(orderItem => {
    const item = mockItems.find(i => i._id === orderItem.itemId);
    return {
      itemId: item._id,
      name: item.name,
      price: item.price,
      quantity: orderItem.quantity,
      totalPrice: item.price * orderItem.quantity
    };
  });
  
  const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const order = {
    _id: Date.now().toString(),
    userId: req.user.id,
    vendorId,
    items: orderItems,
    totalAmount,
    deliveryAddress,
    vendorAddress: vendor.address,
    status: 'pending',
    notes,
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockOrders.push(order);
  
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

app.get('/api/orders/my-orders', authenticate, (req, res) => {
  const userOrders = mockOrders.filter(order => order.userId === req.user.id);
  
  res.json({
    success: true,
    data: {
      orders: userOrders,
      pagination: {
        page: 1,
        limit: 10,
        total: userOrders.length,
        pages: 1
      }
    }
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Vendor routes
app.get('/api/vendor/dashboard/stats', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const vendorOrders = mockOrders.filter(order => order.vendorId === req.user.id);
  const stats = {
    totalOrders: vendorOrders.length,
    pendingOrders: vendorOrders.filter(o => o.status === 'pending').length,
    completedOrders: vendorOrders.filter(o => o.status === 'delivered').length,
    totalRevenue: vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    todayRevenue: vendorOrders
      .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.totalAmount, 0),
    averageOrderValue: vendorOrders.length > 0 
      ? vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0) / vendorOrders.length 
      : 0
  };

  res.json({ success: true, data: { stats } });
});

app.get('/api/vendor/orders', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  let vendorOrders = mockOrders.filter(order => order.vendorId === req.user.id);
  
  if (req.query.status) {
    vendorOrders = vendorOrders.filter(order => order.status === req.query.status);
  }

  res.json({ success: true, data: { orders: vendorOrders } });
});

app.put('/api/vendor/orders/:orderId/approve', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const order = mockOrders.find(o => o._id === req.params.orderId && o.vendorId === req.user.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = 'vendor_approved';
  order.approvedAt = new Date().toISOString();

  res.json({ success: true, message: 'Order approved successfully', data: { order } });
});

app.put('/api/vendor/orders/:orderId/reject', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const order = mockOrders.find(o => o._id === req.params.orderId && o.vendorId === req.user.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = 'cancelled';
  order.rejectedAt = new Date().toISOString();
  order.rejectionReason = req.body.reason || 'Rejected by vendor';

  res.json({ success: true, message: 'Order rejected successfully', data: { order } });
});

app.get('/api/vendor/items', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  let vendorItems = mockItems.filter(item => item.vendorId === req.user.id);
  
  if (req.query.category) {
    vendorItems = vendorItems.filter(item => item.category === req.query.category);
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    vendorItems = vendorItems.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.description.toLowerCase().includes(search)
    );
  }
  
  if (req.query.isAvailable !== undefined) {
    vendorItems = vendorItems.filter(item => item.isAvailable === (req.query.isAvailable === 'true'));
  }

  res.json({ success: true, data: { items: vendorItems } });
});

app.post('/api/vendor/items', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const newItem = {
    _id: (mockItems.length + 1).toString(),
    vendorId: req.user.id,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockItems.push(newItem);

  res.status(201).json({ success: true, message: 'Item created successfully', data: { item: newItem } });
});

app.put('/api/vendor/items/:itemId', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const itemIndex = mockItems.findIndex(item => item._id === req.params.itemId && item.vendorId === req.user.id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  mockItems[itemIndex] = {
    ...mockItems[itemIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, message: 'Item updated successfully', data: { item: mockItems[itemIndex] } });
});

app.delete('/api/vendor/items/:itemId', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const itemIndex = mockItems.findIndex(item => item._id === req.params.itemId && item.vendorId === req.user.id);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  mockItems.splice(itemIndex, 1);

  res.json({ success: true, message: 'Item deleted successfully' });
});

app.put('/api/vendor/items/:itemId/toggle-availability', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const item = mockItems.find(item => item._id === req.params.itemId && item.vendorId === req.user.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  item.isAvailable = !item.isAvailable;
  item.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Item availability updated', data: { item } });
});

app.get('/api/vendor/profile', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const vendor = mockVendors.find(v => v.userId === req.user.id);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor profile not found' });
  }

  res.json({ success: true, data: { vendor } });
});

app.put('/api/vendor/profile', authenticate, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const vendorIndex = mockVendors.findIndex(v => v.userId === req.user.id);
  if (vendorIndex === -1) {
    return res.status(404).json({ success: false, message: 'Vendor profile not found' });
  }

  mockVendors[vendorIndex] = {
    ...mockVendors[vendorIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, message: 'Profile updated successfully', data: { vendor: mockVendors[vendorIndex] } });
});

// Google OAuth routes
app.get('/api/google-auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Google auth route working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/google-auth/token', async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Google credential is required'
    });
  }

  try {
    // Load Google Auth Library
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'No email provided by Google'
      });
    }

    // Check if user already exists with this Google ID
    let user = mockUsers.find(u => u.googleId === googleId);
    
    if (user) {
      // User exists, generate token and return
      const token = generateToken(user);
      
      console.log(`Google login successful for existing user: ${email}`);
      
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            avatar: user.avatar
          },
          token
        }
      });
    }
    
    // Check if user exists with the same email
    user = mockUsers.find(u => u.email === email);
    
    if (user) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isVerified = true;
      if (picture) user.avatar = picture;
      
      const token = generateToken(user);
      
      console.log(`Google account linked to existing user: ${email}`);
      
      return res.json({
        success: true,
        message: 'Account linked and login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            avatar: user.avatar
          },
          token
        }
      });
    }
    
    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      googleId,
      name: name || 'Google User',
      email,
      role: 'user',
      isVerified: true,
      avatar: picture,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    const token = generateToken(newUser);
    
    console.log(`New user created via Google OAuth: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Account created and login successful',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
          avatar: newUser.avatar
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Google token verification error:', error);
    
    if (error.message.includes('Token used too early') || error.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: 'Google token has expired or is not yet valid'
      });
    }
    
    if (error.message.includes('Invalid token signature')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token signature'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Failed to verify Google token'
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  console.log(`💾 Using mock data (no database required)`);
});

module.exports = app;
