const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== INITIALISATION ====================
const initTable = async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS \`messagerie\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`id_medecin\` int NOT NULL,
                \`id_patient\` int NOT NULL,
                \`sujet\` varchar(255) DEFAULT NULL,
                \`priorite\` enum('low','normal','high') DEFAULT 'normal',
                \`expediteur\` enum('medecin','patient') NOT NULL,
                \`message\` text NOT NULL,
                \`lu\` tinyint(1) DEFAULT '0',
                \`date_envoi\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                \`type\` enum('text','image','vocal','file') DEFAULT 'text',
                \`fichier_url\` text,
                PRIMARY KEY (\`id\`),
                KEY \`fk_message_medecin\` (\`id_medecin\`),
                KEY \`fk_message_patient\` (\`id_patient\`)
            )
        `);
        console.log('✅ Table messagerie prête');
        
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
            console.log('✅ Dossier uploads créé');
        }
    } catch (err) {
        console.error('❌ Erreur initialisation messagerie:', err);
    }
};
initTable();

// ==================== MULTER CONFIG ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (!ext) {
            const mimeToExt = {
                'audio/webm': '.webm',
                'audio/mp4': '.mp4',
                'audio/ogg': '.ogg',
                'audio/mpeg': '.mp3',
                'audio/wav': '.wav',
                'audio/aac': '.aac',
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'application/pdf': '.pdf'
            };
            const baseMime = file.mimetype.split(';')[0];
            ext = mimeToExt[baseMime] || '.bin';
        }
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + ext);
    }
});

const upload = multer({ storage });

// ==================== INFOS (Pour nouvelles conversations) ====================
router.get('/info/medecin/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, nom, prenom, specialite FROM medecin WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json({ success: true, data: rows[0] });
        else res.status(404).json({ success: false, message: 'Médecin non trouvé' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/info/patient/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, nom, prenom FROM patient WHERE id = ?', [req.params.id]);
        if (rows.length > 0) res.json({ success: true, data: rows[0] });
        else res.status(404).json({ success: false, message: 'Patient non trouvé' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==================== ENVOYER MESSAGE ====================
router.post('/envoyer', upload.single('fichier'), async (req, res) => {
    let { id_medecin, id_patient, expediteur, message, type } = req.body;

    let fichier_url = null;
    let messageType = type || 'text';

    if (req.file) {
        fichier_url = `/uploads/${req.file.filename}`;
        const mime = req.file.mimetype.toLowerCase();
        if (mime.includes('image')) messageType = 'image';
        else if (mime.includes('audio') || req.file.filename.match(/\.(webm|mp4|ogg|wav|mp3|aac)$/i)) messageType = 'vocal';
        else messageType = 'file';
    }

    if (!id_medecin || !id_patient || !expediteur) {
        return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO messagerie (id_medecin, id_patient, expediteur, message, type, fichier_url) VALUES (?, ?, ?, ?, ?, ?)`,
            [Number(id_medecin), Number(id_patient), expediteur, message || '', messageType, fichier_url]
        );

        res.status(201).json({ success: true, data: { id: result.insertId, type: messageType, fichier_url } });
    } catch (error) {
        console.error('Erreur envoi message:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ==================== CONVERSATION ====================
router.get('/conversation/:patientId/:medecinId', async (req, res) => {
    try {
        const [messages] = await pool.execute(
            `SELECT * FROM messagerie WHERE id_patient = ? AND id_medecin = ? ORDER BY date_envoi ASC`,
            [req.params.patientId, req.params.medecinId]
        );
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== STATS MEDECIN ====================
router.get('/medecin/:medecinId/stats', async (req, res) => {
    const { medecinId } = req.params;
    try {
        const [[{total_patients}]] = await pool.execute(`SELECT COUNT(DISTINCT id_patient) as total_patients FROM messagerie WHERE id_medecin = ?`, [medecinId]);
        const [[{non_lus}]] = await pool.execute(`SELECT COUNT(*) as non_lus FROM messagerie WHERE id_medecin = ? AND expediteur = 'patient' AND lu = 0`, [medecinId]);
        res.json({ success: true, data: { total_patients, non_lus, en_attente: non_lus } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== DISCUSSIONS ====================
router.get('/patient/:patientId/discussions', async (req, res) => {
    try {
        const [discussions] = await pool.execute(`
            SELECT m.id as medecin_id, m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite as medecin_specialite,
            msg.message as dernier_message, msg.type, msg.date_envoi, msg.expediteur, msg.lu,
            (SELECT COUNT(*) FROM messagerie WHERE id_patient = ? AND id_medecin = m.id AND lu = 0 AND expediteur = 'medecin') as non_lus
            FROM medecin m JOIN messagerie msg ON m.id = msg.id_medecin
            WHERE msg.id_patient = ? AND msg.id = (SELECT MAX(id) FROM messagerie WHERE id_patient = ? AND id_medecin = m.id)
            ORDER BY msg.date_envoi DESC
        `, [req.params.patientId, req.params.patientId, req.params.patientId]);
        res.json({ success: true, data: discussions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/medecin/:medecinId/discussions', async (req, res) => {
    try {
        const [discussions] = await pool.execute(`
            SELECT p.id as patient_id, p.nom as patient_nom, p.prenom as patient_prenom,
            msg.message as dernier_message, msg.type, msg.date_envoi, msg.expediteur, msg.lu,
            (SELECT COUNT(*) FROM messagerie WHERE id_medecin = ? AND id_patient = p.id AND lu = 0 AND expediteur = 'patient') as non_lus
            FROM patient p JOIN messagerie msg ON p.id = msg.id_patient
            WHERE msg.id_medecin = ? AND msg.id = (SELECT MAX(id) FROM messagerie WHERE id_medecin = ? AND id_patient = p.id)
            ORDER BY msg.date_envoi DESC
        `, [req.params.medecinId, req.params.medecinId, req.params.medecinId]);
        res.json({ success: true, data: discussions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== MARQUER COMME LU ====================
router.put('/marquer-lu', async (req, res) => {
    const { id_patient, id_medecin, pour_qui } = req.body;
    const expediteur = pour_qui === 'medecin' ? 'patient' : 'medecin';
    try {
        await pool.execute(`UPDATE messagerie SET lu = 1 WHERE id_patient = ? AND id_medecin = ? AND expediteur = ? AND lu = 0`, [id_patient, id_medecin, expediteur]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;