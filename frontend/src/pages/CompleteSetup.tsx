import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SetupCompletion from '@/components/SetupCompletion';
import LoadingSpinner from '@/components/LoadingSpinner';

const CompleteSetup: React.FC = () => {
  const { user, loading, completeSetup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // If user has already completed setup, redirect to dashboard
    // Add additional check to prevent redirect loops
    if (!loading && user && user.setupCompleted === true) {
      const redirectPath = user.role === 'vendor' ? '/vendor/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
      return;
    }
  }, [loading, isAuthenticated, user?.setupCompleted, user?.role, navigate]);

  const handleSetupComplete = async (setupData: any) => {
    try {
      const success = await completeSetup(setupData);
      
      if (success) {
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          // Redirect to appropriate dashboard
          const redirectPath = setupData.role === 'vendor' ? '/vendor/dashboard' : '/dashboard';
          navigate(redirectPath, { replace: true });
        }, 200);
      }
    } catch (error) {
      console.error('Setup completion failed:', error);
    }
  };

  const handleSkip = () => {
    // For now, don't allow skipping - user must complete setup
    // This prevents the bypass bug
    console.log('Setup cannot be skipped');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  if (user.setupCompleted) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Setup</h1>
          <p className="mt-2 text-gray-600">
            Please complete your account setup to continue using Robo Q
          </p>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg p-8">
          <SetupCompletion
            user={user}
            onComplete={handleSetupComplete}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </div>
  );
};

export default CompleteSetup;
