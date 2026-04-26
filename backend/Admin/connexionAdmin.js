const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * POST /api/admin/login
 * Connexion administrateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, mot_de_passe, actif FROM administrateur WHERE email = ? LIMIT 1',
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

    if (password !== admin.mot_de_passe) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    await pool.execute(
      'UPDATE administrateur SET dernier_connexion = NOW() WHERE id = ?',
      [admin.id]
    );

    const adminResponse = {
      id: admin.id,
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email,
      nomComplet: `${admin.prenom} ${admin.nom}`
    };

    res.json({
      success: true,
      message: 'Connexion réussie',
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