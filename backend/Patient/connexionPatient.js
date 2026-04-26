const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    console.log('📝 Tentative de connexion patient');
    console.log('📧 Email reçu:', email);

    // 🔴 nettoyage des données
    email = email?.trim()?.toLowerCase();
    password = password?.trim();

    console.log('🔄 Email normalisé:', email);

    // Vérification des champs
    if (!email || !password) {
      console.warn('⚠️ Validation échouée - Email ou mot de passe manquant');
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Recherche patient
    console.log('🔍 Recherche du patient en base de données...');
    const [rows] = await pool.execute(
      'SELECT id, nom, prenom, email, mot_de_passe FROM patient WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      console.error('❌ Patient non trouvé avec l\'email:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const patient = rows[0];
    console.log('✅ Patient trouvé en base de données');
    console.log('👤 ID:', patient.id);
    console.log('📛 Nom:', patient.prenom, patient.nom);

    // 🔴 nettoyage base
    const dbPassword = String(patient.mot_de_passe).trim();

    // comparaison
    console.log('🔐 Vérification du mot de passe...');
    if (password !== dbPassword) {
      console.error('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Mot de passe valide!');

    // update connexion
    console.log('⏰ Mise à jour de la dernière connexion...');
    await pool.execute(
      'UPDATE patient SET dernier_connexion = NOW() WHERE id = ?',
      [patient.id]
    );

    console.log('✨ Connexion réussie pour le patient ID:', patient.id);
    console.log('🎯 Redirection vers le dashboard du patient ID:', patient.id);

    return res.json({
      success: true,
      message: 'Connexion réussie',
      patient: {
        id: patient.id,
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
        nomComplet: `${patient.prenom} ${patient.nom}`
      }
    });

  } catch (error) {
    console.error('🔴 Erreur serveur:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;