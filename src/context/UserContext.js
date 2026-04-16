// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../api/auth';

// Create the context
const UserContext = createContext();

// Context provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user from backend on app load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('🔄 Initializing user...');
        const response = await getCurrentUser();
        if (response.success && response.user) {
          console.log('✅ User loaded:', response.user.username);
          setUser(response.user);
          setError(null);
        } else {
          console.log('ℹ️  No authenticated user');
          setUser(null);
        }
      } catch (error) {
        console.log('ℹ️  User not authenticated:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Login handler
  const login = (userData) => {
    console.log('✅ User logged in:', userData.username);
    setUser(userData);
    setError(null);
  };

  // Register handler
  const register = (userData) => {
    console.log('✅ User registered:', userData.username);
    setUser(userData);
    setError(null);
  };

  // Logout handler
  const logout = async () => {
    try {
      console.log('🔄 Logging out...');
      await apiLogout();
      console.log('✅ User logged out');
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError('Failed to logout');
    }
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    console.log('✅ Profile updated');
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData
    }));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
