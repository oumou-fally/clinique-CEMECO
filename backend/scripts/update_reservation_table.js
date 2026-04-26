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

    console.log('Suppression de l\'ancienne table reservation...');
    await pool.query('DROP TABLE IF EXISTS reservation');

    console.log('Création de la nouvelle table reservation...');
    await pool.query(`
      CREATE TABLE reservation (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        date_naissance DATE NOT NULL,
        sexe ENUM('M', 'F') NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        adresse TEXT,
        motif TEXT,
        date_rendez_vous DATE NOT NULL,
        heure_rendez_vous TIME NOT NULL,
        id_secretaire INT NOT NULL,
        id_medecin INT NOT NULL,
        statut ENUM('attente', 'confirme', 'annule') DEFAULT 'attente',
        CONSTRAINT fk_reservation_secretaire
          FOREIGN KEY (id_secretaire) REFERENCES secretaire(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_reservation_medecin
          FOREIGN KEY (id_medecin) REFERENCES medecin(id)
          ON DELETE CASCADE
      )
    `);

    console.log('Table reservation créée avec succès selon le nouveau schéma');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la base de données:', error);
    process.exit(1);
  }
}

run();
