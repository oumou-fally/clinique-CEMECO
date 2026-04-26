const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Insertion d\'un rendez-vous de test...');
    
    // Récupérer un médecin et une secrétaire
    const [medecins] = await pool.query('SELECT id FROM medecin LIMIT 1');
    const [secretaires] = await pool.query('SELECT id FROM secretaire LIMIT 1');

    if (medecins.length === 0 || secretaires.length === 0) {
      console.error('Erreur: Aucun médecin ou secrétaire trouvé.');
      process.exit(1);
    }

    const medecinId = medecins[0].id;
    const secretaireId = secretaires[0].id;

    await pool.execute(
      `INSERT INTO reservation 
      (nom, prenom, date_naissance, sexe, telephone, email, adresse, motif, date_rendez_vous, heure_rendez_vous, id_secretaire, id_medecin, statut) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'attente')`,
      [
        'Sow', 
        'Amadou', 
        '1995-05-15', 
        'M', 
        '622 00 00 00', 
        'amadou@test.com', 
        'Conakry', 
        'Consultation de routine', 
        '2026-04-25', 
        '10:30', 
        secretaireId, 
        medecinId
      ]
    );

    console.log('Rendez-vous de test inséré avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'insertion:', error);
    process.exit(1);
  }
}

run();
