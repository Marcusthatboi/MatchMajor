import React from 'react';
import './Footer.css';
import logo from '../../images/MatchMajor logo Full.png';
import rowanLogo from '../../images/rowanU-logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="MatchMajor logo" className="footer-logo-image" />
          <p>Connect with students. Find your perfect study partner.</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          <img src={rowanLogo} alt="Rowan University logo" className="footer-rowan-logo" />
          &copy; {new Date().getFullYear()} MatchMajor. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
