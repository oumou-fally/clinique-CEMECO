const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// ======================================================
// ✅ MIDDLEWARE VALIDATION
// ======================================================
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe sont requis'
    });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Format des données invalide'
    });
  }

  next();
};

// ======================================================
// 🔐 LOGIN SECRETAIRE
// ======================================================
router.post('/login-secretaire', validateLogin, async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim().toLowerCase();
    password = password.trim();

    console.log(`🔐 Tentative de connexion: ${email}`);

    const [rows] = await pool.execute(
      `SELECT id, nom, prenom, email, mot_de_passe, telephone, statut 
       FROM secretaire 
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const secretaire = rows[0];

    if (secretaire.statut !== 'actif') {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    if (password !== secretaire.mot_de_passe) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    await pool.execute(
      'UPDATE secretaire SET dernier_connexion = NOW() WHERE id = ?',
      [secretaire.id]
    );

    // Token simple (compatible avec ton système actuel)
    const token = Buffer.from(`${secretaire.id}:${Date.now()}`).toString('base64');

    const secretaireData = {
      id: secretaire.id,
      nom: secretaire.nom,
      prenom: secretaire.prenom,
      email: secretaire.email,
      telephone: secretaire.telephone || '',
      nomComplet: `${secretaire.prenom} ${secretaire.nom}`
    };

    console.log(`✅ Connexion réussie: ${secretaire.prenom} ${secretaire.nom}`);

    res.json({
      success: true,
      message: 'Connexion réussie',
      secretaire: secretaireData,
      token: token
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur. Veuillez réessayer plus tard.'
    });
  }
});


// ======================================================
// 🔍 VERIFY TOKEN
// ======================================================
router.get('/verify-secretaire', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const decoded = Buffer.from(token, 'base64').toString();
    const [id] = decoded.split(':');

    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, telephone FROM secretaire WHERE id = ? AND statut = "actif"',
      [id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Session expirée'
      });
    }

    const secretaire = rows[0];

    res.json({
      success: true,
      secretaire: {
        id: secretaire.id,
        nom: secretaire.nom,
        prenom: secretaire.prenom,
        email: secretaire.email,
        telephone: secretaire.telephone,
        nomComplet: `${secretaire.prenom} ${secretaire.nom}`
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de vérification'
    });
  }
});


// ======================================================
// 🔔 NOMBRE DE NOTIFICATIONS (AJOUT UTILE)
// ======================================================
router.get('/notifications/count/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM reservation
      WHERE id_secretaire = ?
      AND notif_secretaire = 1
    `, [id]);

    res.json({ success: true, total: rows[0].total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;