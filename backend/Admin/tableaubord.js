const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkRole } = require('../middleware/authRole');

/**
 * GET /api/admin/dashboard/stats
 * Analyse complète de la clinique pour le tableau de bord
 */
router.get('/stats', checkRole(['super_admin', 'admin']), async (req, res) => {
    try {
        // 1. Chiffres clés (KPIs)
        const [[kpis]] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM patient) as totalPatients,
                (SELECT COUNT(*) FROM medecin) as totalMedecins,
                (SELECT COUNT(*) FROM reservation WHERE DATE(date_rendez_vous) = CURDATE()) as rdvAujourdhui,
                (SELECT COALESCE(SUM(montant), 0) FROM factures WHERE statut = 'payee') as revenuTotal
        `);

        // 2. Analyse Médicale : Top médecins par activité (30 derniers jours)
        const [topMedecins] = await pool.execute(`
            SELECT m.nom, m.prenom, m.specialite, COUNT(r.id_reservation) as nb_consultations
            FROM medecin m
            LEFT JOIN reservation r ON m.id = r.id_medecin AND r.statut = 'termine'
            WHERE r.date_rendez_vous >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) OR r.id_reservation IS NULL
            GROUP BY m.id
            ORDER BY nb_consultations DESC
            LIMIT 5
        `);

        // 3. Analyse Financière : Revenus par type de consultation
        const [revenusParType] = await pool.execute(`
            SELECT service as nom, SUM(montant) as total, COUNT(*) as nb
            FROM factures
            WHERE statut = 'payee'
            GROUP BY service
            ORDER BY total DESC
        `);

        // 4. Activité Récente (UNION avec conversion de collation pour éviter les erreurs)
        const [activites] = await pool.execute(`
            (SELECT 
                CONVERT('Nouvelle Facture' USING utf8mb4) as type, 
                CONVERT(patient_nom USING utf8mb4) as sujet, 
                CONVERT(montant USING utf8mb4) as info, 
                created_at as date 
             FROM factures 
             ORDER BY created_at DESC LIMIT 5)
            UNION ALL
            (SELECT 
                CONVERT('Nouveau RDV' USING utf8mb4) as type, 
                CONVERT(CONCAT(p.prenom, ' ', p.nom) USING utf8mb4) as sujet, 
                CONVERT(r.motif USING utf8mb4) as info, 
                r.date_rendez_vous as date 
             FROM reservation r 
             JOIN patient p ON r.patient_id = p.id 
             ORDER BY r.id_reservation DESC LIMIT 5)
            ORDER BY date DESC
            LIMIT 10
        `);

        // 5. Répartition des patients (basée sur la facturation)
        const [[patientsType]] = await pool.execute(`
            SELECT 
                COUNT(CASE WHEN patient_type = 'insured' THEN 1 END) as assures,
                COUNT(CASE WHEN patient_type = 'non-insured' THEN 1 END) as nonAssures
            FROM factures
        `);

        
        res.json({
            success: true,
            kpis,
            medicalAnalysis: {
                topMedecins
            },
            financialAnalysis: {
                revenusParType
            },
            recentActivity: activites,
            patientDistribution: {
                assures: patientsType.assures || 0,
                nonAssures: patientsType.nonAssures || 0
            }
        });

    } catch (error) {
        console.error('Erreur dashboard admin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

module.exports = router;
