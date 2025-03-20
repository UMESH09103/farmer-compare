// frontend/src/components/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FiSearch, FiX, FiEye } from 'react-icons/fi';

const Home = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [products, setProducts] = useState({});
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopsAndProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const profileResponse = await fetch(`${apiUrl}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const profileData = await profileResponse.json();
        setUser(profileData);

        const shopsResponse = await fetch(`${apiUrl}/api/shops`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!shopsResponse.ok) {
          throw new Error('Failed to fetch shops');
        }
        const shopsData = await shopsResponse.json();
        setShops(shopsData);
        setFilteredShops(shopsData);

        const productsData = {};
        for (const shop of shopsData) {
          const productsResponse = await fetch(`${apiUrl}/api/shops/${shop._id}/products`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (productsResponse.ok) {
            const shopProducts = await productsResponse.json();
            productsData[shop._id] = shopProducts.length > 0 ? shopProducts : [];
          } else {
            productsData[shop._id] = [];
          }
        }
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      }
    };

    fetchShopsAndProducts();
  }, [navigate]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredShops(shops);
    } else {
      const filtered = shops.filter((shop) =>
        shop.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredShops(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredShops(shops);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-500">
      <Navbar user={user} />
      <div className="container mx-auto p-6">
        {/* Dashboard Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold gradient-header">Farmer Dashboard</h1>
          <p className="text-muted mt-2 text-lg">Explore shops and compare products</p>
        </div>

        {/* Shops Section */}
        <div className="bg-card rounded-xl bg-green-50 shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-text mb-4 gradient-header">Available Shops</h2>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto glassmorphism rounded-lg shadow-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-muted" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search shops by name..."
                className="w-full pl-10 pr-10 py-3 bg-gray-0 rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-secondary transition-colors"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {filteredShops.length === 0 ? (
            <p className="text-muted text-center">
              {searchQuery ? 'No shops match your search.' : 'No shops available.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop, index) => (
                <div
                  key={shop._id}
                  className="gradient-border bg-white rounded-lg p-5 card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-lg  font-semibold text-text mb-2">{shop.name}</h3>
                  <p className=" mb-1">Location: {shop.location}</p>
                  <p className=" mb-3">Contact: {shop.contactNumber}</p>

                  {/* Product Count Badge */}
                  <div className="mb-4">
                    {products[shop._id] ? (
                      products[shop._id].length > 0 ? (
                        <span className="product-badge">
                          {products[shop._id].length} products
                        </span>
                      ) : (
                        <span className="">No products available</span>
                      )
                    ) : (
                      <span className="">No products available</span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    {products[shop._id]?.length > 0 ? (
                      <button
                        onClick={() => navigate(`/shop/${shop._id}`)}
                        className="flex items-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        <FiEye />
                        <span>View Products</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                      >
                        <FiEye />
                        <span>View Products</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;