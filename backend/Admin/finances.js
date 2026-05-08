const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkRole } = require('../middleware/authRole');

// GET /api/admin/finances - Statistiques financières détaillées basées sur la facturation réelle
router.get('/', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    // 1. KPIs Globales (Chiffre d'affaires total, Payé, En attente)
    const [statsGlobales] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN statut = 'payee' THEN montant ELSE 0 END) as totalRevenus,
        SUM(CASE WHEN statut = 'en_attente' THEN montant ELSE 0 END) as totalEnAttente,
        COUNT(CASE WHEN statut = 'payee' THEN 1 END) as nbFacturesPayees,
        COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as nbFacturesAttente
      FROM factures
    `);

    // 2. Revenus mensuels (6 derniers mois)
    const [revenusMensuels] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date_facture, '%M') as mois,
        SUM(montant) as montant,
        COUNT(*) as nbFactures
      FROM factures
      WHERE statut = 'payee'
      AND date_facture >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date_facture, '%Y-%m')
      ORDER BY date_facture ASC
    `);

    // 3. Répartition par méthode de paiement
    const [methodesPaiement] = await pool.execute(`
      SELECT payment_method as methode, COUNT(*) as nb, SUM(montant) as total
      FROM factures
      WHERE statut = 'payee'
      GROUP BY payment_method
    `);

    // 4. Liste des dernières transactions détaillées
    const [transactions] = await pool.execute(`
      SELECT 
        f.id, 
        f.patient_nom as patient, 
        f.service, 
        f.montant, 
        f.payment_method as methode, 
        f.statut, 
        f.date_facture as date,
        f.patient_type
      FROM factures f
      ORDER BY f.created_at DESC
      LIMIT 50
    `);

    // 5. Statistiques du jour
    const [statsJour] = await pool.execute(`
      SELECT SUM(montant) as total, COUNT(*) as nb
      FROM factures
      WHERE date_facture = CURDATE() AND statut = 'payee'
    `);

    res.json({
      success: true,
      kpis: {
        totalRevenus: statsGlobales[0].totalRevenus || 0,
        totalEnAttente: statsGlobales[0].totalEnAttente || 0,
        nbFacturesPayees: statsGlobales[0].nbFacturesPayees || 0,
        nbFacturesAttente: statsGlobales[0].nbFacturesAttente || 0,
        revenusJour: statsJour[0].total || 0,
        nbVentesJour: statsJour[0].nb || 0
      },
      revenus: revenusMensuels,
      methodes: methodesPaiement,
      paiements: transactions,
      // Pour les graphiques
      statsChart: revenusMensuels.map(r => ({
        name: r.mois,
        revenue: parseFloat(r.montant)
      }))
    });

  } catch (error) {
    console.error('Erreur finances:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
