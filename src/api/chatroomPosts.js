// client/src/api/chatroomPosts.js
import { api } from './index';

// Uses centralized API client with credentials handling

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/posts' 
  : '/posts';

/**
 * Get posts for a chatroom
 */
export const getPosts = async (chatroomId, limit = 50) => {
  try {
    console.log('Fetching posts for chatroom:', chatroomId);
    const response = await api.get(`${API_URL}/${chatroomId}`, { params: { limit }, skipCache: true });
    return response;
  } catch (error) {
    console.error('Get posts error:', error);
    throw error;
  }
};

/**
 * Create a new post
 */
export const createPost = async (chatroomId, content, options = {}) => {
  try {
    console.log('📤 Creating post:', { chatroomId, content });
    const requestBody = { chatroomId, content, ...options };
    console.log('📋 Request body:', requestBody);
    
    const response = await api.post(API_URL, requestBody);
    console.log('✅ Post created successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Create post error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code,
      fullError: error
    });
    throw error;
  }
};

export const requestRoommateJoin = async (postId) => {
  try {
    const response = await api.post(`${API_URL}/${postId}/roommate-request`);
    return response;
  } catch (error) {
    console.error('Request roommate join error:', error);
    throw error;
  }
};

export const respondToRoommateRequest = async (postId, requestId, decision) => {
  try {
    const response = await api.put(`${API_URL}/${postId}/roommate-request/${requestId}`, {
      decision
    });
    return response;
  } catch (error) {
    console.error('Respond roommate request error:', error);
    throw error;
  }
};

/**
 * Like/unlike a post
 */
export const likePost = async (postId) => {
  try {
    console.log('Liking post:', postId);
    const response = await api.put(`${API_URL}/${postId}/like`);
    return response;
  } catch (error) {
    console.error('Like post error:', error);
    throw error;
  }
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId, text) => {
  try {
    console.log('Adding comment to post:', postId);
    const response = await api.post(`${API_URL}/${postId}/comment`, {
      text
    });
    return response;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
};

/**
 * Delete a post (only owner or admin)
 */
export const deletePost = async (postId) => {
  try {
    console.log('Deleting post:', postId);
    const response = await api.delete(`${API_URL}/${postId}`);
    return response;
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};
