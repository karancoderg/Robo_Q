import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface GoogleOAuthButtonProps {
  text?: string;
  onSuccess?: (result: { success: boolean; needsSetup?: boolean; user?: any }) => void;
  onError?: () => void;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ 
  text = "signin_with",
  onSuccess,
  onError 
}) => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Check if Google OAuth is available
    const checkGoogleOAuth = () => {
      try {
        // Check if the Google OAuth script is loaded
        if ((window as any).google && (window as any).google.accounts) {
          setIsGoogleLoaded(true);
          setLoadError(false);
        } else {
          // Retry after a short delay
          setTimeout(checkGoogleOAuth, 1000);
        }
      } catch (error) {
        console.warn('Google OAuth not available:', error);
        setLoadError(true);
      }
    };

    // Add error listener for network issues
    const handleNetworkError = (event: any) => {
      if (event.target && event.target.src && event.target.src.includes('accounts.google.com')) {
        console.warn('Google OAuth script failed to load:', event);
        setLoadError(true);
        toast.error('Google Sign-in is temporarily unavailable. Please try regular login.');
      }
    };

    window.addEventListener('error', handleNetworkError, true);
    checkGoogleOAuth();

    return () => {
      window.removeEventListener('error', handleNetworkError, true);
    };
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      // Google OAuth success - processing credential
      const result = await loginWithGoogle(credentialResponse.credential);
      
      if (result.success) {
        if (result.needsSetup) {
          // Don't show success toast yet, user needs to complete setup
          onSuccess?.(result);
        } else {
          toast.success('Successfully signed in with Google!');
          onSuccess?.(result);
        }
      } else {
        toast.error('Failed to sign in with Google');
        onError?.();
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error('Failed to sign in with Google');
      onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google OAuth failed');
    toast.error('Google sign-in failed. Please try regular login.');
    onError?.();
  };

  // Show fallback if Google OAuth fails to load
  if (loadError) {
    return (
      <div className="w-full">
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Google Sign-in is temporarily unavailable.
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Please use regular email/password login instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      {isLoading ? (
        <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">Signing in...</span>
        </div>
      ) : !isGoogleLoaded ? (
        <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
          <div className="animate-pulse rounded-full h-5 w-5 bg-gray-300"></div>
          <span className="ml-2 text-sm text-gray-500">Loading Google Sign-in...</span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={text as any}
          theme="outline"
          size="large"
          shape="rectangular"
          logo_alignment="left"
          auto_select={false}
          use_fedcm_for_prompt={false}
        />
      )}
    </div>
  );
};

export default GoogleOAuthButton;
