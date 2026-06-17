const { AdminLog } = require('../models');

/**
 * Enregistre une action administrative sensible.
 * Échoue silencieusement (log console) pour ne jamais bloquer l'action
 * principale si l'écriture du journal d'audit échoue.
 */
async function logAdminAction({ adminId, action, targetType, targetId = null, details = null }) {
  try {
    await AdminLog.create({ adminId, action, targetType, targetId, details });
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

module.exports = { logAdminAction };
