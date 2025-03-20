// frontend/src/components/ComparePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ComparePage = ({ user }) => {
  const { user: authUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      if (!authUser || authUser.role !== 'farmer') return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [authUser]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-500 to-yellow-100 mx-auto content-center">
      <div className="p-6 bg-card shadow-bg rounded-lg max-w-4xl bg-gradient-to-b from-blue-200 to-green-200 mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-text mb-6 text-center">
          Compare Products
        </h2>
        {/* Search Bar Section */}
        <div className="mb-6">
          <label
            htmlFor="search"
            className="block text-text font-medium mb-2"
          >
            Search Products
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary transition duration-200 placeholder-muted"
          />
        </div>
        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-orange-100">
                <th className="p-3 border border-black text-text font-medium text-left">
                  Name
                </th>
                <th className="p-3 border border-black text-text font-medium text-left">
                  Price
                </th>
                <th className="p-3 border border-black text-text font-medium text-left">
                  Shop
                </th>
                <th className="p-3 border border-black text-text font-medium text-left">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition duration-200"
                  >
                    <td className="p-3 border border-black text-text">
                      {product.name}
                    </td>
                    <td className="p-3 border border-black text-text">
                      Rs.{product.price}
                    </td>
                    <td className="p-3 border border-black text-text">
                      {product.shopId?.name || 'N/A'}
                    </td>
                    <td className="p-3 border border-black text-text">
                      {product.amount
                        ? `${product.amount.value} ${product.amount.unit}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-3 border border-black text-center text-muted"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
