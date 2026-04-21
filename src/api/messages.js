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
    console.log('📤 Sending message:', { chatroomId, text });
    const requestBody = { chatroomId, text };
    console.log('📋 Request body:', requestBody);
    
    const response = await api.post(API_URL, requestBody);
    console.log('✅ Message sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Send message error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
      fullError: error
    });
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
