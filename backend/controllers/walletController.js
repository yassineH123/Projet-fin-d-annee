const { User, Transaction } = require('../models');
const sequelize = require('../database');
const { createTopUpSession, constructWebhookEvent } = require('../services/stripeService');

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

// ── Stripe Checkout ──────────────────────────────────────────────────────────

async function stripeCheckout(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount < 10 || amount > 5000)
      return res.status(400).json({ message: 'Montant invalide (10–5000 DH).' });

    const user = await User.findByPk(req.user.id, { attributes: ['id', 'email'] });
    const origin = req.headers.origin || 'http://localhost:5173';

    const session = await createTopUpSession({
      userId: req.user.id,
      amount,
      userEmail: user.email,
      successUrl: `${origin}/wallet?payment=success`,
      cancelUrl:  `${origin}/wallet?payment=cancelled`,
    });

    if (!session) {
      // Stripe non configuré — fallback vers le topUp direct (mode dev)
      return topUp(req, res, next);
    }

    return res.json({ url: session.url });
  } catch (err) { return next(err); }
}

async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const event = constructWebhookEvent(req.body, sig);

  if (!event) return res.status(400).json({ message: 'Webhook invalide.' });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, amount, type } = session.metadata || {};

    if (type === 'wallet_topup' && userId && amount) {
      try {
        await sequelize.transaction(async (t) => {
          const user = await User.findByPk(parseInt(userId), { transaction: t, lock: true });
          if (!user) return;
          const newBalance = parseFloat(user.walletBalance) + parseFloat(amount);
          await user.update({ walletBalance: newBalance }, { transaction: t });
          await Transaction.create({
            userId: parseInt(userId),
            type: 'credit',
            amount: parseFloat(amount),
            description: 'Recharge via Stripe',
            balanceAfter: newBalance,
          }, { transaction: t });
        });
      } catch (err) {
        console.error('[Stripe webhook] Erreur crédit wallet:', err.message);
      }
    }
  }

  return res.json({ received: true });
}

module.exports = { getBalance, topUp, getTransactions, stripeCheckout, stripeWebhook };
