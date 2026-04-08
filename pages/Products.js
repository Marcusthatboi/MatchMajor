// client/src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import ProductCard from '../components/Products/ProductCard';
import CategoryFilter from '../components/UI/CategoryFilter';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts(category);
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const categories = ['Bundle', 'Hardware', 'Software', 'Service', 'Accessory', ''];

  return (
    <div className="products-page">
      <h1>Our Products</h1>
      
      <CategoryFilter 
        categories={categories} 
        activeCategory={category}
        onCategoryChange={setCategory} 
      />
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="product-grid">
          {products.length === 0 ? (
            <p>No products found</p>
          ) : (
            products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Products;