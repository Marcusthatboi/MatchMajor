// client/src/api/chatroomPosts.js
import axios from 'axios';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/posts' 
  : 'http://localhost:5000/api/posts';

/**
 * Get posts for a chatroom
 */
export const getPosts = async (chatroomId, limit = 50) => {
  try {
    console.log('Fetching posts for chatroom:', chatroomId);
    const response = await axios.get(`${API_URL}/${chatroomId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get posts error:', error);
    throw error;
  }
};

/**
 * Create a new post
 */
export const createPost = async (chatroomId, content) => {
  try {
    console.log('Creating post in chatroom:', chatroomId);
    const response = await axios.post(API_URL, {
      chatroomId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

/**
 * Like/unlike a post
 */
export const likePost = async (postId) => {
  try {
    console.log('Liking post:', postId);
    const response = await axios.put(`${API_URL}/${postId}/like`);
    return response.data;
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
    const response = await axios.post(`${API_URL}/${postId}/comment`, {
      text
    });
    return response.data;
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
    const response = await axios.delete(`${API_URL}/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};
/**
 * Delete a post
 */
export const deletePost = async (postId) => {
  try {
    const response = await axios.delete(`${API_URL}/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};
