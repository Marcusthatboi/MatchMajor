import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../api/cart';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'creditCard'
  });
  
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await getCart();
        
        if (response.data.items.length === 0) {
          navigate('/cart');
          return;
        }
        
        setCart(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load cart data');
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [navigate]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const API_URL = process.env.NODE_ENV === 'production'
        ? '/api/orders'
        : 'http://localhost:5000/api/orders';
        
      const response = await axios.post(API_URL, {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      }, {
        withCredentials: true
      });
      
      navigate(`/order-success/${response.data.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading checkout data...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!cart || cart.items.length === 0) {
    return <div className="empty-cart-message">Your cart is empty</div>;
  }
  
  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <div className="checkout-form-container">
          <h2>Shipping Information</h2>
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <h2>Payment Method</h2>
            
            <div className="payment-methods">
              <div className="payment-method">
                <input
                  type="radio"
                  id="creditCard"
                  name="paymentMethod"
                  value="creditCard"
                  checked={formData.paymentMethod === 'creditCard'}
                  onChange={handleChange}
                />
                <label htmlFor="creditCard">Credit Card</label>
              </div>
              
              <div className="payment-method">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={handleChange}
                />
                <label htmlFor="paypal">PayPal</label>
              </div>
            </div>
            
            <button
              type="submit"
              className="place-order-btn"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cart.items.map(item => (
              <div key={item.product._id} className="summary-item">
                <span className="item-name">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="item-price">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="summary-total">
            <span>Total:</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;