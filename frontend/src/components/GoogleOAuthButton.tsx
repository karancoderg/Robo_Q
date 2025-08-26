import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface GoogleOAuthButtonProps {
  text?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ 
  text = "signin_with",
  onSuccess,
  onError 
}) => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      console.log('Google OAuth success:', credentialResponse);
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        toast.success('Successfully signed in with Google!');
        onSuccess?.();
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
    toast.error('Google sign-in failed. Please try again.');
    onError?.();
  };

  return (
    <div className="w-full flex justify-center">
      {isLoading ? (
        <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-600">Signing in...</span>
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
