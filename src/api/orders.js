// client/src/api/orders.js
import { api } from './index';

const API_URL = process.env.NODE_ENV === 'production'
  ? '/orders'
  : '/orders';

/**
 * Create a new order from cart
 */
export const createOrder = async (shippingAddress, paymentMethod) => {
  try {
    console.log('Creating order...');
    const response = await api.post(API_URL, {
      shippingAddress,
      paymentMethod
    });
    return response;
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
    const response = await api.get(`${API_URL}/myorders`);
    return response;
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
    const response = await api.get(`${API_URL}/${orderId}`);
    return response;
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};