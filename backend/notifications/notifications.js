const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ======================================================
// 🔔 NOTIFICATIONS DU MÉDECIN
// ======================================================
router.get('/medecin/:medecinId', async (req, res) => {
  const { medecinId } = req.params
  try {
    const [rows] = await pool.execute(`
      SELECT n.id, n.type, n.message, n.lu, n.created_at,
             n.id_reservation,
             r.date_rendez_vous, r.heure_rendez_vous, r.motif,
             p.nom AS patient_nom, p.prenom AS patient_prenom,
             p.telephone AS patient_telephone, p.date_naissance AS patient_date_naissance
      FROM notifications n
      LEFT JOIN reservation r ON n.id_reservation = r.id_reservation
      LEFT JOIN patient p ON r.patient_id = p.id
      WHERE n.id_medecin = ?
      ORDER BY n.created_at DESC
    `, [medecinId])
    res.json({ success: true, notifications: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

// ======================================================
// 🔔 NOTIFICATIONS DU PATIENT
// ======================================================
router.get('/patient/:patientId', async (req, res) => {
  const { patientId } = req.params
  try {
    const [rows] = await pool.execute(`
      SELECT n.id, n.type, n.message, n.lu, n.created_at,
             n.id_reservation,
             r.date_rendez_vous, r.heure_rendez_vous,
             m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite
      FROM notifications n
      LEFT JOIN reservation r ON n.id_reservation = r.id_reservation
      LEFT JOIN medecin m ON r.medecin_id = m.id
      WHERE n.id_patient = ?
      ORDER BY n.created_at DESC
    `, [patientId])
    res.json({ success: true, notifications: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

// ======================================================
// ✅ MARQUER NOTIFICATION COMME LUE
// ======================================================
router.put('/:id/lu', async (req, res) => {
  const { id } = req.params
  try {
    await pool.execute('UPDATE notifications SET lu = 1 WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

module.exports = router;
