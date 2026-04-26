const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Base route for stats
router.get('/', async (req, res) => {
    try {
        res.json({ success: true, message: 'Stats API is working' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
