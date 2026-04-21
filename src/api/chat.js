// src/api/chat.js
import { api } from './index';

const API_URL = '/messages';

/**
 * Get recent chat messages
 */
export const getMessages = async (chatroomId, limit = 10) => {
  try {
    if (!chatroomId) {
      return {
        success: true,
        data: []
      };
    }

    console.log('Fetching messages for chatroom:', chatroomId);
    const response = await api.get(`${API_URL}/${chatroomId}`, { params: { limit }, skipCache: true });
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
    const response = await api.post(API_URL, { text });
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
