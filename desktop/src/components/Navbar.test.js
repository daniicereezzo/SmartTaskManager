// Reset module registry to avoid previously-loaded modules (from other tests)
jest.resetModules();

// Provide explicit mock factories so the real store modules (which import services/axios)
// are never loaded during tests.
jest.mock('../store/authStore', () => ({
  useAuthStore: jest.fn()
}));
jest.mock('../store/themeStore', () => ({
  useThemeStore: jest.fn()
}));

const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
require('@testing-library/jest-dom');

// Import after mocks so the component will use the mocked stores
const Navbar = require('./Navbar').default;
const { useAuthStore } = require('../store/authStore');
const { useThemeStore } = require('../store/themeStore');

test('renders Navbar with user and toggles theme', () => {
  useAuthStore.mockReturnValue({ user: { name: 'Joe', email: 'joe@example.com' }, logout: jest.fn() });
  useThemeStore.mockReturnValue({ theme: 'light', toggleTheme: jest.fn() });

  render(React.createElement(Navbar));
  expect(screen.getByText(/Smart Task Manager/i)).toBeInTheDocument();
  expect(screen.getByText('Joe')).toBeInTheDocument();

  const btn = screen.getByTitle(/Switch to/);
  fireEvent.click(btn);
  expect(useThemeStore().toggleTheme).toHaveBeenCalled();
});
