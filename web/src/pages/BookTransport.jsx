import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Train, Bus, Car, Plane, User, Phone, Mail,
  CreditCard, CheckCircle, Download, Share2, AlertCircle,
} from 'lucide-react';
import { ONCF, CTM_ROUTES, FLIGHTS, findRoutes, formatDuration, buildDeepLink, nextDeparture } from '../data/transportData';

/* ─── Tiny QR code via API ─── */
function QRCode({ value, size = 160 }) {
  // uses qrcode.react approach via canvas — we draw a simple visual representation
  // In prod, use the `qrcode.react` library or similar
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=1a1a2e&bgcolor=ffffff`;
  return (
    <img src={url} alt="QR Code billet" width={size} height={size}
      style={{ borderRadius: 8, border: '3px solid white', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }} />
  );
}

/* ─── Helpers ─── */
function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3] }} />
      ))}
    </div>
  );
}

const MODE_CFG = {
  train:     { label: 'Train ONCF',  Icon: Train, color: '#2196F3', bg: 'rgba(33,150,243,0.10)' },
  bus:       { label: 'Bus CTM',     Icon: Bus,   color: '#FF9800', bg: 'rgba(255,152,0,0.10)'  },
  avion:     { label: 'Avion',       Icon: Plane, color: '#00BCD4', bg: 'rgba(0,188,212,0.10)'  },
  grandtaxi: { label: 'Grand Taxi',  Icon: Car,   color: '#9C27B0', bg: 'rgba(156,39,176,0.10)' },
};

function generateBookingRef() {
  return 'ATW-' + Math.random().toString(36).slice(2,6).toUpperCase() + '-' + Date.now().toString().slice(-4);
}

const STEPS = ['Trajet', 'Passager', 'Paiement', 'Billet'];

/* ─── Step indicators ─── */
function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900,
              background: i < current ? '#22C55E' : i === current ? '#C1272D' : 'var(--bg-700)',
              color: i <= current ? '#fff' : 'var(--text-muted)',
              border: i === current ? '2px solid #C1272D' : '2px solid transparent',
              transition: 'all .3s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: i === current ? '#C1272D' : 'var(--text-muted)' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ height: 2, flex: 1, background: i < current ? '#22C55E' : 'var(--border-color)', transition: 'background .3s', marginBottom: 18 }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─── */
export default function BookTransport() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const mode     = sp.get('mode')     || 'train';
  const from     = sp.get('from')     || 'Casablanca';
  const to       = sp.get('to')       || 'Marrakech';
  const date     = sp.get('date')     || new Date().toISOString().split('T')[0];
  const operator = sp.get('operator') || 'ONCF';

  const cfg = MODE_CFG[mode] || MODE_CFG.train;
  const Icon = cfg.Icon;

  // Find route data
  const datasets = { train: ONCF, bus: CTM_ROUTES, avion: FLIGHTS };
  const routes = findRoutes(datasets[mode] || ONCF, from, to);
  const route = routes[0];

  const price = route?.price ?? route?.pricePerPerson ?? route?.priceFrom ?? 0;
  const departures = route?.departures || [];
  const nextDep = nextDeparture(departures);

  const [step, setStep] = useState(0);
  const [selectedDep, setSelectedDep] = useState(nextDep?.time || departures[0] || '');
  const [passengerClass, setPassengerClass] = useState('2e');

  // Passenger form
  const [form, setForm] = useState({ nom: '', prenom: '', cin: '', telephone: '', email: '' });
  const [formErrors, setFormErrors] = useState({});

  // Payment
  const [payMethod, setPayMethod] = useState('card');
  const [cardNum,   setCardNum]   = useState('');
  const [paying,    setPaying]    = useState(false);

  // Ticket
  const [bookingRef, setBookingRef] = useState('');
  const [issued,     setIssued]     = useState(false);

  const finalPrice = passengerClass === '1e' ? Math.round(price * 1.45) : price;
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function validatePassenger() {
    const errs = {};
    if (!form.nom.trim())    errs.nom = 'Obligatoire';
    if (!form.prenom.trim()) errs.prenom = 'Obligatoire';
    if (!form.cin.trim())    errs.cin = 'Obligatoire';
    if (!form.telephone.match(/^0[5-7]\d{8}$/)) errs.telephone = 'Format invalide (ex: 0612345678)';
    if (form.email && !form.email.includes('@')) errs.email = 'Email invalide';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNextStep() {
    if (step === 1 && !validatePassenger()) return;
    setStep(s => s + 1);
  }

  async function handlePay() {
    setPaying(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1800));
    const ref = generateBookingRef();
    setBookingRef(ref);
    setIssued(true);
    setPaying(false);
    setStep(3);
  }

  const ticketData = bookingRef
    ? `ATLASWAY|${bookingRef}|${from}|${to}|${date}|${selectedDep}|${form.prenom} ${form.nom}|${form.cin}|${finalPrice}DH`
    : '';

  /* ── Step 0: Trajet ── */
  function StepTrajet() {
    return (
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16 }}>Choisir le départ</h2>

        {/* Route summary */}
        <div style={{ padding: '14px 16px', borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.color}30`, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon size={16} style={{ color: cfg.color }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: cfg.color }}>{operator}</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{from} → {to}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{formattedDate} · {route ? formatDuration(route.duration) : '–'} · CO₂ {route?.co2 ?? '–'} kg</p>
        </div>

        {/* Classe */}
        {(mode === 'train' || mode === 'bus') && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Classe</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['2e', '1e'].map(cls => (
                <button key={cls} onClick={() => setPassengerClass(cls)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 13,
                    border: `2px solid ${passengerClass === cls ? cfg.color : 'var(--border-color)'}`,
                    background: passengerClass === cls ? cfg.bg : 'var(--bg-700)',
                    color: passengerClass === cls ? cfg.color : 'var(--text-muted)',
                    transition: 'all .15s',
                  }}>
                  {cls === '2e' ? '2ème classe' : '1ère classe ✨'}
                  <br />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>
                    {cls === '2e' ? `${price} DH` : `${Math.round(price * 1.45)} DH`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Horaires */}
        {departures.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Heure de départ</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {departures.map(d => {
                const [h, m] = d.split(':').map(Number);
                const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
                const depMin = h * 60 + m;
                const isPast = depMin < nowMin;
                const isNext = d === nextDep?.time;
                return (
                  <button key={d} onClick={() => !isPast && setSelectedDep(d)}
                    disabled={isPast}
                    style={{
                      padding: '8px 14px', borderRadius: 8, cursor: isPast ? 'not-allowed' : 'pointer',
                      fontFamily: 'monospace', fontSize: 13, fontWeight: 800,
                      opacity: isPast ? 0.35 : 1,
                      border: `2px solid ${selectedDep === d ? cfg.color : 'var(--border-color)'}`,
                      background: selectedDep === d ? cfg.bg : isNext ? 'rgba(34,197,94,0.06)' : 'var(--bg-700)',
                      color: selectedDep === d ? cfg.color : isNext ? '#22C55E' : 'var(--text-primary)',
                      transition: 'all .15s',
                    }}>
                    {d}
                    {isNext && !isPast && <span style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#22C55E' }}>Prochain</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Step 1: Passager ── */
  function StepPassager() {
    const fields = [
      { key: 'nom',       label: 'Nom',         placeholder: 'KHOULANI',         type: 'text' },
      { key: 'prenom',    label: 'Prénom',       placeholder: 'Adam',             type: 'text' },
      { key: 'cin',       label: 'N° CIN',       placeholder: 'AB123456',         type: 'text' },
      { key: 'telephone', label: 'Téléphone',    placeholder: '0612345678',       type: 'tel'  },
      { key: 'email',     label: 'Email (opt.)', placeholder: 'adam@gmail.com',   type: 'email'},
    ];
    return (
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16 }}>Informations passager</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input
                type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, boxSizing: 'border-box',
                  background: 'var(--bg-700)', color: 'var(--text-primary)', outline: 'none',
                  border: `1.5px solid ${formErrors[f.key] ? '#EF4444' : 'var(--border-color)'}`,
                }}
              />
              {formErrors[f.key] && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 3 }}>{formErrors[f.key]}</p>}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertCircle size={12} /> Les données sont utilisées uniquement pour l'émission du billet.
        </p>
      </div>
    );
  }

  /* ── Step 2: Paiement ── */
  function StepPaiement() {
    return (
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16 }}>Paiement</h2>

        {/* Récapitulatif */}
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-700)', border: '1px solid var(--border-color)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{from} → {to}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: cfg.color }}>{finalPrice} DH</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>{formattedDate} · {selectedDep} · {passengerClass}</span>
            <span>{form.prenom} {form.nom}</span>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Commission AtlasWay (5%)</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(finalPrice * 0.05)} DH</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#22C55E' }}>{Math.round(finalPrice * 1.05)} DH</span>
          </div>
        </div>

        {/* Méthode paiement */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Méthode de paiement</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[{ id: 'card', label: '💳 Carte bancaire' }, { id: 'cmi', label: '🏦 CMI / CIH Bank' }, { id: 'cash', label: '💵 Cash en gare' }].map(m => (
            <button key={m.id} onClick={() => setPayMethod(m.id)}
              style={{
                flex: 1, padding: '9px 6px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 800,
                border: `2px solid ${payMethod === m.id ? '#C1272D' : 'var(--border-color)'}`,
                background: payMethod === m.id ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)',
                color: payMethod === m.id ? '#C1272D' : 'var(--text-muted)',
              }}>
              {m.label}
            </button>
          ))}
        </div>

        {payMethod === 'card' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input placeholder="1234 5678 9012 3456" value={cardNum}
              onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())}
              style={{ padding: '10px 12px', borderRadius: 10, fontSize: 14, fontFamily: 'monospace', letterSpacing: 2, background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="MM/AA" maxLength={5}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
              <input placeholder="CVV" maxLength={3}
                style={{ width: 70, padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
          </div>
        )}
        {payMethod === 'cmi' && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(212,137,10,0.07)', border: '1px solid rgba(212,137,10,0.25)', fontSize: 12, color: '#D4890A', fontWeight: 600 }}>
            Vous serez redirigé vers la plateforme CMI sécurisée pour finaliser le paiement.
          </div>
        )}
        {payMethod === 'cash' && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
            Votre place sera réservée pendant 30 min. Présentez-vous au guichet avec votre CIN.
          </div>
        )}
      </div>
    );
  }

  /* ── Step 3: Billet ── */
  function StepBillet() {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={32} style={{ color: '#22C55E' }} />
          </div>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>Billet confirmé !</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Référence : <strong style={{ color: '#C1272D', fontFamily: 'monospace' }}>{bookingRef}</strong></p>

        {/* E-ticket */}
        <div style={{
          borderRadius: 16, overflow: 'hidden', border: '2px solid var(--border-color)',
          background: 'var(--card-bg)', maxWidth: 360, margin: '0 auto',
        }}>
          <ZelligeStripe />
          {/* Header */}
          <div style={{ padding: '14px 18px', background: cfg.bg, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>ATLASWAY · E-BILLET</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{from} → {to}</p>
              </div>
              <Icon size={28} style={{ color: cfg.color }} />
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 16, textAlign: 'left' }}>
              {[
                { label: 'Passager',   value: `${form.prenom} ${form.nom}` },
                { label: 'CIN',        value: form.cin },
                { label: 'Date',       value: new Date(date + 'T12:00:00').toLocaleDateString('fr-MA', { day:'2-digit', month:'2-digit', year:'numeric' }) },
                { label: 'Départ',     value: selectedDep },
                { label: 'Classe',     value: passengerClass },
                { label: 'Prix',       value: `${Math.round(finalPrice * 1.05)} DH` },
                { label: 'Opérateur', value: operator },
                { label: 'Réf.',       value: bookingRef },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: label === 'Réf.' ? 'monospace' : 'inherit' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <QRCode value={ticketData} size={140} />
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              Présentez ce QR code au contrôleur · Valable uniquement pour ce trajet
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <Download size={13} /> Télécharger
          </button>
          <button onClick={() => { if (navigator.share) navigator.share({ title: `Billet AtlasWay ${bookingRef}`, text: `${from} → ${to} · ${date} · ${selectedDep}` }); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(193,39,45,0.25)', background: 'rgba(193,39,45,0.08)', color: '#C1272D', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <Share2 size={13} /> Partager
          </button>
        </div>
        <Link to="/mobility" style={{ display: 'block', marginTop: 14, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Retour au planificateur
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          style={{ padding: 8, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-700)', cursor: 'pointer' }}>
          <ArrowLeft size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)' }}>Réserver · {cfg.label}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{from} → {to} · {date}</p>
        </div>
      </div>

      <StepBar current={step} />

      {/* Card */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '20px 18px', marginBottom: 20 }}>
        {step === 0 && <StepTrajet />}
        {step === 1 && <StepPassager />}
        {step === 2 && <StepPaiement />}
        {step === 3 && <StepBillet />}
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-700)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
              Retour
            </button>
          )}
          <button
            onClick={step === 2 ? handlePay : handleNextStep}
            disabled={paying}
            style={{
              flex: 2, padding: '12px', borderRadius: 12, border: 'none', cursor: paying ? 'wait' : 'pointer',
              background: paying ? 'rgba(193,39,45,0.5)' : 'linear-gradient(135deg, #C1272D, #a01f24)',
              color: '#fff', fontSize: 14, fontWeight: 900,
              boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {paying
              ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Traitement...</>
              : step === 0 ? 'Choisir ce trajet →'
              : step === 1 ? 'Continuer →'
              : <>Payer {Math.round(finalPrice * 1.05)} DH</>
            }
          </button>
        </div>
      )}
    </div>
  );
}
