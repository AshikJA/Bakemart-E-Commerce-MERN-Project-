const { loginUserSchema, addProductSchema, addCategorySchema, updateProfileSchema, addressSchema } = require('../utils/validation'); 

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

  static addproductValidation = (data) => {
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
    return value;
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
    return file;
  }
}

module.exports = BaseController;