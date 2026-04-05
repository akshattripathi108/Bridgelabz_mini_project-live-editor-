const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const { protect } = require('../middleware/auth');

// Execute code
router.post('/execute', protect, executionController.executeCode);

// Get supported languages
router.get('/languages', executionController.getSupportedLanguages);

module.exports = router;
