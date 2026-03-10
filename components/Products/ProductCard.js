import React from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../../api/cart';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
        <h3 className="product-name">{product.name}</h3>
      </Link>
      <p className="product-category">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button 
        className="add-to-cart-btn" 
        onClick={handleAddToCart}
        disabled={!product.inStock}
      >
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
};

export default ProductCard;