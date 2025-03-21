// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const User = require('./models/User');
const Shop = require('./models/Shop');
const Product=require('./models/product');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up Multer for temporary file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// JWT Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register endpoint (unchanged)
app.post('/api/register', async (req, res) => {
  const { username, email, password, location, contactNumber, role } = req.body;
  if (!['farmer', 'shopper'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be "farmer" or "shopper"' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      location,
      contactNumber,
      role,
    });
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Login endpoint (unchanged)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Get user profile (unchanged)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Get all shops (unchanged)
app.get('/api/shops', authenticateToken, async (req, res) => {
  try {
    const shops = await Shop.find().populate('userId', 'username email contactNumber');
    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Get shops created by the authenticated shopper (unchanged)
app.get('/api/my-shops', authenticateToken, async (req, res) => {
  if (req.user.role !== 'shopper') {
    return res.status(403).json({ message: 'Access denied. Shoppers only.' });
  }
  try {
    const shops = await Shop.find({ userId: req.user.userId }).populate('userId', 'username email contactNumber');
    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Add a shop (unchanged)
app.post('/api/shops', authenticateToken, async (req, res) => {
  if (req.user.role !== 'shopper') {
    return res.status(403).json({ message: 'Access denied. Shoppers only.' });
  }
  const { name, location, contactNumber } = req.body;
  try {
    const newShop = new Shop({
      name,
      location,
      contactNumber,
      userId: req.user.userId,
    });
    await newShop.save();
    res.status(201).json({ message: 'Shop added successfully', shop: newShop });
  } catch (error) {
    console.error('Error adding shop:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Get products by shop (unchanged)
app.get('/api/shops/:shopId/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId }).populate('shopId', 'name location contactNumber userId');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Search products by name (unchanged)
app.get('/api/products/search', authenticateToken, async (req, res) => {
  const { name } = req.query;
  try {
    const products = await Product.find({ name: { $regex: name, $options: 'i' } }).populate('shopId', 'name location contactNumber userId');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Add a product (updated to include amount)
app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'shopper') {
    return res.status(403).json({ message: 'Access denied. Shoppers only.' });
  }

  const { name, description, price, category, amount, shopId } = req.body; // Added amount
  let imageUrl;

  try {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    if (shop.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only add products to your own shops' });
    }

    // Upload image to Cloudinary if it exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'farmer-products',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Parse the amount field (sent as a JSON string)
    const parsedAmount = amount ? JSON.parse(amount) : { value: 0, unit: 'units' };

    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      amount: parsedAmount, // Add amount object
      shopId,
      image: imageUrl,
    });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Edit a product (updated to include amount)
app.put('/api/products/:productId', authenticateToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'shopper') {
    return res.status(403).json({ message: 'Access denied. Shoppers only.' });
  }

  const { productId } = req.params;
  const { name, description, price, category, amount } = req.body; // Added amount
  let imageUrl;

  try {
    // Find the product
    const product = await Product.findById(productId).populate('shopId');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify the product belongs to the shopper's shop
    if (product.shopId.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit products in your own shops' });
    }

    // If a new image is uploaded, upload it to Cloudinary and delete the old image
    if (req.file) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'farmer-products',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);

      // Delete the old image from Cloudinary if it exists
      if (product.image) {
        const publicId = product.image.split('/').slice(-2).join('/').split('.')[0]; // Extract public_id
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Parse the amount field (sent as a JSON string)
    const parsedAmount = amount ? JSON.parse(amount) : product.amount;

    // Update the product
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
    product.amount = parsedAmount; // Update amount
    if (imageUrl) {
      product.image = imageUrl;
    }

    await product.save();
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Delete a product (unchanged)
app.delete('/api/products/:productId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'shopper') {
    return res.status(403).json({ message: 'Access denied. Shoppers only.' });
  }

  const { productId } = req.params;

  try {
    // Find the product
    const product = await Product.findById(productId).populate('shopId');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify the product belongs to the shopper's shop
    if (product.shopId.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete products in your own shops' });
    }

    // Delete the image from Cloudinary if it exists
    if (product.image) {
      const publicId = product.image.split('/').slice(-2).join('/').split('.')[0]; // Extract public_id
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete the product from the database
    await Product.deleteOne({ _id: productId });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Get All Products (updated to include amount)
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }
    const products = await Product.find()
      .select('name price shopId image amount') // Added amount to selection
      .populate('shopId', 'name location');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});