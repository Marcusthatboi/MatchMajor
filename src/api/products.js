// client/src/api/products.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/products' 
  : 'http://localhost:5000/api/products';

export const getProducts = async (category = '') => {
  const response = await axios.get(`${API_URL}${category ? `?category=${category}` : ''}`);
  return response.data;
};

export const getProduct = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};