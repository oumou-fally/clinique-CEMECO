const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Récupérer tous les types de consultation
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT nom, prix FROM type_consultation');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types de consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des types de consultation'
    });
  }
});

module.exports = router;
