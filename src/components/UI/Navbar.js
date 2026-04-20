import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import logo from '../../images/MatchMajor logo HZ.png';
import './Navbar.css';

const Navbar = ({ logoutHandler }) => {
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useUser();

  // Use the provided logout handler or fall back to context logout
  const handleLogout = async () => {
    try {
      if (logoutHandler) {
        await logoutHandler();
      } else {
        await contextLogout();
      }
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {user ? (
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="MatchMajor logo" className="navbar-logo-image" />
          </Link>
        ) : (
          <div className="navbar-logo">
            <img src={logo} alt="MatchMajor logo" className="navbar-logo-image" />
          </div>
        )}
        
        {user && (
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/matches" className="nav-link">Matches</Link>
            <Link to="/posts" className="nav-link">Posts</Link>
            <Link to="/chat" className="nav-link">Chatroom</Link>
          </div>
        )}
        
        <div className="navbar-auth">
          {user ? (
            <>
              <Link to="/profile" className="profile-link">
                <i className="fas fa-user-circle"></i>
                Profile
              </Link>
              <div className="user-menu">
                <span className="username">Hi, {user.username}</span>
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/posts" className="dropdown-item">Community Posts</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
