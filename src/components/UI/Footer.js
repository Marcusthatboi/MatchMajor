import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>MatchMajor</h2>
          <p>Connect with students. Find your perfect study partner.</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MatchMajor. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
