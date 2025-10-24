import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { AuthService } from './services/AuthService';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import PreferencesPage from './pages/PreferencesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Handle Electron menu actions
    if (window.electronAPI) {
      const handleNewTask = () => {
        // Navigate to new task or open modal
        console.log('New task requested from menu');
      };

      const handleSyncCalendar = () => {
        // Trigger calendar sync
        console.log('Calendar sync requested from menu');
      };

      window.electronAPI.onMenuNewTask(handleNewTask);
      window.electronAPI.onMenuSyncCalendar(handleSyncCalendar);

      return () => {
        window.electronAPI.removeAllListeners('menu-new-task');
        window.electronAPI.removeAllListeners('menu-sync-calendar');
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoginPage />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/preferences" element={<PreferencesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
