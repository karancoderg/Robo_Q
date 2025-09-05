#!/usr/bin/env node

const mongoose = require('mongoose');
const readline = require('readline');
const path = require('path');

// Database connection
const connectDB = async () => {
  try {
    // Load environment variables from backend .env file
    require('dotenv').config({ path: './backend/.env' });
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery_robot';
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('📦 Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

// User Schema (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  phone: String,
  address: Object,
  businessInfo: Object,
  setupCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Order Schema (to handle related data)
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ... other fields
});

const Order = mongoose.model('Order', orderSchema);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Function to display user info
const displayUserInfo = (user) => {
  console.log('\n📋 User Information:');
  console.log('━'.repeat(50));
  console.log(`👤 Name: ${user.name}`);
  console.log(`📧 Email: ${user.email}`);
  console.log(`🎭 Role: ${user.role.toUpperCase()}`);
  console.log(`📱 Phone: ${user.phone || 'Not provided'}`);
  console.log(`✅ Setup Completed: ${user.setupCompleted ? 'Yes' : 'No'}`);
  console.log(`📅 Created: ${user.createdAt.toLocaleDateString()}`);
  console.log(`🆔 User ID: ${user._id}`);
  console.log('━'.repeat(50));
};

// Function to check related data
const checkRelatedData = async (userId) => {
  try {
    const userOrders = await Order.countDocuments({ userId });
    const vendorOrders = await Order.countDocuments({ vendorId: userId });
    
    console.log('\n🔍 Related Data Check:');
    console.log(`📦 Orders as Customer: ${userOrders}`);
    console.log(`🏪 Orders as Vendor: ${vendorOrders}`);
    
    return { userOrders, vendorOrders };
  } catch (error) {
    console.error('❌ Error checking related data:', error.message);
    return { userOrders: 0, vendorOrders: 0 };
  }
};

// Function to remove user account
const removeUserAccount = async (email, options = {}) => {
  try {
    console.log(`\n🔍 Searching for user with email: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found with that email address');
      return false;
    }

    // Display user information
    displayUserInfo(user);

    // Check related data
    const relatedData = await checkRelatedData(user._id);

    // Confirmation prompt (unless force mode)
    if (!options.force) {
      console.log('\n⚠️  WARNING: This action cannot be undone!');
      
      if (relatedData.userOrders > 0 || relatedData.vendorOrders > 0) {
        console.log('🚨 This user has associated orders. Deletion will affect order history.');
      }
      
      const confirmation = await askQuestion('\n❓ Are you sure you want to delete this user? (type "DELETE" to confirm): ');
      
      if (confirmation !== 'DELETE') {
        console.log('❌ Deletion cancelled');
        return false;
      }
    }

    // Perform deletion
    console.log('\n🗑️  Deleting user account...');
    
    // Option to handle related data
    if (options.deleteOrders && (relatedData.userOrders > 0 || relatedData.vendorOrders > 0)) {
      console.log('🗑️  Deleting related orders...');
      await Order.deleteMany({ 
        $or: [
          { userId: user._id },
          { vendorId: user._id }
        ]
      });
      console.log('✅ Related orders deleted');
    }

    // Delete the user
    await User.findByIdAndDelete(user._id);
    
    console.log('✅ User account deleted successfully!');
    console.log(`📧 Deleted user: ${user.name} (${user.email})`);
    
    return true;
  } catch (error) {
    console.error('❌ Error removing user account:', error.message);
    return false;
  }
};

// Function to list users (for reference)
const listUsers = async (limit = 40) => {
  try {
    const users = await User.find({})
      .select('name email role createdAt setupCompleted')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`\n📋 Recent Users (Last ${limit}):`);
    console.log('━'.repeat(80));
    console.log('Name'.padEnd(20) + 'Email'.padEnd(30) + 'Role'.padEnd(10) + 'Setup'.padEnd(10) + 'Created');
    console.log('━'.repeat(80));
    
    users.forEach(user => {
      const name = (user.name || 'N/A').substring(0, 19).padEnd(20);
      const email = user.email.substring(0, 29).padEnd(30);
      const role = user.role.toUpperCase().padEnd(10);
      const setup = (user.setupCompleted ? 'Yes' : 'No').padEnd(10);
      const created = user.createdAt.toLocaleDateString();
      
      console.log(`${name}${email}${role}${setup}${created}`);
    });
    console.log('━'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
};

// Main function
const main = async () => {
  console.log('🗑️  USER ACCOUNT REMOVAL TOOL');
  console.log('═'.repeat(50));
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const email = args[0];
    const force = args.includes('--force');
    const deleteOrders = args.includes('--delete-orders');
    const listMode = args.includes('--list');

    if (listMode) {
      await listUsers();
      rl.close();
      process.exit(0);
    }

    if (!email) {
      console.log('\n📋 Usage Options:');
      console.log('1. Remove specific user: node remove_user_account.js <email>');
      console.log('2. Force removal: node remove_user_account.js <email> --force');
      console.log('3. Remove with orders: node remove_user_account.js <email> --delete-orders');
      console.log('4. List users: node remove_user_account.js --list');
      console.log('\n📋 Interactive Mode:');
      
      await listUsers(5);
      
      const inputEmail = await askQuestion('\n📧 Enter email address to remove (or "exit" to quit): ');
      
      if (inputEmail.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);
      }
      
      const success = await removeUserAccount(inputEmail, { force, deleteOrders });
      
      if (success) {
        console.log('\n🎉 Operation completed successfully!');
      }
    } else {
      // Direct email provided
      const success = await removeUserAccount(email, { force, deleteOrders });
      
      if (success) {
        console.log('\n🎉 Operation completed successfully!');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\n📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n👋 Process interrupted. Cleaning up...');
  rl.close();
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { removeUserAccount, listUsers };
