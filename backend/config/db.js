const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clinique_cemeco'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL:', err);
  } else {
    console.log('Connecté à MySQL');
  }
});

module.exports = db;