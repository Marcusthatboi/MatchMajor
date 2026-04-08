import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const API_URL = process.env.NODE_ENV === 'production'
          ? '/api/orders/myorders'
          : 'http://localhost:5000/api/orders/myorders';
          
        const response = await axios.get(API_URL, {
          withCredentials: true
        });
        
        setOrders(response.data.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading profile data...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-info">
          <h2>Account Information</h2>
          
          <div className="info-group">
            <label>Username:</label>
            <p>{user.username}</p>
          </div>
          
          <div className="info-group">
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
          
          <div className="info-group">
            <label>Member Since:</label>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="profile-orders">
          <h2>Order History</h2>
          
          {orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <Link to="/products" className="shop-now-btn">Shop Now</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order._id.substr(-6)}</h3>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <p>{order.items.length} item(s)</p>
                    <p className="order-total">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  
                  <Link to={`/order-success/${order._id}`} className="view-order-btn">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;