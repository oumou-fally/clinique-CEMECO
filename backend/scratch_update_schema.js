const pool = require('./config/db');

async function migrateSchema() {
    console.log('🚀 Démarrage de la mise à jour du schéma de base de données...');
    
    try {
        // 1. Modifier la colonne statut pour inclure 'en_cours_validation'
        console.log('⏳ Modification de la colonne statut...');
        await pool.execute(`
            ALTER TABLE factures 
            MODIFY COLUMN statut ENUM('en_attente', 'en_cours_validation', 'payee', 'annulee') DEFAULT 'en_attente'
        `);
        console.log('✅ Colonne statut modifiée avec succès.');

        // 2. Ajouter la colonne validation_ref si elle n'existe pas
        console.log("⏳ Ajout de la colonne validation_ref...");
        const [columns] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'validation_ref'");
        if (columns.length === 0) {
            await pool.execute(`
                ALTER TABLE factures 
                ADD COLUMN validation_ref VARCHAR(150) NULL AFTER orange_transaction_id
            `);
            console.log('✅ Colonne validation_ref ajoutée avec succès.');
        } else {
            console.log('ℹ️ La colonne validation_ref existe déjà.');
        }
        
        console.log('✨ Mise à jour du schéma SQL terminée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de la migration du schéma :', error.message);
    } finally {
        process.exit(0);
    }
}

migrateSchema();
