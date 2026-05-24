import { apiService } from './ApiService';

class AuthService {
  async login(googleToken) {
    const response = await apiService.post('/auth/google', {
      googleToken
    });
    return response;
  }

  async getCurrentUser() {
    const response = await apiService.get('/auth/me');
    return response.data;
  }

  async logout() {
    await apiService.post('/auth/logout');
  }

  async getGoogleAuthUrl() {
    const response = await apiService.get('/auth/google/url');
    return response.authUrl;
  }

  async connectGoogleCalendar(code) {
    const response = await apiService.post('/auth/google/callback', { code });
    return response;
  }

  async refreshToken() {
    const response = await apiService.post('/auth/refresh');
    return response;
  }
}

// Export a singleton instance named `authService` to avoid identifier collisions
export const authService = new AuthService();
