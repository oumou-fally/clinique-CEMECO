const pool = require('../config/db');

async function run() {
  try {
    console.log('Création de la table facture_history si elle n\'existe pas...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS facture_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        facture_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        old_value JSON NULL,
        new_value JSON NULL,
        user_role VARCHAR(50) NULL,
        user_id VARCHAR(100) NULL,
        note VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (facture_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Table facture_history prête.');
    process.exit(0);
  } catch (err) {
    console.error('Erreur création facture_history:', err);
    process.exit(1);
  }
}

run();
