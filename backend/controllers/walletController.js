const { User, Transaction } = require('../models');
const sequelize = require('../database');

async function getBalance(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'walletBalance'] });
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    return res.json({ balance: user.walletBalance, transactions });
  } catch (err) { return next(err); }
}

async function topUp(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > 5000)
      return res.status(400).json({ message: 'Montant invalide (1–5000 DH).' });

    await sequelize.transaction(async (t) => {
      const user = await User.findByPk(req.user.id, { transaction: t, lock: true });
      const newBalance = parseFloat(user.walletBalance) + parseFloat(amount);
      await user.update({ walletBalance: newBalance }, { transaction: t });
      await Transaction.create({
        userId: req.user.id,
        type: 'credit',
        amount,
        description: 'Recharge portefeuille',
        balanceAfter: newBalance,
      }, { transaction: t });
      return res.json({ balance: newBalance, message: `+${amount} DH ajoutés à votre portefeuille.` });
    });
  } catch (err) { return next(err); }
}

async function getTransactions(req, res, next) {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return res.json({ transactions });
  } catch (err) { return next(err); }
}

module.exports = { getBalance, topUp, getTransactions };
