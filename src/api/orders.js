// client/src/api/orders.js
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production'
  ? '/api/orders'
  : 'http://localhost:5000/api/orders';

/**
 * Create a new order from cart
 */
export const createOrder = async (shippingAddress, paymentMethod) => {
  try {
    console.log('Creating order...');
    const response = await axios.post(API_URL, {
      shippingAddress,
      paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

/**
 * Get all orders for current user
 */
export const getUserOrders = async () => {
  try {
    console.log('Fetching user orders...');
    const response = await axios.get(`${API_URL}/myorders`);
    return response.data;
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    console.log('Fetching order:', orderId);
    const response = await axios.get(`${API_URL}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};


export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};