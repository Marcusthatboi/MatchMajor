// client/src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '../api/cart';
import CartItem from '../components/Cart/CartItem';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await getCart();
        setCart(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load cart');
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      const response = await updateCartItem(productId, quantity);
      setCart(response.data);
    } catch (error) {
      setError('Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await removeFromCart(productId);
      setCart(response.data);
    } catch (error) {
      setError('Failed to remove item from cart');
    }
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h1>Your Cart is Empty</h1>
        <p>Add items to your cart to continue shopping</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map(item => (
            <CartItem 
              key={item.product._id} 
              item={item} 
              onQuantityChange={handleQuantityChange} 
              onRemove={handleRemoveItem} 
            />
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="cart-total">
            <span>Total:</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          <button 
            className="checkout-btn"
            onClick={proceedToCheckout}
            disabled={cart.items.length === 0}
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;