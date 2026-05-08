const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// ==================== ROUTES PRINCIPALES ====================

// Récupérer toutes les factures
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT f.*, 
                   p.prenom AS patient_prenom, 
                   p.nom AS patient_nom_db,
                   p.telephone,
                   p.email,
                   p.quartier,
                   p.commune
            FROM factures f
            JOIN patient p ON f.patient_id = p.id
            ORDER BY f.created_at DESC
        `);
        res.json({ success: true, factures: rows });
    } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});



// ==================== ROUTES PATIENTS ====================

// Récupérer tous les patients
router.get('/patients', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, nom, prenom, telephone, email, quartier, commune, sexe, date_naissance
            FROM patient 
            ORDER BY nom ASC, prenom ASC
        `);
        res.json({ success: true, patients: rows });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ==================== ROUTES CONSULTATIONS ====================

// Récupérer toutes les consultations
router.get('/consultations', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, 
                   COALESCE(tc.nom, r.motif) as type_nom, 
                   COALESCE(tc.prix, 0) as type_prix,
                   p.nom as patient_nom,
                   p.prenom as patient_prenom,
                   p.telephone as patient_telephone,
                   r.patient_id as patient_id,
                   COALESCE(tc.id, 0) as id_type_consultation_db
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id_reservation
            JOIN patient p ON r.patient_id = p.id
            LEFT JOIN type_consultation tc ON (c.id_type_consultation = tc.id OR r.motif LIKE CONCAT('%', tc.nom, '%'))
            ORDER BY c.date_consultation DESC
        `);
        res.json({ success: true, consultations: rows });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer les consultations d'un patient spécifique
router.get('/consultations/patient/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, 
                   COALESCE(tc.nom, r.motif) as type_nom, 
                   COALESCE(tc.prix, 0) as type_prix,
                   m.nom as medecin_nom, 
                   m.prenom as medecin_prenom,
                   r.patient_id as patient_id,
                   COALESCE(tc.id, 0) as id_type_consultation_db
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id_reservation
            JOIN patient p ON r.patient_id = p.id
            LEFT JOIN type_consultation tc ON (c.id_type_consultation = tc.id OR r.motif LIKE CONCAT('%', tc.nom, '%'))
            LEFT JOIN medecin m ON c.id_medecin = m.id
            WHERE p.id = ?
            ORDER BY c.date_consultation DESC
        `, [id]);
        
        // Vérifier pour chaque consultation si elle a une facture
        const consultationsWithFacture = await Promise.all(rows.map(async (consultation) => {
            const [facture] = await pool.execute(
                'SELECT id, statut, montant FROM factures WHERE consultation_id = ?',
                [consultation.id]
            );
            return {
                ...consultation,
                a_facture: facture.length > 0,
                facture_id: facture.length > 0 ? facture[0].id : null,
                facture_statut: facture.length > 0 ? facture[0].statut : null
            };
        }));
        
        res.json({ success: true, consultations: consultationsWithFacture });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ==================== ROUTES TYPES CONSULTATION ====================

// Récupérer tous les types de consultation
router.get('/types-consultation', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, nom, prix 
            FROM type_consultation 
            ORDER BY nom ASC
        `);
        res.json({ success: true, types: rows });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ==================== FONCTION UTILITAIRE ====================

// Récupérer une facture par ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT f.*, 
                   p.prenom AS patient_prenom, 
                   p.nom AS patient_nom_db,
                   p.telephone,
                   p.email,
                   p.quartier,
                   p.commune,
                   p.sexe,
                   p.date_naissance
            FROM factures f
            JOIN patient p ON f.patient_id = p.id
            WHERE f.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Facture non trouvée' });
        }
        res.json({ success: true, facture: rows[0] });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Créer une nouvelle facture
router.post('/', async (req, res) => {
    const {
        consultation_id,
        patient_id,
        type_consultation_id,
        patient_nom,
        service,
        montant,
        patient_type,
        payment_method,
        insurance_provider,
        bank_name,
        bank_account_number,
        bank_rib,
        orange_number,
        orange_name,
        orange_transaction_id,
        statut
    } = req.body;

    // Validation des champs obligatoires
    if (patient_id === undefined || patient_id === null || 
        type_consultation_id === undefined || type_consultation_id === null || 
        montant === undefined || montant === null) {
        return res.status(400).json({ 
            success: false, 
            message: 'Les champs patient_id, type_consultation_id et montant sont obligatoires' 
        });
    }

    // Vérifier si une facture existe déjà pour cette consultation
    if (consultation_id) {
        const [existing] = await pool.execute(
            'SELECT id FROM factures WHERE consultation_id = ?',
            [consultation_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Une facture existe déjà pour cette consultation' 
            });
        }
    }

    try {
        const [result] = await pool.execute(`
            INSERT INTO factures (
                consultation_id,
                patient_id,
                type_consultation_id,
                patient_nom,
                service,
                montant,
                patient_type,
                payment_method,
                insurance_provider,
                bank_name,
                bank_account_number,
                bank_rib,
                orange_number,
                orange_name,
                orange_transaction_id,
                statut
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            consultation_id || null,
            patient_id,
            type_consultation_id,
            patient_nom || (await getPatientNom(patient_id, pool)),
            service,
            montant,
            patient_type || 'non-insured',
            payment_method || 'cash',
            insurance_provider || null,
            bank_name || null,
            bank_account_number || null,
            bank_rib || null,
            orange_number || null,
            orange_name || null,
            orange_transaction_id || null,
            statut || 'payee'
        ]);

        // Récupérer la facture créée
        const [newFacture] = await pool.execute(`
            SELECT f.*, p.prenom AS patient_prenom, p.nom AS patient_nom_db
            FROM factures f
            JOIN patient p ON f.patient_id = p.id
            WHERE f.id = ?
        `, [result.insertId]);

        res.json({ 
            success: true, 
            id: result.insertId,
            facture: newFacture[0],
            message: 'Facture créée avec succès' 
        });
    } catch (error) {
        console.error('Erreur lors de la création de la facture:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Mettre à jour le statut d'une facture
router.patch('/:id/statut', async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    if (!['en_attente', 'payee', 'annulee'].includes(statut)) {
        return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    try {
        await pool.execute('UPDATE factures SET statut = ? WHERE id = ?', [statut, id]);
        res.json({ success: true, message: 'Statut mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Supprimer/Annuler une facture
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('UPDATE factures SET statut = "annulee" WHERE id = ?', [id]);
        res.json({ success: true, message: 'Facture annulée avec succès' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

async function getPatientNom(patientId, pool) {
    try {
        const [rows] = await pool.execute(
            'SELECT CONCAT(prenom, " ", nom) as nom_complet FROM patient WHERE id = ?',
            [patientId]
        );
        return rows[0]?.nom_complet || '';
    } catch (error) {
        console.error('Erreur getPatientNom:', error);
        return '';
    }
}

module.exports = router;