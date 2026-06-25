const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Token manquant.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifié en base (et non dans le JWT) pour révoquer immédiatement l'accès
    // d'un compte suspendu/banni après coup, sans attendre l'expiration du token.
    const user = await User.findById(decoded.id).select('role status isDriver driverVerified');
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable.' });
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Compte suspendu ou banni.' });
    }

    req.user = { id: user.id, role: user.role, isDriver: user.isDriver, driverVerified: user.driverVerified };
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalide.' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    return next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
