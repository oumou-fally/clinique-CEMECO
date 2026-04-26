const express = require('express')
const router = express.Router()
const pool = require('../config/db')


// ======================================================
// 🌍 PLANNING GLOBAL (SECRÉTAIRE)
// ======================================================
router.get('/all/global', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.*,
                m.nom AS medecin_nom,
                m.prenom AS medecin_prenom,
                m.specialite
            FROM planning_medecin p
            JOIN medecin m ON p.id_medecin = m.id
            ORDER BY p.date_planning ASC, p.heure_debut ASC
        `)

        res.json({ success: true, planning: rows })

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false })
    }
})


// ======================================================
// 👨‍⚕️ PLANNING D'UN MÉDECIN
// ======================================================
router.get('/medecin/:medecinId', async (req, res) => {
    const { medecinId } = req.params

    try {
        const [rows] = await pool.execute(`
            SELECT * 
            FROM planning_medecin
            WHERE id_medecin = ?
            ORDER BY date_planning ASC, heure_debut ASC
        `, [medecinId])

        res.json({ success: true, planning: rows })

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false })
    }
})


// ======================================================
// 🔎 CHECK DISPONIBILITÉ MÉDECINS (IMPORTANT RDV)
// ======================================================
router.get('/check/:date/:heure', async (req, res) => {
    const { date, heure } = req.params

    try {
        const [rows] = await pool.execute(`
            SELECT DISTINCT
                m.id,
                m.nom,
                m.prenom,
                m.specialite
            FROM medecin m
            JOIN planning_medecin p ON m.id = p.id_medecin
            WHERE p.date_planning = ?
            AND p.statut = 'disponible'
            AND ? BETWEEN p.heure_debut AND p.heure_fin
        `, [date, heure])

        res.json({
            success: true,
            medecins: rows
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false })
    }
})


// ======================================================
// 📝 AJOUT / UPDATE PLANNING
// ======================================================
router.post('/', async (req, res) => {

    const {
        id,
        id_medecin,
        date_planning,
        heure_debut,
        heure_fin,
        statut,
        commentaire
    } = req.body

    if (!id_medecin || !date_planning || !heure_debut || !heure_fin) {
        return res.status(400).json({
            success: false,
            message: 'Données manquantes'
        })
    }

    try {

        // ======================================================
        // 🚨 CHECK CHEVAUCHEMENT
        // ======================================================
        const [overlaps] = await pool.execute(`
            SELECT id FROM planning_medecin
            WHERE id_medecin = ?
            AND date_planning = ?
            AND id != ?
            AND (heure_debut < ? AND heure_fin > ?)
        `, [
            id_medecin,
            date_planning,
            id || 0,
            heure_fin,
            heure_debut
        ])

        if (overlaps.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Créneau déjà occupé'
            })
        }

        // ======================================================
        // UPDATE
        // ======================================================
        if (id) {
            await pool.execute(`
                UPDATE planning_medecin
                SET date_planning = ?, heure_debut = ?, heure_fin = ?, statut = ?, commentaire = ?
                WHERE id = ?
            `, [
                date_planning,
                heure_debut,
                heure_fin,
                statut,
                commentaire,
                id
            ])

            // NOTIFICATION SECRETAIRE
            const [med] = await pool.execute('SELECT nom, prenom FROM medecin WHERE id = ?', [id_medecin])
            const msg = `Dr. ${med[0].prenom} ${med[0].nom} a modifié son planning du ${date_planning}`
            await pool.execute(`
                INSERT INTO notifications (type, message, id_medecin, lu)
                VALUES ('planning', ?, ?, 0)
            `, [msg, id_medecin])

            return res.json({
                success: true,
                message: 'Planning mis à jour'
            })
        }

        // ======================================================
        // INSERT
        // ======================================================
        await pool.execute(`
            INSERT INTO planning_medecin
            (id_medecin, date_planning, heure_debut, heure_fin, statut, commentaire)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            id_medecin,
            date_planning,
            heure_debut,
            heure_fin,
            statut || 'disponible',
            commentaire
        ])

        // NOTIFICATION SECRETAIRE
        const [med2] = await pool.execute('SELECT nom, prenom FROM medecin WHERE id = ?', [id_medecin])
        const msg2 = `Dr. ${med2[0].prenom} ${med2[0].nom} a ajouté un planning pour le ${date_planning}`
        await pool.execute(`
            INSERT INTO notifications (type, message, id_medecin, lu)
            VALUES ('planning', ?, ?, 0)
        `, [msg2, id_medecin])

        res.json({
            success: true,
            message: 'Planning ajouté'
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false })
    }
})


// ======================================================
// 🗑 SUPPRESSION
// ======================================================
router.delete('/:id', async (req, res) => {

    const { id } = req.params

    try {
        await pool.execute(
            'DELETE FROM planning_medecin WHERE id = ?',
            [id]
        )

        res.json({
            success: true,
            message: 'Planning supprimé'
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false })
    }
})


module.exports = router