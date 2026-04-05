const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');

// Get code suggestion
router.post('/code', protect, suggestionController.getCodeSuggestion);

module.exports = router;
