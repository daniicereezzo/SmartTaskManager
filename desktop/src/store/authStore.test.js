// Mock AuthService to avoid importing axios ESM in tests
jest.mock('../services/AuthService', () => ({
  authService: {
    login: jest.fn(),
    getCurrentUser: jest.fn()
  }
}));

const { act } = require('react');
const { useAuthStore } = require('./authStore');
const { authService } = require('../services/AuthService');

test('authStore login sets user and token', async () => {
  const fakeResp = { user: { id: 1, name: 'A' }, token: 't' };
  authService.login.mockResolvedValue(fakeResp);

  // access store actions
  const { login } = useAuthStore.getState();
  
  await act(async () => {
    const res = await login('google-token');
    expect(res).toEqual(fakeResp);
  });

  const state = useAuthStore.getState();
  expect(state.user).toEqual(fakeResp.user);
  expect(state.token).toBe('t');
});

test('authStore logout clears user and token', () => {
  // initialize state
  const { logout, updateUser } = useAuthStore.getState();
  // set a user
  updateUser({ name: 'X' });
  useAuthStore.setState({ token: 't', user: { id: 2, name: 'X' } });

  logout();
  const state = useAuthStore.getState();
  expect(state.user).toBeNull();
  expect(state.token).toBeNull();
});

test('authStore checkAuth fetches current user when token present', async () => {
  const fakeUser = { id: 9, name: 'Check' };
  authService.getCurrentUser.mockResolvedValue(fakeUser);

  // set a token in the store so checkAuth proceeds
  useAuthStore.setState({ token: 'existing-token' });

  await act(async () => {
    await useAuthStore.getState().checkAuth();
  });

  const state = useAuthStore.getState();
  expect(state.user).toEqual(fakeUser);
  expect(state.isLoading).toBe(false);
});
