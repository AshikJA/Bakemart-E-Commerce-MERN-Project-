module.exports = {

  PORT: process.env.PORT || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/Project03",

  JWT_SECRET: process.env.JWT_SECRET || "Fazil@123",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "7d",

  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes  
    MAX_REQUESTS: 200,
    AUTH_MAX_REQUESTS: 5,
    SEARCH_WINDOW_MS: 1 * 60 * 1000, // 1 minute
    SEARCH_MAX_REQUESTS: 30,
  },

  CORS: {
    ORIGIN: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://192.168.1.111:5173'],
    CREDENTIALS: true,
    METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || "AdminSecret123",
  ADMIN_JWT_EXPIRATION: process.env.ADMIN_JWT_EXPIRATION || "7d",
  
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT || 465,
  SMTP_USER: process.env.SMTP_USER || "ashikjattipalla21@gmail.com",
  SMTP_PASS: process.env.SMTP_PASS || "hmwrtncggxymhfaq",
  SMTP_FROM: process.env.SMTP_FROM || "BackeMart <ashikjattipalla21@gmail.com>",

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID  || "rzp_test_SXstDQaeqh7PUy",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "v2NE2NO139KPyPnwuEYwUYnj",
};