const nodemailer = require('nodemailer');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function baseLayout(content) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#080503;padding:32px;color:#e2e8f0;">
      <div style="max-width:560px;margin:0 auto;background:#111010;border-radius:20px;padding:32px;border:1px solid #2a1a1a;">
        <p style="letter-spacing:3px;color:#C1272D;font-size:11px;font-weight:800;margin:0 0 24px;">ATLASWAY</p>
        ${content}
        <hr style="border:none;border-top:1px solid #2a1a1a;margin:28px 0;" />
        <p style="color:#475569;font-size:12px;line-height:1.6;margin:0;">
          Vous recevez cet email car vous avez un compte AtlasWay.<br/>
          <a href="https://atlasway.ma" style="color:#C1272D;">atlasway.ma</a>
        </p>
      </div>
    </div>`;
}

async function send({ to, subject, html }) {
  const transport = getTransport();
  if (!transport) {
    console.log(`\n[EMAIL] To: ${to} | Subject: ${subject}\n[EMAIL] (SMTP non configuré — email non envoyé)\n`);
    return;
  }
  await transport.sendMail({
    from: `"AtlasWay" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to, subject, html,
  });
}

// ── Templates ────────────────────────────────────────────────────────────────

async function sendVerificationEmail({ to, firstName, code }) {
  await send({
    to, subject: 'Votre code de confirmation AtlasWay',
    html: baseLayout(`
      <h1 style="margin:0 0 12px;font-size:26px;color:#fff;">Confirmez votre email</h1>
      <p style="line-height:1.7;color:#cbd5e1;">Bonjour <strong>${firstName}</strong>, voici votre code :</p>
      <div style="margin:28px 0;padding:20px;border-radius:16px;background:#0b0202;text-align:center;border:1px dashed #3a1a1a;">
        <span style="font-size:40px;letter-spacing:12px;font-weight:800;color:#C1272D;">${code}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;">Ce code expire dans 10 minutes.</p>
    `),
  });
}

async function sendBookingConfirmation({ to, passenger, ride, seats, totalPrice }) {
  const dateStr = new Date(ride.departureDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  await send({
    to, subject: `Réservation confirmée — ${ride.from} → ${ride.to}`,
    html: baseLayout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Réservation confirmée ✅</h1>
      <p style="color:#cbd5e1;line-height:1.7;">Bonjour <strong>${passenger}</strong>, votre réservation a été acceptée !</p>
      <div style="margin:24px 0;padding:20px;border-radius:14px;background:#0b0202;border:1px solid #2a1a1a;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Trajet</td><td style="padding:8px 0;color:#fff;font-weight:700;text-align:right;">${ride.from} → ${ride.to}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Date</td><td style="padding:8px 0;color:#fff;font-weight:700;text-align:right;">${dateStr}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Places</td><td style="padding:8px 0;color:#fff;font-weight:700;text-align:right;">${seats}</td></tr>
          <tr style="border-top:1px solid #2a1a1a;"><td style="padding:12px 0 0;color:#C1272D;font-weight:700;">Total payé</td><td style="padding:12px 0 0;color:#C1272D;font-weight:800;font-size:18px;text-align:right;">${totalPrice} MAD</td></tr>
        </table>
      </div>
      <a href="https://atlasway.ma/bookings" style="display:inline-block;padding:12px 24px;background:#C1272D;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Voir mes réservations</a>
    `),
  });
}

async function sendBookingCancellation({ to, passenger, ride, refundAmount, refundRate }) {
  const refundMsg = refundAmount > 0
    ? `<p style="color:#34D399;font-weight:700;">💚 ${refundAmount} MAD remboursés dans votre portefeuille (${Math.round(refundRate * 100)}%).</p>`
    : `<p style="color:#94a3b8;">Aucun remboursement (annulation tardive).</p>`;
  await send({
    to, subject: `Réservation annulée — ${ride.from} → ${ride.to}`,
    html: baseLayout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Réservation annulée</h1>
      <p style="color:#cbd5e1;line-height:1.7;">Bonjour <strong>${passenger}</strong>, votre réservation pour le trajet <strong>${ride.from} → ${ride.to}</strong> a été annulée.</p>
      ${refundMsg}
      <a href="https://atlasway.ma/rides/search" style="display:inline-block;padding:12px 24px;background:#C1272D;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Trouver un autre trajet</a>
    `),
  });
}

async function sendDriverVerificationResult({ to, firstName, approved, reason }) {
  const title   = approved ? 'Profil conducteur vérifié ✅' : 'Document refusé ❌';
  const message = approved
    ? `Félicitations <strong>${firstName}</strong> ! Votre profil conducteur a été vérifié. Vous pouvez maintenant publier des trajets.`
    : `Bonjour <strong>${firstName}</strong>, votre document a été refusé.${reason ? ` Motif : <em>${reason}</em>` : ''} Veuillez soumettre un nouveau document valide.`;
  const cta = approved
    ? `<a href="https://atlasway.ma/rides/publish" style="display:inline-block;padding:12px 24px;background:#C1272D;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Publier un trajet</a>`
    : `<a href="https://atlasway.ma/profile" style="display:inline-block;padding:12px 24px;background:#C1272D;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Mettre à jour mon profil</a>`;
  await send({
    to, subject: `AtlasWay — ${title}`,
    html: baseLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#fff;">${title}</h1>
      <p style="color:#cbd5e1;line-height:1.7;">${message}</p>
      <div style="margin-top:24px;">${cta}</div>
    `),
  });
}

async function sendRideReminder({ to, passenger, ride }) {
  const dateStr = new Date(ride.departureDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = ride.departureTime || '';
  await send({
    to, subject: `Rappel — Votre trajet demain ${ride.from} → ${ride.to}`,
    html: baseLayout(`
      <h1 style="margin:0 0 8px;font-size:24px;color:#fff;">Votre trajet est demain 🚗</h1>
      <p style="color:#cbd5e1;line-height:1.7;">Bonjour <strong>${passenger}</strong>, rappel pour votre trajet :</p>
      <div style="margin:20px 0;padding:16px;border-radius:14px;background:#0b0202;border:1px solid #2a1a1a;">
        <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">${ride.from} → ${ride.to}</p>
        <p style="margin:6px 0 0;color:#94a3b8;">${dateStr}${timeStr ? ` à ${timeStr}` : ''}</p>
      </div>
      <a href="https://atlasway.ma/bookings" style="display:inline-block;padding:12px 24px;background:#C1272D;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Voir les détails</a>
    `),
  });
}

module.exports = { sendVerificationEmail, sendBookingConfirmation, sendBookingCancellation, sendDriverVerificationResult, sendRideReminder };
