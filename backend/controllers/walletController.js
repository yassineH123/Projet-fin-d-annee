const { User, Transaction } = require('../models');
const { runInTransaction } = require('../utils/walletTransaction');
const { createTopUpSession, constructWebhookEvent } = require('../services/stripeService');

async function getBalance(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    return res.json({ balance: user.walletBalance, transactions });
  } catch (err) { return next(err); }
}

async function topUp(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > 5000)
      return res.status(400).json({ message: 'Montant invalide (1–5000 DH).' });

    const newBalance = await runInTransaction(async (session) => {
      const user = await User.findById(req.user.id).session(session);
      const balance = parseFloat(user.walletBalance) + parseFloat(amount);
      user.set({ walletBalance: balance });
      await user.save({ session });
      await Transaction.create([{
        userId: req.user.id,
        type: 'credit',
        amount,
        description: 'Recharge portefeuille',
        balanceAfter: balance,
      }], { session });
      return balance;
    });

    return res.json({ balance: newBalance, message: `+${amount} DH ajoutés à votre portefeuille.` });
  } catch (err) { return next(err); }
}

async function getTransactions(req, res, next) {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.json({ transactions });
  } catch (err) { return next(err); }
}

// ── Stripe Checkout ──────────────────────────────────────────────────────────

async function stripeCheckout(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount < 10 || amount > 5000)
      return res.status(400).json({ message: 'Montant invalide (10–5000 DH).' });

    const user = await User.findById(req.user.id).select('email');
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
        await runInTransaction(async (dbSession) => {
          const user = await User.findById(userId).session(dbSession);
          if (!user) return;
          const newBalance = parseFloat(user.walletBalance) + parseFloat(amount);
          user.set({ walletBalance: newBalance });
          await user.save({ session: dbSession });
          await Transaction.create([{
            userId,
            type: 'credit',
            amount: parseFloat(amount),
            description: 'Recharge via Stripe',
            balanceAfter: newBalance,
          }], { session: dbSession });
        });
      } catch (err) {
        console.error('[Stripe webhook] Erreur crédit wallet:', err.message);
      }
    }
  }

  return res.json({ received: true });
}

module.exports = { getBalance, topUp, getTransactions, stripeCheckout, stripeWebhook };
