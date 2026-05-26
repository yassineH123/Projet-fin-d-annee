const { PromoCode, User, Transaction } = require('../models');
const sequelize = require('../database');

async function validate(req, res, next) {
  try {
    const { code } = req.body;
    const promo = await PromoCode.findOne({ where: { code: code.toUpperCase(), active: true } });
    if (!promo) return res.status(404).json({ message: 'Code promo invalide ou expiré.' });
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return res.status(400).json({ message: 'Code promo expiré.' });
    if (promo.usedCount >= promo.maxUses) return res.status(400).json({ message: 'Code promo épuisé.' });
    return res.json({ promo: { id: promo.id, type: promo.type, value: promo.value, description: promo.description } });
  } catch (err) { return next(err); }
}

async function apply(req, res, next) {
  try {
    const { code, amount } = req.body;
    const promo = await PromoCode.findOne({ where: { code: code.toUpperCase(), active: true } });
    if (!promo) return res.status(404).json({ message: 'Code invalide.' });
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return res.status(400).json({ message: 'Code expiré.' });
    if (promo.usedCount >= promo.maxUses) return res.status(400).json({ message: 'Code épuisé.' });

    const discount = promo.type === 'percent'
      ? Math.round(amount * (promo.value / 100) * 100) / 100
      : Math.min(parseFloat(promo.value), parseFloat(amount));

    await sequelize.transaction(async (t) => {
      const user = await User.findByPk(req.user.id, { transaction: t, lock: true });
      const newBalance = parseFloat(user.walletBalance) + discount;
      await user.update({ walletBalance: newBalance }, { transaction: t });
      await Transaction.create({ userId: req.user.id, type: 'credit', amount: discount, description: `Code promo ${promo.code}`, balanceAfter: newBalance }, { transaction: t });
      await promo.increment('usedCount', { transaction: t });
    });

    return res.json({ discount, message: `${discount} DH crédités dans votre portefeuille !` });
  } catch (err) { return next(err); }
}

// Admin
async function create(req, res, next) {
  try {
    const { code, type, value, maxUses, expiresAt, description } = req.body;
    const promo = await PromoCode.create({ code: code.toUpperCase(), type, value, maxUses: maxUses || 100, expiresAt: expiresAt || null, description });
    return res.status(201).json({ promo });
  } catch (err) { return next(err); }
}

async function getAll(req, res, next) {
  try {
    const promos = await PromoCode.findAll({ order: [['createdAt','DESC']] });
    return res.json({ promos });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    await PromoCode.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'Code supprimé.' });
  } catch (err) { return next(err); }
}

module.exports = { validate, apply, create, getAll, remove };
