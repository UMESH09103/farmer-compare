// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import ShopperDashboard from './components/ShopperDashboard.jsx';
import ShopProducts from './components/ShopProducts.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ComparePage from './components/ComparePage.jsx'; // Add this import
import { useAuth } from './contexts/AuthContext'; // Assuming you have an AuthContext

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/shopper-dashboard" element={<ShopperDashboard user={user} />} />
        <Route path="/shop/:shopId" element={<ShopProducts user={user} />} />
        <Route path="/compare" element={<ComparePage user={user} />} /> {/* Add this route */}
        <Route path="/" element={<Home user={user} />} /> {/* Default route */}
      </Routes>
    </Router>
  );
};

export default App;