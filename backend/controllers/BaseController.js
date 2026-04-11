const { loginUserSchema, addProductSchema, addCategorySchema, updateProfileSchema, addressSchema } = require('../utils/validation'); 
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

class BaseController {
  static asyncHandler = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  }

  static validateRequest = (schema, data) => {
    const { error, value } = schema.validate(data, { stripUnknown: true });
    if (error) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Validation error',
        details: error.details
      };
    }
    return value;
  }

  static loginValidation = (data) => {
     const { email, password } = data;
    if (!email || !password) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Email and password are required',
      };
    }
    const { error, value } = loginUserSchema.validate(data);
    if (error) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Validation error',
        details: error.details
      };
    }
    return value;
  }

  static addproductValidation = (req) => {
    const data = { ...req.body };
    if (data.weight === '') delete data.weight; 

    if (data.variants && typeof data.variants === 'string') {
      try {
        data.variants = JSON.parse(data.variants);
      } catch (e) {
        data.variants = [];
      }
    }
    if (data.variantType === 'none') {
      data.variants = [];
    }
    
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => f.filename);
      data.image = req.files[0].filename;
    } 
    else if (data.images && typeof data.images === 'string') {
      data.images = [data.images];
      data.image = data.images[0];
    }
    else if (Array.isArray(data.images) && data.images.every(img => typeof img === 'string')) {
      data.image = data.images[0];
    }
    else {
      data.images = [];
      data.image = '';
    }
    const { name, price, description, category, stock } = data;
    if (!name || !price || !description || !category || !stock) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'All fields are required',
      };
    }
    const { error, value } = addProductSchema.validate(data);
    if (error) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Validation error',
        details: error.details
      };
    }
    return { req, value };
  }   

  static addCategoryValidation = (data) => {
    const { name } = data;
    if (!name) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Category name is required',
      };
    }
    const { error, value } = addCategorySchema.validate(data);
    if (error) {
      throw { 
        name: 'ValidationError',
        status: 400, 
        message: 'Validation error',
        details: error.details
      };
    }
    return value;
  }   

  static handleFile = (file) => {
    if (!file) {
      throw { 
        name: 'FileError',
        status: 400, 
        message: 'File is required',
      };
    }
    return file.filename;
  }
}

module.exports = BaseController;