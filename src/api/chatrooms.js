// client/src/api/chatrooms.js
import axios from 'axios';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/chatrooms' 
  : 'http://localhost:5000/api/chatrooms';

/**
 * Get all chatrooms
 */
export const getAllChatrooms = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Get chatrooms error:', error);
    throw error;
  }
};

/**
 * Get a specific chatroom
 */
export const getChatroom = async (chatroomId) => {
  try {
    const response = await axios.get(`${API_URL}/${chatroomId}`);
    return response.data;
  } catch (error) {
    console.error('Get chatroom error:', error);
    throw error;
  }
};

/**
 * Create a new chatroom
 */
export const createChatroom = async (name, description, color) => {
  try {
    const response = await axios.post(API_URL, {
      name,
      description,
      color
    });
    return response.data;
  } catch (error) {
    console.error('Create chatroom error:', error);
    throw error;
  }
};

/**
 * Join a chatroom
 */
export const joinChatroom = async (chatroomId) => {
  try {
    const response = await axios.post(`${API_URL}/join`, {
      chatroomId
    });
    return response.data;
  } catch (error) {
    console.error('Join chatroom error:', error);
    throw error;
  }
};

/**
 * Leave a chatroom
 */
export const leaveChatroom = async (chatroomId) => {
  try {
    const response = await axios.post(`${API_URL}/leave`, {
      chatroomId
    });
    return response.data;
  } catch (error) {
    console.error('Leave chatroom error:', error);
    throw error;
  }
};
