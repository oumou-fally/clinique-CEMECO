const express = require('express');
const router = express.Router();
const db = require('../config/db');

// INSCRIPTION UTILISATEUR
router.post('/register', (req, res) => {
  const { nom, email, mot_de_passe, role } = req.body;

  if (!nom || !email || !mot_de_passe || !role) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  const sql = `
    INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [nom, email, mot_de_passe, role], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: result.insertId
    });
  });
});

module.exports = router;