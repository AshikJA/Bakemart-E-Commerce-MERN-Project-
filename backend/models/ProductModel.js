const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });


const ProductSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a non-negative number'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    image: {
      type: String,
      required: false,
    },
    images: [{
      type: String,
      required: false
    }],
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock must be a non-negative number'],
    },
    weight: {
      type: String,
      required: false,
    },
    variantType: {
      type: String,
      enum: ['weight', 'size', 'flavor', 'none'],
      default: 'none'
    },
    variants: [{
      name: { type: String },
      price: { type: Number },
      stock: { type: Number, default: 0 },
      sku: { type: String },
      isDefault: { type: Boolean, default: false }
    }],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0
    }
  }, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ stock: 1 });

module.exports = mongoose.model("Product", ProductSchema);