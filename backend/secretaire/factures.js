const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const { notifyPatient } = require('../config/notifier');

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

// Récupérer toutes les factures payées par assurance
router.get('/assurance/payees', async (req, res) => {
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
            WHERE f.statut = 'payee' AND f.patient_type = 'insured'
            ORDER BY f.date_facture DESC
        `);
        res.json({ success: true, factures: rows });
    } catch (error) {
        console.error('Erreur lors de la récupération des factures payées par assurance:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer les demandes de validation / portefeuille assurances (regroupées)
router.get('/assurance/validation-requests', async (req, res) => {
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
            WHERE f.patient_type = 'insured' AND f.statut IN ('en_attente','en_cours_validation','payee')
            ORDER BY f.updated_at DESC
        `);

        // Compter par statut
        const counts = rows.reduce((acc, r) => {
            acc.total = (acc.total || 0) + 1;
            acc[r.statut] = (acc[r.statut] || 0) + 1;
            return acc;
        }, {});

        // Organiser par statut pour la consommation UI
        const byStatus = rows.reduce((acc, r) => {
            acc[r.statut] = acc[r.statut] || [];
            acc[r.statut].push(r);
            return acc;
        }, {});

        res.json({ success: true, factures: rows, counts, byStatus });
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes de validation assurance:', error);
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

// Récupérer les consultations d'un patient groupées par jour
router.get('/consultations/patient/:id/grouped', async (req, res) => {
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
        
        // Récupérer les factures
        const [factures] = await pool.execute('SELECT * FROM factures');

        const consultationsWithFacture = rows.map((consultation) => {
            const facture = factures.find(f => f.consultation_id === consultation.id);
            return {
                ...consultation,
                a_facture: !!facture,
                facture_id: facture ? facture.id : null,
                facture_statut: facture ? facture.statut : null
            };
        });
        
        // Grouper par jour
        const grouped = groupConsultationsByDay(consultationsWithFacture, factures);
        
        res.json({ success: true, consultations: grouped });
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
        insurance_number,
        coverage_rate,
        bank_name,
        bank_account_number,
        bank_rib,
        cheque_number,
        cheque_holder,
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

    const computed_montant = Number(montant) || 0;
    let computed_coverage_rate = 0;
    let computed_montant_assurance = 0;
    let computed_montant_patient = computed_montant;

    if (patient_type === 'insured') {
        computed_coverage_rate = Number(coverage_rate) || 0;
        computed_montant_assurance = (computed_montant * computed_coverage_rate) / 100;
        computed_montant_patient = computed_montant - computed_montant_assurance;
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
                montant_patient,
                montant_assurance,
                patient_type,
                payment_method,
                insurance_provider,
                insurance_number,
                coverage_rate,
                bank_name,
                bank_account_number,
                bank_rib,
                cheque_number,
                cheque_holder,
                orange_number,
                orange_name,
                orange_transaction_id,
                statut
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            consultation_id || null,
            patient_id,
            type_consultation_id,
            patient_nom || (await getPatientNom(patient_id, pool)),
            service,
            montant,
            computed_montant_patient,
            computed_montant_assurance,
            patient_type || 'non-insured',
            payment_method || 'cash',
            insurance_provider || null,
            insurance_number || null,
            computed_coverage_rate,
            bank_name || null,
            bank_account_number || null,
            bank_rib || null,
            cheque_number || null,
            cheque_holder || null,
            orange_number || null,
            orange_name || null,
            orange_transaction_id || null,
            statut || (patient_type === 'insured' ? 'en_attente' : 'payee')
        ]);

        // Récupérer la facture créée
        const [newFacture] = await pool.execute(`
            SELECT f.*, p.prenom AS patient_prenom, p.nom AS patient_nom_db
            FROM factures f
            JOIN patient p ON f.patient_id = p.id
            WHERE f.id = ?
        `, [result.insertId]);

        // Enregistrer l'historique (création)
        try {
            await pool.execute(
                'INSERT INTO facture_history (facture_id, action, old_value, new_value, user_role, user_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [result.insertId, 'created', null, JSON.stringify(newFacture[0] || {}), req.headers['x-user-role'] || null, req.headers['x-user-id'] || null, null]
            );
        } catch (err) {
            console.error('Erreur enregistrement historique création:', err);
        }

        // NOTIFIER LE PATIENT
        await notifyPatient({
            id_patient: patient_id,
            type: 'facture',
            title: 'Nouvelle facture disponible',
            message: `Une facture d'un montant de ${computed_montant} GNF a été émise pour votre consultation de ${service || 'Médecine Générale'}.`
        });

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

// Modifier / Mettre à jour une facture
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        patient_id,
        type_consultation_id,
        patient_nom,
        service,
        montant,
        patient_type,
        payment_method,
        insurance_provider,
        insurance_number,
        coverage_rate,
        bank_name,
        bank_account_number,
        bank_rib,
        cheque_number,
        cheque_holder,
        orange_number,
        orange_name,
        orange_transaction_id,
        statut
    } = req.body;

    if (!patient_id || !type_consultation_id || !montant) {
        return res.status(400).json({ 
            success: false, 
            message: 'Les champs patient_id, type_consultation_id et montant sont obligatoires' 
        });
    }

    if (patient_type === 'insured' && statut === 'payee') {
        const [curr] = await pool.execute('SELECT statut FROM factures WHERE id = ?', [id]);
        if (curr.length > 0 && curr[0].statut !== 'payee') {
            return res.status(403).json({
                success: false,
                message: "Les factures d'assurés doivent faire l'objet d'une validation par l'administrateur avant d'être encaissées."
            });
        }
    }

    const computed_montant = Number(montant) || 0;
    let computed_coverage_rate = 0;
    let computed_montant_assurance = 0;
    let computed_montant_patient = computed_montant;

    if (patient_type === 'insured') {
        computed_coverage_rate = Number(coverage_rate) || 0;
        computed_montant_assurance = (computed_montant * computed_coverage_rate) / 100;
        computed_montant_patient = computed_montant - computed_montant_assurance;
    }

    try {
        // Récupérer l'état actuel pour historique
        const [currentRows] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);
        const oldFact = currentRows[0] || null;
        const statutAEnregistrer = statut || (patient_type === 'insured' ? (oldFact?.statut || 'en_attente') : (oldFact?.statut || 'payee'));

        await pool.execute(`
            UPDATE factures SET
                patient_id = ?,
                type_consultation_id = ?,
                patient_nom = ?,
                service = ?,
                montant = ?,
                montant_patient = ?,
                montant_assurance = ?,
                patient_type = ?,
                payment_method = ?,
                insurance_provider = ?,
                insurance_number = ?,
                coverage_rate = ?,
                bank_name = ?,
                bank_account_number = ?,
                bank_rib = ?,
                cheque_number = ?,
                cheque_holder = ?,
                orange_number = ?,
                orange_name = ?,
                orange_transaction_id = ?,
                statut = ?
            WHERE id = ?
        `, [
            patient_id,
            type_consultation_id,
            patient_nom || (await getPatientNom(patient_id, pool)),
            service,
            montant,
            computed_montant_patient,
            computed_montant_assurance,
            patient_type || 'non-insured',
            payment_method || 'cash',
            insurance_provider || null,
            insurance_number || null,
            computed_coverage_rate,
            bank_name || null,
            bank_account_number || null,
            bank_rib || null,
            cheque_number || null,
            cheque_holder || null,
            orange_number || null,
            orange_name || null,
            orange_transaction_id || null,
                statutAEnregistrer,
            id
        ]);

        // Récupérer la facture mise à jour
        const [updatedFacture] = await pool.execute(`
            SELECT f.*, p.prenom AS patient_prenom, p.nom AS patient_nom_db
            FROM factures f
            JOIN patient p ON f.patient_id = p.id
            WHERE f.id = ?
        `, [id]);

        // Enregistrer l'historique (update)
        try {
            await pool.execute(
                'INSERT INTO facture_history (facture_id, action, old_value, new_value, user_role, user_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, 'updated', JSON.stringify(oldFact || {}), JSON.stringify(updatedFacture[0] || {}), req.headers['x-user-role'] || null, req.headers['x-user-id'] || null, null]
            );
        } catch (err) {
            console.error('Erreur enregistrement historique update:', err);
        }

        // NOTIFIER LE PATIENT
        if (updatedFacture.length > 0) {
            const fact = updatedFacture[0];
            let title = 'Facture mise à jour';
            let message = `Votre facture pour la consultation de ${fact.service || 'Médecine Générale'} a été mise à jour.`;
            if (fact.statut === 'payee') {
                title = 'Facture payée';
                message = `Le paiement de votre facture de ${fact.montant} GNF pour la consultation de ${fact.service || 'Médecine Générale'} a été enregistré avec succès.`;
            } else if (fact.statut === 'en_cours_validation') {
                title = 'Validation de l\'assurance';
                message = `La part assurance (${fact.montant_assurance} GNF) de votre facture pour ${fact.service || 'Médecine Générale'} a été envoyée pour validation.`;
            }
            await notifyPatient({
                id_patient: fact.patient_id,
                type: 'facture',
                title: title,
                message: message
            });
        }

        res.json({ 
            success: true, 
            facture: updatedFacture[0],
            message: 'Facture mise à jour avec succès' 
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Mettre à jour le statut d'une facture
router.patch('/:id/statut', async (req, res) => {
    const { id } = req.params;
    const { statut, validation_ref } = req.body;

    if (!['en_attente', 'en_cours_validation', 'payee', 'annulee'].includes(statut)) {
        return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    try {
        // Récupérer l'état actuel pour historique
        const [currentRows] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);
        const oldFact = currentRows[0] || null;

        // Interdire à la secrétaire de forcer une facture d'assuré directement en 'payee'
        if (statut === 'payee') {
            if (oldFact && oldFact.patient_type === 'insured') {
                return res.status(403).json({ 
                    success: false, 
                    message: "Les factures d'assurés doivent faire l'objet d'une validation par l'administrateur avant d'être encaissées." 
                });
            }
        }

        if (statut === 'en_cours_validation') {
            await pool.execute(
                'UPDATE factures SET statut = ?, validation_ref = ? WHERE id = ?', 
                [statut, validation_ref || null, id]
            );
        } else {
            await pool.execute('UPDATE factures SET statut = ? WHERE id = ?', [statut, id]);
        }

        // Récupérer la facture mise à jour
        const [factRows] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);

        // Enregistrer l'historique (statut)
        try {
            await pool.execute(
                'INSERT INTO facture_history (facture_id, action, old_value, new_value, user_role, user_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, 'status_change', JSON.stringify(oldFact || {}), JSON.stringify(factRows[0] || {}), req.headers['x-user-role'] || null, req.headers['x-user-id'] || null, null]
            );
        } catch (err) {
            console.error('Erreur enregistrement historique statut:', err);
        }

        if (factRows.length > 0) {
            const fact = factRows[0];
            let title = 'Statut de facture mis à jour';
            let message = `Le statut de votre facture pour ${fact.service || 'Médecine Générale'} est passé à : ${statut}.`;
            if (statut === 'payee') {
                title = 'Paiement confirmé';
                message = `Votre paiement pour la consultation de ${fact.service || 'Médecine Générale'} a été confirmé avec succès.`;
            } else if (statut === 'en_cours_validation') {
                title = 'En attente de validation';
                message = `Votre part assurance pour la consultation de ${fact.service || 'Médecine Générale'} est en attente de validation par l'administrateur.`;
            }
            await notifyPatient({
                id_patient: fact.patient_id,
                type: 'facture',
                title: title,
                message: message
            });
        }
        
        res.json({ success: true, message: 'Statut mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Route spéciale pour l'administrateur : valider une facture d'assuré
// Cette route permet à l'admin de marquer une facture d'assuré comme payée
// et d'ajouter une référence de validation. Elle contourne la restriction
// qui empêche une secrétaire de marquer directement une facture d'assuré en 'payee'.
router.post('/:id/admin-validate', async (req, res) => {
    const { id } = req.params;
    const { validation_ref } = req.body;

    try {
        const [rows] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Facture non trouvée' });
        }

        const oldFact = rows[0];

        // Mettre la facture en 'payee' et enregistrer la référence de validation
        await pool.execute(
            'UPDATE factures SET statut = ?, validation_ref = ? WHERE id = ?',
            ['payee', validation_ref || null, id]
        );

        // Récupérer la facture mise à jour
        const [updatedFacture] = await pool.execute(`
            SELECT f.*, p.prenom AS patient_prenom, p.nom AS patient_nom_db
            FROM factures f
            JOIN patient p ON f.patient_id = p.id
            WHERE f.id = ?
        `, [id]);

        // Enregistrer l'historique (admin validation)
        try {
            await pool.execute(
                'INSERT INTO facture_history (facture_id, action, old_value, new_value, user_role, user_id, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, 'admin_validate', JSON.stringify(oldFact || {}), JSON.stringify(updatedFacture[0] || {}), req.headers['x-admin-role'] || 'admin', req.headers['x-user-id'] || null, validation_ref || null]
            );
        } catch (err) {
            console.error('Erreur enregistrement historique admin-validate:', err);
        }

        // NOTIFIER LE PATIENT
        if (updatedFacture.length > 0) {
            const fact = updatedFacture[0];
            await notifyPatient({
                id_patient: fact.patient_id,
                type: 'facture',
                title: 'Paiement confirmé par l\'administration',
                message: `Le paiement de votre facture de ${fact.montant} GNF pour ${fact.service || 'Médecine Générale'} a été validé par l'administration.`
            });
        }

        res.json({ success: true, facture: updatedFacture[0], message: 'Facture validée par l\'admin' });
    } catch (error) {
        console.error('Erreur lors de la validation admin de la facture:', error);
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

// Fonction pour grouper les consultations faites le même jour
function groupConsultationsByDay(consultations, facturesList = []) {
    if (!consultations || consultations.length === 0) return [];
    
    const groups = {};
    consultations.forEach(c => {
        const dateObj = new Date(c.date_consultation);
        const dateKey = dateObj.toLocaleDateString('fr-FR');
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(c);
    });

    return Object.keys(groups).map(dateKey => {
        const list = groups[dateKey];
        list.sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));
        
        const type_prix = list.reduce((sum, c) => sum + Number(c.type_prix || 0), 0);
        const type_nom = list.map(c => c.type_nom || "Consultation").join(" + ");
        
        // Récupérer les factures existantes pour toutes les consultations du groupe
        const facturesDuGroupe = list.map(c => facturesList.find(f => f.consultation_id === c.id)).filter(Boolean);
        const aFacture = facturesDuGroupe.length > 0;
        const factureExistante = facturesDuGroupe[0] || null;

        return {
            id: list[0].id,
            consultation_ids: list.map(c => c.id),
            dateKey,
            date_consultation: list[0].date_consultation,
            patient_id: list[0].patient_id,
            type_prix,
            type_nom,
            diagnostic: list.map(c => c.diagnostic).filter(Boolean).join(" | "),
            aFacture,
            factureExistante,
            consultations: list
        };
    });
}

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

// Récupérer l'historique d'une facture
router.get('/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM facture_history WHERE facture_id = ? ORDER BY created_at DESC',
            [id]
        );
        res.json({ success: true, history: rows });
    } catch (error) {
        console.error('Erreur récupération historique:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;