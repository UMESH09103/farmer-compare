// frontend/src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome, FiShoppingBag, FiSearch } from 'react-icons/fi';

const Navbar = ({ user, isAuthPage = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
      {/* Website Heading */}
      <div className="text-xl font-bold">
        Farmer Price Compare
      </div>

      {/* Navigation Links (hidden on auth pages) */}
      {!isAuthPage && (
        <div className="flex space-x-4">
          {user && user.role === 'farmer' && (
            <>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-1 hover:text-secondary transition-colors"
              >
                <FiHome />
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/compare')}
                className="flex items-center space-x-1 hover:text-secondary transition-colors"
              >
                <FiSearch />
                <span>Compare</span>
              </button>
            </>
          )}
          {user && user.role === 'shopper' && (
            <>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-1 hover:text-secondary transition-colors"
              >
                <FiHome />
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/shopper-dashboard')}
                className="flex items-center space-x-1 hover:text-secondary transition-colors"
              >
                <FiShoppingBag />
                <span>Dashboard</span>
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 hover:text-secondary transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;