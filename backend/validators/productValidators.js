const { body, query } = require('express-validator');

// ── Admin: Product ──────────────────────────────────────────────────────────

const addProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// ── Admin: Category ─────────────────────────────────────────────────────────

const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Category name must be 2–30 characters'),
];

// ── Public: Filter Products ──────────────────────────────────────────────────

const filterProductsValidator = [
  body('checked')
    .optional()
    .isArray().withMessage('Checked categories must be an array'),

  body('radio')
    .optional()
    .isArray({ min: 0, max: 2 }).withMessage('Price range must be an array of [min, max]'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
];

// ── Public: Product Review ──────────────────────────────────────────────────

const reviewValidator = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
];

// ── Admin: Login ────────────────────────────────────────────────────────────

const adminLoginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Admin email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = {
  addProductValidator,
  categoryValidator,
  filterProductsValidator,
  reviewValidator,
  adminLoginValidator,
};
