const { validationResult } = require('express-validator');

/**
 * Global express-validator middleware.
 * Place after validator chains. If any rule fails, it formats all errors
 * into a consistent shape and passes them to the error handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  // Structured error that the global errorHandler understands
  const err = {
    name: 'ValidationError',
    status: 422, 
    message: formatted[0].message, // first error as top-level message
    details: formatted,            // all errors for field-level display
  };

  return next(err);
};

module.exports = validate;
