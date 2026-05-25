const express = require('express');
const pool = require('../config/db');
const { comparePassword, hashPassword, generateToken, verifyToken, isHashedPassword } = require('../utils/auth');

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
       WHERE LOWER(email) = ?`,
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

    const isPasswordValid = await comparePassword(password, secretaire.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    if (!isHashedPassword(secretaire.mot_de_passe)) {
      const hashedPassword = await hashPassword(password);
      await pool.execute('UPDATE secretaire SET mot_de_passe = ? WHERE id = ?', [hashedPassword, secretaire.id]);
    }

    await pool.execute(
      'UPDATE secretaire SET dernier_connexion = NOW() WHERE id = ?',
      [secretaire.id]
    );

    const token = generateToken({
      id: secretaire.id,
      role: 'secretaire',
      email: secretaire.email
    });

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
      token,
      secretaire: secretaireData
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

    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Session invalide ou expirée'
      });
    }

    const { id } = payload;

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

// ======================================================
// 👤 GET PROFIL SECRÉTAIRE
// ======================================================
router.get('/profil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, telephone, statut FROM secretaire WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Secrétaire non trouvée' });
    }

    res.json({ success: true, secretaire: rows[0] });
  } catch (error) {
    console.error('Erreur GET profil secrétaire:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ======================================================
// ✏️ UPDATE PROFIL SECRÉTAIRE
// ======================================================
router.put('/profil/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone } = req.body;

    await pool.execute(
      'UPDATE secretaire SET nom = ?, prenom = ?, email = ?, telephone = ? WHERE id = ?',
      [nom, prenom, email, telephone, id]
    );

    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, telephone, statut FROM secretaire WHERE id = ? LIMIT 1',
      [id]
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      secretaire: rows[0]
    });
  } catch (error) {
    console.error('Erreur PUT profil secrétaire:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;