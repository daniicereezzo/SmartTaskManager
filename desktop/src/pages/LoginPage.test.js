// Ensure a clean module registry
jest.resetModules();

// Mock the auth store so we don't pull real services (and axios) into tests
jest.mock('../store/authStore', () => ({
  useAuthStore: jest.fn()
}));

// Mock react-hot-toast default export
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Also mock AuthService so LoginPage's import doesn't load the real module (which uses axios ESM)
jest.mock('../services/AuthService', () => ({
  __esModule: true,
  AuthService: {
    login: jest.fn()
  },
  authService: {
    login: jest.fn()
  }
}));

const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');

// Import after mocks
const LoginPage = require('./LoginPage').default;
const { useAuthStore } = require('../store/authStore');
const toast = require('react-hot-toast').default;

test('LoginPage triggers login and shows success toast', async () => {
  const loginMock = jest.fn().mockResolvedValue({ user: { id: 1, name: 'Test' }, token: 'tok' });
  useAuthStore.mockReturnValue({ login: loginMock });

  render(React.createElement(LoginPage));

  const btn = screen.getByRole('button', { name: /Continue with Google/i });
  fireEvent.click(btn);

  await waitFor(() => expect(loginMock).toHaveBeenCalledWith('mock-google-token'));
  expect(toast.success).toHaveBeenCalledWith('Successfully logged in!');
});
