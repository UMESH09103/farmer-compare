// src/components/AddShopForm.jsx
import React, { useState } from 'react';

const AddShopForm = ({ onShopAdded }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(contactNumber)) {
      alert('Please enter a valid 10-digit contact number');
      return;
    }

    const payload = { name, location, contactNumber };
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      alert('Shop added successfully!');
      onShopAdded(data.shop);
      setName('');
      setLocation('');
      setContactNumber('');
    } catch (error) {
      console.error('Error adding shop:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-text font-medium mb-1">Shop Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-text font-medium mb-1">Location</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
      </div>
      <div>
        <label htmlFor="contactNumber" className="block text-text font-medium mb-1">Contact Number</label>
        <input
          type="tel"
          id="contactNumber"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Add Shop
      </button>
    </form>
  );
};

export default AddShopForm;