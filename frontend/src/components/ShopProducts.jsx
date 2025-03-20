// frontend/src/components/ShopProducts.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import EditProductForm from './EditProductForm.jsx';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const ShopProducts = () => {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [shop, setShop] = useState(null);
  const [user, setUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Fetch user profile
        const profileResponse = await fetch(`${apiUrl}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const profileData = await profileResponse.json();
        console.log('User Profile:', profileData); // Debug: Log user data
        setUser(profileData);

        // Fetch shop details and products
        const shopResponse = await fetch(`${apiUrl}/api/shops/${shopId}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!shopResponse.ok) {
          throw new Error('Failed to fetch shop details');
        }
        const shopData = await shopResponse.json();
        console.log('Shop Data:', shopData); // Debug: Log shop data
        setProducts(shopData);

        if (shopData.length > 0) {
          console.log('Shop Info:', shopData[0].shopId); // Debug: Log shopId details
          setShop(shopData[0].shopId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred. Please try again.');
        navigate('/login');
      }
    };

    fetchShopAndProducts();
  }, [shopId, navigate]);

  const handleProductUpdated = (updatedProduct) => {
    setEditLoading(true);
    setProducts((prev) =>
      prev.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
    setEditLoading(false);
    alert('Product updated successfully!');
  };

  const handleDeleteProduct = async (productId) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      setProducts((prev) => prev.filter((product) => product._id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteModal(null);
    }
  };

  if (!user || !shop) {
    return <div>Loading...</div>;
  }

  // Debug: Log values used to calculate isShopOwner
  console.log('User ID:', user._id);
  console.log('Shop User ID:', shop.userId);
  const isShopOwner = user && shop && user._id === (typeof shop.userId === 'object' ? shop.userId._id : shop.userId);
  console.log('Is Shop Owner:', isShopOwner);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-500 to-green-400">
      <Navbar user={user} />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-text mb-6">Shop Products - {shop.name}</h1>
        <div className="bg-card bg-gradient-to-b from-gray-400 to-green-300 rounded-lg shadow-md p-6">
          {products.length === 0 ? (
            <p className="text-muted">No products available in this shop.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-50 rounded-lg bg-gradient-to-b from-gray-300 to-green-200 shadow-sm p-4 hover:shadow-md transition-shadow duration-300 relative"
                >
                  {product.image ? (
                    <img
                      src={`${product.image}?w=300&h=200&c=fill&f=auto&q=auto&dpr=auto`}
                      alt={product.name}
                      className="w-full h-60 object-cover rounded-lg mb-4"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                      <span className="text-muted">No Image</span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-text">{product.name}</h3>
                  <p className="text-muted">{product.description}</p>
                  <p className="text-text font-medium">Price: ₹{product.price}</p>
                  <p className="text-muted">Category: {product.category}</p>
                  <p className="text-muted">Amount: {product.amount ? `${product.amount.value} ${product.amount.unit}` : 'N/A'}</p>
                  <p className="text-muted">Shop: {product.shopId.name}</p>
                  <p className="text-muted">Location: {product.shopId.location}</p>
                  <p className="text-muted">Contact: {product.shopId.contactNumber}</p>

                  {/* Show Edit and Delete buttons only for the shop owner */}
                  {isShopOwner && (
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex items-center space-x-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                        disabled={loading || editLoading}
                      >
                        <FiEdit />
                        <span>{editLoading && editingProduct?._id === product._id ? 'Saving...' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(product._id)}
                        className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        disabled={loading || editLoading}
                      >
                        <FiTrash2 />
                        <span>{loading && showDeleteModal === product._id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  )}

                  {/* Edit Product Form */}
                  {editingProduct && editingProduct._id === product._id && (
                    <div className="mt-4 bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
                      <h4 className="text-lg font-semibold text-text mb-4">Edit Product: {editingProduct.name}</h4>
                      <EditProductForm
                        product={editingProduct}
                        shopId={shopId}
                        onProductUpdated={handleProductUpdated}
                        onCancel={() => setEditingProduct(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-4">Confirm Deletion</h3>
            <p className="text-muted mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDeleteProduct(showDeleteModal)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProducts;