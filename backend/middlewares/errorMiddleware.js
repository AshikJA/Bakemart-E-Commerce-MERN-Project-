const errorHandler = (err, req, res, next) => {
  console.error('Error stack:', err.stack || err);

  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;


  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation Error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
