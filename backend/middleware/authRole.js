/**
 * Middleware pour vérifier les rôles des administrateurs
 * @param {Array} roles - Liste des rôles autorisés (ex: ['super_admin'])
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Dans une application réelle, on utiliserait req.admin.role (issu d'un token JWT par exemple)
    // Ici, on suppose que le rôle est passé dans les headers ou extrait d'une session
    // Pour cet exemple, nous allons regarder dans req.headers['x-admin-role'] 
    // ou req.admin?.role si un middleware d'auth précédent l'a déjà rempli.
    
    const adminRole = req.headers['x-admin-role'] || (req.admin && req.admin.role);

    if (!adminRole) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé - Rôle non identifié'
      });
    }

    if (!roles.includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Permissions insuffisantes'
      });
    }

    next();
  };
};

module.exports = { checkRole };
