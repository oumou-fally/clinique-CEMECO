const pool = require('./config/db');

async function createPlanningTable() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS planning_medecin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_medecin INT NOT NULL,
                date_planning DATE NOT NULL,
                heure_debut TIME NOT NULL,
                heure_fin TIME NOT NULL,
                statut ENUM('disponible', 'indisponible', 'urgence') DEFAULT 'disponible',
                commentaire TEXT,
                FOREIGN KEY (id_medecin) REFERENCES medecin(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table planning_medecin créée avec succès');
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit();
    }
}

createPlanningTable();
