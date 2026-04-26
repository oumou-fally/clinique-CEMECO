const pool = require('./config/db');

async function createOrdonnance() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS ordonnance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_medecin INT NOT NULL,
                id_reservation INT NOT NULL,
                nom_medicament VARCHAR(150) NOT NULL,
                dosage VARCHAR(100) NOT NULL,
                date_ordination TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_medecin) REFERENCES medecin(id) ON DELETE CASCADE,
                FOREIGN KEY (id_reservation) REFERENCES reservation(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table ordonnance créée avec succès');
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit();
    }
}

createOrdonnance();
