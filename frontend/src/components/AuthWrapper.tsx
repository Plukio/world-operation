import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SignIn from './SignIn';
import SignUp from './SignUp';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading World Operation...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isSignUp ? (
      <SignUp onToggleMode={() => setIsSignUp(false)} />
    ) : (
      <SignIn onToggleMode={() => setIsSignUp(true)} />
    );
  }

  return <>{children}</>;
}
