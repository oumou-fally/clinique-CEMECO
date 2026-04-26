const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Pool de connexions MySQL optimisé
 * Gère automatiquement les connexions réutilisables
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinique_cemeco',
  port: process.env.DB_PORT || 3306,
  
  // Configuration du pool
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
  queueLimit: 0,

  // Multiuser queries
  multipleStatements: false,
  
  // Character set
  charset: 'utf8mb4'
});

/**
 * Teste la connexion au démarrage
 */
pool.getConnection()
  .then(connection => {
    connection.ping()
      .then(() => {
        console.log('✅ Pool MySQL connecté avec succès');
        connection.release();
      })
      .catch(err => {
        console.error('❌ Erreur de ping MySQL :', err.message);
      });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion au pool MySQL :', err.message);
    console.error('   Vérifiez: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    process.exit(1);
  });

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('❌ Erreur non gérée du pool :', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    console.error('Database had a fatal error.');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_HANDSHAKE_FAILURE') {
    console.error('Database had a handshake failure.');
  }
});

module.exports = pool;