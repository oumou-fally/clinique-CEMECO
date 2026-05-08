const express = require('express');
const pool = require('../config/db');
const { checkRole } = require('../middleware/authRole');

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
// Uniquement pour Super Admin
router.post('/', checkRole(['super_admin', 'admin']), async (req, res) => {
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
      [
        prenom || null, 
        nom || null, 
        email || null, 
        telephone || null, 
        plainPassword || null, 
        adminId || null
      ]
    );

    console.log(`✅ ${role} créé avec succès - ID: ${result.insertId}`);

    // Réponse avec le mot de passe en clair (à donner à la personne)
    res.status(201).json({
      success: true,
      message: `${role === 'medecin' ? 'Médecin' : 'Secrétaire'} ajouté avec succès`,
      personnel: {
        id: result.insertId,
        prenom: prenom.trim(),
        nom: nom.trim(),
        nomComplet: `${prenom.trim()} ${nom.trim()}`,
        email,
        telephone,
        role,
        statut: 'actif'
      },
      password: plainPassword,           // ← Mot de passe généré (important !)
      messagePassword: 'Donnez ce mot de passe à la personne concernée. Elle pourra le changer plus tard.'
    });

  } catch (error) {
    console.error('❌ Erreur création personnel:', error);
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
      prenom: (p.prenom || '').trim(),
      nom: (p.nom || '').trim(),
      nomComplet: `${(p.prenom || '').trim()} ${(p.nom || '').trim()}`
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

// DELETE /api/personnel/:id - Supprimer un médecin ou secrétaire
router.delete('/:id', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query; // 'medecin' ou 'secretaire'

    if (!id || !role) {
      return res.status(400).json({ success: false, message: 'ID et rôle requis' });
    }

    const table = role === 'medecin' ? 'medecin' : 'secretaire';

    // 1. Vérifier les dépendances (ex: rendez-vous pour les médecins)
    if (role === 'medecin') {
      const [appts] = await pool.execute('SELECT id_reservation FROM reservation WHERE id_medecin = ? LIMIT 1', [id]);
      if (appts.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Impossible de supprimer ce médecin car il a des rendez-vous enregistrés.' 
        });
      }
    }

    // 2. Supprimer
    await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Membre supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression personnel:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression' });
  }
});

// PUT /api/personnel/:id - Modifier un membre
router.put('/:id', checkRole(['super_admin', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, email, telephone, role } = req.body;

    const table = role === 'medecin' ? 'medecin' : 'secretaire';

    await pool.execute(
      `UPDATE ${table} SET prenom = ?, nom = ?, email = ?, telephone = ? WHERE id = ?`,
      [prenom, nom, email, telephone, id]
    );

    res.json({ success: true, message: 'Informations mises à jour' });
  } catch (error) {
    console.error('Erreur modification personnel:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;