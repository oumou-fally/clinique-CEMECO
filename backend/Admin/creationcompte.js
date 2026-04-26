const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/**
 * Fonction pour générer un mot de passe aléatoire sécurisé
 */
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$-_+';
  let password = '';
  
  // Au moins une majuscule, une minuscule, un chiffre et un caractère spécial
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '@#$-_+'[Math.floor(Math.random() * 6)];

  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ========================
// GESTION DU PERSONNEL
// ========================

// POST /api/personnel - Ajouter un médecin ou secrétaire
router.post('/', async (req, res) => {
  try {
    const { prenom, nom, email, telephone, role, id_admin } = req.body;

    // Validation
    if (!prenom || !nom || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Prénom, nom, email et rôle sont obligatoires'
      });
    }

    const table = role === 'medecin' ? 'medecin' : 'secretaire';

    // Vérifier si l'email existe déjà
    const [existing] = await pool.execute(
      `SELECT id FROM ${table} WHERE email = ?`, [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Générer un mot de passe automatique
    const plainPassword = generatePassword(10);
    console.log(`🔑 Mot de passe généré pour ${prenom} ${nom} : ${plainPassword}`);

    // Récupérer l'id_admin depuis le body ou le middleware
    const adminId = id_admin || req.admin?.id || null;

    // Insertion dans la base (id_admin pour medecin ET secretaire)
    const [result] = await pool.execute(
      `INSERT INTO ${table} (prenom, nom, email, telephone, mot_de_passe, id_admin) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [prenom, nom, email, telephone, plainPassword, adminId]
    );

    console.log(`✅ ${role} créé avec succès - ID: ${result.insertId}`);

    // Réponse avec le mot de passe en clair (à donner à la personne)
    res.status(201).json({
      success: true,
      message: `${role === 'medecin' ? 'Médecin' : 'Secrétaire'} ajouté avec succès`,
      personnel: {
        id: result.insertId,
        prenom,
        nom,
        nomComplet: `${prenom} ${nom}`,
        email,
        telephone,
        role,
        statut: 'actif'
      },
      password: plainPassword,           // ← Mot de passe généré (important !)
      messagePassword: 'Donnez ce mot de passe à la personne concernée. Elle pourra le changer plus tard.'
    });

  } catch (error) {
    console.error('Erreur création personnel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création'
    });
  }
});

// GET /api/personnel - Liste des membres
router.get('/', async (req, res) => {
  try {
    const { role = 'tous', search } = req.query;

    let queryMed = `SELECT id, prenom, nom, email, telephone, 'medecin' as role, 'actif' as statut FROM medecin`;
    let querySec = `SELECT id, prenom, nom, email, telephone, 'secretaire' as role, 'actif' as statut FROM secretaire`;

    const params = [];

    if (search) {
      const term = `%${search}%`;
      queryMed += ` WHERE prenom LIKE ? OR nom LIKE ? OR email LIKE ?`;
      querySec += ` WHERE prenom LIKE ? OR nom LIKE ? OR email LIKE ?`;
      params.push(term, term, term);
    }

    const [medecins] = await pool.execute(queryMed, params);
    const [secretaires] = await pool.execute(querySec, params);

    let allPersonnel = [...medecins, ...secretaires];

    if (role !== 'tous') {
      allPersonnel = allPersonnel.filter(p => p.role === role);
    }

    allPersonnel = allPersonnel.map(p => ({
      ...p,
      nomComplet: `${p.prenom} ${p.nom}`
    }));

    res.json({
      success: true,
      count: allPersonnel.length,
      personnel: allPersonnel
    });

  } catch (error) {
    console.error('Erreur récupération personnel:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Les autres routes (GET /:id, PUT, DELETE) restent les mêmes que précédemment
// Je peux te les remettre si besoin.

module.exports = router;