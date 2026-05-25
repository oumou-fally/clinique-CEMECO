const express = require('express');
const pool = require('../config/db');
const { comparePassword, hashPassword, generateToken, isHashedPassword } = require('../utils/auth');

const router = express.Router();

/**
 * POST /api/admin/login
 * Connexion administrateur
 */
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, mot_de_passe, role, actif FROM administrateur WHERE LOWER(email) = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const admin = rows[0];

    if (!admin.actif) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    const isPasswordValid = await comparePassword(password, admin.mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    if (!isHashedPassword(admin.mot_de_passe)) {
      const hashedPassword = await hashPassword(password);
      await pool.execute('UPDATE administrateur SET mot_de_passe = ? WHERE id = ?', [hashedPassword, admin.id]);
    }

    await pool.execute(
      'UPDATE administrateur SET dernier_connexion = NOW() WHERE id = ?',
      [admin.id]
    );

    const token = generateToken({
      id: admin.id,
      role: admin.role || 'admin',
      email: admin.email
    });

    const adminResponse = {
      id: admin.id,
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      role: admin.role, // <-- Ajout du rôle
      nomComplet: `${admin.prenom} ${admin.nom}`
    };

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: adminResponse
    });

  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/admin/logout
 * Déconnexion (optionnel, peut être géré côté client)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

/**
 * GET /api/admin/profile/:id
 * Récupération du profil administrateur
 */
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, telephone, email, date_creation, dernier_connexion FROM administrateur WHERE id = ? AND actif = TRUE',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrateur non trouvé'
      });
    }

    const admin = rows[0];
    res.json({
      success: true,
      admin: {
        ...admin,
        nomComplet: `${admin.prenom} ${admin.nom}`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;