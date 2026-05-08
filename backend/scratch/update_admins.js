const pool = require('../config/db');

async function updateAdmins() {
  try {
    await pool.execute('UPDATE administrateur SET nom = ?, prenom = ? WHERE id = 1', ['Baldé', 'Elhadj Yaya']);
    await pool.execute('UPDATE administrateur SET nom = ?, prenom = ? WHERE id = 2', ['Bah', 'Mamadou Bassirou']);
    console.log('✅ Noms des administrateurs mis à jour');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

updateAdmins();
