// routes/connexionPatient.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { sendOTPEmail } = require('../config/mailer');

const router = express.Router();

// Création du dossier logs
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    console.log('📝 Tentative de connexion patient');
    console.log('📧 Email reçu:', email);

    // Nettoyage des données
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

    // Nettoyage base
    const dbPassword = String(patient.mot_de_passe).trim();

    // Comparaison
    console.log('🔐 Vérification du mot de passe...');
    if (password !== dbPassword) {
      console.error('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log('✅ Mot de passe valide!');

    // Update connexion
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

// Inscription d'un nouveau patient
router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, sexe, date_naissance, commune, quartier, password } = req.body;

    // Validation basique
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Les champs Nom, Prénom, Email et Mot de passe sont requis'
      });
    }

    // Vérifier si l'email existe déjà
    const [existing] = await pool.execute('SELECT id FROM patient WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Insertion du nouveau patient
    const [result] = await pool.execute(
      'INSERT INTO patient (nom, prenom, email, telephone, sexe, date_naissance, commune, quartier, mot_de_passe, dernier_connexion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [nom, prenom, email, telephone, sexe, date_naissance, commune, quartier, password]
    );

    const newPatientId = result.insertId;

    return res.json({
      success: true,
      message: 'Compte créé avec succès',
      patient: {
        id: newPatientId,
        nom,
        prenom,
        email,
        nomComplet: `${prenom} ${nom}`
      }
    });

  } catch (error) {
    console.error('🔴 Erreur lors de l\'inscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});

// ======================================================
// 🔑 SYSTÈME DE MOT DE PASSE OUBLIÉ (OTP)
// ======================================================

// 1. Demander la réinitialisation (Envoi OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim()?.toLowerCase();
    console.log('📨 /api/patient/forgot-password appelé', { rawEmail: req.body.email, normalizedEmail: email });

    if (!email) {
      console.warn('⚠️ forgot-password : email manquant');
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    // Vérifier si le patient existe
    const [rows] = await pool.execute('SELECT id, nom, prenom FROM patient WHERE email = ?', [email]);
    if (rows.length === 0) {
      console.warn('⚠️ forgot-password : email introuvable', email);
      // Pour des raisons de sécurité, on ne révèle pas que l'email n'existe pas
      return res.status(200).json({ 
        success: true, 
        message: 'Si cet email est associé à un compte, vous recevrez un code de vérification.' 
      });
    }

    const patient = rows[0];
    
    // Générer OTP (6 chiffres)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔐 OTP généré', { otp, expiry: expiry.toISOString(), patientId: patient.id });

    // Enregistrer en base
    await pool.execute(
      'UPDATE patient SET reset_otp = ?, reset_otp_expiry = ?, reset_otp_attempts = 0 WHERE id = ?',
      [otp, expiry, patient.id]
    );
    console.log('💾 OTP enregistré en base pour le patient', patient.id);

    // Envoyer l'email
    try {
      await sendOTPEmail(email, otp, `${patient.prenom} ${patient.nom}`);
      console.log('✅ Email envoyé avec succès à', email);
      
      return res.json({
        success: true,
        message: 'Un code de vérification a été envoyé à votre adresse email.'
      });
    } catch (mailError) {
      console.error('🔴 Erreur Email lors de sendOTPEmail:', mailError);
      
      // Log détaillé
      fs.appendFileSync(path.join(logsDir, 'forgot_password_errors.log'), 
        `\n[${new Date().toISOString()}] Erreur envoi email - Patient: ${patient.id} (${email}) - Erreur: ${mailError.message}\n`
      );
      
      // Réinitialiser l'OTP en cas d'échec
      await pool.execute(
        'UPDATE patient SET reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
        [patient.id]
      );
      
      return res.status(500).json({
        success: false,
        message: 'Erreur technique lors de l\'envoi de l\'email. Veuillez réessayer.'
      });
    }

  } catch (error) {
    console.error('🔴 Erreur Forgot Password:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 2. Vérifier le code OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const email = req.body.email?.trim()?.toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email et code requis' });
    }

    const [rows] = await pool.execute(
      'SELECT id, reset_otp, reset_otp_expiry, reset_otp_attempts FROM patient WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucune demande de réinitialisation trouvée' });
    }

    const patient = rows[0];

    // Vérifier les tentatives (max 5)
    if (patient.reset_otp_attempts >= 5) {
      await pool.execute(
        'UPDATE patient SET reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
        [patient.id]
      );
      return res.status(400).json({ 
        success: false, 
        message: 'Trop de tentatives. Veuillez refaire une demande.' 
      });
    }

    if (!patient.reset_otp || patient.reset_otp !== otp) {
      // Incrémenter le compteur de tentatives
      await pool.execute(
        'UPDATE patient SET reset_otp_attempts = reset_otp_attempts + 1 WHERE id = ?',
        [patient.id]
      );
      return res.status(400).json({ success: false, message: 'Code invalide' });
    }

    if (new Date() > new Date(patient.reset_otp_expiry)) {
      await pool.execute(
        'UPDATE patient SET reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
        [patient.id]
      );
      return res.status(400).json({ success: false, message: 'Code expiré. Veuillez refaire une demande.' });
    }

    // Code valide - générer un token temporaire pour la réinitialisation
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.execute(
      'UPDATE patient SET reset_token = ?, reset_token_expiry = ?, reset_otp_attempts = 0 WHERE id = ?',
      [resetToken, tokenExpiry, patient.id]
    );

    return res.json({ 
      success: true, 
      message: 'Code valide',
      resetToken // En production, utiliser une session
    });

  } catch (error) {
    console.error('🔴 Erreur Verify OTP:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// 3. Réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { email: rawEmail, resetToken, newPassword } = req.body;
    const email = rawEmail?.trim()?.toLowerCase();

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier le token
    const [rows] = await pool.execute(
      `SELECT id, reset_token, reset_token_expiry 
       FROM patient 
       WHERE email = ? AND reset_token = ?`,
      [email, resetToken]
    );

    if (rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session invalide. Veuillez refaire une demande.' 
      });
    }

    const patient = rows[0];

    if (new Date() > new Date(patient.reset_token_expiry)) {
      await pool.execute(
        'UPDATE patient SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [patient.id]
      );
      return res.status(400).json({ 
        success: false, 
        message: 'Session expirée. Veuillez refaire une demande.' 
      });
    }

    // Mettre à jour le mot de passe
    await pool.execute(
      `UPDATE patient 
       SET mot_de_passe = ?,
           reset_otp = NULL,
           reset_otp_expiry = NULL,
           reset_otp_attempts = 0,
           reset_token = NULL,
           reset_token_expiry = NULL
       WHERE id = ?`,
      [newPassword, patient.id]
    );

    console.log(`✅ Mot de passe réinitialisé pour le patient ${patient.id} (${email})`);

    return res.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    });

  } catch (error) {
    console.error('🔴 Erreur Reset Password:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;