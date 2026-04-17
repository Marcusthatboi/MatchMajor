// client/src/api/messages.js
import { api } from './index';

// Uses centralized API client with credentials handling

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/messages' 
  : '/messages';

/**
 * Get messages for a chatroom
 */
export const getMessages = async (chatroomId, limit = 50) => {
  try {
    const response = await api.get(`${API_URL}/${chatroomId}`, { params: { limit }, skipCache: true });
    return response;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

/**
 * Send a message to a chatroom
 */
export const sendMessage = async (chatroomId, text) => {
  try {
    const response = await api.post(API_URL, {
      chatroomId,
      text
    });
    return response;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`${API_URL}/${messageId}`);
    return response;
  } catch (error) {
    console.error('Delete message error:', error);
    throw error;
  }
};
