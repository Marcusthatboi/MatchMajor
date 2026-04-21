// src/api/posts.js
import { api } from './index';

const API_URL = '/posts';

/**
 * Get posts for a specific chatroom
 * GET /api/posts/:chatroomId?limit=50
 */
export const getPostsByChatroom = async (chatroomId, limit = 50) => {
  try {
    console.log('Fetching posts for chatroom:', chatroomId);
    const response = await api.get(`${API_URL}/${chatroomId}`, { 
      params: { limit },
      skipCache: true 
    });
    return response;
  } catch (error) {
    console.error('Get posts error:', error);
    throw error;
  }
};

/**
 * Create a new post in a chatroom
 * POST /api/posts
 */
export const createPost = async (chatroomId, content) => {
  try {
    console.log('Creating post in chatroom:', chatroomId);
    const response = await api.post(API_URL, { 
      chatroomId,
      content 
    }, { skipCache: true });
    return response;
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

/**
 * Like/Unlike a post
 * PUT /api/posts/:postId/like
 */
export const likePost = async (postId) => {
  try {
    console.log('Toggling like for post:', postId);
    const response = await api.put(`${API_URL}/${postId}/like`, {}, { skipCache: true });
    return response;
  } catch (error) {
    console.error('Like post error:', error);
    throw error;
  }
};

/**
 * Add a comment to a post
 * POST /api/posts/:postId/comment
 */
export const addComment = async (postId, text) => {
  try {
    console.log('Adding comment to post:', postId);
    const response = await api.post(`${API_URL}/${postId}/comment`, { 
      text 
    }, { skipCache: true });
    return response;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
};

/**
 * Delete a post (owner or admin only)
 * DELETE /api/posts/:postId
 */
export const deletePost = async (postId) => {
  try {
    console.log('Deleting post:', postId);
    const response = await api.delete(`${API_URL}/${postId}`, { skipCache: true });
    return response;
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};
