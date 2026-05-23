const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// -----------------------------------------------------
// GET patient notifications
// -----------------------------------------------------
router.get('/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT n.id, n.type AS statut, n.type, n.title, n.message, n.lu, n.created_at,
             n.id_reservation,
             r.date_rendez_vous, r.heure_rendez_vous,
             m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite AS medecin_specialite
      FROM notifications n
      LEFT JOIN reservation r ON n.id_reservation = r.id_reservation
      LEFT JOIN medecin m ON r.id_medecin = m.id
      WHERE n.id_patient = ?
      ORDER BY n.created_at DESC
    `, [patientId]);
    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('Error fetching patient notifications:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// -----------------------------------------------------
// Mark a notification as read
// -----------------------------------------------------
router.put('/patient/:id/lu', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('UPDATE notifications SET lu = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
