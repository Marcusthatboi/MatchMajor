// Centralized API client for matches
import { api } from './index';

/**
 * Get match recommendations for the current user
 */
export const getMatches = async (context = 'comprehensive') => {
  try {
    const response = await api.get('/matches', { params: { context }, skipCache: true });
    return response;
  } catch (error) {
    console.error('Get matches error:', error);
    throw error;
  }
};

/**
 * Get a specific user's profile
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/matches/${userId}`, { skipCache: true });
    return response;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Update current user's profile with survey data
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/matches/profile', profileData);
    return response;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};
