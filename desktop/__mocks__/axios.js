// __mocks__/axios.js
const mockAxios = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), handlers: [] },
    response: { use: jest.fn(), handlers: [] }
  }
};
module.exports = mockAxios;
