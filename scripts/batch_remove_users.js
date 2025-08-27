#!/usr/bin/env node

const mongoose = require('mongoose');
const fs = require('fs');

// Batch user removal script
const batchRemoveUsers = async (emails) => {
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
    });
    const User = mongoose.model('User', userSchema);

    console.log(`🗑️  Starting batch removal of ${emails.length} users...\n`);

    const results = {
      removed: [],
      notFound: [],
      errors: []
    };

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i].trim().toLowerCase();
      
      if (!email) continue;

      try {
        console.log(`[${i + 1}/${emails.length}] Processing: ${email}`);
        
        const user = await User.findOneAndDelete({ email });
        
        if (user) {
          console.log(`✅ Removed: ${user.name} (${user.email})`);
          results.removed.push({
            email: user.email,
            name: user.name,
            role: user.role
          });
        } else {
          console.log(`❌ Not found: ${email}`);
          results.notFound.push(email);
        }
        
      } catch (error) {
        console.log(`💥 Error processing ${email}: ${error.message}`);
        results.errors.push({ email, error: error.message });
      }
    }

    // Summary
    console.log('\n📊 BATCH REMOVAL SUMMARY:');
    console.log('═'.repeat(50));
    console.log(`✅ Successfully removed: ${results.removed.length}`);
    console.log(`❌ Not found: ${results.notFound.length}`);
    console.log(`💥 Errors: ${results.errors.length}`);

    if (results.removed.length > 0) {
      console.log('\n🗑️  Removed Users:');
      results.removed.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    if (results.notFound.length > 0) {
      console.log('\n❌ Not Found:');
      results.notFound.forEach(email => {
        console.log(`   • ${email}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n💥 Errors:');
      results.errors.forEach(item => {
        console.log(`   • ${item.email}: ${item.error}`);
      });
    }

    return results;

  } catch (error) {
    console.error('❌ Batch removal failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n📦 Disconnected from MongoDB');
  }
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🗑️  BATCH USER REMOVAL TOOL');
    console.log('═'.repeat(40));
    console.log('\nUsage Options:');
    console.log('1. From file: node batch_remove_users.js emails.txt');
    console.log('2. Direct emails: node batch_remove_users.js email1@example.com email2@example.com');
    console.log('\nFile format (emails.txt):');
    console.log('user1@example.com');
    console.log('user2@example.com');
    console.log('user3@example.com');
    process.exit(1);
  }

  let emails = [];

  // Check if first argument is a file
  if (args.length === 1 && args[0].endsWith('.txt')) {
    const filename = args[0];
    
    if (!fs.existsSync(filename)) {
      console.error(`❌ File not found: ${filename}`);
      process.exit(1);
    }

    try {
      const fileContent = fs.readFileSync(filename, 'utf8');
      emails = fileContent.split('\n').filter(email => email.trim());
      console.log(`📄 Loaded ${emails.length} emails from ${filename}`);
    } catch (error) {
      console.error(`❌ Error reading file: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Direct email arguments
    emails = args;
  }

  if (emails.length === 0) {
    console.log('❌ No emails provided');
    process.exit(1);
  }

  try {
    await batchRemoveUsers(emails);
    console.log('\n🎉 Batch removal completed!');
  } catch (error) {
    console.error('❌ Batch removal failed:', error.message);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { batchRemoveUsers };
