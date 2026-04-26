const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Récupérer toutes les absences
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT a.*, m.nom, m.prenom 
      FROM absence_medecin a 
      JOIN medecin m ON a.medecin_id = m.id
      ORDER BY a.date_debut DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter une absence
router.post('/', async (req, res) => {
  const { medecin_id, date_debut, date_fin, type, commentaire } = req.body;
  
  if (!medecin_id || !date_debut || !date_fin || !type) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO absence_medecin (medecin_id, date_debut, date_fin, type, commentaire) VALUES (?, ?, ?, ?, ?)',
      [medecin_id, date_debut, date_fin, type, commentaire]
    );
    res.status(201).json({ id: result.insertId, message: 'Absence ajoutée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'absence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une absence
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM absence_medecin WHERE id = ?', [id]);
    res.json({ message: 'Absence supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'absence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
