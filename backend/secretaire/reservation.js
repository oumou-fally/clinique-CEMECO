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
        r.id_reservation AS id, r.date_rendez_vous, r.heure_rendez_vous, r.motif, r.statut,
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
        r.id_reservation AS id,
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
      ORDER BY r.id_reservation DESC
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
    // 1. Changer le statut + notifier le patient et marquer la notification secrétaire traitée
    await pool.execute(`
      UPDATE reservation
      SET statut = 'confirme', notif_patient = 1, notif_secretaire = 0
      WHERE id_reservation = ?
    `, [id])

    // 2. Récupérer les détails du RDV pour les notifications
    const [rdvRows] = await pool.execute(`
      SELECT r.*, p.nom AS patient_nom, p.prenom AS patient_prenom
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.id_reservation = ?
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
      WHERE id_reservation = ?
    `, [id_medecin, id])

    // 2. Récupérer les détails complets du RDV pour la notification
    const [rdvRows] = await pool.execute(`
      SELECT 
        r.id_reservation AS id, r.date_rendez_vous, r.heure_rendez_vous, r.motif,
        p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone AS patient_telephone
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.id_reservation = ?
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
      'SELECT * FROM reservation WHERE id_reservation = ?',
      [id]
    )

    if (rdv.length === 0) {
      return res.status(404).json({ success: false })
    }

    const reservation = rdv[0]

    if (reservation.id_medecin) {
      const [existingMed] = await pool.execute(
        'SELECT id, nom, prenom, specialite FROM medecin WHERE id = ?',
        [reservation.id_medecin]
      )
      return res.json({ success: true, medecin: existingMed[0], alreadyAssigned: true })
    }

    const [medecins] = await pool.execute(`
      SELECT m.id, m.nom, m.prenom, m.specialite
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
      WHERE id_reservation = ?
    `, [medecin.id, id])

    const [rdvRows] = await pool.execute(`
      SELECT 
        r.id_reservation AS id, r.date_rendez_vous, r.heure_rendez_vous, r.motif,
        p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone AS patient_telephone
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.id_reservation = ?
    `, [id])

    if (rdvRows.length > 0) {
      const rdvDetails = rdvRows[0]
      const dateFormatee = new Date(rdvDetails.date_rendez_vous).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const message = `🩺 Nouveau rendez-vous attribué — Patient : ${rdvDetails.patient_prenom} ${rdvDetails.patient_nom} | Date : ${dateFormatee} à ${rdvDetails.heure_rendez_vous?.substring(0,5)} | Motif : ${rdvDetails.motif || 'Non précisé'} | Tél. : ${rdvDetails.patient_telephone || 'N/A'}`

      await pool.execute(`
        INSERT INTO notifications (type, message, id_medecin, id_reservation, lu)
        VALUES ('rendez-vous', ?, ?, ?, 0)
      `, [message, medecin.id, id])
    }

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
        notif_secretaire = 0,
        notif_patient = 1,
        notif_medecin = IF(id_medecin IS NOT NULL, 1, notif_medecin)
      WHERE id_reservation = ?
    `, [date_rendez_vous, heure_rendez_vous, id])

    const [updatedRows] = await pool.execute(`
      SELECT id_medecin, date_rendez_vous, heure_rendez_vous
      FROM reservation
      WHERE id_reservation = ?
    `, [id])

    if (updatedRows.length > 0 && updatedRows[0].id_medecin) {
      const rdv = updatedRows[0]
      const msg = `⏳ Le rendez-vous a été reporté au ${new Date(rdv.date_rendez_vous).toLocaleDateString('fr-FR')} à ${rdv.heure_rendez_vous?.substring(0,5)}.`
      await pool.execute(`
        INSERT INTO notifications (type, message, id_medecin, id_reservation, lu)
        VALUES ('report', ?, ?, ?, 0)
      `, [msg, updatedRows[0].id_medecin, id])
    }

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
        notif_secretaire = 0,
        notif_patient = 1,
        notif_medecin = IF(id_medecin IS NOT NULL, 1, notif_medecin)
      WHERE id_reservation = ?
    `, [id])

    const [updatedRows] = await pool.execute(`
      SELECT id_medecin, date_rendez_vous, heure_rendez_vous
      FROM reservation
      WHERE id_reservation = ?
    `, [id])

    if (updatedRows.length > 0 && updatedRows[0].id_medecin) {
      const rdv = updatedRows[0]
      const msg = `❌ Le rendez-vous du ${new Date(rdv.date_rendez_vous).toLocaleDateString('fr-FR')} à ${rdv.heure_rendez_vous?.substring(0,5)} a été annulé.`
      await pool.execute(`
        INSERT INTO notifications (type, message, id_medecin, id_reservation, lu)
        VALUES ('annule', ?, ?, ?, 0)
      `, [msg, updatedRows[0].id_medecin, id])
    }

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
        r.id_reservation AS id,
        r.statut,
        r.date_rendez_vous,
        r.heure_rendez_vous,
        r.motif,
        r.notif_patient,
        m.nom AS medecin_nom,
        m.prenom AS medecin_prenom,
        CASE
          WHEN EXISTS(SELECT 1 FROM ordonnance o WHERE o.id_reservation = r.id_reservation) THEN CONCAT('Votre ordonnance pour le rendez-vous du ', DATE_FORMAT(r.date_rendez_vous, '%d/%m/%Y'), ' à ', TIME_FORMAT(r.heure_rendez_vous, '%H:%i'), ' est disponible. Consultez votre dossier médical.')
          WHEN r.statut = 'termine' THEN CONCAT('Votre consultation du ', DATE_FORMAT(r.date_rendez_vous, '%d/%m/%Y'), ' à ', TIME_FORMAT(r.heure_rendez_vous, '%H:%i'), ' a été enregistrée. Consultez votre dossier médical.')
          WHEN r.statut = 'confirme' THEN CONCAT('Votre rendez-vous du ', DATE_FORMAT(r.date_rendez_vous, '%d/%m/%Y'), ' à ', TIME_FORMAT(r.heure_rendez_vous, '%H:%i'), ' a été confirmé par la secrétaire.')
          WHEN r.statut = 'annule' THEN CONCAT('Votre rendez-vous du ', DATE_FORMAT(r.date_rendez_vous, '%d/%m/%Y'), ' à ', TIME_FORMAT(r.heure_rendez_vous, '%H:%i'), ' a été annulé par la secrétaire.')
          WHEN r.statut = 'reporte' THEN CONCAT('Votre rendez-vous a été reporté au ', DATE_FORMAT(r.date_rendez_vous, '%d/%m/%Y'), ' à ', TIME_FORMAT(r.heure_rendez_vous, '%H:%i'), ' par la secrétaire.')
          ELSE CONCAT('Votre demande de rendez-vous du ', DATE_FORMAT(r.date_rendez_vous, '%d/%m/%Y'), ' à ', TIME_FORMAT(r.heure_rendez_vous, '%H:%i'), ' est bien enregistrée. La secrétaire vous contactera bientôt.')
        END AS message
      FROM reservation r
      LEFT JOIN medecin m ON r.id_medecin = m.id
      WHERE r.patient_id = ? AND r.notif_patient = 1
      ORDER BY r.id_reservation DESC
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
    await pool.execute('UPDATE reservation SET notif_patient = 0 WHERE id_reservation = ?', [id])
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
      SELECT r.id_reservation AS id, r.date_rendez_vous, r.heure_rendez_vous, r.motif, r.statut,
             p.nom, p.prenom, 'rendezvous' AS type_notif
      FROM reservation r
      JOIN patient p ON r.patient_id = p.id
      WHERE r.notif_secretaire = 1
      ORDER BY r.id_reservation DESC
    `)

    const [planningRows] = await pool.execute(`
      SELECT id, type, message, created_at, 'planning' AS type_notif
      FROM notifications
      WHERE type = 'planning' AND lu = 0
      ORDER BY created_at DESC
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
// ✅ MARQUER NOTIFICATION SÉCRÉTAIRE COMME LUE
// ======================================================
router.put('/notifications/secretaire/:id/lu', async (req, res) => {
  const { id } = req.params
  try {
    await pool.execute('UPDATE reservation SET notif_secretaire = 0 WHERE id_reservation = ?', [id])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
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
    await pool.execute('DELETE FROM reservation WHERE id_reservation = ?', [id])
    res.json({ success: true })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

module.exports = router