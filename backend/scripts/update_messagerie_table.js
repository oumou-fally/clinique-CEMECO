const pool = require('../config/db');

async function updateMessagingTable() {
    try {
        console.log('🚀 Mise à jour de la table messagerie...');
        
        const sql = `
        ALTER TABLE messagerie 
        ADD COLUMN type ENUM('text', 'image', 'vocal', 'file') DEFAULT 'text',
        ADD COLUMN fichier_url TEXT DEFAULT NULL;
        `;

        await pool.execute(sql);
        console.log('✅ Table messagerie mise à jour avec succès !');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('ℹ️ Les colonnes existent déjà.');
            process.exit(0);
        }
        console.error('❌ Erreur lors de la mise à jour de la table:', error);
        process.exit(1);
    }
}

updateMessagingTable();
