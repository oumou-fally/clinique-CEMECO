const pool = require('../config/db');

async function run() {
  try {
    console.log('Début de la mise à jour de la table factures...');
    
    // 1. insurance_number
    const [cols] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'insurance_number'");
    if (cols.length === 0) {
      await pool.execute("ALTER TABLE factures ADD COLUMN insurance_number VARCHAR(100) NULL AFTER insurance_provider");
      console.log("✅ Colonne 'insurance_number' ajoutée.");
    } else {
      console.log("ℹ️ Colonne 'insurance_number' existe déjà.");
    }
    
    // 2. coverage_rate
    const [colsRate] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'coverage_rate'");
    if (colsRate.length === 0) {
      await pool.execute("ALTER TABLE factures ADD COLUMN coverage_rate INT DEFAULT 0 AFTER insurance_number");
      console.log("✅ Colonne 'coverage_rate' ajoutée.");
    } else {
      console.log("ℹ️ Colonne 'coverage_rate' existe déjà.");
    }

    // 3. montant_patient
    const [colsPt] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'montant_patient'");
    if (colsPt.length === 0) {
      await pool.execute("ALTER TABLE factures ADD COLUMN montant_patient DECIMAL(12,2) DEFAULT 0.00 AFTER montant");
      console.log("✅ Colonne 'montant_patient' ajoutée.");
    } else {
      console.log("ℹ️ Colonne 'montant_patient' existe déjà.");
    }

    // 4. montant_assurance
    const [colsIns] = await pool.execute("SHOW COLUMNS FROM factures LIKE 'montant_assurance'");
    if (colsIns.length === 0) {
      await pool.execute("ALTER TABLE factures ADD COLUMN montant_assurance DECIMAL(12,2) DEFAULT 0.00 AFTER montant_patient");
      console.log("✅ Colonne 'montant_assurance' ajoutée.");
    } else {
      console.log("ℹ️ Colonne 'montant_assurance' existe déjà.");
    }
    
    console.log('✅ Mise à jour de la base de données terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

run();
