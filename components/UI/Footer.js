import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>TechStore</h3>
          <p>Your one-stop shop for tech solutions for every need.</p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/profile">My Account</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Categories</h3>
          <ul className="footer-links">
            <li><Link to="/products?category=Bundle">Bundles</Link></li>
            <li><Link to="/products?category=Hardware">Hardware</Link></li>
            <li><Link to="/products?category=Software">Software</Link></li>
            <li><Link to="/products?category=Service">Services</Link></li>
            <li><Link to="/products?category=Accessory">Accessories</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="footer-links">
            <li><i className="fas fa-map-marker-alt"></i> 123 Tech Street, San Francisco, CA</li>
            <li><i className="fas fa-phone"></i> (123) 456-7890</li>
            <li><i className="fas fa-envelope"></i> support@techstore.com</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TechStore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;