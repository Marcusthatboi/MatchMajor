// Centralized API client for authentication
import { api } from './index';

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  });
  return response;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  // Store token if successful
  if (response.success && response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  return response;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  
  // Clear token on logout
  localStorage.removeItem('authToken');
  
  return response;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response;
};