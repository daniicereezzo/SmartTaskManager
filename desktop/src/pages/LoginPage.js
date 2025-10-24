import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthService } from '../services/AuthService';
import toast from 'react-hot-toast';
import { 
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would integrate with Google OAuth
      // For now, we'll simulate a successful login
      const mockGoogleToken = 'mock-google-token';
      await login(mockGoogleToken);
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">STM</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Smart Task Manager
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Intelligent task scheduling and management
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Key Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Google Calendar integration
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Automatic task scheduling
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Energy level optimization
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Priority-based organization
                </span>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>

          {/* Demo Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This is a demo version. In production, this would integrate with Google OAuth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
