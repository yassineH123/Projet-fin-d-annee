const { Premium, User, Transaction } = require('../models');
const sequelize = require('../database');

const PLANS = {
  monthly: { price: 49, days: 30,  label: 'Mensuel' },
  yearly:  { price: 399, days: 365, label: 'Annuel'  },
};

async function getStatus(req, res, next) {
  try {
    const premium = await Premium.findOne({ where: { userId: req.user.id, active: true }, order: [['endDate','DESC']] });
    const isPremium = premium && new Date(premium.endDate) > new Date();
    return res.json({ isPremium, premium: isPremium ? premium : null, plans: PLANS });
  } catch (err) { return next(err); }
}

async function subscribe(req, res, next) {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Plan invalide.' });
    const { price, days } = PLANS[plan];

    await sequelize.transaction(async (t) => {
      const user = await User.findByPk(req.user.id, { transaction: t, lock: true });
      if (parseFloat(user.walletBalance) < price)
        throw { status: 400, message: `Solde insuffisant. Vous avez ${user.walletBalance} DH, il faut ${price} DH.` };

      const newBalance = parseFloat(user.walletBalance) - price;
      await user.update({ walletBalance: newBalance }, { transaction: t });
      await Transaction.create({ userId: req.user.id, type: 'debit', amount: price, description: `Abonnement Premium ${PLANS[plan].label}`, balanceAfter: newBalance }, { transaction: t });

      const startDate = new Date();
      const endDate = new Date(Date.now() + days * 24 * 3600 * 1000);
      await Premium.create({ userId: req.user.id, plan, price, startDate, endDate, active: true }, { transaction: t });
    });

    return res.json({ message: `Abonnement Premium ${PLANS[plan].label} activé !` });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
}

module.exports = { getStatus, subscribe };
