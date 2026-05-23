const pool = require('./db');

/**
 * Crée une notification pour un patient dans la base de données.
 */
async function notifyPatient({ id_patient, id_reservation, type, title, message }) {
  try {
    let resolvedPatientId = id_patient;
    if (!resolvedPatientId) {
      // Si l'id_patient n'est pas fourni mais qu'on a l'id_reservation, on le cherche
      if (id_reservation) {
        const [rows] = await pool.execute('SELECT patient_id FROM reservation WHERE id_reservation = ?', [id_reservation]);
        if (rows.length > 0) {
          resolvedPatientId = rows[0].patient_id;
        }
      }
    }
    
    if (!resolvedPatientId) {
      console.warn(`[NOTIFIER] Impossible d'envoyer la notification car aucun patient n'est associé à la réservation ${id_reservation}`);
      return { success: false, message: 'ID patient introuvable' };
    }

    await pool.execute(`
      INSERT INTO notifications (type, title, message, id_patient, id_reservation, lu)
      VALUES (?, ?, ?, ?, ?, 0)
    `, [type, title, message, resolvedPatientId, id_reservation || null]);

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la création de la notification patient:', error);
    return { success: false, error };
  }
}

module.exports = { notifyPatient };
