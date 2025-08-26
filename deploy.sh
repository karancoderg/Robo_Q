#!/bin/bash

echo "🚀 Preparing for deployment..."

# Test frontend build
echo "📦 Testing frontend build..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend build successful!"

# Test backend
echo "🔧 Testing backend..."
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed!"
    exit 1
fi
echo "✅ Backend dependencies installed!"

echo "🎉 Ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repository"
echo "   - Select 'backend' folder"
echo "   - Use 'node src/server-simple.js' as start command"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Select 'frontend' folder"
echo "   - Vercel will auto-detect Vite configuration"
echo ""
echo "3. Update environment variables:"
echo "   - Update VITE_API_URL in Vercel with your Render backend URL"
echo "   - Update FRONTEND_URL in Render with your Vercel frontend URL"
