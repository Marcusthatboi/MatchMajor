// client/src/api/messages.js
import axios from 'axios';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/messages' 
  : 'http://localhost:5000/api/messages';

/**
 * Get messages for a chatroom
 */
export const getMessages = async (chatroomId, limit = 50) => {
  try {
    const response = await axios.get(`${API_URL}/${chatroomId}?limit=${limit}`);
    return response.data;
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
    const response = await axios.post(API_URL, {
      chatroomId,
      text
    });
    return response.data;
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
    const response = await axios.delete(`${API_URL}/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Delete message error:', error);
    throw error;
  }
};
