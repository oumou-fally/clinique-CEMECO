const pool = require('../config/db');

async function setupMessagingTable() {
    try {
        console.log('🚀 Création de la table messagerie...');
        
        const sql = `
        CREATE TABLE IF NOT EXISTS messagerie (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_medecin INT NOT NULL,
            id_patient INT NOT NULL,
            expediteur ENUM('medecin', 'patient') NOT NULL,
            message TEXT NOT NULL,
            lu BOOLEAN DEFAULT FALSE,
            date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_message_medecin
                FOREIGN KEY (id_medecin)
                REFERENCES medecin(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_message_patient
                FOREIGN KEY (id_patient)
                REFERENCES patient(id)
                ON DELETE CASCADE
        );`;

        await pool.execute(sql);
        console.log('✅ Table messagerie prête !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création de la table:', error);
        process.exit(1);
    }
}

setupMessagingTable();
