import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const API_URL = process.env.NODE_ENV === 'production'
          ? '/api/orders'
          : 'http://localhost:5000/api/orders';
          
        const response = await axios.get(`${API_URL}/${id}`, {
          withCredentials: true
        });
        
        setOrder(response.data.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="order-success">
      <div className="success-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      
      <h1>Order Placed Successfully!</h1>
      <p>Thank you for your purchase. Your order has been received.</p>
      
      {order && (
        <div className="order-details">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
          <p><strong>Status:</strong> <span className="status">{order.status}</span></p>
        </div>
      )}
      
      <div className="action-buttons">
        <Link to="/profile" className="btn-secondary">View Order History</Link>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;