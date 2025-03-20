// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Simulate loading user from localStorage or API on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Simplified token decoding (replace with actual JWT decode in production)
      const decodedUser = { email: 'user@example.com', role: 'farmer' }; // Placeholder
      setUser(decodedUser);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', 'dummy-token'); // Replace with actual token
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};