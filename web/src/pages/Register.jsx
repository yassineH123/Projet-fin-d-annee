import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Gift, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const PERKS = [
  { emoji: '🚗', text: 'Publiez et réservez des trajets' },
  { emoji: '💰', text: 'Économisez jusqu\'à 70% vs taxi' },
  { emoji: '🇲🇦', text: '48 villes marocaines couvertes' },
  { emoji: '⭐', text: 'Communauté de confiance vérifiée' },
];

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [searchParams]        = useSearchParams();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', referralCode: searchParams.get('ref') || '' });
  const [otp, setOtp]         = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.lastName.trim())  e.lastName  = 'Nom requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse email invalide';
    if (form.password.length < 8) e.password = 'Au moins 8 caractères';
    if (form.phone && !/^\+?\d{8,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Numéro invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success(form.phone ? 'Code envoyé par SMS !' : 'Code envoyé à votre email !');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email', { email: form.email, code: otp });
      login(data.token, data.user);
      toast.success('Compte créé avec succès !');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : /[A-Z]/.test(form.password) && /\d/.test(form.password) ? 4 : 3;
  const pwdColors = ['', '#EF4444', '#F97316', '#F59E0B', '#22C55E'];
  const pwdLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'];

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-900)' }}>
      <SEO title="Créer un compte" description="Rejoignez AtlasWay — la plateforme de covoiturage #1 au Maroc. Inscription gratuite en 2 minutes." path="/register" noIndex />

      {/* ── Hero band ── */}
      <div style={{ background: 'linear-gradient(135deg, #0a1a0a 0%, #1a0f05 50%, #0f0505 100%)', borderBottom: '1px solid var(--border-color)', padding: '22px 20px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, display: 'flex' }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: ['#006233','#D4890A','#C1272D'][i % 3] }} />
          ))}
        </div>

        {/* Animated floating shapes */}
        <div className="auth-shape auth-shape-1" style={{ width: 60, height: 60, top: 5, right: 40, border: '1.5px solid rgba(0,98,51,0.18)', transform: 'rotate(30deg)' }} />
        <div className="auth-shape auth-shape-2" style={{ width: 38, height: 38, top: 15, right: 10, border: '1.5px solid rgba(212,137,10,0.2)', transform: 'rotate(45deg)' }} />
        <div className="auth-shape auth-shape-3" style={{ width: 80, height: 80, top: 0, right: 80, border: '1px solid rgba(0,98,51,0.1)', transform: 'rotate(15deg)' }} />
        <div className="auth-orb" style={{ width: 140, height: 140, top: -50, right: -20, background: 'radial-gradient(circle, rgba(0,98,51,0.15) 0%, transparent 70%)' }} />

        <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative' }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#D4890A', textTransform: 'uppercase' }}>✦ AtlasWay</p>
            <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: '#fff' }}>Rejoignez la communauté 🇲🇦</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
            {PERKS.map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                <span style={{ fontSize: 14 }}>{emoji}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px 48px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {[{ n: 1, label: 'Informations' }, { n: 2, label: 'Vérification' }].map(({ n, label }, i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900,
                    background: step > n ? '#006233' : step === n ? '#C1272D' : 'var(--bg-700)',
                    color: step >= n ? '#fff' : 'var(--text-muted)',
                    border: `2px solid ${step > n ? '#006233' : step === n ? '#C1272D' : 'var(--border-color)'}`,
                  }}>
                    {step > n ? '✓' : n}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step === n ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: 1.5, borderRadius: 1, background: step > 1 ? '#006233' : 'var(--border-color)', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>

          <div className="auth-card-enter" style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border-color)', padding: '24px 22px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            {step === 1 ? (
              <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Créez votre compte</p>

                {/* Prénom + Nom */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.04em' }}>PRÉNOM</label>
                    <input value={form.firstName} onChange={set('firstName')} placeholder="Yassine"
                      className={`input ${errors.firstName ? 'input-error' : ''}`} style={{ height: 44 }} />
                    {errors.firstName && <p className="field-error" style={{ marginTop: 3, fontSize: 11 }}><AlertCircle size={10} /> {errors.firstName}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.04em' }}>NOM</label>
                    <input value={form.lastName} onChange={set('lastName')} placeholder="Benali"
                      className={`input ${errors.lastName ? 'input-error' : ''}`} style={{ height: 44 }} />
                    {errors.lastName && <p className="field-error" style={{ marginTop: 3, fontSize: 11 }}><AlertCircle size={10} /> {errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.04em' }}>EMAIL</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="vous@example.com"
                    className={`input ${errors.email ? 'input-error' : ''}`} style={{ height: 44 }} />
                  {errors.email && <p className="field-error" style={{ marginTop: 3, fontSize: 11 }}><AlertCircle size={10} /> {errors.email}</p>}
                </div>

                {/* Téléphone */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.04em' }}>
                    TÉLÉPHONE <span style={{ fontWeight: 500, fontSize: 10, color: 'var(--text-muted)' }}>(optionnel · SMS)</span>
                  </label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+212600000000"
                    className={`input ${errors.phone ? 'input-error' : ''}`} style={{ height: 44 }} />
                  {errors.phone && <p className="field-error" style={{ marginTop: 3, fontSize: 11 }}><AlertCircle size={10} /> {errors.phone}</p>}
                </div>

                {/* Mot de passe + force */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.04em' }}>MOT DE PASSE</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                      placeholder="Min. 8 caractères"
                      className={`input ${errors.password ? 'input-error' : ''}`}
                      style={{ height: 44, paddingRight: 44 }} minLength={8} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwdStrength ? pwdColors[pwdStrength] : 'var(--border-color)', transition: 'background 0.2s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: pwdColors[pwdStrength] }}>{pwdLabels[pwdStrength]}</span>
                    </div>
                  )}
                  {errors.password && <p className="field-error" style={{ marginTop: 3, fontSize: 11 }}><AlertCircle size={10} /> {errors.password}</p>}
                </div>

                {/* Parrainage */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#D4890A', marginBottom: 5, letterSpacing: '0.04em' }}>
                    <Gift size={11} style={{ display: 'inline', marginRight: 4 }} />CODE PARRAINAGE <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>(optionnel)</span>
                  </label>
                  <input value={form.referralCode} onChange={set('referralCode')} placeholder="Ex: ADAM42"
                    className="input" style={{ height: 44, textTransform: 'uppercase' }} maxLength={10} />
                </div>

                <button type="submit" disabled={loading} style={{
                  height: 50, borderRadius: 14, border: 'none', marginTop: 4,
                  background: loading ? 'var(--bg-700)' : 'linear-gradient(135deg, #006233, #004d26)',
                  color: loading ? 'var(--text-muted)' : '#fff', fontSize: 15, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(0,98,51,0.35)',
                }}>
                  {loading
                    ? <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    : <><span>Créer mon compte</span> <ArrowRight size={16} /></>
                  }
                </button>

                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Déjà un compte ?{' '}
                  <Link to="/login" style={{ color: '#C1272D', fontWeight: 800, textDecoration: 'none' }}>Se connecter →</Link>
                </p>
              </form>
            ) : (
              /* ── Step 2 : OTP ── */
              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,98,51,0.1)', border: '1px solid rgba(0,98,51,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <CheckCircle size={28} style={{ color: '#22C55E' }} />
                  </div>
                  <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)', margin: '0 0 6px' }}>Vérifiez votre {form.phone ? 'téléphone' : 'email'}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Code envoyé à <strong style={{ color: 'var(--text-primary)' }}>{form.phone || form.email}</strong>
                  </p>
                </div>

                <div>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="_ _ _ _ _ _"
                    className="input"
                    style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, letterSpacing: '0.5em', height: 64, borderRadius: 16, padding: '0 16px' }}
                    maxLength={6} required autoFocus
                  />
                  <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'center' }}>
                    {[0,1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: 28, height: 3, borderRadius: 2, background: otp.length > i ? '#006233' : 'var(--border-color)', transition: 'background 0.15s' }} />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || otp.length !== 6} style={{
                  height: 50, borderRadius: 14, border: 'none',
                  background: otp.length !== 6 || loading ? 'var(--bg-700)' : 'linear-gradient(135deg, #006233, #004d26)',
                  color: otp.length !== 6 || loading ? 'var(--text-muted)' : '#fff',
                  fontSize: 15, fontWeight: 800, cursor: otp.length !== 6 || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: otp.length === 6 && !loading ? '0 6px 20px rgba(0,98,51,0.35)' : 'none',
                }}>
                  {loading
                    ? <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    : 'Vérifier le code →'
                  }
                </button>

                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 0 }}>
                  ← Modifier mes informations
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
