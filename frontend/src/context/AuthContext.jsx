import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('glamai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token with backend
      apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data.user);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      })
      .catch(() => {
        // Token invalid
        localStorage.removeItem('glamai_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('glamai_token', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  // Step 1: send OTP (returns { success, pending, message })
  const sendOtp = async (name, email, phone, password) => {
    const res = await apiClient.post('/auth/register', { name, email, phone, password });
    return res.data;
  };

  // Step 2: verify OTP → create account → log user in
  const verifyOtp = async (email, otp) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('glamai_token', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  // Legacy register (kept for compatibility)
  const register = async (name, email, password) => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('glamai_token', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('glamai_token');
    delete apiClient.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, sendOtp, verifyOtp, logout, updateUser, isAuthenticated: !!user || !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
