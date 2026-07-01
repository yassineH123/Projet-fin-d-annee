import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowRight, Car, Train, Bus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const STATS = [
  { val: '12K+', label: 'Voyageurs' },
  { val: '3K+',  label: 'Conducteurs' },
  { val: '48',   label: 'Villes' },
];

const CITIES_FLOW = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda'];

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [fErr, setFErr]       = useState({});

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (error) setError('');
    if (fErr[k]) setFErr((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse email invalide';
    if (!form.password) e.password = 'Mot de passe requis';
    setFErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success('Connexion réussie !');
      navigate(data.user.role === 'admin' || data.user.role === 'superadmin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-900)' }}>
      <SEO title="Connexion" description="Connectez-vous à votre compte AtlasWay pour réserver ou proposer un covoiturage au Maroc." path="/login" noIndex />

      {/* ── Hero band ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f0505 0%, #1f0808 40%, #0a1a0a 100%)', borderBottom: '1px solid var(--border-color)', padding: '28px 20px 24px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {/* Zellige stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, display: 'flex' }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
          ))}
        </div>

        {/* Animated floating shapes */}
        <div className="auth-shape auth-shape-1" style={{ width: 70, height: 70, top: -10, right: 60, transform: 'rotate(25deg)' }} />
        <div className="auth-shape auth-shape-2" style={{ width: 44, height: 44, top: 12, right: 20, border: '1.5px solid rgba(212,137,10,0.18)', transform: 'rotate(45deg)' }} />
        <div className="auth-shape auth-shape-3" style={{ width: 90, height: 90, top: 8, right: 100, border: '1px solid rgba(0,98,51,0.12)', transform: 'rotate(12deg)' }} />
        <div className="auth-shape auth-shape-4" style={{ width: 32, height: 32, top: 30, right: 150, border: '1px solid rgba(193,39,45,0.1)', transform: 'rotate(60deg)' }} />

        {/* Glow orbs */}
        <div className="auth-orb" style={{ width: 160, height: 160, top: -60, right: -30, background: 'radial-gradient(circle, rgba(193,39,45,0.18) 0%, transparent 70%)' }} />
        <div className="auth-orb" style={{ width: 100, height: 100, bottom: -20, left: '30%', background: 'radial-gradient(circle, rgba(212,137,10,0.12) 0%, transparent 70%)', animationDelay: '2s' }} />

        <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(193,39,45,0.15)', border: '1px solid rgba(193,39,45,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={22} style={{ color: '#C1272D' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#D4890A', textTransform: 'uppercase' }}>✦ AtlasWay</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Bon retour 👋</p>
            </div>
          </div>

          {/* Route animation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
            {CITIES_FLOW.map((city, i) => (
              <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: i % 3 === 0 ? '#C1272D' : i % 3 === 1 ? '#D4890A' : '#22C55E', whiteSpace: 'nowrap' }}>{city}</span>
                {i < CITIES_FLOW.length - 1 && (
                  <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.12)', margin: '0 4px', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            {STATS.map(({ val, label }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>{val}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px 48px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Card */}
          <div className="auth-card-enter" style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border-color)', padding: '28px 26px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <p style={{ margin: '0 0 22px', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
              Connexion à votre compte
            </p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 18 }}>
                <AlertCircle size={15} style={{ color: '#F87171', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#F87171', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em' }}>ADRESSE EMAIL</label>
                <input
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="vous@example.com" autoComplete="email"
                  className={`input ${fErr.email ? 'input-error' : ''}`}
                  style={{ height: 46 }}
                />
                {fErr.email && <p className="field-error" style={{ marginTop: 4 }}><AlertCircle size={11} /> {fErr.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>MOT DE PASSE</label>
                  <Link to="/forgot-password" style={{ fontSize: 11, color: '#C1272D', fontWeight: 700, textDecoration: 'none' }}>
                    Oublié ?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="••••••••" autoComplete="current-password"
                    className={`input ${(fErr.password || error) ? 'input-error' : ''}`}
                    style={{ height: 46, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {fErr.password && <p className="field-error" style={{ marginTop: 4 }}><AlertCircle size={11} /> {fErr.password}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                height: 50, borderRadius: 14, border: 'none', marginTop: 4,
                background: loading ? 'var(--bg-700)' : 'linear-gradient(135deg, #C1272D, #9e1f24)',
                color: loading ? 'var(--text-muted)' : '#fff', fontSize: 15, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 6px 20px rgba(193,39,45,0.35)',
                transition: 'all 0.2s',
              }}>
                {loading
                  ? <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  : <><span>Se connecter</span> <ArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>ou</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: '#C1272D', fontWeight: 800, textDecoration: 'none' }}>
                Créer un compte →
              </Link>
            </p>
          </div>

          {/* Modes de transport */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
            {[{ Icon: Car, label: 'Covoiturage' }, { Icon: Train, label: 'Train' }, { Icon: Bus, label: 'Bus' }].map(({ Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>
                <Icon size={13} /> {label}
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 14 }}>
            En vous connectant, vous acceptez nos conditions d'utilisation.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
