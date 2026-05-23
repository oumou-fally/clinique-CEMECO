const pool = require('../config/db');

async function run() {
  try {
    console.log('Début de la mise à jour de la table factures pour les chèques...');
    
    // 1. cheque_number
    const [colsNum] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'cheque_number'");
    if (colsNum.length === 0) {
      await pool.execute("ALTER TABLE factures ADD COLUMN cheque_number VARCHAR(100) NULL AFTER bank_account_number");
      console.log("✅ Colonne 'cheque_number' ajoutée.");
    } else {
      console.log("ℹ️ Colonne 'cheque_number' existe déjà.");
    }
    
    // 2. cheque_holder
    const [colsHolder] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'cheque_holder'");
    if (colsHolder.length === 0) {
      await pool.execute("ALTER TABLE factures ADD COLUMN cheque_holder VARCHAR(150) NULL AFTER cheque_number");
      console.log("✅ Colonne 'cheque_holder' ajoutée.");
    } else {
      console.log("ℹ️ Colonne 'cheque_holder' existe déjà.");
    }

    console.log('✅ Mise à jour des chèques terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

run();
