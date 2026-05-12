const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message || err);

  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  if (err.name === 'ValidationError') {
    statusCode = err.status || 422;
    message = err.message || 'Validation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the maximum limit of 5MB';
  } else if (err.message && err.message.includes('Invalid file type')) {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
