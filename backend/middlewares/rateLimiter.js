const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const generalLimiter = rateLimit({
    windowMs: config.RATE_LIMIT.WINDOW_MS,
    max: config.RATE_LIMIT.MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

const authLimiter = rateLimit({
    windowMs: config.RATE_LIMIT.WINDOW_MS,
    max: config.RATE_LIMIT.AUTH_MAX_REQUESTS,
    message: 'Too many login attempts, please try again after 15 minutes',
});

const searchLimiter = rateLimit({
    windowMs: config.RATE_LIMIT.SEARCH_WINDOW_MS,
    max: config.RATE_LIMIT.SEARCH_MAX_REQUESTS,
    message: 'Too many search requests, please try again after 1 minute',
});

module.exports = { generalLimiter, authLimiter, searchLimiter };  