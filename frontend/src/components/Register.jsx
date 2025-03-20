// frontend/src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import farmerBackground from '../assets/farmer-background.jpg'; // Import the background image

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, location, contactNumber, role }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative "
      style={{
        backgroundImage: `url(${farmerBackground})`,
      }}
    >
      {/* Overlay for readability */}
      <div className=" absolute height-100 inset-0 bg-black bg-opacity-50"></div>

      {/* Form Card */}
      <div className="relative max-w-md w-full bg-card bg-opacity-70 rounded-lg bg-gradient-to-b from-gray-400 to-green-300 shadow-lg p-8 animate-fade-in">
        {/* Header */}
        <h2 className="text-3xl font-bold text-text text-center mb-6">Register</h2>
        <p className=" text-center mb-8">Create an account to start managing shops or comparing prices.</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-text font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all bg-white bg-opacity-80"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-text font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all bg-white bg-opacity-80"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-text font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all bg-white bg-opacity-80"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-text font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all bg-white bg-opacity-80"
              placeholder="Enter your location"
              required
            />
          </div>
          <div>
            <label htmlFor="contactNumber" className="block text-text font-medium mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all bg-white bg-opacity-80"
              placeholder="Enter your contact number"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-text font-medium mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all bg-white bg-opacity-80"
              required
            >
              <option value="">Select your role</option>
              <option value="farmer">Farmer</option>
              <option value="shopper">Shopper</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-secondary text-black py-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-muted mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-secondary hover:underline focus:outline-none"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;