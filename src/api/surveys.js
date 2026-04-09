// client/src/api/surveys.js
import axios from 'axios';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/survey' 
  : 'http://localhost:5000/api/survey';

/**
 * Create or update user survey
 */
export const saveSurvey = async (surveyData) => {
  try {
    const response = await axios.post(`${API_URL}`, surveyData);
    return response.data;
  } catch (error) {
    console.error('Save survey error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Get current user's survey
 */
export const getSurvey = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error('Get survey error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Get a specific user's survey by userId
 */
export const getUserSurvey = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user survey error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Delete user's survey
 */
export const deleteSurvey = async () => {
  try {
    const response = await axios.delete(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error('Delete survey error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Get all surveys (admin)
 */
export const getAllSurveys = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  } catch (error) {
    console.error('Get all surveys error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
