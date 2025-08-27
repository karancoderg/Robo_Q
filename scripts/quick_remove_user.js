#!/usr/bin/env node

const mongoose = require('mongoose');

// Quick and simple user removal script
const quickRemoveUser = async (email) => {
  try {
    // Load environment variables from backend .env file
    require('dotenv').config({ path: './backend/.env' });
    
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery_robot';
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('📦 Connected to MongoDB');

    // User Schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true, required: true },
      role: String,
      // ... other fields
    });
    const User = mongoose.model('User', userSchema);

    // Find and remove user
    console.log(`🔍 Looking for user: ${email}`);
    const user = await User.findOneAndDelete({ email: email.toLowerCase() });

    if (user) {
      console.log('✅ User removed successfully!');
      console.log(`👤 Removed: ${user.name} (${user.email}) - Role: ${user.role}`);
      return true;
    } else {
      console.log('❌ User not found with that email');
      return false;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
};

// Get email from command line or prompt
const email = process.argv[2];

if (!email) {
  console.log('Usage: node quick_remove_user.js <email>');
  console.log('Example: node quick_remove_user.js john@example.com');
  process.exit(1);
}

// Run the removal
quickRemoveUser(email).then(() => {
  process.exit(0);
}).catch(console.error);
