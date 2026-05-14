const pool = require('../config/db');

async function initSystemSettings() {
    try {
        console.log('🚀 Initialisation des paramètres système...');

        // 1. Table Horaires
        await pool.query(`
            CREATE TABLE IF NOT EXISTS horaires_clinique (
                id INT AUTO_INCREMENT PRIMARY KEY,
                jour VARCHAR(20) NOT NULL UNIQUE,
                debut TIME NOT NULL,
                fin TIME NOT NULL,
                actif BOOLEAN DEFAULT TRUE
            )
        `);

        // 2. Table Spécialités
        await pool.query(`
            CREATE TABLE IF NOT EXISTS specialites_clinique (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                icon_name VARCHAR(50) DEFAULT 'Heart'
            )
        `);

        // 3. Insertion des données par défaut si vide
        const [hCount] = await pool.query('SELECT COUNT(*) as count FROM horaires_clinique');
        if (hCount[0].count === 0) {
            console.log('📅 Insertion des horaires par défaut...');
            const jours = [
                ['lundi', '08:00', '18:00', 1],
                ['mardi', '08:00', '18:00', 1],
                ['mercredi', '08:00', '18:00', 1],
                ['jeudi', '08:00', '18:00', 1],
                ['vendredi', '08:00', '18:00', 1],
                ['samedi', '09:00', '13:00', 1],
                ['dimanche', '00:00', '00:00', 0]
            ];
            for (const [j, d, f, a] of jours) {
                await pool.query('INSERT INTO horaires_clinique (jour, debut, fin, actif) VALUES (?, ?, ?, ?)', [j, d, f, a]);
            }
        }

        const [sCount] = await pool.query('SELECT COUNT(*) as count FROM specialites_clinique');
        if (sCount[0].count === 0) {
            console.log('❤️ Insertion des spécialités par défaut...');
            const specs = [
                ['Cardiologie Clinique', 'Consultations et suivis cardiaques standards', 'Heart'],
                ['Rhythmologie', 'Troubles du rythme et pacemakers', 'Activity'],
                ['Chirurgie Cardiaque', 'Interventions chirurgicales lourdes', 'Stethoscope'],
                ['Cardiologie Vasculaire', 'Pathologies des vaisseaux et artères', 'Activity']
            ];
            for (const [n, d, i] of specs) {
                await pool.query('INSERT INTO specialites_clinique (nom, description, icon_name) VALUES (?, ?, ?)', [n, d, i]);
            }
        }

        console.log('✅ Configuration système initialisée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        process.exit(1);
    }
}

initSystemSettings();
