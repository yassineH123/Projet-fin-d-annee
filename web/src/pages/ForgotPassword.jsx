import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [email, setEmail]     = useState('');
  const [code, setCode]       = useState('');
  const [newPassword, setNew] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fErr, setFErr]       = useState({});

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFErr({ email: 'Adresse email invalide' });
      return;
    }
    setFErr({});
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Code envoyé à votre email !');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setFErr({ newPassword: 'Au moins 8 caractères' });
      return;
    }
    setFErr({});
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      toast.success('Mot de passe réinitialisé !');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 6,
  };

  const spinnerEl = (
    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
  );

  const btnStyle = (disabled) => ({
    height: 46, borderRadius: 12, border: 'none',
    background: disabled ? 'var(--bg-700)' : 'linear-gradient(135deg, #C1272D, #9e1f24)',
    color: disabled ? 'var(--text-muted)' : '#fff',
    fontSize: 14, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: disabled ? 'none' : '0 4px 14px rgba(193,39,45,0.3)',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(193,39,45,0.1)', border: '1px solid rgba(193,39,45,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Car size={28} style={{ color: '#C1272D' }} />
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>
            {step === 1 ? 'Mot de passe oublié' : 'Nouveau mot de passe'}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {step === 1 ? 'Entrez votre email pour recevoir un code' : `Code envoyé à ${email}`}
          </p>
        </div>

        {/* Card */}
        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <ZelligeStripe />
          <div style={{ padding: '24px 24px 20px' }}>

            {step === 1 ? (
              <form onSubmit={handleSendCode} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Adresse email</label>
                  <input
                    type="email" value={email}
                    onChange={e => { setEmail(e.target.value); if (fErr.email) setFErr({}); }}
                    placeholder="vous@example.com" className="input"
                    style={fErr.email ? { borderColor: '#EF4444' } : {}}
                  />
                  {fErr.email && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertCircle size={12} /> {fErr.email}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={loading} style={btnStyle(loading)}>
                  {loading ? spinnerEl : 'Envoyer le code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Code à 6 chiffres</label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="_ _ _ _ _ _" className="input"
                    style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, letterSpacing: '0.5em', padding: '14px 16px' }}
                    maxLength={6} required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'} value={newPassword}
                      onChange={e => { setNew(e.target.value); if (fErr.newPassword) setFErr({}); }}
                      placeholder="Min. 8 caractères" className="input"
                      style={{ paddingRight: 44, ...(fErr.newPassword ? { borderColor: '#EF4444' } : {}) }}
                      minLength={8}
                    />
                    <button
                      type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fErr.newPassword && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertCircle size={12} /> {fErr.newPassword}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={loading || code.length !== 6} style={btnStyle(loading || code.length !== 6)}>
                  {loading ? spinnerEl : 'Réinitialiser'}
                </button>
                <button
                  type="button" onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  ← Retour
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
              <Link to="/login" style={{ color: '#C1272D', fontWeight: 700, textDecoration: 'none' }}>← Retour à la connexion</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
