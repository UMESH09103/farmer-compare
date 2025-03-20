// frontend/src/components/EditProductForm.jsx
import React, { useState } from 'react';

const EditProductForm = ({ product, shopId, onProductUpdated, onCancel }) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price.toString());
  const [category, setCategory] = useState(product.category);
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', Number(price));
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      alert('Product updated successfully!');
      onProductUpdated(data.product);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <div>
        <label htmlFor="name" className="block text-text font-medium mb-1">Product Name</label>
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
        <label htmlFor="description" className="block text-text font-medium mb-1">Description</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-text font-medium mb-1">Price</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-text font-medium mb-1">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          required
        >
          <option value="">Select a category</option>
          <option value="fertilizer">Fertilizer</option>
          <option value="insecticide">Insecticide</option>
          <option value="seed">Seed</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="image" className="block text-text font-medium mb-1">Product Image (optional)</label>
        {product.image && (
          <div className="mb-2">
            <p className="text-muted">Current Image:</p>
            <img
              src={product.image}
              alt="Current product"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
        <input
          type="file"
          id="image"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Update Product
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;