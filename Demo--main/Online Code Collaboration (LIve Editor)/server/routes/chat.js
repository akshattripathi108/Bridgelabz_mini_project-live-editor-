const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Send message to AI
router.post('/message', protect, chatController.sendMessage);

// Get chat history for a room
router.get('/history/:roomId', protect, chatController.getChatHistory);

// Clear chat history
router.delete('/history/:roomId', protect, chatController.clearChatHistory);

module.exports = router;
