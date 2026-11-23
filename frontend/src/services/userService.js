import { apiClient } from './apiClient';
import { mockUserData } from '../data/mockUserData';
import { mockNotifications } from '../data/mockNotifications';

export const userService = {
  /**
   * Fetch current user profile & estimated beauty metrics
   * Endpoint: GET /api/user/profile
   */
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data.user;
    } catch (err) {
      return mockUserData;
    }
  },

  /**
   * Fetch user notifications
   * Endpoint: GET /api/user/notifications
   */
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/user/notifications');
      return response.data.notifications;
    } catch (err) {
      return mockNotifications;
    }
  }
};
