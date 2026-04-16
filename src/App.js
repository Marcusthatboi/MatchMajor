import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Survey from './pages/Survey';

import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Posts from './pages/Posts';
import ChatRoom from './pages/ChatRoom';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Navbar from './components/UI/Navbar';
import Footer from './components/UI/Footer';
import { UserProvider, useUser } from './context/UserContext';
import './App.css';

// Inner App component that uses UserContext
const AppContent = () => {
  const { user, loading, isAuthenticated, logout } = useUser();
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="loading-container"><div className="spinner">Loading...</div></div>;
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };
  
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar user={user} logoutHandler={logout} />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/survey" element={
              <ProtectedRoute>
                <Survey />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            } />
            <Route path="/posts" element={
              <ProtectedRoute>
                <Posts />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatRoom />
              </ProtectedRoute>
            } />
            
            {/* Product routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Cart and checkout routes */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order/:id" element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

// Outer App component wraps with UserProvider
const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;