const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuration Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/messagerie/envoyer
 * @desc    Envoyer un message (Patient vers Médecin ou vice-versa)
 */
router.post('/envoyer', upload.single('fichier'), async (req, res) => {
    const { id_medecin, id_patient, expediteur, message, sujet, priorite, type } = req.body;
    const fichier_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    let messageType = type || 'text';
    if (req.file) {
        if (req.file.mimetype.startsWith('image/')) messageType = 'image';
        else if (req.file.mimetype.startsWith('audio/')) messageType = 'vocal';
        else messageType = 'file';
    }
    
    console.log('📩 Tentative d\'envoi de message:', { id_medecin, id_patient, expediteur, messageType });

    if (!id_medecin || !id_patient || !expediteur || (!message && !fichier_url)) {
        console.warn('⚠️ Champs manquants pour l\'envoi du message');
        return res.status(400).json({ 
            success: false, 
            message: 'Tous les champs sont obligatoires.' 
        });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO messagerie (id_medecin, id_patient, expediteur, message, sujet, priorite, type, fichier_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id_medecin, id_patient, expediteur, message || '', sujet || null, priorite || 'normal', messageType, fichier_url]
        );

        res.status(201).json({
            success: true,
            message: 'Message envoyé avec succès',
            data: {
                id: result.insertId,
                id_medecin,
                id_patient,
                expediteur,
                message,
                sujet,
                priorite,
                type: messageType,
                fichier_url,
                date_envoi: new Date()
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'envoi du message' });
    }
});

/**
 * @route   GET /api/messagerie/conversation/:patientId/:medecinId
 * @desc    Récupérer l'historique d'une conversation entre un patient et un médecin
 */
router.get('/conversation/:patientId/:medecinId', async (req, res) => {
    const { patientId, medecinId } = req.params;

    try {
        const [messages] = await pool.execute(
            `SELECT * FROM messagerie 
             WHERE id_patient = ? AND id_medecin = ? 
             ORDER BY date_envoi ASC`,
            [patientId, medecinId]
        );

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la conversation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/**
 * @route   GET /api/messagerie/patient/:patientId/discussions
 * @desc    Liste des médecins avec qui le patient a une discussion (avec le dernier message)
 */
router.get('/patient/:patientId/discussions', async (req, res) => {
    const { patientId } = req.params;

    try {
        const [discussions] = await pool.execute(`
            SELECT 
                m.id as medecin_id,
                m.nom as medecin_nom,
                m.prenom as medecin_prenom,
                m.specialite as medecin_specialite,
                msg.message as dernier_message,
                msg.date_envoi,
                msg.lu,
                msg.expediteur,
                (SELECT COUNT(*) FROM messagerie 
                 WHERE id_patient = ? AND id_medecin = m.id AND lu = 0 AND expediteur = 'medecin') as non_lus
            FROM medecin m
            JOIN messagerie msg ON m.id = msg.id_medecin
            WHERE msg.id_patient = ?
            AND msg.id = (
                SELECT MAX(id) FROM messagerie 
                WHERE id_patient = ? AND id_medecin = m.id
            )
            ORDER BY msg.date_envoi DESC
        `, [patientId, patientId, patientId]);

        res.json({
            success: true,
            data: discussions
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des discussions patient:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/**
 * @route   GET /api/messagerie/medecin/:medecinId/stats
 * @desc    Récupérer les statistiques de messagerie pour un médecin
 */
router.get('/medecin/:medecinId/stats', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT id_patient) as total_patients,
                COUNT(*) as total_messages,
                (SELECT COUNT(*) FROM messagerie WHERE id_medecin = ? AND lu = 0 AND expediteur = 'patient') as non_lus,
                (SELECT COUNT(DISTINCT id_patient) FROM messagerie WHERE id_medecin = ? AND id NOT IN (
                    SELECT m1.id FROM messagerie m1 
                    WHERE m1.expediteur = 'medecin'
                )) as en_attente
            FROM messagerie 
            WHERE id_medecin = ?
        `, [medecinId, medecinId, medecinId]);

        res.json({ success: true, data: stats[0] });
    } catch (error) {
        console.error('Erreur stats messagerie:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/**
 * @route   GET /api/messagerie/medecin/:medecinId/discussions
 * @desc    Liste des patients avec qui le médecin a une discussion (pour GestionConseilsMedicaux.jsx)
 */
router.get('/medecin/:medecinId/discussions', async (req, res) => {
    const { medecinId } = req.params;

    try {
        console.log(`📡 Récupération des discussions pour le médecin ID: ${medecinId}`);
        const [discussions] = await pool.execute(`
            SELECT 
                p.id as patient_id,
                p.nom as patient_nom,
                p.prenom as patient_prenom,
                p.email as patient_email,
                msg.message as dernier_message,
                msg.sujet,
                msg.priorite,
                msg.date_envoi,
                msg.lu,
                msg.expediteur,
                (SELECT COUNT(*) FROM messagerie 
                 WHERE id_medecin = ? AND id_patient = p.id AND lu = 0 AND expediteur = 'patient') as non_lus
            FROM patient p
            JOIN messagerie msg ON p.id = msg.id_patient
            WHERE msg.id_medecin = ?
            AND msg.id = (
                SELECT MAX(id) FROM messagerie 
                WHERE id_medecin = ? AND id_patient = p.id
            )
            ORDER BY msg.date_envoi DESC
        `, [medecinId, medecinId, medecinId]);

        res.json({
            success: true,
            data: discussions
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des discussions médecin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/**
 * @route   PUT /api/messagerie/marquer-lu
 * @desc    Marquer les messages d'une conversation comme lus
 */
router.put('/marquer-lu', async (req, res) => {
    const { id_patient, id_medecin, pour_qui } = req.body; // pour_qui = 'medecin' ou 'patient'

    if (!id_patient || !id_medecin || !pour_qui) {
        return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }

    // Si pour_qui = 'medecin', on marque comme lus les messages envoyés par le 'patient'
    const expediteur_a_marquer = (pour_qui === 'medecin') ? 'patient' : 'medecin';

    try {
        await pool.execute(
            `UPDATE messagerie SET lu = 1 
             WHERE id_patient = ? AND id_medecin = ? AND expediteur = ? AND lu = 0`,
            [id_patient, id_medecin, expediteur_a_marquer]
        );

        res.json({ success: true, message: 'Messages marqués comme lus' });
    } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
