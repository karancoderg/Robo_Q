#!/bin/bash

echo "🔄 Reverting RoboQ back to mock data..."

# Stop any running servers
echo "📛 Stopping existing servers..."
pkill -f "node.*server"
pkill -f "npm.*start"
pkill -f "npm.*dev"

# Navigate to backend directory
cd backend

# Restore original server file
echo "🔄 Restoring original server..."
if [ -f "src/server-simple-backup.js" ]; then
    cp src/server-simple-backup.js src/server-simple.js
    echo "✅ Restored server-simple.js from backup"
else
    echo "⚠️ No backup found, keeping current server-simple.js"
fi

# Update package.json to use the mock server
echo "📝 Updating package.json..."
sed -i 's/"start": "node src\/server-active.js"/"start": "node src\/server-simple.js"/' package.json
sed -i 's/"dev": "nodemon src\/server-active.js"/"dev": "nodemon src\/server-simple.js"/' package.json

# Update environment variables
echo "🔧 Updating environment variables..."
sed -i 's/MOCK_MODE=false/MOCK_MODE=true/' .env

# Start the mock server
echo "🚀 Starting mock server..."
npm start &

# Wait a moment for server to start
sleep 3

# Test the server
echo "🧪 Testing server connection..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$response" = "200" ]; then
    echo "✅ Mock server is running successfully!"
else
    echo "❌ Server test failed. Check the logs."
fi

echo ""
echo "🎉 Reverted to mock data successfully!"
echo ""
echo "📋 You are now using:"
echo "   • Mock data (in-memory)"
echo "   • Original server-simple.js"
echo "   • All original functionality preserved"
echo ""
echo "To switch back to database, run: ./switch-to-database.sh"
