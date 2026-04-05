const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// All project routes are protected
router.use(protect);

// Create, get user projects
router.post('/', projectController.createProject);
router.get('/user/projects', projectController.getUserProjects);

// Specific project operations
router.get('/:roomId', projectController.getProject);
router.post('/join/:roomId', projectController.joinProject);
router.put('/:roomId', projectController.updateProject);
router.delete('/:roomId', projectController.deleteProject);

module.exports = router;
