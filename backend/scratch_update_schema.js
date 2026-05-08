const pool = require('./config/db');

async function updateSchema() {
  try {
    console.log('🔄 Mise à jour du schéma...');
    
    // Update Enum
    await pool.query("ALTER TABLE reservation MODIFY COLUMN statut ENUM('attente','confirme','annule','termine','reporte','attribue') DEFAULT 'attente'");
    console.log('✅ Statut enum mis à jour');

    // Add motif_report
    try {
        await pool.query("ALTER TABLE reservation ADD COLUMN motif_report TEXT AFTER motif");
        console.log('✅ Colonne motif_report ajoutée');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ Colonne motif_report existe déjà');
        } else {
            throw err;
        }
    }

    console.log('✨ Mise à jour terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

updateSchema();
