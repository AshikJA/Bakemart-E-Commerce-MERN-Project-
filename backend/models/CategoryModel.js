const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [30, 'Name cannot exceed 30 characters'],
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  }, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);
