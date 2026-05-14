const pool = require('../config/db');

async function migrate() {
    try {
        console.log('🚀 Démarrage de la migration...');
        
        // Mise à jour de l'énumération des statuts
        await pool.execute(`
            ALTER TABLE planning_medecin 
            MODIFY COLUMN statut ENUM('disponible', 'indisponible', 'modifié', 'annulé', 'urgence') 
            DEFAULT 'disponible'
        `);
        
        console.log('✅ Table planning_medecin mise à jour avec succès.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

migrate();
