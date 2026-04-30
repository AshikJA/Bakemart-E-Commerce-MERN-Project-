const { body } = require('express-validator');

const addBannerValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),

  body('url')
    .optional()
    .trim()
    .isURL().withMessage('Please enter a valid URL'),
];

const updateBannerValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),

  body('url')
    .optional()
    .trim()
    .isURL().withMessage('Please enter a valid URL'),
];

module.exports = {
  addBannerValidator,
  updateBannerValidator,
};