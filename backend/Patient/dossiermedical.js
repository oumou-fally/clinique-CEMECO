const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Récupérer l'ensemble du dossier médical d'un patient par son ID
router.get('/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        // 1. Récupérer les informations du patient
        const [patientRows] = await pool.execute(
            'SELECT id, nom, prenom, email, telephone, date_naissance, sexe, commune, quartier FROM patient WHERE id = ?',
            [patientId]
        );

        if (patientRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient non trouvé' });
        }

        const patient = patientRows[0];

        // 2. Récupérer les consultations avec les informations du docteur
        const [consultations] = await pool.execute(`
            SELECT 
                c.*, 
                r.date_rendez_vous, 
                r.heure_rendez_vous, 
                r.motif,
                m.nom as medecin_nom, 
                m.prenom as medecin_prenom, 
                m.specialite as medecin_specialite
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id_reservation
            JOIN medecin m ON c.id_medecin = m.id
            WHERE r.patient_id = ?
            ORDER BY c.date_consultation DESC
        `, [patientId]);

        // 3. Récupérer les ordonnances avec les informations du docteur
        const [ordonnancesRows] = await pool.execute(`
            SELECT 
                o.*, 
                c.date_consultation,
                m.nom as medecin_nom, 
                m.prenom as medecin_prenom,
                m.specialite as medecin_specialite
            FROM ordonnance o
            JOIN consultation c ON o.id_consultation = c.id
            JOIN medecin m ON c.id_medecin = m.id
            JOIN reservation r ON c.id_reservation = r.id_reservation
            WHERE r.patient_id = ?
            ORDER BY o.date_ordination DESC
        `, [patientId]);

        // Parser le JSON des médicaments pour chaque ordonnance
        const ordonnances = ordonnancesRows.map(ord => {
            let parsedMedicaments = [];
            try {
                parsedMedicaments = typeof ord.medicaments === 'string' ? JSON.parse(ord.medicaments) : ord.medicaments;
            } catch (e) {
                console.error('Erreur parsing medicaments:', e);
            }
            return {
                ...ord,
                medicaments: parsedMedicaments
            };
        });

        res.json({
            success: true,
            data: {
                patient,
                consultations,
                ordonnances
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du dossier médical:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération du dossier' });
    }
});

module.exports = router;
