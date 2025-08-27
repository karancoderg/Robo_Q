#!/bin/bash

echo "🔄 Switching RoboQ from mock data to real database..."

# Stop any running servers
echo "📛 Stopping existing servers..."
pkill -f "node.*server"
pkill -f "npm.*start"
pkill -f "npm.*dev"

# Navigate to backend directory
cd backend

# Install additional dependencies if needed
echo "📦 Installing dependencies..."
npm install mongoose bcryptjs jsonwebtoken nodemailer google-auth-library

# Initialize database with sample data
echo "🗄️ Initializing database with sample data..."
node src/init-database.js

# Backup current server file
echo "💾 Backing up current server..."
if [ -f "src/server-simple.js" ]; then
    cp src/server-simple.js src/server-simple-backup.js
    echo "✅ Backed up server-simple.js to server-simple-backup.js"
fi

# Switch to database server
echo "🔄 Switching to database server..."
cp src/server-database.js src/server-active.js

# Update package.json to use the new server
echo "📝 Updating package.json..."
sed -i 's/"start": "node src\/server-simple.js"/"start": "node src\/server-active.js"/' package.json
sed -i 's/"dev": "nodemon src\/server-simple.js"/"dev": "nodemon src\/server-active.js"/' package.json

# Update environment variables
echo "🔧 Updating environment variables..."
if ! grep -q "MOCK_MODE=false" .env; then
    echo "MOCK_MODE=false" >> .env
fi

# Start the new server
echo "🚀 Starting database server..."
npm start &

# Wait a moment for server to start
sleep 3

# Test the server
echo "🧪 Testing server connection..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$response" = "200" ]; then
    echo "✅ Server is running successfully with database connection!"
else
    echo "❌ Server test failed. Check the logs."
fi

echo ""
echo "🎉 Migration to database completed!"
echo ""
echo "📋 Summary of changes:"
echo "   • Switched from mock data to MongoDB database"
echo "   • Added sample users, vendors, items, and robots"
echo "   • Enhanced Google OAuth with user setup flow"
echo "   • Added role selection (user/vendor) for new Google users"
echo "   • Preserved all existing functionality"
echo ""
echo "🔑 Test accounts:"
echo "   • User: john@example.com / password123"
echo "   • User: jane@example.com / password123"
echo "   • Vendor: pizza@example.com / password123"
echo "   • Vendor: burger@example.com / password123"
echo ""
echo "🌐 Google OAuth:"
echo "   • New users will be prompted to set password and select role"
echo "   • Existing users will login directly"
echo "   • Vendors can set up business information during onboarding"
echo ""
echo "📊 Database Status:"
echo "   • MongoDB URI: ${MONGODB_URI}"
echo "   • Sample data initialized"
echo "   • Real-time updates enabled"
echo ""
echo "To revert to mock data, run: ./revert-to-mock.sh"
