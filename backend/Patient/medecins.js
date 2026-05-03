const express = require('express');
const pool = require('../config/db');
const router = express.Router();

/**
 * @route   GET /api/patient/:patientId/mes-medecins
 * @desc    Récupérer la liste des médecins ayant déjà consulté le patient
 */
router.get('/:patientId/mes-medecins', async (req, res) => {
    const { patientId } = req.params;

    try {
        // On récupère les médecins qui ont au moins une réservation (confirmée ou terminée) avec ce patient
        const [medecins] = await pool.execute(`
            SELECT DISTINCT 
                m.id, 
                m.nom, 
                m.prenom, 
                m.specialite as specialty, 
                m.email, 
                m.telephone as phone,
                'CEMECO Cabinet de Cardiologie - Kipé' as location,
                4.8 as rating,
                150 as reviews,
                'Lun-Sam: 08:30-17:00' as availability
            FROM medecin m
            JOIN reservation r ON m.id = r.id_medecin
            WHERE r.patient_id = ?
        `, [patientId]);

        res.json({
            success: true,
            data: medecins
        });
    } catch (error) {
        console.error('Erreur récupération mes médecins:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
