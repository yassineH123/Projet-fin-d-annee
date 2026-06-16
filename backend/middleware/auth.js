const User = require('../models/User');

// Middleware pour vérifier le rôle
async function checkRole(token, requiredRole) {
  if (!token || !token.startsWith('mock-token-')) {
    throw new Error('Invalid token');
  }
  
  const userId = token.replace('mock-token-', '');
  const user = await User.findByPk(userId);
  
  if (!user) throw new Error('User not found');
  
  if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'superadmin') {
    throw new Error('Unauthorized: Admin access required');
  }
  
  if (requiredRole === 'superadmin' && user.role !== 'superadmin') {
    throw new Error('Unauthorized: Super Admin access required');
  }
  
  return user;
}

module.exports = { checkRole };