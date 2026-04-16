// Centralized API client for cart operations
import { api } from './index';

/**
 * Get current user's cart
 */
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response;
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
    const response = await api.post('/cart/add', { productId, quantity });
    return response;
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
    const response = await api.put('/cart/update', { productId, quantity });
    return response;
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
    const response = await api.delete(`/cart/item/${productId}`);
    return response;
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
    const response = await api.delete('/cart/clear');
    return response;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
};