import React from 'react';
import './CartItem.css';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 1) {
      onQuantityChange(item.product._id, newQuantity);
    }
  };
  
  const increaseQuantity = () => {
    onQuantityChange(item.product._id, item.quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.product._id, item.quantity - 1);
    }
  };
  
  return (
    <div className="cart-item">
      <div className="item-image">
        <img src={item.product.image} alt={item.product.name} />
      </div>
      
      <div className="item-details">
        <h3 className="item-name">{item.product.name}</h3>
        <p className="item-price">${item.product.price.toFixed(2)}</p>
      </div>
      
      <div className="item-quantity">
        <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
        <input 
          type="number" 
          min="1" 
          value={item.quantity} 
          onChange={handleQuantityChange}
          className="quantity-input"
        />
        <button className="quantity-btn" onClick={increaseQuantity}>+</button>
      </div>
      
      <div className="item-total">
        ${(item.product.price * item.quantity).toFixed(2)}
      </div>
      
      <button 
        className="remove-btn"
        onClick={() => onRemove(item.product._id)}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default CartItem;