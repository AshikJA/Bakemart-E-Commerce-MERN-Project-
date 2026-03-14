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

module.exports = { registerUserSchema, loginUserSchema, forgotPasswordSchema, resetPasswordSchema };