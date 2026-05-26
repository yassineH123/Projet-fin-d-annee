const { LoginHistory } = require('../models');

async function getMine(req, res, next) {
  try {
    const history = await LoginHistory.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    return res.json({ history });
  } catch (err) { return next(err); }
}

async function record(userId, req, success = true) {
  try {
    const ua = req.headers['user-agent'] || '';
    const device = ua.includes('Mobile') ? 'Mobile' : ua.includes('Tablet') ? 'Tablette' : 'Ordinateur';
    await LoginHistory.create({
      userId,
      ip: req.ip || req.connection?.remoteAddress || null,
      userAgent: ua.slice(0, 500),
      device,
      success,
    });
  } catch (_) {}
}

module.exports = { getMine, record };
