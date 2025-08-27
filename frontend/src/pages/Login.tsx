import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import GoogleOAuthButton from '@/components/GoogleOAuthButton';
import SetupCompletion from '@/components/SetupCompletion';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [otp, setOtp] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupUser, setSetupUser] = useState(null);

  const { login, loginWithOTP, verifyLoginOTP, completeSetup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);

    const result = await loginWithOTP(email);
    if (result.success) {
      setShowOTPLogin(true);
    }
    // Remove duplicate error handling - AuthContext already shows the error

    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await verifyLoginOTP(email, otp);
    if (success) {
      navigate(from, { replace: true });
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (result: { success: boolean; needsSetup?: boolean; user?: any }) => {
    if (result.success) {
      if (result.needsSetup && result.user) {
        setSetupUser(result.user);
        setShowSetup(true);
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const handleSetupComplete = async (setupData: any) => {
    setLoading(true);
    const success = await completeSetup(setupData);
    if (success) {
      setShowSetup(false);
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  const handleSetupSkip = () => {
    setShowSetup(false);
    navigate(from, { replace: true });
  };

  if (showSetup && setupUser) {
    return (
      <SetupCompletion
        user={setupUser}
        onComplete={handleSetupComplete}
        onSkip={handleSetupSkip}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">🚀</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {!showOTPLogin ? (
          <>
            {/* Google OAuth Button */}
            <div className="mb-6">
              <GoogleOAuthButton 
                text="signin_with" 
                onSuccess={handleGoogleSuccess}
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input rounded-t-md"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="input rounded-b-md"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleOTPLogin}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Sign in with OTP instead
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Note: You must have a registered account to sign in
                </p>
              </div>
            </form>
          </>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent an OTP to your email. Please enter it below.
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                className="input w-full"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Verify OTP'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowOTPLogin(false)}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Back to password login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <div className="text-center text-sm text-gray-600">
            Demo Accounts:
            <br />
            User: john@example.com / password123
            <br />
            Vendor: pizza@example.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
