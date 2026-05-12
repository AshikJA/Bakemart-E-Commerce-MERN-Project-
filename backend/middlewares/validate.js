const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  const err = {
    name: 'ValidationError',
    status: 422, 
    message: formatted[0].message, // first error as top-level message
    details: formatted,            // all errors for field-level display
  };

  return next(err);
};

module.exports = validate;
