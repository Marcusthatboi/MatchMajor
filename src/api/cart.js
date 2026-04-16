// client/src/api/cart.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/cart' 
  : 'http://localhost:5000/api/cart';

/**
 * Get current user's cart
 */
export const getCart = async () => {
  try {
    console.log('Fetching cart...');
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Get cart error:', error);
    throw error;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (productId, quantity = 1) => {
  try {
    console.log('Adding to cart - productId:', productId, 'quantity:', quantity);
    const response = await axios.post(`${API_URL}/add`, { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (productId, quantity) => {
  try {
    console.log('Updating cart item - productId:', productId, 'quantity:', quantity);
    const response = await axios.put(`${API_URL}/update`, { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Update cart item error:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (productId) => {
  try {
    console.log('Removing from cart - productId:', productId);
    const response = await axios.delete(`${API_URL}/item/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async () => {
  try {
    console.log('Clearing cart...');
    const response = await axios.delete(`${API_URL}/clear`);
    return response.data;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
};

};