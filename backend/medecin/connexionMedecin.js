const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📝 Tentative de connexion reçue');
    console.log('📧 Email:', email);

    if (!email || !password) {
      console.warn('⚠️ Validation échouée - Email ou mot de passe manquant');
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    console.log('🔍 Recherche du médecin en base de données...');
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, mot_de_passe, statut FROM medecin WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      console.error('❌ Médecin non trouvé avec l\'email:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const medecin = rows[0];
    console.log('✅ Médecin trouvé en base de données');
    console.log('👤 ID:', medecin.id);
    console.log('📛 Nom:', medecin.prenom, medecin.nom);
    console.log('📊 Statut:', medecin.statut);

    if (medecin.statut !== 'actif') {
      console.error('⛔ Compte désactivé pour:', medecin.email);
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // ✅ COMPARAISON DU MOT DE PASSE
    console.log('🔐 Vérification du mot de passe...');
    
    if (password !== medecin.mot_de_passe) {
      console.error('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Mot de passe valide!');
    console.log('⏰ Mise à jour de la dernière connexion...');

    await pool.execute(
      'UPDATE medecin SET dernier_connexion = NOW() WHERE id = ?',
      [medecin.id]
    );

    console.log('✨ Connexion réussie pour le médecin:', medecin.prenom, medecin.nom);
    console.log('🎯 Redirection vers le dashboard du médecin ID:', medecin.id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      medecin: {
        id: medecin.id,
        nom: medecin.nom,
        prenom: medecin.prenom,
        email: medecin.email,
        nomComplet: `${medecin.prenom} ${medecin.nom}`
      }
    });

  } catch (error) {
    console.error('🔴 Erreur serveur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;