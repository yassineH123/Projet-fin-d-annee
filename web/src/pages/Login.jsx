import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LANGS } from '../context/LanguageContext';

/* Étoile marocaine SVG */
function MoroccanStar({ size = 28, color = '#D4890A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path d="M10,1 L12.94,8.29 L19.51,8.62 L14.78,13.06 L16.18,19.51 L10,15.88 L3.82,19.51 L5.22,13.06 L0.49,8.62 L7.06,8.29Z" fill={color} />
    </svg>
  );
}

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const { lang, setLang, t: globalT } = useLanguage();

  const t      = globalT.login;
  const isRtl  = globalT.dir === 'rtl';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (error) setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(t.welcome);
      navigate(data.user.role === 'admin' || data.user.role === 'superadmin' ? '/admin/home' : '/');
    } catch (err) {
      setError(err.response?.data?.message || t.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(150deg, #0F0704 0%, #1E0D07 50%, #160905 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Lueur safran */}
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '50%', height: '60%', background: 'radial-gradient(ellipse, rgba(212,137,10,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Texte arabe fantôme */}
      <div style={{
        position: 'absolute', bottom: '-2%', left: 0, right: 0, textAlign: 'center',
        fontSize: 'clamp(40px,7vw,90px)', fontFamily: 'Amiri, serif', fontWeight: 700,
        color: 'transparent', WebkitTextStroke: '1px rgba(212,137,10,0.05)',
        userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>مرحباً بك في المغرب</div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* ── Sélecteur de langue ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {Object.entries(LANGS).map(([key, l]) => (
            <button key={key} onClick={() => setLang(key)} className={`lang-btn${lang === key ? ' active' : ''}`}>
              <span>{l.flag}</span> {l.name}
            </button>
          ))}
        </div>

        {/* ── Entête ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }} dir={globalT.dir}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg,#B8232A,#8A1520)',
            border: '1px solid rgba(212,137,10,0.4)',
            boxShadow: '0 0 20px rgba(184,35,42,0.35)',
            marginBottom: 16,
          }}>
            <MoroccanStar size={30} color="#D4890A" />
          </div>
          <h1 style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#F5EDD8', letterSpacing: '0.03em', margin: 0 }}>
            {t.title}
          </h1>
          <p style={{ color: 'rgba(245,237,216,0.5)', fontSize: '0.85rem', marginTop: 6 }}>{t.subtitle}</p>

          {/* Diviseur étoile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px auto 0', maxWidth: 200, color: 'rgba(212,137,10,0.4)' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,rgba(212,137,10,0.35))' }} />
            <MoroccanStar size={11} color="#D4890A" />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,rgba(212,137,10,0.35))' }} />
          </div>
        </div>

        {/* ── Carte formulaire ── */}
        <div style={{
          background: 'linear-gradient(160deg,#1C0C07,#200F08)',
          border: '1px solid rgba(212,137,10,0.25)',
          borderRadius: 20, padding: '1.75rem',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,137,10,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Arc mauresque décoratif */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 70, height: 32, borderRadius: '0 0 35px 35px', background: 'linear-gradient(to bottom,rgba(212,137,10,0.12),transparent)', borderLeft: '1px solid rgba(212,137,10,0.18)', borderRight: '1px solid rgba(212,137,10,0.18)', borderBottom: '1px solid rgba(212,137,10,0.12)', pointerEvents: 'none' }} />
          {/* Ligne drapeau */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '20px 20px 0 0', background: 'linear-gradient(to right,transparent,#B8232A,#D4890A,#005A2E,#D4890A,#B8232A,transparent)' }} />

          {/* Erreur */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(193,39,45,0.1)', border: '1px solid rgba(193,39,45,0.3)', color: '#f87171', borderRadius: 12, padding: '10px 14px', marginBottom: 18, fontSize: '0.82rem' }} dir={globalT.dir}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} dir={globalT.dir} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'rgba(245,237,216,0.65)', marginBottom: 6, fontFamily: isRtl ? "'Amiri',serif" : "'Cairo',sans-serif", letterSpacing: isRtl ? 0 : '0.04em' }}>
                {t.emailLabel}
              </label>
              <input
                type="email" value={form.email} onChange={set('email')}
                placeholder={t.emailPlaceholder}
                className="input" required autoComplete="email"
                style={{ direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(245,237,216,0.65)', fontFamily: isRtl ? "'Amiri',serif" : "'Cairo',sans-serif", letterSpacing: isRtl ? 0 : '0.04em' }}>
                  {t.passwordLabel}
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.72rem', color: '#D4890A', textDecoration: 'none', fontFamily: isRtl ? "'Amiri',serif" : 'inherit' }}>
                  {t.forgot}
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  placeholder="••••••••"
                  className={`input pr-11${error ? ' border-red-500/60' : ''}`}
                  required autoComplete="current-password"
                  style={{ direction: 'ltr' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,237,216,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.95rem', fontFamily: isRtl ? "'Amiri',serif" : "'Cairo',sans-serif", fontWeight: 800, marginTop: 4, flexDirection: isRtl ? 'row-reverse' : 'row' }}
            >
              {loading
                ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : <><ArrowRight size={16} />{t.submit}</>
              }
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ position: 'relative', margin: '20px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: 1, background: 'rgba(212,137,10,0.15)' }} />
            </div>
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <span style={{ background: '#1C0C07', padding: '0 12px', color: 'rgba(245,237,216,0.3)', fontSize: '0.75rem', fontFamily: isRtl ? "'Amiri',serif" : 'inherit' }}>{t.or}</span>
            </div>
          </div>

          {/* Lien inscription */}
          <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'rgba(245,237,216,0.45)', fontFamily: isRtl ? "'Amiri',serif" : 'inherit' }} dir={globalT.dir}>
            {t.noAccount}{' '}
            <Link to="/register" style={{ color: '#D4890A', fontWeight: 700, textDecoration: 'none' }}>
              {t.register}
            </Link>
          </p>
        </div>

        {/* Mentions légales */}
        <p style={{ textAlign: 'center', color: 'rgba(245,237,216,0.2)', fontSize: '0.7rem', marginTop: 16, fontFamily: isRtl ? "'Amiri',serif" : 'inherit' }} dir={globalT.dir}>
          {t.terms}
        </p>
      </div>
    </div>
  );
}