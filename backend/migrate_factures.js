const pool = require('./config/db');

async function migrate() {
    console.log('🚀 Démarrage de la mise à jour de la structure de la base de données...');
    
    const queries = [
        // 1. Suppression de la table existante si nécessaire pour repartir sur une base propre (ATTENTION : efface les données de test)
        // Alternativement, on peut faire des ALTER TABLE, mais ici on va s'assurer que la structure est EXACTEMENT celle demandée.
        "DROP TABLE IF EXISTS factures;",
        
        // 2. Création de la table selon le schéma exact fourni par l'utilisateur
        `CREATE TABLE factures (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rendez_vous_id INT NULL,
            consultation_id INT NULL,
            patient_id INT NOT NULL,
            type_consultation_id INT NOT NULL,
            patient_nom VARCHAR(150) NOT NULL,
            service VARCHAR(150) NOT NULL,
            montant DECIMAL(12,2) NOT NULL,
            patient_type ENUM('insured', 'non-insured') NOT NULL DEFAULT 'non-insured',
            payment_method ENUM('cash', 'cheque', 'banque', 'orange-money', 'autre') NULL,
            insurance_provider VARCHAR(100) NULL,
            bank_name VARCHAR(100) NULL,
            bank_account_number VARCHAR(50) NULL,
            bank_rib VARCHAR(50) NULL,
            orange_number VARCHAR(20) NULL,
            orange_name VARCHAR(100) NULL,
            orange_transaction_id VARCHAR(50) NULL,
            date_facture DATE DEFAULT (CURRENT_DATE),
            statut ENUM('en_attente', 'payee', 'annulee') DEFAULT 'en_attente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patient(id),
            FOREIGN KEY (type_consultation_id) REFERENCES type_consultation(id)
        );`
    ];

    try {
        for (const query of queries) {
            await pool.execute(query);
            console.log(`✅ Requête exécutée avec succès`);
        }
        console.log('✨ Migration terminée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
    } finally {
        process.exit(0);
    }
}

migrate();
