import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Restore user and token immediately from localStorage so hard reload never loses session
  const [token, setToken] = useState(() => {
    return localStorage.getItem('glamai_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('glamai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!token && !user ? false : true);

  // Set default authorization header whenever token changes
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify/refresh user profile from backend
      apiClient.get('/auth/me')
        .then(res => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('glamai_user', JSON.stringify(res.data.user));
          }
        })
        .catch(err => {
          // Only invalidate session if backend explicitly reports 401 Unauthorized (token expired/invalid)
          if (err.response?.status === 401) {
            console.warn('[GlamAI Auth] Token expired or invalid, logging out.');
            localStorage.removeItem('glamai_token');
            localStorage.removeItem('glamai_user');
            delete apiClient.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
          } else {
            // For network hiccups or ephemeral storage cold starts, keep current session from localStorage
            console.info('[GlamAI Auth] Preserving active session from local cache.');
          }
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
    localStorage.setItem('glamai_user', JSON.stringify(userData));
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
    localStorage.setItem('glamai_user', JSON.stringify(userData));
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
    localStorage.setItem('glamai_user', JSON.stringify(userData));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('glamai_token');
    localStorage.removeItem('glamai_user');
    delete apiClient.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('glamai_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = Boolean(token || user);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, sendOtp, verifyOtp, logout, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
