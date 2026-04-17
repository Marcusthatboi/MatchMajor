// src/api/posts.js
import { api } from './index';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/posts' 
  : '/posts';

/**
 * Get all community posts
 */
export const getPosts = async (limit = 10) => {
  try {
    console.log('Fetching posts from:', `${API_URL}?limit=${limit}`);
    const response = await api.get(API_URL, { params: { limit }, skipCache: true });
    return response;
  } catch (error) {
    console.error('Get posts error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    // Return mock data if API not available
    return {
      success: false,
      data: [
        { _id: '1', author: 'Alex', content: 'Working on my AI portfolio today! Anyone want to collaborate?', likes: 14, createdAt: new Date() },
        { _id: '2', author: 'Jordan', content: 'Finished a data analysis project on college admissions trends.', likes: 21, createdAt: new Date() },
      ]
    };
  }
};

/**
 * Create a new post
 */
export const createPost = async (content) => {
  try {
    console.log('Creating post:', content);
    const response = await api.post(API_URL, { content });
    return response;
  } catch (error) {
    console.error('Create post error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Like a post
 */
export const likePost = async (postId) => {
  try {
    console.log('Liking post:', postId);
    const response = await api.post(`${API_URL}/${postId}/like`);
    return response;
  } catch (error) {
    console.error('Like post error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
