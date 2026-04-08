// client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import ProductCard from '../components/Products/ProductCard';
import CategoryFilter from '../components/UI/CategoryFilter';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await getProducts(category);
        setFeaturedProducts(data.slice(0, 4)); // Get first 4 products
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
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Tech Solutions for Every Need</h1>
          <p>Discover our range of tech bundles, hardware, and software solutions</p>
          <Link to="/products" className="cta-button">Shop Now</Link>
        </div>
      </section>

      <section className="featured-products">
        <h2>Featured Products</h2>
        <CategoryFilter 
          categories={categories} 
          activeCategory={category}
          onCategoryChange={setCategory} 
        />
        
        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        
        <Link to="/products" className="view-all">View All Products</Link>
      </section>

      <section className="services">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <i className="fas fa-shipping-fast"></i>
            <h3>Fast Shipping</h3>
            <p>Free delivery on orders over $100</p>
          </div>
          <div className="service-card">
            <i className="fas fa-headset"></i>
            <h3>Technical Support</h3>
            <p>24/7 expert tech assistance</p>
          </div>
          <div className="service-card">
            <i className="fas fa-sync-alt"></i>
            <h3>Easy Returns</h3>
            <p>30-day money-back guarantee</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;