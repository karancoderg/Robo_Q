# Google OAuth Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

## 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure the OAuth consent screen:
   - Application name: "Delivery Robot Platform"
   - User support email: your email
   - Developer contact information: your email
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Delivery Robot Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`

## 3. Update Environment Variables

### Backend (.env)
```env
GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
```

## 4. Test the Integration

1. Start both backend and frontend servers
2. Go to login/register page
3. Click "Continue with Google" button
4. Complete Google OAuth flow
5. Should redirect to dashboard with user logged in

## 5. Production Setup

For production, update the authorized origins and redirect URIs to your production domain:
- `https://yourdomain.com`
- `https://api.yourdomain.com/api/auth/google/callback`

## Features Implemented

✅ **Sign up with Google** - Creates new user account  
✅ **Sign in with Google** - Logs in existing users  
✅ **Account Linking** - Links Google account to existing email  
✅ **Auto-verification** - Google accounts are pre-verified  
✅ **Profile Pictures** - Uses Google profile picture as avatar  
✅ **Secure Token Handling** - JWT tokens for session management  

## Security Features

- Google ID token verification
- Secure JWT token generation
- Account linking prevention for security
- Email verification bypass for Google accounts
- Session management with HTTP-only cookies (for redirect flow)
