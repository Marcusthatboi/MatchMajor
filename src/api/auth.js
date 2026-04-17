// Centralized API client for authentication
import { api } from './index';

export const register = async (username, email, password, confirmPassword) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword
    });
    return response;
  } catch (error) {
    console.error('Auth register error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    // Token is set as httpOnly cookie by server
    // The APIClient will automatically send credentials with requests
    return response;
  } catch (error) {
    console.error('Auth login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    
    // Clear token on logout
    localStorage.removeItem('authToken');
    
    return response;
  } catch (error) {
    console.error('Auth logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response;
  } catch (error) {
    console.error('Auth getCurrentUser error:', error);
    throw error;
  }
};