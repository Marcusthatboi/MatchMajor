import axios from 'axios';

axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV === 'production'
  ? '/api/orders'
  : 'http://localhost:5000/api/orders';

export const createOrder = async (shippingAddress, paymentMethod) => {
  const response = await axios.post(API_URL, {
    shippingAddress,
    paymentMethod
  });
  return response.data;
};

export const getUserOrders = async () => {
  const response = await axios.get(`${API_URL}/myorders`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};