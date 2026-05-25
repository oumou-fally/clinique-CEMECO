const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

/**
 * Vérifie si une valeur ressemble à un mot de passe bcrypt haché.
 * Cela permet de migrer progressivement les entrées en clair existantes.
 */
function isHashedPassword(value) {
  const trimmedValue = String(value || '').trim();
  return trimmedValue.length > 0 && /^\$2[abxy]\$\d{2}\$/.test(trimmedValue);
}

/**
 * Hash un mot de passe en clair avec bcrypt.
 */
async function hashPassword(plainPassword) {
  const normalizedPassword = String(plainPassword || '').trim();
  if (!normalizedPassword) {
    throw new Error('Mot de passe invalide pour le hash');
  }
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(normalizedPassword, salt);
}

/**
 * Compare un mot de passe en clair avec un mot de passe stocké.
 * Si le mot de passe stocké est en clair, la comparaison directe sera utilisée.
 */
async function comparePassword(plainPassword, storedPassword) {
  const normalizedPlain = String(plainPassword || '').trim();
  const normalizedStored = String(storedPassword || '').trim();

  if (!normalizedPlain || !normalizedStored) {
    return false;
  }

  if (isHashedPassword(normalizedStored)) {
    return bcrypt.compare(normalizedPlain, normalizedStored);
  }

  return normalizedPlain === normalizedStored;
}

/**
 * Génère un token JWT signé pour l'utilisateur.
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Vérifie la validité d'un token JWT et renvoie le contenu décodé.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  isHashedPassword,
  generateToken,
  verifyToken
};
