const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const { notifyPatient } = require('../config/notifier');

// Récupérer les réservations confirmées pour un médecin spécifique (avec infos patient)
router.get('/reservations/:medecinId', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT r.id_reservation AS id, r.*, p.nom, p.prenom, p.telephone, p.sexe, p.date_naissance, p.email
            FROM reservation r
            JOIN patient p ON r.patient_id = p.id
            WHERE r.id_medecin = ?
            ORDER BY r.date_rendez_vous DESC, r.heure_rendez_vous DESC
        `, [medecinId]);
        
        res.json({ success: true, reservations: rows });
    } catch (error) {
        console.error('Erreur récupération réservations médecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Enregistrer une consultation
router.post('/', async (req, res) => {
    const {
        id_reservation,
        id_medecin,
        pa, fc, fr, temperature, saturation, poids, taille, imc,
        biologie, ecg, rx_pulmonaire, ett,
        symptomes, diagnostic, traitement, notes
    } = req.body;

    if (!id_reservation || !id_medecin) {
        return res.status(400).json({ success: false, message: 'ID Réservation et ID Médecin requis' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 0. Vérifier si une consultation existe déjà pour cette réservation
        const [existing] = await connection.execute(
            'SELECT id FROM consultation WHERE id_reservation = ?',
            [id_reservation]
        );

        let result;
        if (existing.length > 0) {
            // Mise à jour
            [result] = await connection.execute(`
                UPDATE consultation SET 
                    pa = ?, fc = ?, fr = ?, temperature = ?, saturation = ?, 
                    poids = ?, taille = ?, imc = ?,
                    biologie = ?, ecg = ?, rx_pulmonaire = ?, ett = ?,
                    symptomes = ?, diagnostic = ?, traitement = ?, notes = ?
                WHERE id_reservation = ?
            `, [
                pa, fc, fr, temperature, saturation, poids, taille, imc,
                biologie, ecg, rx_pulmonaire, ett,
                symptomes, diagnostic, traitement, notes,
                id_reservation
            ]);
        } else {
            // Insertion
            [result] = await connection.execute(`
                INSERT INTO consultation (
                    id_reservation, id_medecin,
                    pa, fc, fr, temperature, saturation, poids, taille, imc,
                    biologie, ecg, rx_pulmonaire, ett,
                    symptomes, diagnostic, traitement, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id_reservation, id_medecin,
                pa, fc, fr, temperature, saturation, poids, taille, imc,
                biologie, ecg, rx_pulmonaire, ett,
                symptomes, diagnostic, traitement, notes
            ]);
        }

        // 2. Mettre à jour le statut de la réservation (au cas où elle n'était pas encore 'termine')
        await connection.execute(
            "UPDATE reservation SET statut = 'termine', notif_patient = 1 WHERE id_reservation = ?",
            [id_reservation]
        );

        // NOTIFIER LE PATIENT
        const [rdvCheck] = await connection.execute('SELECT date_rendez_vous, heure_rendez_vous FROM reservation WHERE id_reservation = ?', [id_reservation]);
        if (rdvCheck.length > 0) {
            const dateSimple = new Date(rdvCheck[0].date_rendez_vous).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            await notifyPatient({
                id_reservation: id_reservation,
                type: 'termine',
                title: 'Consultation terminée',
                message: `Votre consultation du ${dateSimple} à ${rdvCheck[0].heure_rendez_vous?.substring(0, 5)} a été enregistrée. Consultez votre dossier médical.`
            });
        }

        await connection.commit();
        res.json({ success: true, message: 'Consultation enregistrée avec succès', id: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur enregistrement consultation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// Récupérer l'historique des consultations pour un médecin
// Récupérer l'historique des consultations pour un médecin (inclut toutes les réservations terminées)
router.get('/historique/:medecinId', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT 
                r.id_reservation as id, 
                r.date_rendez_vous, 
                r.heure_rendez_vous, 
                r.motif, 
                r.statut,
                c.id as id_consultation,
                c.date_consultation,
                c.diagnostic,
                c.traitement,
                c.notes,
                p.nom as patient_nom, 
                p.prenom as patient_prenom,
                p.id as patient_id
            FROM reservation r
            LEFT JOIN consultation c ON r.id_reservation = c.id_reservation
            JOIN patient p ON r.patient_id = p.id
            WHERE r.id_medecin = ? AND (r.statut = 'termine' OR c.id IS NOT NULL)
            ORDER BY r.date_rendez_vous DESC, r.heure_rendez_vous DESC
        `, [medecinId]);
        
        res.json({ success: true, consultations: rows });
    } catch (error) {
        console.error('Erreur historique consultations:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer le détail d'une consultation par ID de réservation
router.get('/detail/:reservationId', async (req, res) => {
    const { reservationId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, p.nom, p.prenom, p.telephone, p.date_naissance, r.motif
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id_reservation
            JOIN patient p ON r.patient_id = p.id
            WHERE c.id_reservation = ?
        `, [reservationId]);
        
        if (rows.length > 0) {
            res.json({ success: true, consultation: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Consultation non trouvée' });
        }
    } catch (error) {
        console.error('Erreur récupération détail consultation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Enregistrer une ordonnance
router.post('/ordonnance', async (req, res) => {
    let { id_consultation, id_reservation, medicaments } = req.body;

    if (!id_consultation && !id_reservation) {
        return res.status(400).json({ success: false, message: 'ID Consultation ou ID Réservation requis' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Si on a l'ID Réservation mais pas Consultation, on le cherche ou on le crée
        if (!id_consultation && id_reservation) {
            const [rows] = await connection.execute(
                'SELECT id FROM consultation WHERE id_reservation = ?',
                [id_reservation]
            );
            
            if (rows.length > 0) {
                id_consultation = rows[0].id;
            } else {
                // Création automatique d'un enregistrement de consultation basique si manquant
                // On récupère l'ID du médecin depuis la réservation
                const [resInfo] = await connection.execute('SELECT id_medecin FROM reservation WHERE id_reservation = ?', [id_reservation]);
                const medId = resInfo.length > 0 ? resInfo[0].id_medecin : null;
                
                const [newConsult] = await connection.execute(
                    'INSERT INTO consultation (id_reservation, id_medecin, date_consultation) VALUES (?, ?, CURRENT_TIMESTAMP)',
                    [id_reservation, medId]
                );
                id_consultation = newConsult.insertId;
                
                // On s'assure que la réservation est bien marquée comme terminée
                await connection.execute(
                    "UPDATE reservation SET statut = 'termine' WHERE id_reservation = ?",
                    [id_reservation]
                );
            }
        }

        const [existing] = await connection.execute(
            'SELECT id FROM ordonnance WHERE id_consultation = ?',
            [id_consultation]
        );

        const medicamentsJson = JSON.stringify(medicaments);

        if (existing.length > 0) {
            await connection.execute(
                'UPDATE ordonnance SET medicaments = ?, date_ordination = CURRENT_TIMESTAMP WHERE id_consultation = ?',
                [medicamentsJson, id_consultation]
            );
        } else {
            await connection.execute(
                'INSERT INTO ordonnance (id_consultation, medicaments) VALUES (?, ?)',
                [id_consultation, medicamentsJson]
            );
        }

        // NOTIFIER LE PATIENT
        const [rdvCheck] = await connection.execute(`
            SELECT r.id_reservation, r.date_rendez_vous, r.heure_rendez_vous
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id_reservation
            WHERE c.id = ?
        `, [id_consultation]);
        if (rdvCheck.length > 0) {
            const dateSimple = new Date(rdvCheck[0].date_rendez_vous).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            await notifyPatient({
                id_reservation: rdvCheck[0].id_reservation,
                type: 'ordonnance',
                title: 'Ordonnance disponible',
                message: `Votre ordonnance pour le rendez-vous du ${dateSimple} à ${rdvCheck[0].heure_rendez_vous?.substring(0, 5)} est disponible. Consultez votre dossier médical.`
            });
        }

        await connection.commit();
        res.json({ success: true, message: 'Ordonnance enregistrée avec succès' });
    } catch (error) {
        await connection.rollback();
        console.error('Erreur ordonnance:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// Récupérer l'ordonnance d'une consultation
router.get('/ordonnance/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // On cherche d'abord si c'est un ID de consultation
        let [rows] = await pool.execute(
            'SELECT * FROM ordonnance WHERE id_consultation = ?',
            [id]
        );

        // Si non trouvé, c'est peut-être un ID de réservation
        if (rows.length === 0) {
            const [consults] = await pool.execute(
                'SELECT id FROM consultation WHERE id_reservation = ?',
                [id]
            );
            if (consults.length > 0) {
                [rows] = await pool.execute(
                    'SELECT * FROM ordonnance WHERE id_consultation = ?',
                    [consults[0].id]
                );
            }
        }

        if (rows.length > 0) {
            const ordonnance = rows[0];
            try {
                ordonnance.medicaments = JSON.parse(ordonnance.medicaments);
            } catch (error) {
                ordonnance.medicaments = [];
            }
            res.json({ success: true, ordonnance });
        } else {
            res.json({ success: true, ordonnance: null });
        }
    } catch (error) {
        console.error('Erreur récup ordonnance:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer toutes les ordonnances (pour la secrétaire)
router.get('/ordonnances/all', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.*, c.id AS id_consultation, p.nom as patient_nom, p.prenom as patient_prenom, r.date_rendez_vous, r.motif, r.id_reservation
            FROM ordonnance o
            JOIN consultation c ON o.id_consultation = c.id
            JOIN reservation r ON c.id_reservation = r.id_reservation
            JOIN patient p ON r.patient_id = p.id
            ORDER BY o.date_ordination DESC
        `);
        res.json({ success: true, ordonnances: rows });
    } catch (error) {
        console.error('Erreur récup toutes ordonnances:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer les ordonnances d'un médecin spécifique
router.get('/ordonnances/medecin/:medecinId', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT o.*, c.id AS id_consultation, p.nom as patient_nom, p.prenom as patient_prenom, r.date_rendez_vous, r.motif, r.id_reservation
            FROM ordonnance o
            JOIN consultation c ON o.id_consultation = c.id
            JOIN reservation r ON c.id_reservation = r.id_reservation
            JOIN patient p ON r.patient_id = p.id
            WHERE c.id_medecin = ?
            ORDER BY o.date_ordination DESC
        `, [medecinId]);
        res.json({ success: true, ordonnances: rows });
    } catch (error) {
        console.error('Erreur récup ordonnances medecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer la liste unique des patients d'un médecin
router.get('/patients/:medecinId', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT p.*, 
                (SELECT MAX(date_rendez_vous) FROM reservation WHERE patient_id = p.id AND id_medecin = ?) as derniere_visite
            FROM patient p
            JOIN reservation r ON p.id = r.patient_id
            WHERE r.id_medecin = ?
            ORDER BY p.nom ASC
        `, [medecinId, medecinId]);
        
        res.json({ success: true, patients: rows });
    } catch (error) {
        console.error('Erreur récupération patients médecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
