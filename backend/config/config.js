module.exports = {
  PORT: process.env.PORT || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/Project03",

  JWT_SECRET: process.env.JWT_SECRET || "Fazil@123",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "7d",

  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || "AdminSecret123",
  ADMIN_JWT_EXPIRATION: process.env.ADMIN_JWT_EXPIRATION || "7d",
  
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT || 465,
  SMTP_USER: process.env.SMTP_USER || "ashikjattipalla21@gmail.com",
  SMTP_PASS: process.env.SMTP_PASS || "hmwrtncggxymhfaq",
  SMTP_FROM: process.env.SMTP_FROM || "BackeMart <ashikjattipalla21@gmail.com>",
};
