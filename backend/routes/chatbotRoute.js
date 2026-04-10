const express = require('express');
const ChatbotController = require('../controllers/ChatbotController');
const router = express.Router();

// Get chatbot reply
router.post('/', ChatbotController.chatbotReply);

module.exports = router;