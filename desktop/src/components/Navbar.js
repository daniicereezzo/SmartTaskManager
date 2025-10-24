import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { 
  SunIcon, 
  MoonIcon, 
  BellIcon, 
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">STM</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Smart Task Manager
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
              title="Notifications"
            >
              <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user?.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Settings dropdown */}
              <div className="relative group">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="Settings"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
