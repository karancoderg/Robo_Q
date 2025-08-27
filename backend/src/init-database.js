const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the schemas from server-database.js (we'll need to extract them)
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

// Models
const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const Item = mongoose.model('Item', itemSchema);
const Robot = mongoose.model('Robot', robotSchema);

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Vendor.deleteMany({});
    // await Item.deleteMany({});
    // await Robot.deleteMany({});
    // console.log('Cleared existing data');

    // Create sample users
    const users = [
      {
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
          coordinates: {
            lat: 40.7128,
            lng: -74.0060
          }
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        address: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: {
            lat: 40.7589,
            lng: -73.9851
          }
        }
      },
      {
        name: 'Pizza Palace Owner',
        email: 'pizza@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true,
        address: {
          street: '789 Pizza St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          coordinates: {
            lat: 40.7505,
            lng: -73.9934
          }
        }
      },
      {
        name: 'Burger King Owner',
        email: 'burger@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true,
        address: {
          street: '321 Burger Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10004',
          coordinates: {
            lat: 40.7282,
            lng: -74.0776
          }
        }
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`Created user: ${user.email}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${existingUser.email}`);
      }
    }

    // Create vendors for vendor users
    const vendorUsers = createdUsers.filter(user => user.role === 'vendor');
    const vendors = [];

    for (const vendorUser of vendorUsers) {
      const existingVendor = await Vendor.findOne({ userId: vendorUser._id });
      if (!existingVendor) {
        let vendorData;
        
        if (vendorUser.email === 'pizza@example.com') {
          vendorData = {
            userId: vendorUser._id,
            businessName: 'Pizza Palace',
            description: 'Authentic Italian pizzas made with fresh ingredients',
            category: 'Restaurant',
            address: vendorUser.address,
            contactInfo: {
              phone: '+1-555-0123',
              email: vendorUser.email
            },
            operatingHours: {
              open: '11:00',
              close: '23:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            rating: 4.5,
            totalOrders: 150
          };
        } else if (vendorUser.email === 'burger@example.com') {
          vendorData = {
            userId: vendorUser._id,
            businessName: 'Burger Kingdom',
            description: 'Gourmet burgers and fries',
            category: 'Restaurant',
            address: vendorUser.address,
            contactInfo: {
              phone: '+1-555-0124',
              email: vendorUser.email
            },
            operatingHours: {
              open: '10:00',
              close: '22:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            rating: 4.2,
            totalOrders: 89
          };
        }

        if (vendorData) {
          const vendor = new Vendor(vendorData);
          await vendor.save();
          vendors.push(vendor);
          console.log(`Created vendor: ${vendor.businessName}`);
        }
      } else {
        vendors.push(existingVendor);
        console.log(`Vendor already exists: ${existingVendor.businessName}`);
      }
    }

    // Create items for vendors
    const itemsData = [
      // Pizza Palace items
      {
        vendorId: vendors.find(v => v.businessName === 'Pizza Palace')?._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 18.99,
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 15,
        weight: 800,
        tags: ['vegetarian', 'classic']
      },
      {
        vendorId: vendors.find(v => v.businessName === 'Pizza Palace')?._id,
        name: 'Pepperoni Pizza',
        description: 'Traditional pizza with pepperoni and mozzarella cheese',
        price: 21.99,
        category: 'Pizza',
        isAvailable: true,
        preparationTime: 15,
        weight: 850,
        tags: ['meat', 'popular']
      },
      {
        vendorId: vendors.find(v => v.businessName === 'Pizza Palace')?._id,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 12.99,
        category: 'Salad',
        isAvailable: true,
        preparationTime: 5,
        weight: 300,
        tags: ['healthy', 'vegetarian']
      },
      // Burger Kingdom items
      {
        vendorId: vendors.find(v => v.businessName === 'Burger Kingdom')?._id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
        price: 15.99,
        category: 'Burger',
        isAvailable: true,
        preparationTime: 10,
        weight: 400,
        tags: ['beef', 'classic']
      },
      {
        vendorId: vendors.find(v => v.businessName === 'Burger Kingdom')?._id,
        name: 'Chicken Deluxe',
        description: 'Grilled chicken breast with avocado and bacon',
        price: 17.99,
        category: 'Burger',
        isAvailable: true,
        preparationTime: 12,
        weight: 450,
        tags: ['chicken', 'premium']
      },
      {
        vendorId: vendors.find(v => v.businessName === 'Burger Kingdom')?._id,
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        price: 6.99,
        category: 'Sides',
        isAvailable: true,
        preparationTime: 5,
        weight: 200,
        tags: ['crispy', 'popular']
      }
    ];

    for (const itemData of itemsData) {
      if (itemData.vendorId) {
        const existingItem = await Item.findOne({ 
          vendorId: itemData.vendorId, 
          name: itemData.name 
        });
        
        if (!existingItem) {
          const item = new Item(itemData);
          await item.save();
          console.log(`Created item: ${item.name}`);
        } else {
          console.log(`Item already exists: ${existingItem.name}`);
        }
      }
    }

    // Create sample robots
    const robotsData = [
      {
        name: 'RoboQ-001',
        status: 'idle',
        currentLocation: {
          lat: 40.7128,
          lng: -74.0060
        },
        batteryLevel: 95,
        capacity: {
          weight: 5000, // 5kg
          volume: 50000 // 50L in cubic cm
        }
      },
      {
        name: 'RoboQ-002',
        status: 'idle',
        currentLocation: {
          lat: 40.7589,
          lng: -73.9851
        },
        batteryLevel: 87,
        capacity: {
          weight: 5000,
          volume: 50000
        }
      },
      {
        name: 'RoboQ-003',
        status: 'maintenance',
        currentLocation: {
          lat: 40.7505,
          lng: -73.9934
        },
        batteryLevel: 23,
        capacity: {
          weight: 5000,
          volume: 50000
        }
      }
    ];

    for (const robotData of robotsData) {
      const existingRobot = await Robot.findOne({ name: robotData.name });
      if (!existingRobot) {
        const robot = new Robot(robotData);
        await robot.save();
        console.log(`Created robot: ${robot.name}`);
      } else {
        console.log(`Robot already exists: ${existingRobot.name}`);
      }
    }

    console.log('Database initialization completed successfully!');
    
    // Print summary
    const userCount = await User.countDocuments();
    const vendorCount = await Vendor.countDocuments();
    const itemCount = await Item.countDocuments();
    const robotCount = await Robot.countDocuments();
    
    console.log('\n=== Database Summary ===');
    console.log(`Users: ${userCount}`);
    console.log(`Vendors: ${vendorCount}`);
    console.log(`Items: ${itemCount}`);
    console.log(`Robots: ${robotCount}`);
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
