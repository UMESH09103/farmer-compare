// backend/models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  amount: { // Added amount field as an object
    value: { type: Number, required: true },
    unit: { type: String, required: true, enum: ['kg', 'g', 'L', 'mL', 'units'] },
  },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  image: { type: String }, // URL from Cloudinary
});

module.exports = mongoose.model('Product', productSchema);