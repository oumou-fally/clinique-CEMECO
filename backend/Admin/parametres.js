const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Récupérer tous les types de consultation avec leurs prix
router.get('/types-consultation', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM type_consultation');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Mettre à jour le prix d'un type de consultation
router.put('/types-consultation/:id', async (req, res) => {
  const { id } = req.params;
  const { prix } = req.body;

  try {
    await pool.query('UPDATE type_consultation SET prix = ? WHERE id = ?', [prix, id]);
    res.json({
      success: true,
      message: 'Prix mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prix:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
