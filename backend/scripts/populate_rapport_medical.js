const pool = require('../config/db');

async function populate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Trouver les consultations existantes qui n'ont pas de rapport_medical
    const [rows] = await connection.execute(`
      SELECT c.id AS id_consultation, r.patient_id AS id_patient, c.date_consultation
      FROM consultation c
      JOIN reservation r ON c.id_reservation = r.id_reservation
      WHERE NOT EXISTS (
        SELECT 1 FROM rapport_medical rm WHERE rm.id_consultation = c.id
      )
    `);

    if (!rows || rows.length === 0) {
      console.log('Aucun rapport à insérer.');
      await connection.commit();
      return;
    }

    console.log(`Insertion de ${rows.length} rapport(s) médical(aux)...`);

    for (const r of rows) {
      const date = r.date_consultation || new Date();
      await connection.execute(
        'INSERT INTO rapport_medical (id_patient, id_consultation, date_rapport) VALUES (?, ?, ?)',
        [r.id_patient, r.id_consultation, date]
      );
    }

    await connection.commit();
    console.log('Import terminé.');
  } catch (err) {
    await connection.rollback();
    console.error('Erreur lors de l\'import des rapports médicaux :', err);
    process.exitCode = 1;
  } finally {
    connection.release();
    process.exit();
  }
}

populate();
