const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ======================================================
// 👨‍⚕️ PLANNING D'UN MÉDECIN
// ======================================================
router.get('/medecin/:medecinId', async (req, res) => {
    const { medecinId } = req.params;

    try {
        // await cleanupOldPlanning(); // Désactivé pour conserver l'historique

        const [rows] = await pool.execute(`
            SELECT * 
            FROM planning_medecin
            WHERE id_medecin = ?
            ORDER BY date_planning ASC, heure_debut ASC
        `, [medecinId]);

        res.json({
            success: true,
            planning: rows
        });

    } catch (error) {
        console.error('Erreur fetch planning:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ======================================================
// 🌍 PLANNING GLOBAL
// ======================================================
router.get('/all/global', async (req, res) => {
    const { start_date, end_date, search, patient_search } = req.query;
    
    try {
        let query = `
            SELECT DISTINCT p.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite
            FROM planning_medecin p
            JOIN medecin m ON p.id_medecin = m.id
            LEFT JOIN reservation r ON r.id_medecin = p.id_medecin 
                AND r.date_rendez_vous = p.date_planning 
                AND r.heure_rendez_vous BETWEEN p.heure_debut AND p.heure_fin
            LEFT JOIN patient pt ON r.patient_id = pt.id
            WHERE 1=1
        `;
        const params = [];

        if (start_date) {
            query += " AND p.date_planning >= ?";
            params.push(start_date);
        }
        if (end_date) {
            query += " AND p.date_planning <= ?";
            params.push(end_date);
        }
        if (search) {
            query += " AND (m.nom LIKE ? OR m.prenom LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        if (patient_search) {
            query += " AND (pt.nom LIKE ? OR pt.prenom LIKE ?)";
            params.push(`%${patient_search}%`, `%${patient_search}%`);
        }

        query += " ORDER BY p.date_planning ASC, p.heure_debut ASC";

        const [rows] = await pool.execute(query, params);

        // Pour chaque créneau, vérifier s'il y a des rendez-vous
        const planningWithImpacts = await Promise.all(rows.map(async (p) => {
            const [rdvs] = await pool.execute(`
                SELECT COUNT(*) as count 
                FROM reservation 
                WHERE id_medecin = ? 
                AND date_rendez_vous = ? 
                AND heure_rendez_vous BETWEEN ? AND ?
                AND statut NOT IN ('annule', 'termine')
            `, [p.id_medecin, p.date_planning, p.heure_debut, p.heure_fin]);
            
            return { ...p, nb_reservations: rdvs[0].count };
        }));

        res.json({ success: true, planning: planningWithImpacts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ======================================================
// 🧹 NETTOYAGE AUTOMATIQUE (après 24h)
// ======================================================
const cleanupOldPlanning = async () => {
    // Désactivé selon les nouvelles exigences de conservation des données
    console.log('🧹 Cleanup automatique désactivé');
};

// ======================================================
// 🔍 IMPACTS D'UN CRÉNEAU
// ======================================================
router.get('/:id/impacts', async (req, res) => {
    const { id } = req.params;
    try {
        const [planning] = await pool.execute('SELECT * FROM planning_medecin WHERE id = ?', [id]);
        if (planning.length === 0) return res.status(404).json({ success: false });

        const p = planning[0];
        const [rdvs] = await pool.execute(`
            SELECT r.*, p.nom as patient_nom, p.prenom as patient_prenom, p.telephone as patient_telephone
            FROM reservation r
            JOIN patient p ON r.patient_id = p.id
            WHERE r.id_medecin = ? 
            AND r.date_rendez_vous = ? 
            AND r.heure_rendez_vous BETWEEN ? AND ?
            AND r.statut NOT IN ('annule', 'termine')
        `, [p.id_medecin, p.date_planning, p.heure_debut, p.heure_fin]);

        res.json({ success: true, impactes: rdvs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// ======================================================
// 📝 AJOUT / MODIFICATION
// ======================================================
router.post('/', async (req, res) => {
    const { id, id_medecin, date_planning, heure_debut, heure_fin, statut, commentaire } = req.body;

    if (!id_medecin || !date_planning || !heure_debut || !heure_fin) {
        return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    try {
        // await cleanupOldPlanning(); // Désactivé

        // Vérification chevauchement
        const [overlaps] = await pool.execute(`
            SELECT id FROM planning_medecin
            WHERE id_medecin = ?
              AND date_planning = ?
              AND id != ?
              AND (
                    (heure_debut < ? AND heure_fin > ?)
                 OR (heure_debut >= ? AND heure_debut < ?)
              )
        `, [id_medecin, date_planning, id || 0, heure_fin, heure_debut, heure_debut, heure_fin]);

        if (overlaps.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ce créneau chevauche un autre existant'
            });
        }

        if (id) {
            // UPDATE
            await pool.execute(`
                UPDATE planning_medecin 
                SET date_planning = ?, heure_debut = ?, heure_fin = ?, statut = ?, commentaire = ?
                WHERE id = ?
            `, [date_planning, heure_debut, heure_fin, statut, commentaire, id]);

            return res.json({ success: true, message: 'Créneau mis à jour' });
        } else {
            // INSERT
            await pool.execute(`
                INSERT INTO planning_medecin 
                (id_medecin, date_planning, heure_debut, heure_fin, statut, commentaire)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [id_medecin, date_planning, heure_debut, heure_fin, statut || 'disponible', commentaire]);

            return res.json({ success: true, message: 'Créneau ajouté' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ======================================================
// 🗑 SUPPRESSION
// ======================================================
router.delete('/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM planning_medecin WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Créneau supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// ======================================================
// 🔄 CLEANUP MANUEL
// ======================================================
router.post('/cleanup', async (req, res) => {
    await cleanupOldPlanning();
    res.json({ success: true, message: 'Nettoyage effectué' });
});

// ======================================================
// 📤 ENVOYER LE PLANNING DU JOUR À LA SECRÉTAIRE
// ======================================================
router.post('/envoyer-jour', async (req, res) => {
    const { id_medecin } = req.body;

    if (!id_medecin) {
        return res.status(400).json({ success: false, message: 'ID médecin requis' });
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        const [creneaux] = await pool.execute(`
            SELECT * FROM planning_medecin 
            WHERE id_medecin = ? 
            AND date_planning = ?
            ORDER BY heure_debut ASC
        `, [id_medecin, today]);

        if (creneaux.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vous n'avez aucun créneau aujourd'hui"
            });
        }

        let message = `📅 Planning du jour (${today}) :\n\n`;

        creneaux.forEach(c => {
            message += `• ${c.heure_debut.slice(0, 5)} - ${c.heure_fin.slice(0, 5)} (${c.statut})\n`;
            if (c.commentaire) message += `  → ${c.commentaire}\n`;
        });

        await pool.execute(`
            INSERT INTO notifications (type, message, id_medecin, lu)
            VALUES ('planning_jour', ?, ?, 0)
        `, [message, id_medecin]);

        res.json({
            success: true,
            message: 'Planning du jour envoyé à la secrétaire avec succès !',
            creneauxCount: creneaux.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;