const { authorizeRoles } = require('./authMiddleware');

// Centralise les règles d'autorisation (RBAC) du projet, pour remplacer les
// vérifications dispersées (`['admin','superadmin'].includes(req.user.role)`,
// `req.user.isDriver`, `xxx.userId !== req.user.id`...) trouvées dans une douzaine
// de contrôleurs/routes par des helpers et middlewares réutilisables.
//
// Dans le modèle de données existant, SUPER_ADMIN et ADMIN sont de vrais rôles
// (User.role), tandis que la capacité "conducteur" (DRIVER) est indépendante du
// rôle (User.isDriver) — un même compte garde le rôle 'user' qu'il soit passager,
// conducteur, ou les deux à la fois. PASSENGER désigne donc simplement un compte
// au rôle de base, sans capacité particulière au-delà de l'authentification.
const ROLES = Object.freeze({
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  PASSENGER: 'user',
});

// ── Helpers purs ─────────────────────────────────────────────────────────────
// Utilisables dans un contrôleur, y compris après avoir chargé une ressource
// (ex. isOwnerOrAdmin(req.user, ride.driverId)), là où une vérification dépend
// d'une donnée qui n'est pas connue avant l'exécution du contrôleur.

function isSuperAdmin(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}

function isAdmin(user) {
  return user?.role === ROLES.ADMIN || isSuperAdmin(user);
}

function isDriver(user) {
  return !!user?.isDriver;
}

function isVerifiedDriver(user) {
  return isDriver(user) && !!user?.driverVerified;
}

function isOwner(user, ownerId) {
  return !!user?.id && user.id === ownerId;
}

function isOwnerOrAdmin(user, ownerId) {
  return isOwner(user, ownerId) || isAdmin(user);
}

// ── Middlewares Express ─────────────────────────────────────────────────────
// À chaîner après authenticateToken, uniquement pour les vérifications résolubles
// à partir de req.user seul (rôle, isDriver, driverVerified) — donc connues avant
// même que le contrôleur ne s'exécute. Les vérifications de propriété d'une
// ressource (booking, ride, post...) restent dans le contrôleur via les helpers
// ci-dessus, juste après le chargement de cette ressource.

const requireAdmin = authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN);
const requireSuperAdmin = authorizeRoles(ROLES.SUPER_ADMIN);

function blockAdmins(message, status = 403) {
  return (req, res, next) => {
    if (isAdmin(req.user)) return res.status(status).json({ message });
    return next();
  };
}

function requireDriver(message, status = 403) {
  return (req, res, next) => {
    if (!isDriver(req.user)) return res.status(status).json({ message });
    return next();
  };
}

function requireVerifiedDriver(message, status = 403) {
  return (req, res, next) => {
    if (!isVerifiedDriver(req.user)) return res.status(status).json({ message });
    return next();
  };
}

module.exports = {
  ROLES,
  isSuperAdmin,
  isAdmin,
  isDriver,
  isVerifiedDriver,
  isOwner,
  isOwnerOrAdmin,
  requireAdmin,
  requireSuperAdmin,
  blockAdmins,
  requireDriver,
  requireVerifiedDriver,
};
