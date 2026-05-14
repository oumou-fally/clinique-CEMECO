const express = require('express');
const pool = require('../config/db');
const router = express.Router();

/**
 * @route   GET /api/patient/:patientId/dashboard
 * @desc    Récupérer toutes les données du tableau de bord patient (Stats synchronisées avec le dossier médical)
 */
router.get('/:patientId', async (req, res) => {
    const { patientId } = req.params;
    console.log(`📊 Requête Dashboard pour Patient ID: ${patientId}`);

    try {
        // 1. Prochains rendez-vous (Confirmés ou Attribués)
        const [rdv] = await pool.execute(`
            SELECT 
                r.id_reservation AS id, 
                r.date_rendez_vous, 
                r.heure_rendez_vous, 
                r.motif, 
                r.statut,
                m.nom as medecin_nom, 
                m.prenom as medecin_prenom, 
                m.specialite
            FROM reservation r
            LEFT JOIN medecin m ON r.id_medecin = m.id
            WHERE r.patient_id = ? 
            AND r.date_rendez_vous >= CURDATE()
            AND r.statut IN ('confirme', 'attribue', 'attente', 'reporte')
            ORDER BY r.date_rendez_vous ASC, r.heure_rendez_vous ASC
            LIMIT 5
        `, [patientId]);

        // 2. Statistiques réelles basées sur l'activité médicale
        const [statsRows] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM reservation WHERE patient_id = ? AND statut != 'annule') as rdv_count,
                (SELECT COUNT(DISTINCT id_medecin) FROM reservation WHERE patient_id = ? AND id_medecin IS NOT NULL) as medecin_count,
                (SELECT COUNT(*) FROM consultation c JOIN reservation r ON c.id_reservation = r.id_reservation WHERE r.patient_id = ?) as dossier_count
        `, [patientId, patientId, patientId]);

        const stats = statsRows[0];
        console.log('📈 Stats synchronisées Dossier:', stats);

        // 3. Infos médicales (Profil)
        const [patient] = await pool.execute(`
            SELECT groupe_sanguin, allergies, antecedent_familial, antecedent_personnel
            FROM patient 
            WHERE id = ?
        `, [patientId]);

        res.json({
            success: true,
            data: {
                appointments: rdv,
                stats: {
                    rdv_count: stats.rdv_count || 0,
                    medecin_count: stats.medecin_count || 0,
                    dossier_count: stats.dossier_count || 0
                },
                profile: patient[0] || {}
            }
        });

    } catch (error) {
        console.error('❌ Erreur dashboard patient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
