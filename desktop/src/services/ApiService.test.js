import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Mock the modules
jest.mock('axios');
jest.mock('../store/authStore');

// Setup before each test
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Setup default axios mock
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn(), handlers: [] },
      response: { use: jest.fn(), handlers: [] }
    }
  };
  axios.create.mockReturnValue(mockAxiosInstance);
});

test('get returns data', async () => {
  // Setup axios mock for this test
  const mockAxiosInstance = axios.create();
  mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: { foo: 1 } });
  
  const { ApiService } = await import('./ApiService');
  const svc = new ApiService();
  const data = await svc.get('/foo');
  expect(data).toEqual({ foo: 1 });
});

test('post returns data', async () => {
  // Setup axios mock for this test
  const mockAxiosInstance = axios.create();
  mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: { bar: 2 } });
  
  const { ApiService } = await import('./ApiService');
  const svc = new ApiService();
  const data = await svc.post('/bar', { x: 1 });
  expect(data).toEqual({ bar: 2 });
});

test('put returns data', async () => {
  // Setup axios mock for this test
  const mockAxiosInstance = axios.create();
  mockAxiosInstance.put = jest.fn().mockResolvedValue({ data: { baz: 3 } });
  
  const { ApiService } = await import('./ApiService');
  const svc = new ApiService();
  const data = await svc.put('/baz', { y: 2 });
  expect(data).toEqual({ baz: 3 });
});

test('delete returns data', async () => {
  // Setup axios mock for this test
  const mockAxiosInstance = axios.create();
  mockAxiosInstance.delete = jest.fn().mockResolvedValue({ data: { ok: true } });
  
  const { ApiService } = await import('./ApiService');
  const svc = new ApiService();
  const data = await svc.delete('/baz');
  expect(data).toEqual({ ok: true });
});

test('handleError returns correct error for response', async () => {
  const { apiService } = await import('./ApiService');
  const error = { response: { data: { error: 'fail' } } };
  const err = apiService.handleError(error);
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toBe('fail');
});

test('handleError returns correct error for request', async () => {
  const { apiService } = await import('./ApiService');
  const error = { request: {} };
  const err = apiService.handleError(error);
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toMatch(/Network error/);
});

test('handleError returns correct error for other', async () => {
  const { apiService } = await import('./ApiService');
  const error = { message: 'other' };
  const err = apiService.handleError(error);
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toBe('other');
});