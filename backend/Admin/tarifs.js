const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkRole } = require('../middleware/authRole');

// GET /api/admin/tarifs - Récupérer tous les tarifs
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM type_consultation ORDER BY nom ASC');
    res.json({
      success: true,
      tarifs: rows
    });
  } catch (error) {
    console.error('Erreur récupération tarifs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/admin/tarifs - Ajouter un nouveau type de consultation
router.post('/', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { nom, prix } = req.body;
    if (!nom || !prix) {
      return res.status(400).json({ success: false, message: 'Nom et prix requis' });
    }

    const [result] = await pool.execute(
      'INSERT INTO type_consultation (nom, prix) VALUES (?, ?)',
      [nom, prix]
    );

    res.status(201).json({
      success: true,
      message: 'Tarif ajouté avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur ajout tarif:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/admin/tarifs/:id - Modifier un tarif existant
router.put('/:id', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prix } = req.body;

    if (!nom || !prix) {
      return res.status(400).json({ success: false, message: 'Nom et prix requis' });
    }

    await pool.execute(
      'UPDATE type_consultation SET nom = ?, prix = ? WHERE id = ?',
      [nom, prix, id]
    );

    res.json({ success: true, message: 'Tarif mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur modification tarif:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/admin/tarifs/:id - Supprimer un tarif
router.delete('/:id', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Optionnel : vérifier si ce type de consultation est utilisé dans des réservations
    const [usage] = await pool.execute('SELECT id FROM reservation WHERE type_consultation = (SELECT nom FROM type_consultation WHERE id = ?) LIMIT 1', [id]);
    
    // Note: cette vérification dépend de si reservation stocke le NOM ou l'ID. 
    // Dans beaucoup d'implémentations précédentes, on stockait le NOM.
    
    await pool.execute('DELETE FROM type_consultation WHERE id = ?', [id]);

    res.json({ success: true, message: 'Tarif supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression tarif:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
