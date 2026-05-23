const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { checkRole } = require('../middleware/authRole');

// GET /api/admin/finances - Statistiques financières détaillées basées sur la facturation réelle
router.get('/', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const hasFilter = debut && fin;
    
    const filterSql = hasFilter ? 'WHERE date_facture BETWEEN ? AND ?' : '';
    const filterSqlAnd = hasFilter ? 'AND date_facture BETWEEN ? AND ?' : '';
    const params = hasFilter ? [debut, fin] : [];

    // 1. KPIs Globales (Chiffre d'affaires total, Payé, En attente, Parts Assurance & Patient)
    const [statsGlobales] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN statut = 'payee' THEN montant ELSE 0 END) as totalRevenus,
        SUM(CASE WHEN statut = 'payee' THEN montant_patient ELSE 0 END) as totalRevenusPatient,
        SUM(CASE WHEN statut = 'payee' THEN montant_assurance ELSE 0 END) as totalRevenusAssurance,
        SUM(CASE WHEN statut = 'en_attente' THEN montant ELSE 0 END) as totalEnAttente,
        SUM(CASE WHEN statut = 'en_cours_validation' THEN montant ELSE 0 END) as totalValidation,
        COUNT(CASE WHEN statut = 'payee' THEN 1 END) as nbFacturesPayees,
        COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as nbFacturesAttente,
        COUNT(CASE WHEN statut = 'en_cours_validation' THEN 1 END) as nbFacturesValidation
      FROM factures
      ${filterSql}
    `, params);

    // 2. Revenus mensuels (6 derniers mois ou période filtrée)
    let revenusSql = `
      SELECT 
        DATE_FORMAT(date_facture, '%Y-%m') as tri,
        DATE_FORMAT(date_facture, '%M') as mois,
        SUM(montant) as montant,
        COUNT(*) as nbFactures
      FROM factures
      WHERE statut = 'payee'
    `;
    let revenusParams = [];
    if (hasFilter) {
      revenusSql += ` AND date_facture BETWEEN ? AND ? `;
      revenusParams = [debut, fin];
    } else {
      revenusSql += ` AND date_facture >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) `;
    }
    revenusSql += `
      GROUP BY DATE_FORMAT(date_facture, '%Y-%m')
      ORDER BY tri ASC
    `;
    const [revenusMensuels] = await pool.execute(revenusSql, revenusParams);

    // 3. Répartition par méthode de paiement (Somme des encaissements des patients)
    const [methodesPaiement] = await pool.execute(`
      SELECT payment_method as methode, COUNT(*) as nb, SUM(montant_patient) as total
      FROM factures
      WHERE statut = 'payee'
      ${filterSqlAnd}
      GROUP BY payment_method
    `, params);

    // 3.b Répartition par compagnie d'assurance (Créances/Sinistres déclarés)
    const [assurancesStats] = await pool.execute(`
      SELECT insurance_provider as assurance, COUNT(*) as nb, SUM(montant_assurance) as total
      FROM factures
      WHERE statut = 'payee' AND patient_type = 'insured'
      ${filterSqlAnd}
      GROUP BY insurance_provider
    `, params);

    // 4. Liste des transactions détaillées (limitée si non filtrée)
    let transactionsSql = `
      SELECT 
        f.id, 
        f.patient_nom as patient, 
        f.service, 
        f.montant, 
        f.montant_patient,
        f.montant_assurance,
        f.coverage_rate,
        f.insurance_provider,
        f.insurance_number,
        f.cheque_number,
        f.cheque_holder,
        f.bank_name,
        f.orange_transaction_id,
        f.validation_ref,
        f.payment_method as methode, 
        f.statut, 
        f.date_facture as date,
        f.patient_type
      FROM factures f
      ${filterSql}
      ORDER BY f.created_at DESC
    `;
    if (!hasFilter) {
      transactionsSql += ` LIMIT 50 `;
    }
    const [transactions] = await pool.execute(transactionsSql, params);

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
        totalRevenusPatient: statsGlobales[0].totalRevenusPatient || 0,
        totalRevenusAssurance: statsGlobales[0].totalRevenusAssurance || 0,
        totalEnAttente: statsGlobales[0].totalEnAttente || 0,
        totalValidation: statsGlobales[0].totalValidation || 0,
        nbFacturesPayees: statsGlobales[0].nbFacturesPayees || 0,
        nbFacturesAttente: statsGlobales[0].nbFacturesAttente || 0,
        nbFacturesValidation: statsGlobales[0].nbFacturesValidation || 0,
        revenusJour: statsJour[0].total || 0,
        nbVentesJour: statsJour[0].nb || 0
      },
      revenus: revenusMensuels,
      methodes: methodesPaiement,
      assurances: assurancesStats,
      paiements: transactions,
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

// Récupérer toutes les factures payées par assurance
router.get('/assurances/payees', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { debut, fin, assurance } = req.query;
    const conditions = ['f.statut = "payee"', 'f.patient_type = "insured"'];
    const params = [];

    if (debut && fin) {
      conditions.push('f.date_facture BETWEEN ? AND ?');
      params.push(debut, fin);
    }
    if (assurance) {
      conditions.push('f.insurance_provider = ?');
      params.push(assurance);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.execute(`
      SELECT 
        f.*, 
        p.prenom AS patient_prenom,
        p.nom AS patient_nom_db,
        p.telephone,
        p.email,
        p.quartier,
        p.commune
      FROM factures f
      JOIN patient p ON f.patient_id = p.id
      ${whereClause}
      ORDER BY f.date_facture DESC
    `, params);

    res.json({ success: true, factures: rows });
  } catch (error) {
    console.error('Erreur récupération factures payées par assurance:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Approuver la validation d'une facture d'assurance
router.patch('/:id/valider', checkRole(['super_admin', 'admin']), async (req, res) => {
  const { id } = req.params;
  const { validation_ref } = req.body || {};
  try {
    const [factures] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);
    if (factures.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    const facture = factures[0];
    if (facture.patient_type !== 'insured') {
      return res.status(400).json({ success: false, message: "Cette facture ne concerne pas un patient assuré." });
    }

    // Mettre à jour la facture
    await pool.execute('UPDATE factures SET statut = "payee", validation_ref = ? WHERE id = ?', [validation_ref || null, id]);

    // Récupérer la nouvelle facture
    const [updated] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);

    // Enregistrer historique
    try {
      await pool.execute(
        'INSERT INTO facture_history (facture_id, action, old_value, new_value, user_role, user_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, 'admin_validate', JSON.stringify(facture || {}), JSON.stringify(updated[0] || {}), req.headers['x-admin-role'] || 'admin', req.headers['x-user-id'] || null, validation_ref || null]
      );
    } catch (err) {
      console.error('Erreur enregistrement historique admin valider:', err);
    }

    res.json({ success: true, message: 'Remboursement d\'assurance validé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la validation du remboursement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Rejeter la validation d'une facture d'assurance (retourner en attente)
router.patch('/:id/rejeter', checkRole(['super_admin', 'admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const [factures] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);
    if (factures.length === 0) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée' });
    }

    const facture = factures[0];
    if (facture.patient_type !== 'insured') {
      return res.status(400).json({ success: false, message: "Cette facture ne concerne pas un patient assuré." });
    }

    // Mettre la facture en attente et supprimer la référence
    await pool.execute('UPDATE factures SET statut = "en_attente", validation_ref = NULL WHERE id = ?', [id]);

    // Récupérer la nouvelle facture
    const [updated] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);

    // Enregistrer historique
    try {
      await pool.execute(
        'INSERT INTO facture_history (facture_id, action, old_value, new_value, user_role, user_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, 'admin_reject', JSON.stringify(facture || {}), JSON.stringify(updated[0] || {}), req.headers['x-admin-role'] || 'admin', req.headers['x-user-id'] || null, null]
      );
    } catch (err) {
      console.error('Erreur enregistrement historique admin rejeter:', err);
    }

    res.json({ success: true, message: 'Demande de remboursement rejetée. La facture est revenue en attente.' });
  } catch (error) {
    console.error('Erreur lors du rejet du remboursement:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});


// Récupérer les demandes de validation / portefeuille assurances (Admin)
router.get('/assurances/validation-requests', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const conditions = ['f.patient_type = "insured"', 'f.statut IN ("en_attente","en_cours_validation","payee")'];
    const params = [];
    if (debut && fin) {
      conditions.push('f.date_facture BETWEEN ? AND ?');
      params.push(debut, fin);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await pool.execute(`
      SELECT f.*, p.prenom AS patient_prenom, p.nom AS patient_nom_db, p.telephone, p.email, p.quartier, p.commune
      FROM factures f
      JOIN patient p ON f.patient_id = p.id
      ${where}
      ORDER BY f.updated_at DESC
    `, params);

    const counts = rows.reduce((acc, r) => {
      acc.total = (acc.total || 0) + 1;
      acc[r.statut] = (acc[r.statut] || 0) + 1;
      return acc;
    }, {});

    const byStatus = rows.reduce((acc, r) => {
      acc[r.statut] = acc[r.statut] || [];
      acc[r.statut].push(r);
      return acc;
    }, {});

    res.json({ success: true, factures: rows, counts, byStatus });
  } catch (error) {
    console.error('Erreur récupération demandes validation assurances (admin):', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
