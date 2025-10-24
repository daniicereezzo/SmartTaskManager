import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Preferences', href: '/preferences', icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    location.pathname === item.href
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="mt-8 px-3">
        <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Quick Actions
        </h3>
        <ul className="mt-2 space-y-1">
          <li>
            <button className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <span className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300">
                +
              </span>
              New Task
            </button>
          </li>
          <li>
            <button className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <span className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300">
                ↻
              </span>
              Sync Calendar
            </button>
          </li>
        </ul>
      </div>

      {/* App Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Smart Task Manager v1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
