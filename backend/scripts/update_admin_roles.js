const pool = require('../config/db');

async function migrate() {
  try {
    console.log('🔄 Mise à jour de la table administrateur...');
    
    // 1. Ajouter la colonne role si elle n'existe pas
    const [columns] = await pool.execute("SHOW COLUMNS FROM administrateur LIKE 'role'");
    if (columns.length === 0) {
      await pool.execute("ALTER TABLE administrateur ADD COLUMN role ENUM('super_admin', 'admin') DEFAULT 'admin'");
      console.log('✅ Colonne "role" ajoutée.');
    }

    // 2. Mettre à jour les rôles
    // Professeur Elhadj Yaya Baldé -> super_admin
    await pool.execute("UPDATE administrateur SET role = 'super_admin' WHERE id = 1");
    // Mamadou Bassirou Bah -> admin
    await pool.execute("UPDATE administrateur SET role = 'admin' WHERE id = 2");
    
    console.log('✅ Rôles mis à jour avec succès.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

migrate();
