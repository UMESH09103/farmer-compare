// frontend/src/components/AddProductForm.jsx
import React, { useState } from 'react';

const AddProductForm = ({ shopId, onProductAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [amountValue, setAmountValue] = useState(''); // State for the amount value (e.g., 5)
  const [amountUnit, setAmountUnit] = useState(''); // State for the unit (e.g., kg)
  const [image, setImage] = useState(null); // State for the image file

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store the selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', Number(price));
    formData.append('category', category);
    // Send amount as a JSON string since FormData doesn't handle objects directly
    formData.append('amount', JSON.stringify({ value: Number(amountValue), unit: amountUnit }));
    formData.append('shopId', shopId);
    if (image) {
      formData.append('image', image); // Add the image file to the form data
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData, // Send FormData instead of JSON
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      alert('Product added successfully!');
      onProductAdded();
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setAmountValue(''); // Reset amount value
      setAmountUnit(''); // Reset amount unit
      setImage(null); // Reset the image input
    } catch (error) {
      console.error('Error adding product:', error);
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
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="amountValue" className="block text-text font-medium mb-1">Amount</label>
          <input
            type="number"
            id="amountValue"
            value={amountValue}
            onChange={(e) => setAmountValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            min="0"
            step="0.1"
            required
          />
        </div>
        <div className="flex-1">
          <label htmlFor="amountUnit" className="block text-text font-medium mb-1">Unit</label>
          <select
            id="amountUnit"
            value={amountUnit}
            onChange={(e) => setAmountUnit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          >
            <option value="">Select a unit</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="L">Liters (L)</option>
            <option value="mL">Milliliters (mL)</option>
            <option value="units">Units</option>
          </select>
        </div>
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
        <label htmlFor="image" className="block text-text font-medium mb-1">Product Image</label>
        <input
          type="file"
          id="image"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>
      <button
        type="submit"
        className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Add Product
      </button>
    </form>
  );
};

export default AddProductForm;