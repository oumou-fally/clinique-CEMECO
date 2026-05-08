const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ======================================================
// 👨‍⚕️ TOUS LES MÉDECINS AVEC STATS ET PLANNING DU JOUR
// ======================================================
router.get('/all-with-stats', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Liste de base des médecins
        const [medecins] = await pool.execute(`
            SELECT m.id, m.nom, m.prenom, m.specialite, m.telephone, m.email, m.statut, m.dernier_connexion
            FROM medecin m
            ORDER BY m.nom ASC
        `);

        // 2. Récupérer toutes les absences aujourd'hui
        const [absences] = await pool.execute(`
            SELECT medecin_id, type, date_fin 
            FROM absence_medecin 
            WHERE ? BETWEEN date_debut AND date_fin
        `, [today]);

        // 3. Récupérer le nombre de consultations aujourd'hui par médecin
        const [statsAujourdhui] = await pool.execute(`
            SELECT id_medecin, COUNT(*) as nb_consultations
            FROM reservation
            WHERE date_rendez_vous = ? AND statut IN ('confirme', 'termine')
            GROUP BY id_medecin
        `, [today]);

        // 4. Récupérer les créneaux du jour
        const [planningJour] = await pool.execute(`
            SELECT id_medecin, COUNT(*) as total_creneaux,
                   SUM(CASE WHEN statut = 'disponible' THEN 1 ELSE 0 END) as creneaux_libres
            FROM planning_medecin
            WHERE date_planning = ?
            GROUP BY id_medecin
        `, [today]);

        // Fusion des données
        const result = medecins.map(m => {
            const absence = absences.find(a => a.medecin_id === m.id);
            const stats = statsAujourdhui.find(s => s.id_medecin === m.id);
            const planning = planningJour.find(p => p.id_medecin === m.id);

            return {
                ...m,
                estAbsent: !!absence,
                typeAbsence: absence ? absence.type : null,
                retourPrevu: absence ? absence.date_fin : null,
                consultationsAujourdhui: stats ? stats.nb_consultations : 0,
                totalCreneaux: planning ? planning.total_creneaux : 0,
                creneauxLibres: planning ? planning.creneaux_libres : 0
            };
        });

        res.json({
            success: true,
            medecins: result,
            totalCount: medecins.length,
            statsGlobales: {
                totalMedecins: medecins.length,
                medecinsActifs: medecins.filter(m => m.statut === 'actif').length,
                enAbsence: absences.length
            }
        });

    } catch (error) {
        console.error('Erreur API Medecins Stats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ======================================================
// 📊 ANALYSE PERFORMANCE PLANNING (Hebdomadaire)
// ======================================================
router.get('/analyse-planning', async (req, res) => {
    try {
        const [analyse] = await pool.execute(`
            SELECT 
                m.id, m.nom, m.prenom, m.specialite,
                COUNT(r.id_reservation) as total_rendezvous,
                SUM(CASE WHEN r.statut = 'termine' THEN 1 ELSE 0 END) as termines,
                SUM(CASE WHEN r.statut = 'annule' THEN 1 ELSE 0 END) as annules,
                (SELECT COUNT(*) FROM planning_medecin WHERE id_medecin = m.id AND date_planning >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as creneaux_ouverts_7j
            FROM medecin m
            LEFT JOIN reservation r ON m.id = r.id_medecin
            WHERE r.date_rendez_vous >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY m.id
            ORDER BY total_rendezvous DESC
        `);

        res.json({ success: true, analyse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
