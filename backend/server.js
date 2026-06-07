require('dotenv').config();
const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ======================================================
// 🧠 MIDDLEWARES
// ======================================================
// CORS (DEV)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-role');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// LOG REQUESTS
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// ======================================================
// 🔐 ROUTES AUTH / ADMIN
// ======================================================
app.use('/api/admin', require('./Admin/connexionAdmin'));
app.use('/api/admin/dashboard', require('./Admin/tableaubord'));
app.use('/api/admin/stats', require('./Admin/statsAdmin'));
app.use('/api/admin/tarifs', require('./Admin/tarifs'));
app.use('/api/admin/finances', require('./Admin/finances'));
app.use('/api/personnel', require('./Admin/creationcompte'));
app.use('/api/admin/parametres', require('./Admin/parametres'));

// ======================================================
// 👨‍⚕️ MÉDECIN
// ======================================================
app.use('/api/medecin', require('./medecin/connexionMedecin'));
app.use('/api/medecin/disponibilites', require('./medecin/disponibilite'));
app.use('/api/disponibilites', require('./medecin/disponibilite'));
app.use('/api/medecin/consultations', require('./medecin/consultation'));
app.use('/api/consultations', require('./medecin/consultation'));
app.use('/api/medecin/planning', require('./medecin/planning'));

// ======================================================
// 🧑 PATIENT
// ======================================================
app.use('/api/patient', require('./Patient/connexionPatient'));
app.use('/api/patient/dossier', require('./Patient/dossiermedical'));
app.use('/api/patient/medecins', require('./Patient/medecins'));
app.use('/api/patient/dashboard', require('./Patient/dashboard'));
app.use('/api/messagerie', require('./Patient/messagerie'));
app.use('/api/patient/types-consultation', require('./Patient/typesConsultation'));
app.use('/api/patient/notifications', require('./Patient/notificationpatient'));

// ======================================================
// 🧑‍💼 SECRÉTAIRE - ROUTES CORRIGÉES
// ======================================================
// Note: L'ordre est important - les routes spécifiques doivent venir avant les routes génériques
app.use('/api/secretaire', require('./secretaire/connexionSecretaire'));
app.use('/api/secretaire/medecins', require('./medecin/medecin'));
app.use('/api/secretaire/factures', require('./secretaire/factures')); // Route principale des factures

// ======================================================
// 📅 RÉSERVATIONS
// ======================================================
app.use('/api/reservations', require('./secretaire/reservation'));

// ======================================================
// 🔔 NOTIFICATIONS
// ======================================================
app.use('/api/notifications', require('./notifications/notifications'));

// ======================================================
// 📊 STATISTIQUES RENDEZ-VOUS
// ======================================================
app.use('/api/stats/rendezvous', require('./stats/rendezvousStats'));

// ======================================================
// 🏥 HEALTH CHECK
// ======================================================
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      status: 'ok',
      database: 'connected',
      environment: NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

// ======================================================
// 🧪 TEST DB
// ======================================================
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 AS test');
    connection.release();

    res.json({
      message: 'Connexion DB OK',
      result: rows
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ======================================================
// 🏠 ROOT
// ======================================================
app.get('/', (req, res) => {
  res.json({
    message: 'API CLINIQUE CEMECO',
    version: '1.0.0',
    environment: NODE_ENV,
    architecture: {
      auth: '/api/admin, /api/patient, /api/medecin, /api/secretaire',
      reservations: '/api/reservations',
      notifications: '/api/notifications',
      stats: '/api/stats/rendezvous',
      billing: '/api/secretaire/factures'
    }
  });
});

// ======================================================
// ❌ 404
// ======================================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ======================================================
// ⚠️ ERROR HANDLER
// ======================================================
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err);

  res.status(500).json({
    error: err.message || 'Erreur serveur'
  });
});

// ======================================================
// 🚀 START SERVER
// ======================================================
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🏥 API CLINIQUE CEMECO               ║
║   Environment: ${NODE_ENV}             ║
║   Port: ${PORT}                        ║
╚════════════════════════════════════════╝
  `);
  console.log(`✅ http://localhost:${PORT}`);
  console.log(`❤️  /api/health`);
  console.log(`📊 Factures: /api/secretaire/factures`);
});

// ======================================================
// 🧯 SHUTDOWN SAFE
// ======================================================
const shutdown = async (signal) => {
  console.log(`\n⏹️  ${signal} reçu`);
  
  server.close(async () => {
    try {
      await pool.end();
      console.log('✅ Fermeture propre terminée');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
  
  setTimeout(() => {
    console.error('⏰ Timeout, fermeture forcée');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));