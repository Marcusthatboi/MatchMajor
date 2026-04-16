// Centralized API client for surveys
import { api } from './index';

/**
 * Create or update user survey
 */
export const saveSurvey = async (surveyData) => {
  try {
    const response = await api.post('/survey', surveyData, { skipCache: true });
    return response;
  } catch (error) {
    console.error('Save survey error:', error);
    throw error;
  }
};

/**
 * Get current user's survey
 */
export const getSurvey = async () => {
  try {
    const response = await api.get('/survey');
    return response;
  } catch (error) {
    console.error('Get survey error:', error);
    throw error;
  }
};

/**
 * Get a specific user's survey by userId
 */
export const getUserSurvey = async (userId) => {
  try {
    const response = await api.get(`/survey/${userId}`);
    return response;
  } catch (error) {
    console.error('Get user survey error:', error);
    throw error;
  }
};

/**
 * Delete user's survey
 */
export const deleteSurvey = async () => {
  try {
    const response = await api.delete('/survey', { skipCache: true });
    return response;
  } catch (error) {
    console.error('Delete survey error:', error);
    throw error;
  }
};

/**
 * Get all surveys (admin)
 */
export const getAllSurveys = async () => {
  try {
    const response = await api.get('/survey/all');
    return response;
  } catch (error) {
    console.error('Get all surveys error:', error);
    throw error;
  }
};
