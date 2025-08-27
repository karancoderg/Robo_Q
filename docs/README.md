# 🚀 NexDrop: Next-Generation Autonomous Delivery Platform

A full-stack web application for managing next-generation autonomous delivery robots, vendors, and customer orders with real-time tracking and advanced authentication systems.

## ✨ Features

### 🔐 Authentication & Authorization
- **Google OAuth 2.0** integration with automatic token refresh
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (User, Vendor, Admin)
- **Email/SMS OTP verification** for additional security
- **Persistent sessions** across page refreshes

### 👥 User Management
- **Customer portal** for ordering and tracking
- **Vendor dashboard** for menu and order management
- **Admin panel** for system oversight
- **Profile management** with avatar support

### 🛒 E-commerce Features
- **Multi-vendor marketplace** with categorized items
- **Shopping cart** with real-time updates
- **Secure checkout** process
- **Order tracking** with real-time status updates
- **Delivery confirmation** with OTP verification

### 🤖 Robot Management
- **Real-time robot tracking** with GPS coordinates
- **Delivery route optimization**
- **Robot status monitoring**
- **Automated delivery assignments**

### 📱 Real-time Features
- **Socket.IO integration** for live updates
- **Real-time notifications** for order status changes
- **Live robot tracking** on interactive maps
- **Instant messaging** between users and vendors

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Socket.IO Client** for real-time features
- **Leaflet** for interactive maps
- **React Hook Form** for form management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Google OAuth 2.0** for social login
- **Nodemailer** for email services
- **Twilio** for SMS services
- **Winston** for logging

### DevOps & Tools
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **Nodemon** for development
- **Concurrently** for running multiple processes

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Google Cloud Console account (for OAuth)
- Twilio account (for SMS, optional)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd robo_Q
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Environment Setup**

Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI="your-mongodb-connection-string"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Twilio (Optional)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-phone"

# Application Settings
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

4. **Google OAuth Setup**

Follow the guide in `GOOGLE_OAUTH_SETUP.md` to configure Google OAuth credentials.

5. **Start the application**

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or start individually:
# Backend
cd backend && npm run dev:full

# Frontend (in another terminal)
cd frontend && npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
robo_Q/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── server.ts       # Main server file
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── docs/                   # Documentation
├── tests/                  # Test files
└── package.json           # Root package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/google-auth/token` - Google OAuth login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor details
- `GET /api/vendors/:id/items` - Get vendor items

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item details

### Robots
- `GET /api/robots` - Get all robots
- `GET /api/robots/:id/location` - Get robot location

## 🔐 Authentication Flow

### Google OAuth Integration
1. User clicks "Continue with Google"
2. Frontend redirects to Google OAuth
3. Google returns with authorization code
4. Frontend exchanges code for ID token
5. Frontend sends ID token to backend
6. Backend verifies token with Google
7. Backend creates/updates user and returns JWT
8. Frontend stores JWT for subsequent requests

### Token Management
- **Access tokens** expire in 7 days
- **Refresh tokens** expire in 30 days
- **Automatic refresh** on token expiration
- **Persistent sessions** across page refreshes

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run OAuth tests
node test_oauth.js
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set production environment variables
3. Start with: `npm start`

### Frontend Deployment
1. Build the React app: `npm run build`
2. Serve the `dist` folder with a web server

### Environment Variables for Production
- Update `FRONTEND_URL` and `GOOGLE_CALLBACK_URL`
- Use production database URL
- Set `NODE_ENV=production`
- Use secure JWT secrets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting guide](docs/TROUBLESHOOTING.md)
2. Review the [OAuth setup guide](GOOGLE_OAUTH_SETUP.md)
3. Check the server logs for errors
4. Open an issue on GitHub

## 🎯 Recent Updates

### OAuth Fixes (Latest)
- ✅ Fixed token persistence after page refresh
- ✅ Added automatic token refresh mechanism
- ✅ Resolved invalid token errors during checkout
- ✅ Enhanced session management
- ✅ Improved error handling and user experience

### Features Added
- ✅ Google OAuth 2.0 integration
- ✅ Real-time order tracking
- ✅ Multi-vendor support
- ✅ Robot management system
- ✅ Email and SMS notifications

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Machine learning for delivery optimization
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Advanced robot fleet management

---

**Built with ❤️ for autonomous delivery solutions**
