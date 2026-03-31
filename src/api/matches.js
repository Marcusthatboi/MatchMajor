// src/api/matches.js
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/matches' 
  : 'http://localhost:5000/api/matches';

axios.defaults.withCredentials = true;

/**
 * Get match recommendations for the current user
 */
export const getMatches = async () => {
  try {
    console.log('Fetching matches from:', `${API_URL}/`);
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error('Get matches error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    throw error;
  }
};

/**
 * Get a specific user's profile
 */
export const getUserProfile = async (userId) => {
  try {
    console.log('Fetching user profile from:', `${API_URL}/${userId}`);
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    throw error;
  }
};

/**
 * Update current user's profile with survey data
 */
export const updateUserProfile = async (profileData) => {
  try {
    console.log('Sending profile update to:', `${API_URL}/profile`);
    console.log('Profile data:', profileData);
    
    const response = await axios.put(`${API_URL}/profile`, profileData);
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Profile update error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code,
      url: error.config?.url
    });
    throw error;
  }
};
