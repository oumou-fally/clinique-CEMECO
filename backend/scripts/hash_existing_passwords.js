const pool = require('../config/db');
const { hashPassword, isHashedPassword } = require('../utils/auth');

async function hashTablePasswords(tableName, idColumn = 'id') {
  console.log(`\n🔐 Vérification des mots de passe dans la table ${tableName}...`);

  const [rows] = await pool.execute(`SELECT ${idColumn} AS id, mot_de_passe FROM ${tableName}`);
  let updatedCount = 0;

  for (const row of rows) {
    const password = row.mot_de_passe;
    if (!password || isHashedPassword(password)) {
      continue;
    }

    const hashedPassword = await hashPassword(String(password));
    await pool.execute(`UPDATE ${tableName} SET mot_de_passe = ? WHERE ${idColumn} = ?`, [hashedPassword, row.id]);
    updatedCount += 1;
  }

  console.log(`✅ ${updatedCount} mot${updatedCount > 1 ? 's' : ''} de passe mis à jour dans ${tableName}`);
}

async function run() {
  try {
    await hashTablePasswords('administrateur');
    await hashTablePasswords('medecin');
    await hashTablePasswords('secretaire');
    await hashTablePasswords('patient');

    console.log('\n🎉 Migration terminée. Tous les mots de passe non hachés ont été sécurisés.');
  } catch (error) {
    console.error('❌ Erreur lors du hash des mots de passe existants :', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
