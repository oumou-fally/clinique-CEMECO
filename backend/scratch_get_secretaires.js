const pool = require('./config/db');

async function getSecretaires() {
  try {
    const [rows] = await pool.execute('SELECT email, mot_de_passe, prenom, nom FROM secretaire');
    console.log('👥 Liste des secrétaires :');
    rows.forEach(sec => {
      console.log(`- Nom: ${sec.prenom} ${sec.nom}`);
      console.log(`  Email: ${sec.email}`);
      console.log(`  Mot de passe: ${sec.mot_de_passe}`);
      console.log('---------------------------');
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

getSecretaires();
