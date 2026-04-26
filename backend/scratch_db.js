const pool = require('./config/db');

async function updateDatabase() {
    try {
        console.log('⏳ Mise à jour de la table reservation...');
        await pool.execute("ALTER TABLE reservation MODIFY COLUMN statut ENUM('attente', 'confirme', 'annule', 'termine') DEFAULT 'attente'");
        console.log('✅ Statut "termine" ajouté à reservation');

        console.log('⏳ Création de la table consultation...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS consultation (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_reservation INT NOT NULL,
                id_medecin INT NOT NULL,
                date_consultation DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                pa VARCHAR(20),
                fc VARCHAR(10),
                fr VARCHAR(10),
                temperature VARCHAR(10),
                saturation VARCHAR(10),
                poids VARCHAR(10),
                taille VARCHAR(10),
                imc VARCHAR(10),
                
                biologie TEXT,
                ecg TEXT,
                rx_pulmonaire TEXT,
                ett TEXT,
                
                symptomes TEXT,
                diagnostic TEXT,
                traitement TEXT,
                notes TEXT,
                
                FOREIGN KEY (id_reservation) REFERENCES reservation(id) ON DELETE CASCADE,
                FOREIGN KEY (id_medecin) REFERENCES medecin(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table consultation créée avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la base de données:', error);
    } finally {
        process.exit();
    }
}

updateDatabase();
