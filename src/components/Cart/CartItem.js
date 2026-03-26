import React, { useState } from 'react';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity || 1);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(item._id, newQuantity);
    }
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(item._id, newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (onQuantityChange) {
        onQuantityChange(item._id, newQuantity);
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item._id);
    }
  };

  const itemTotal = (item.price || 0) * quantity;

  return (
    <div className="cart-item">
      <div className="item-image">
        <img 
          src={item.image || '/placeholder.jpg'} 
          alt={item.name} 
        />
      </div>
      
      <div className="item-details">
        <h3>{item.name}</h3>
        <p className="item-category">{item.category}</p>
        <p className="item-price">${item.price?.toFixed(2)}</p>
      </div>

      <div className="item-quantity">
        <button onClick={handleDecrement} disabled={quantity <= 1}>-</button>
        <input 
          type="number" 
          value={quantity} 
          onChange={handleQuantityChange}
          min="1"
        />
        <button onClick={handleIncrement}>+</button>
      </div>

      <div className="item-total">
        <p>${itemTotal.toFixed(2)}</p>
      </div>

      <div className="item-actions">
        <button 
          className="btn-remove"
          onClick={handleRemove}
          title="Remove from cart"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CartItem;
