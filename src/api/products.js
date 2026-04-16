// Centralized API client for products
import { api } from './index';

/**
 * Get all products with optional filtering and caching
 */
export const getProducts = async (category = '') => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/products', { params });
    return response;
  } catch (error) {
    console.error('Get products error:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response;
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

/**
 * Refresh products list (skip cache)
 */
export const refreshProducts = async () => {
  return api.get('/products', { skipCache: true });
};