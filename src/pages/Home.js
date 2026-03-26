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

  // Mock data for social features
  const mockMatches = [
    { id: 1, name: 'Alex', skills: 'React, Node.js', common: 87 },
    { id: 2, name: 'Jordan', skills: 'Python, Data Science', common: 75 },
  ];

  const mockPosts = [
    { id: 1, author: 'Alex', content: 'Working on my AI portfolio today! Anyone want to collaborate?', likes: 14 },
    { id: 2, author: 'Jordan', content: 'Finished a data analysis project on college admissions trends.', likes: 21 },
  ];

  const mockMessages = [
    { id: 1, user: 'Alex', text: 'Hi team! Who is ready for a coding session today?' },
    { id: 2, user: 'You', text: 'I am! Let\'s meet at 5pm.' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await getProducts(category);
        setFeaturedProducts(data.slice(0, 4));
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
          <h1>Welcome to MatchMajor</h1>
          <p>Connect with fellow students, find study partners, and discover tech solutions for your academic journey</p>
          <Link to="/matches" className="cta-button">Find Your Match</Link>
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

      <section className="social-modules">
        <div className="modules-grid">
          <div className="module matches-module">
            <h2>Your Matches</h2>
            <p>Students who align with your study goals</p>
            <div className="matches-preview">
              {mockMatches.map((match) => (
                <div key={match.id} className="match-preview">
                  <h4>{match.name}</h4>
                  <p>{match.skills}</p>
                  <span className="compatibility">{match.common}% match</span>
                </div>
              ))}
            </div>
            <Link to="/matches" className="module-link">View All Matches</Link>
          </div>

          <div className="module posts-module">
            <h2>Community Posts</h2>
            <p>Latest updates from fellow students</p>
            <div className="posts-preview">
              {mockPosts.slice(0, 2).map((post) => (
                <div key={post.id} className="post-preview">
                  <p className="post-author">{post.author}</p>
                  <p className="post-content">{post.content.substring(0, 60)}...</p>
                  <span className="post-likes">❤️ {post.likes}</span>
                </div>
              ))}
            </div>
            <Link to="/posts" className="module-link">View All Posts</Link>
          </div>

          <div className="module chat-module">
            <h2>Study Chatroom</h2>
            <p>Connect with study partners</p>
            <div className="chat-preview">
              {mockMessages.slice(-3).map((msg) => (
                <div key={msg.id} className="chat-message-preview">
                  <strong>{msg.user}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <Link to="/chat" className="module-link">Join Chatroom</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;