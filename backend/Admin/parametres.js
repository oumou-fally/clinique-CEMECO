const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- INFORMATIONS CLINIQUE ---

router.get('/info', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clinique_info WHERE id = 1');
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Erreur info clinique:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.post('/info', async (req, res) => {
    const { nom, adresse, telephone, email, site_web, notifications_email, sauvegarde_auto, retention_donnees } = req.body;
    try {
        await pool.query(
            `UPDATE clinique_info SET 
                nom = ?, adresse = ?, telephone = ?, email = ?, site_web = ?, 
                notifications_email = ?, sauvegarde_auto = ?, retention_donnees = ? 
             WHERE id = 1`,
            [nom, adresse, telephone, email, site_web, notifications_email ? 1 : 0, sauvegarde_auto ? 1 : 0, retention_donnees]
        );
        res.json({ success: true, message: 'Informations mises à jour' });
    } catch (error) {
        console.error('Erreur sauvegarde info:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// --- TYPES DE CONSULTATION ---

router.get('/types-consultation', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM type_consultation');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erreur types:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

router.put('/types-consultation/:id', async (req, res) => {
  const { id } = req.params;
  const { prix } = req.body;
  try {
    await pool.query('UPDATE type_consultation SET prix = ? WHERE id = ?', [prix, id]);
    res.json({ success: true, message: 'Prix mis à jour' });
  } catch (error) {
    console.error('Erreur mise à jour prix:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// --- HORAIRES CLINIQUE ---

router.get('/horaires', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM horaires_clinique');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erreur horaires:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

router.post('/horaires', async (req, res) => {
    const { horaires } = req.body;
    try {
        for (const [jour, info] of Object.entries(horaires)) {
            await pool.query(
                'UPDATE horaires_clinique SET debut = ?, fin = ?, actif = ? WHERE jour = ?',
                [info.debut, info.fin, info.actif ? 1 : 0, jour]
            );
        }
        res.json({ success: true, message: 'Horaires mis à jour' });
    } catch (error) {
        console.error('Erreur sauvegarde horaires:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// --- SPÉCIALITÉS ---

router.get('/specialites', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM specialites_clinique');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erreur spécialités:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;
