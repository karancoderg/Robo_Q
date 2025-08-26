import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface GoogleOAuthButtonProps {
  text?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ 
  text = "Continue with Google",
  onSuccess,
  onError 
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        toast.success('Successfully signed in with Google!');
        onSuccess?.();
        navigate('/dashboard');
      } else {
        toast.error('Failed to sign in with Google');
        onError?.();
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error('Failed to sign in with Google');
      onError?.();
    }
  };

  const handleError = () => {
    console.error('Google OAuth failed');
    toast.error('Google sign-in was cancelled or failed');
    onError?.();
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text as any}
        theme="outline"
        size="large"
        width="100%"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleOAuthButton;
