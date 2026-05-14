const pool = require('../config/db');

async function extendSystemSettings() {
    try {
        console.log('🚀 Extension des paramètres système...');

        // 1. Table Informations Clinique
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clinique_info (
                id INT PRIMARY KEY DEFAULT 1,
                nom VARCHAR(200) NOT NULL,
                adresse TEXT,
                telephone VARCHAR(50),
                email VARCHAR(150),
                site_web VARCHAR(150),
                notifications_email BOOLEAN DEFAULT TRUE,
                sauvegarde_auto BOOLEAN DEFAULT TRUE,
                retention_donnees VARCHAR(50) DEFAULT 'unlimited'
            )
        `);

        // 2. Insertion des données par défaut si vide
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM clinique_info');
        if (rows[0].count === 0) {
            console.log('📝 Insertion des informations clinique par défaut...');
            await pool.query(`
                INSERT INTO clinique_info (id, nom, adresse, telephone, email, site_web) 
                VALUES (1, 'Clinique CEMECO', 'Kipé, près de Heroes Coffee - En face de Plaza Diamond', '+224 622 00 00 00', 'contact@cemeco.gn', 'www.cemeco.gn')
            `);
        }

        console.log('✅ Extension terminée !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur extension:', error);
        process.exit(1);
    }
}

extendSystemSettings();
