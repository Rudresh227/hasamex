'use client';

import { useState, useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      window.location.replace('/login');
    }
  }, [mounted, isAuthenticated]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
