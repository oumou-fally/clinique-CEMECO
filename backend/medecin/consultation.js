const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Récupérer les réservations confirmées pour un médecin spécifique
router.get('/reservations/:medecinId', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM reservation 
            WHERE id_medecin = ?
            ORDER BY date_rendez_vous DESC, heure_rendez_vous DESC
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
            "UPDATE reservation SET statut = 'termine' WHERE id = ?",
            [id_reservation]
        );

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
router.get('/historique/:medecinId', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, r.nom as patient_nom, r.prenom as patient_prenom, r.date_rendez_vous, r.heure_rendez_vous
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id
            WHERE c.id_medecin = ?
            ORDER BY c.date_consultation DESC
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
            SELECT c.*, r.nom, r.prenom, r.telephone, r.date_naissance, r.motif
            FROM consultation c
            JOIN reservation r ON c.id_reservation = r.id
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
    const { id_reservation, id_medecin, medicaments } = req.body;

    if (!id_reservation || !id_medecin || !medicaments || !Array.isArray(medicaments)) {
        return res.status(400).json({ success: false, message: 'Données invalides' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // On peut supprimer les anciennes ordonnances pour cette réservation si on veut "remplacer"
        await connection.execute('DELETE FROM ordonnance WHERE id_reservation = ?', [id_reservation]);

        for (const med of medicaments) {
            await connection.execute(
                'INSERT INTO ordonnance (id_medecin, id_reservation, nom_medicament, dosage) VALUES (?, ?, ?, ?)',
                [id_medecin, id_reservation, med.nom, med.dosage]
            );
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

// Récupérer l'ordonnance d'une réservation
router.get('/ordonnance/:reservationId', async (req, res) => {
    const { reservationId } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM ordonnance WHERE id_reservation = ?',
            [reservationId]
        );
        res.json({ success: true, medicaments: rows });
    } catch (error) {
        console.error('Erreur récup ordonnance:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer toutes les ordonnances (pour la secrétaire)
router.get('/ordonnances/all', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.*, r.nom as patient_nom, r.prenom as patient_prenom, m.nom as medecin_nom, m.prenom as medecin_prenom
            FROM ordonnance o
            JOIN reservation r ON o.id_reservation = r.id
            JOIN medecin m ON o.id_medecin = m.id
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
            SELECT o.*, r.nom as patient_nom, r.prenom as patient_prenom
            FROM ordonnance o
            JOIN reservation r ON o.id_reservation = r.id
            WHERE o.id_medecin = ?
            ORDER BY o.date_ordination DESC
        `, [medecinId]);
        res.json({ success: true, ordonnances: rows });
    } catch (error) {
        console.error('Erreur récup ordonnances medecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
