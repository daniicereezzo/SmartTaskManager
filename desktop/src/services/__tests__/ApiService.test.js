import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

// Mock the modules
jest.mock('axios');
jest.mock('../../store/authStore');

// Setup before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Mock useAuthStore to prevent undefined errors
  useAuthStore.mockReturnValue({
    getState: () => ({
      token: null,
      logout: jest.fn()
    })
  });

  // Reset the module registry before each test
  jest.resetModules();
});

test('get returns data', async () => {
  const mockAxios = {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), handlers: [] },
        response: { use: jest.fn(), handlers: [] }
      },
      get: jest.fn().mockResolvedValueOnce({ data: { foo: 1 } }),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }))
  };
  jest.mock('axios', () => mockAxios);
  
  const { apiService } = await import('../../services/ApiService');
  const data = await apiService.get('/foo');
  expect(data).toEqual({ foo: 1 });
});

test('post returns data', async () => {
  const mockAxios = {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), handlers: [] },
        response: { use: jest.fn(), handlers: [] }
      },
      get: jest.fn(),
      post: jest.fn().mockResolvedValueOnce({ data: { bar: 2 } }),
      put: jest.fn(),
      delete: jest.fn()
    }))
  };
  jest.mock('axios', () => mockAxios);
  
  const { apiService } = await import('../../services/ApiService');
  const data = await apiService.post('/bar', { x: 1 });
  expect(data).toEqual({ bar: 2 });
});

test('put returns data', async () => {
  const mockAxios = {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), handlers: [] },
        response: { use: jest.fn(), handlers: [] }
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn().mockResolvedValueOnce({ data: { baz: 3 } }),
      delete: jest.fn()
    }))
  };
  jest.mock('axios', () => mockAxios);
  
  const { apiService } = await import('../../services/ApiService');
  const data = await apiService.put('/baz', { y: 2 });
  expect(data).toEqual({ baz: 3 });
});

test('delete returns data', async () => {
  const mockAxios = {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), handlers: [] },
        response: { use: jest.fn(), handlers: [] }
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn().mockResolvedValueOnce({ data: { ok: true } })
    }))
  };
  jest.mock('axios', () => mockAxios);
  
  const { apiService } = await import('../../services/ApiService');
  const data = await apiService.delete('/baz');
  expect(data).toEqual({ ok: true });
});

test('handleError returns correct error for response', async () => {
  const { apiService } = await import('../../services/ApiService');
  const error = { response: { data: { error: 'fail' } } };
  const err = apiService.handleError(error);
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toBe('fail');
});

test('handleError returns correct error for request', async () => {
  const { apiService } = await import('../../services/ApiService');
  const error = { request: {} };
  const err = apiService.handleError(error);
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toMatch(/Network error/);
});

test('handleError returns correct error for other', async () => {
  const { apiService } = await import('../../services/ApiService');
  const error = { message: 'other' };
  const err = apiService.handleError(error);
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toBe('other');
});