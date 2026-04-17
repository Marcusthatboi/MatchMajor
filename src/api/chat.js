// src/api/chat.js
import { api } from './index';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/chat' 
  : '/chat';

/**
 * Get recent chat messages
 */
export const getMessages = async (limit = 10) => {
  try {
    console.log('Fetching messages from:', `${API_URL}/messages?limit=${limit}`);
    const response = await api.get(`${API_URL}/messages`, { params: { limit }, skipCache: true });
    return response;
  } catch (error) {
    console.error('Get messages error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    // Return mock data if API not available
    return {
      success: false,
      data: [
        { _id: '1', user: 'Alex', text: 'Hi team! Who is ready for a coding session today?', createdAt: new Date() },
        { _id: '2', user: 'Jordan', text: 'I am! Let\'s meet at 3pm.', createdAt: new Date() },
      ]
    };
  }
};

/**
 * Send a chat message
 */
export const sendMessage = async (text) => {
  try {
    console.log('Sending message:', text);
    const response = await api.post(`${API_URL}/messages`, { text });
    return response;
  } catch (error) {
    console.error('Send message error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
