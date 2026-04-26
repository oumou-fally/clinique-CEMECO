const pool = require('./config/db');

async function migrate() {
  try {
    console.log('🚀 Démarrage de la migration de la table medecin...');

    // 1. Ajouter matricule
    try {
      await pool.execute('ALTER TABLE medecin ADD COLUMN matricule VARCHAR(20) UNIQUE AFTER id');
      console.log('✅ Colonne "matricule" ajoutée');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ Colonne "matricule" existe déjà');
      else throw e;
    }

    // 2. Ajouter specialite
    try {
      await pool.execute("ALTER TABLE medecin ADD COLUMN specialite VARCHAR(100) DEFAULT 'Cardiologue' AFTER nom");
      console.log('✅ Colonne "specialite" ajoutée');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️ Colonne "specialite" existe déjà');
      else throw e;
    }

    // 3. Mettre à jour les matricules existants s'ils sont nuls
    const [medecins] = await pool.execute('SELECT id FROM medecin WHERE matricule IS NULL');
    for (const med of medecins) {
      const matricule = `MED-${new Date().getFullYear()}-${med.id.toString().padStart(3, '0')}`;
      await pool.execute('UPDATE medecin SET matricule = ? WHERE id = ?', [matricule, med.id]);
      console.log(`✨ Matricule généré pour le médecin ID ${med.id}: ${matricule}`);
    }

    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

migrate();
