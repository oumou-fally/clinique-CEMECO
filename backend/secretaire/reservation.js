const express = require('express')
const pool = require('../config/db')
const router = express.Router()

// ======================================================
// 📋 GET RESERVATIONS D'UN PATIENT
// ======================================================
router.get('/patient/:patientId', async (req, res) => {
  const { patientId } = req.params
  try {
    const [rows] = await pool.execute(`
      SELECT 
        r.id, r.date_rendez_vous, r.heure_rendez_vous, r.motif, r.statut,
        m.nom AS medecin_nom, m.prenom AS medecin_prenom
      FROM reservation r
      LEFT JOIN medecin m ON r.id_medecin = m.id
      WHERE r.patient_id = ?
      ORDER BY r.date_rendez_vous DESC
    `, [patientId])
    res.json({ success: true, reservations: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 🔍 GET ALL RESERVATIONS
// ======================================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        r.id,
        r.patient_id,
        p.nom AS patient_nom,
        p.prenom AS patient_prenom,
        r.date_rendez_vous,
        r.heure_rendez_vous,
        r.motif,
        r.statut,
        r.id_medecin,
        m.nom AS medecin_nom,
        m.prenom AS medecin_prenom
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      LEFT JOIN medecin m ON r.id_medecin = m.id
      ORDER BY r.id DESC
    `)

    res.json({ success: true, reservations: rows })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 📝 CREATE RESERVATION
// ======================================================
router.post('/', async (req, res) => {
  const {
    patient_id,
    id_secretaire,
    date_rendez_vous,
    heure_rendez_vous,
    motif
  } = req.body

  try {
    const [result] = await pool.execute(`
      INSERT INTO reservation
      (patient_id, id_secretaire, date_rendez_vous, heure_rendez_vous, motif, statut, notif_secretaire)
      VALUES (?, ?, ?, ?, ?, 'attente', 1)
    `, [
      patient_id,
      id_secretaire,
      date_rendez_vous,
      heure_rendez_vous,
      motif
    ])

    res.json({ success: true, id: result.insertId })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// ✅ CONFIRMER RDV
// ======================================================
router.put('/:id/confirm', async (req, res) => {
  const { id } = req.params

  try {
    // 1. Changer le statut + notifier le patient
    await pool.execute(`
      UPDATE reservation
      SET statut = 'confirme', notif_patient = 1
      WHERE id = ?
    `, [id])

    // 2. Récupérer les détails du RDV pour les notifications
    const [rdvRows] = await pool.execute(`
      SELECT r.*, p.nom AS patient_nom, p.prenom AS patient_prenom
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.id = ?
    `, [id])

    if (rdvRows.length > 0) {
      const rdv = rdvRows[0]
      const dateFormatee = new Date(rdv.date_rendez_vous).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })

      // 3. Si un médecin est déjà assigné, lui envoyer aussi une notification
      if (rdv.id_medecin) {
        const msg = `✅ Rendez-vous confirmé — Patient : ${rdv.patient_prenom} ${rdv.patient_nom} | Date : ${dateFormatee} à ${rdv.heure_rendez_vous?.substring(0,5)} | Motif : ${rdv.motif || 'Non précisé'}`
        await pool.execute(`
          INSERT INTO notifications (type, message, id_medecin, id_reservation, lu)
          VALUES ('confirmation', ?, ?, ?, 0)
        `, [msg, rdv.id_medecin, id])
      }
    }

    res.json({ success: true })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 👨‍⚕️ ASSIGNER MÉDECIN
// ======================================================
router.put('/:id/assign', async (req, res) => {
  const { id } = req.params
  const { id_medecin } = req.body

  try {
    // 1. Mettre à jour la réservation
    await pool.execute(`
      UPDATE reservation
      SET 
        id_medecin = ?,
        statut = 'attribue',
        notif_medecin = 1,
        notif_patient = 1
      WHERE id = ?
    `, [id_medecin, id])

    // 2. Récupérer les détails complets du RDV pour la notification
    const [rdvRows] = await pool.execute(`
      SELECT 
        r.id, r.date_rendez_vous, r.heure_rendez_vous, r.motif,
        p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone AS patient_telephone
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.id = ?
    `, [id])

    if (rdvRows.length > 0) {
      const rdv = rdvRows[0]
      const dateFormatee = new Date(rdv.date_rendez_vous).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const message = `🩺 Nouveau rendez-vous attribué — Patient : ${rdv.patient_prenom} ${rdv.patient_nom} | Date : ${dateFormatee} à ${rdv.heure_rendez_vous?.substring(0,5)} | Motif : ${rdv.motif || 'Non précisé'} | Tél. : ${rdv.patient_telephone || 'N/A'}`

      await pool.execute(`
        INSERT INTO notifications (type, message, id_medecin, id_reservation, lu)
        VALUES ('rendez-vous', ?, ?, ?, 0)
      `, [message, id_medecin, id])
    }

    res.json({ success: true })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 🤖 AUTO ASSIGN
// ======================================================
router.put('/:id/auto-assign', async (req, res) => {
  const { id } = req.params

  try {
    const [rdv] = await pool.execute(
      'SELECT * FROM reservation WHERE id = ?',
      [id]
    )

    if (rdv.length === 0) {
      return res.status(404).json({ success: false })
    }

    const reservation = rdv[0]

    const [medecins] = await pool.execute(`
      SELECT m.id
      FROM planning_medecin p
      JOIN medecin m ON p.id_medecin = m.id
      WHERE p.date_planning = ?
      AND p.statut = 'disponible'
      AND ? BETWEEN p.heure_debut AND p.heure_fin
      LIMIT 1
    `, [
      reservation.date_rendez_vous,
      reservation.heure_rendez_vous
    ])

    if (medecins.length === 0) {
      return res.json({ success: false, message: 'Aucun médecin disponible' })
    }

    const medecin = medecins[0]

    await pool.execute(`
      UPDATE reservation
      SET 
        id_medecin = ?,
        statut = 'attribue',
        notif_medecin = 1,
        notif_patient = 1
      WHERE id = ?
    `, [medecin.id, id])

    res.json({ success: true, medecin })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 🔄 REPORT
// ======================================================
router.put('/:id/report', async (req, res) => {
  const { id } = req.params
  const { date_rendez_vous, heure_rendez_vous } = req.body

  try {
    await pool.execute(`
      UPDATE reservation
      SET 
        date_rendez_vous = ?,
        heure_rendez_vous = ?,
        statut = 'reporte',
        notif_secretaire = 1,
        notif_patient = 1
      WHERE id = ?
    `, [date_rendez_vous, heure_rendez_vous, id])

    res.json({ success: true })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// ❌ CANCEL
// ======================================================
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params

  try {
    await pool.execute(`
      UPDATE reservation
      SET 
        statut = 'annule',
        notif_secretaire = 1,
        notif_patient = 1
      WHERE id = ?
    `, [id])

    res.json({ success: true })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 🔔 NOTIFICATIONS PATIENT
// ======================================================
router.get('/notifications/patient/:patientId', async (req, res) => {
  const { patientId } = req.params
  try {
    const [rows] = await pool.execute(`
      SELECT 
        r.id, r.statut, r.date_rendez_vous, r.heure_rendez_vous, r.motif, r.notif_patient,
        m.nom AS medecin_nom, m.prenom AS medecin_prenom
      FROM reservation r
      LEFT JOIN medecin m ON r.id_medecin = m.id
      WHERE r.patient_id = ? AND r.notif_patient = 1
      ORDER BY r.id DESC
    `, [patientId])
    res.json({ success: true, notifications: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

// ======================================================
// ✅ MARQUER NOTIFICATION PATIENT COMME LUE
// ======================================================
router.put('/notifications/patient/:id/lu', async (req, res) => {
  const { id } = req.params
  try {
    await pool.execute('UPDATE reservation SET notif_patient = 0 WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

// ======================================================
// 🔔 NOTIFICATIONS SECRÉTAIRE
// ======================================================
router.get('/notifications/secretaire', async (req, res) => {
  try {
    const [rdvRows] = await pool.execute(`
      SELECT r.id, r.date_rendez_vous, r.heure_rendez_vous, r.motif, r.statut,
             p.nom, p.prenom, 'rendezvous' AS type_notif
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.notif_secretaire = 1
      ORDER BY r.id DESC
    `)

    const [planningRows] = await pool.execute(`
      SELECT id, type, message, created_at, 'planning' AS type_notif
      FROM notifications
      WHERE lu = 0
      ORDER BY id DESC
    `)

    res.json({ 
        success: true, 
        notifications: {
            rendezvous: rdvRows,
            planning: planningRows
        }
    })

  } catch (error) {
    res.status(500).json({ success: false })
  }
})


// ======================================================
// ✅ MARQUER NOTIFICATION SYSTÈME COMME LUE
// ======================================================
router.put('/notifications/systeme/:id/lu', async (req, res) => {
  const { id } = req.params
  try {
    await pool.execute('UPDATE notifications SET lu = 1 WHERE id = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

// ======================================================
// 📊 STATS DASHBOARD (UNIQUE + PROPRE)
// ======================================================
router.get('/stats/dashboard', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN statut = 'attente' THEN 1 ELSE 0 END) AS attente,
        SUM(CASE WHEN statut = 'confirme' THEN 1 ELSE 0 END) AS confirme,
        SUM(CASE WHEN statut = 'annule' THEN 1 ELSE 0 END) AS annule,
        SUM(CASE WHEN statut = 'reporte' THEN 1 ELSE 0 END) AS reporte
      FROM reservation
    `)

    res.json({
      success: true,
      stats: rows[0]
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})


// ======================================================
// 🗑 DELETE
// ======================================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await pool.execute('DELETE FROM reservation WHERE id = ?', [id])
    res.json({ success: true })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

module.exports = router