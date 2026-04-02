const Joi = require('joi');

const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required()
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  token: Joi.string().trim().required(),
  password: Joi.string().min(6).required()
});
  
const addProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  stock: Joi.number().required(),
  image: Joi.string().optional(),
  images: Joi.array().items(Joi.string()).min(1).required(),
  weight: Joi.number().allow('', null).optional()  
});

const addCategorySchema = Joi.object({
  name: Joi.string().min(2).max(30).trim().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().trim().required()
});

const addressSchema = Joi.object({
  name: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  street: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  pincode: Joi.string().trim().required(),
  isDefault: Joi.boolean()
});

module.exports = { 
  registerUserSchema, 
  loginUserSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  addProductSchema, 
  addCategorySchema,
  updateProfileSchema,
  addressSchema
};
