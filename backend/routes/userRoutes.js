const express = require('express');
const router = express.Router();

// Import controller
const userController = require('../controllers/userController');

// Routes
router.get('/', userController.getUsers);
router.post('/', userController.createUser);

module.exports = router;