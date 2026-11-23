import { apiClient } from './apiClient';

export const analysisService = {
  async validatePhoto(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await apiClient.post('/analysis/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return response.data;
  },

  async analyzePhoto(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await apiClient.post('/analysis/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },

  async getHistory() {
    const response = await apiClient.get('/analysis/history');
    return response.data;
  }
};
