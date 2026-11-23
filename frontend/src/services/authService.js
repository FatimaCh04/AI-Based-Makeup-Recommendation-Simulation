import { apiClient } from './apiClient';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(name, email, password) {
    const response = await apiClient.post('/auth/register', { name, email, password });
    return response.data;
  },

  async getMe(token) {
    const response = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
