import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  }
});

// Add auth token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('glamai_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('glamai_token');
      // Don't redirect here - let AuthContext handle it
    }
    console.info(`[GlamAI API] Request failed:`, error.message);
    return Promise.reject(error);
  }
);
