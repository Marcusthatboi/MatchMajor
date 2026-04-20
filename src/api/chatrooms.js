// client/src/api/chatrooms.js
import { api } from './index';

// Uses centralized API client with credentials handling

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/chatroom' 
  : '/chatroom';

/**
 * Get all chatrooms
 */
export const getAllChatrooms = async () => {
  try {
    const response = await api.get(API_URL, { skipCache: true });
    return response;
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
    const response = await api.get(`${API_URL}/${chatroomId}`);
    return response;
  } catch (error) {
    console.error('Get chatroom error:', error);
    throw error;
  }
};

/**
 * Create a new chatroom
 */
export const createChatroom = async (name, description, color, isPrivate = false) => {
  try {
    const response = await api.post(API_URL, {
      name,
      description,
      color,
      isPrivate
    });
    return response;
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
    const response = await api.post(`${API_URL}/join`, {
      chatroomId
    });
    return response;
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
    const response = await api.post(`${API_URL}/leave`, {
      chatroomId
    });
    return response;
  } catch (error) {
    console.error('Leave chatroom error:', error);
    throw error;
  }
};
