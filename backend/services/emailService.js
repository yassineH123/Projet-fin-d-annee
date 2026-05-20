const { Resend } = require('resend');

async function sendVerificationEmail({ to, firstName, code }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('\n========================================');
    console.log(`  CODE DE VERIFICATION pour ${to}`);
    console.log(`  👉  ${code}`);
    console.log('========================================\n');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'AtlasWay <onboarding@resend.dev>',
    to,
    subject: 'Votre code de confirmation AtlasWay',
    html: `
      <div style="font-family:Arial,sans-serif;background:#0f172a;padding:32px;color:#e2e8f0;">
        <div style="max-width:560px;margin:0 auto;background:#111827;border-radius:20px;padding:32px;border:1px solid #334155;">
          <p style="letter-spacing:2px;color:#60a5fa;font-size:12px;font-weight:700;">ATLASWAY</p>
          <h1 style="margin:0 0 12px;font-size:28px;">Confirmez votre email</h1>
          <p style="line-height:1.6;color:#cbd5e1;">Bonjour ${firstName}, voici votre code de confirmation :</p>
          <div style="margin:28px 0;padding:20px;border-radius:16px;background:#0b1120;text-align:center;border:1px dashed #334155;">
            <span style="font-size:38px;letter-spacing:10px;font-weight:800;color:#93c5fd;">${code}</span>
          </div>
          <p style="color:#94a3b8;font-size:13px;">Ce code expire dans 10 minutes.</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };
