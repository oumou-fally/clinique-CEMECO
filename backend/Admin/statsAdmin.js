const express = require('express');
const pool = require('../config/db');
const router = express.Router();

/**
 * GET /api/admin/stats
 * Récupère les statistiques globales pour le tableau de bord admin
 */
router.get('/', async (req, res) => {
  try {
    // 1. Nombre de patients actifs
    const [patientCount] = await pool.execute('SELECT COUNT(*) as total FROM patient');
    
    // 2. Rendez-vous aujourd'hui
    const [todayAppts] = await pool.execute(
      'SELECT COUNT(*) as total FROM reservation WHERE DATE(date_rendez_vous) = CURDATE()'
    );

    // 3. Dossiers médicaux disponibles
    const [recordCount] = await pool.execute('SELECT COUNT(*) as total FROM rapport_medical');

    // 4. Nombre de médecins
    const [medecinCount] = await pool.execute('SELECT COUNT(*) as total FROM medecin');

    // 5. Liste complète des rendez-vous (pour Supervision)
    const [allReservations] = await pool.execute(`
      SELECT r.id_reservation AS id, r.date_rendez_vous, r.heure_rendez_vous as heure, 
             p.nom as patient_nom, p.prenom as patient_prenom, 
             m.nom as medecin_nom, r.statut
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      JOIN medecin m ON r.id_medecin = m.id
      ORDER BY r.date_rendez_vous DESC
    `);

    // 6. Liste complète des patients / dossiers (pour Supervision)
    const [allPatients] = await pool.execute(`
      SELECT p.id, p.nom, p.prenom, p.telephone, p.date_inscription,
             (SELECT COUNT(*) FROM rapport_medical WHERE id_patient = p.id) as consultations
      FROM patient p
      ORDER BY p.nom ASC
    `);

    res.json({
      success: true,
      metrics: {
        patients: patientCount[0].total,
        todayAppointments: todayAppts[0].total,
        medicalRecords: recordCount[0].total,
        medecins: medecinCount[0].total
      },
      reservations: allReservations,
      patients: allPatients
    });

  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
