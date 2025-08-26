import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Vendor from '../models/Vendor';
import Item from '../models/Item';
import Order from '../models/Order';
import Robot from '../models/Robot';
import { logger } from '../config/logger';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Item.deleteMany({}),
      Order.deleteMany({}),
      Robot.deleteMany({})
    ]);
    logger.info('Cleared existing data');

    // Create users
    const users = await User.create([
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
          coordinates: { lat: 40.7128, lng: -74.0060 }
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
          coordinates: { lat: 40.7589, lng: -73.9851 }
        }
      },
      {
        name: 'Pizza Palace Owner',
        email: 'pizza@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true
      },
      {
        name: 'Fresh Grocery Owner',
        email: 'grocery@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      }
    ]);
    logger.info('Created users');

    // Create vendors
    const vendors = await Vendor.create([
      {
        userId: users[2]._id,
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
        rating: 4.5,
        totalOrders: 150
      },
      {
        userId: users[3]._id,
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
        rating: 4.2,
        totalOrders: 89
      }
    ]);
    logger.info('Created vendors');

    // Create items
    const items = await Item.create([
      // Pizza Palace items
      {
        vendorId: vendors[0]._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        category: 'food',
        preparationTime: 15,
        weight: 500,
        tags: ['pizza', 'vegetarian', 'italian']
      },
      {
        vendorId: vendors[0]._id,
        name: 'Pepperoni Pizza',
        description: 'Traditional pizza with pepperoni and mozzarella cheese',
        price: 14.99,
        category: 'food',
        preparationTime: 15,
        weight: 550,
        tags: ['pizza', 'meat', 'italian']
      },
      {
        vendorId: vendors[0]._id,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        category: 'food',
        preparationTime: 5,
        weight: 300,
        tags: ['salad', 'healthy', 'vegetarian']
      },
      // Fresh Grocery items
      {
        vendorId: vendors[1]._id,
        name: 'Organic Bananas',
        description: 'Fresh organic bananas, 1 lb',
        price: 2.99,
        category: 'groceries',
        preparationTime: 2,
        weight: 454,
        tags: ['fruit', 'organic', 'healthy']
      },
      {
        vendorId: vendors[1]._id,
        name: 'Whole Milk',
        description: 'Fresh whole milk, 1 gallon',
        price: 3.49,
        category: 'groceries',
        preparationTime: 1,
        weight: 3785,
        tags: ['dairy', 'milk']
      },
      {
        vendorId: vendors[1]._id,
        name: 'Bread Loaf',
        description: 'Fresh whole wheat bread loaf',
        price: 2.49,
        category: 'groceries',
        preparationTime: 1,
        weight: 680,
        tags: ['bread', 'wheat']
      }
    ]);
    logger.info('Created items');

    // Create robots
    const robots = await Robot.create([
      {
        name: 'RoboDelivery-001',
        status: 'idle',
        currentLocation: { lat: 40.7505, lng: -73.9934 },
        batteryLevel: 85,
        capacity: { weight: 5000, volume: 50000 },
        currentLoad: { weight: 0, volume: 0 }
      },
      {
        name: 'RoboDelivery-002',
        status: 'idle',
        currentLocation: { lat: 40.7282, lng: -74.0776 },
        batteryLevel: 92,
        capacity: { weight: 5000, volume: 50000 },
        currentLoad: { weight: 0, volume: 0 }
      },
      {
        name: 'RoboDelivery-003',
        status: 'maintenance',
        currentLocation: { lat: 40.7589, lng: -73.9851 },
        batteryLevel: 15,
        capacity: { weight: 5000, volume: 50000 },
        currentLoad: { weight: 0, volume: 0 }
      }
    ]);
    logger.info('Created robots');

    // Create sample orders
    const orders = await Order.create([
      {
        userId: users[0]._id,
        vendorId: vendors[0]._id,
        items: [
          {
            itemId: items[0]._id,
            name: items[0].name,
            price: items[0].price,
            quantity: 1,
            totalPrice: items[0].price
          },
          {
            itemId: items[2]._id,
            name: items[2].name,
            price: items[2].price,
            quantity: 1,
            totalPrice: items[2].price
          }
        ],
        totalAmount: items[0].price + items[2].price,
        deliveryAddress: users[0].address!,
        vendorAddress: vendors[0].address,
        status: 'pending'
      },
      {
        userId: users[1]._id,
        vendorId: vendors[1]._id,
        items: [
          {
            itemId: items[3]._id,
            name: items[3].name,
            price: items[3].price,
            quantity: 2,
            totalPrice: items[3].price * 2
          },
          {
            itemId: items[4]._id,
            name: items[4].name,
            price: items[4].price,
            quantity: 1,
            totalPrice: items[4].price
          }
        ],
        totalAmount: (items[3].price * 2) + items[4].price,
        deliveryAddress: users[1].address!,
        vendorAddress: vendors[1].address,
        status: 'vendor_approved'
      }
    ]);
    logger.info('Created orders');

    logger.info('Database seeded successfully!');
    logger.info(`Created:
      - ${users.length} users
      - ${vendors.length} vendors
      - ${items.length} items
      - ${robots.length} robots
      - ${orders.length} orders
    `);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

export default seedData;
