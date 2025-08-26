import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import { logger } from './logger';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info(`Google OAuth attempt for email: ${profile.emails?.[0]?.value}`);
    
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      logger.info(`Existing Google user found: ${user.email}`);
      return done(null, user);
    }
    
    // Check if user exists with the same email
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.isVerified = true; // Google accounts are pre-verified
        await user.save();
        logger.info(`Linked Google account to existing user: ${email}`);
        return done(null, user);
      }
    }
    
    // Create new user
    if (!email) {
      return done(new Error('No email provided by Google'), null);
    }
    
    const newUser = await User.create({
      googleId: profile.id,
      name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
      email: email,
      role: 'user', // Default role for Google sign-ups
      isVerified: true, // Google accounts are pre-verified
      avatar: profile.photos?.[0]?.value,
      // No password needed for Google OAuth users
    });
    
    logger.info(`New Google user created: ${email}`);
    return done(null, newUser);
    
  } catch (error) {
    logger.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
