const Stripe = require('stripe');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

// Creates a Stripe Checkout Session for wallet top-up
async function createTopUpSession({ userId, amount, userEmail, successUrl, cancelUrl }) {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [{
      price_data: {
        currency: 'mad',
        product_data: {
          name: 'Recharge Portefeuille AtlasWay',
          description: `Ajout de ${amount} MAD à votre portefeuille`,
        },
        unit_amount: Math.round(amount * 100), // centimes
      },
      quantity: 1,
    }],
    metadata: { userId: String(userId), amount: String(amount), type: 'wallet_topup' },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// Verifies and parses a Stripe webhook event
function constructWebhookEvent(payload, sig) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  try {
    return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return null;
  }
}

module.exports = { createTopUpSession, constructWebhookEvent };
