// client/src/api/products.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/products' 
  : 'http://localhost:5000/api/products';

/**
 * Get all products with optional filtering
 */
export const getProducts = async (category = '') => {
  try {
    console.log('Fetching products...');
    const url = category ? `${API_URL}?category=${category}` : API_URL;
    const response = await axios.get(url);
    return response.data;
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
    console.log('Fetching product:', productId);
    const response = await axios.get(`${API_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

/**
 * Refresh products list
 */
export const refreshProducts = async () => {
  return getProducts();
};


export const getProduct = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};