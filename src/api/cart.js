// client/src/api/cart.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/cart' 
  : 'http://localhost:5000/api/cart';

export const getCart = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await axios.post(`${API_URL}/add`, { productId, quantity });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await axios.put(`${API_URL}/update`, { productId, quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await axios.delete(`${API_URL}/item/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axios.delete(`${API_URL}/clear`);
  return response.data;
};