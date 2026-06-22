import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

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
      const msg = err.response?.data?.message || 'Erreur de connexion';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-dark-900">
      <SEO title="Connexion" description="Connectez-vous à votre compte AtlasWay pour réserver ou proposer un covoiturage au Maroc." path="/login" noIndex />
      <div className="w-full max-w-md">

        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-4">
            <Car className="text-primary-400" size={28} />
          </div>
          <h1 className="text-3xl font-black text-white">Connexion</h1>
          <p className="text-slate-400 mt-2 text-sm">Accédez à votre compte AtlasWay</p>
        </div>

        <div className="card p-6 shadow-2xl">

          {/* Global error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="field-label">Adresse email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="vous@example.com"
                className={`input ${fErr.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              {fErr.email && <p className="field-error"><AlertCircle size={12} /> {fErr.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-300">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className={`input pr-11 ${(fErr.password || error) ? 'input-error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fErr.password && <p className="field-error"><AlertCircle size={12} /> {fErr.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-12 mt-1 rounded-xl flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" />
                : 'Se connecter'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-500" />
            </div>
            <div className="relative text-center">
              <span className="bg-dark-800 px-3 text-slate-500 text-xs">ou</span>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300 hover:underline transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          En vous connectant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </div>
  );
}
