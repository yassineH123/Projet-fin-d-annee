const twilio = require('twilio');

async function sendVerificationSMS({ to, code }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
    console.log('\n========================================');
    console.log(`  CODE DE VERIFICATION SMS pour ${to}`);
    console.log(`  👉  ${code}`);
    console.log('========================================\n');
    return;
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Votre code AtlasWay : ${code}. Valide 10 minutes.`,
    from: process.env.TWILIO_PHONE,
    to,
  });
}

module.exports = { sendVerificationSMS };
