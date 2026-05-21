import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [step, setStep]       = useState(1); // 1=form, 2=otp
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [otp, setOtp]         = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Code envoyé à votre email !');
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
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(async (credential) => {
    setGoogleLoading(true);
    try {
      const { data } = await api.post('/auth/google', { idToken: credential });
      login(data.token, data.user);
      toast.success('Connexion Google reussie !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur Google');
    } finally {
      setGoogleLoading(false);
    }
  }, [login, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Car className="text-primary-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white">{step === 1 ? 'Inscription' : 'Vérification'}</h1>
          <p className="text-slate-400 mt-2">
            {step === 1 ? 'Créez votre compte AtlasWay' : `Code envoyé à ${form.email}`}
          </p>
        </div>

        <div className="card">
          {step === 1 ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <GoogleAuthButton onCredential={handleGoogleCredential} onError={(msg) => toast.error(msg)} text="signup_with" />
                {googleLoading && (
                  <span className="text-center text-slate-500 text-xs">Connexion Google...</span>
                )}
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-500" />
                </div>
                <div className="relative text-center">
                  <span className="bg-dark-800 px-3 text-slate-500 text-xs">ou</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Prénom</label>
                  <input value={form.firstName} onChange={set('firstName')} placeholder="Yassine" className="input" required />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Nom</label>
                  <input value={form.lastName} onChange={set('lastName')} placeholder="Benali" className="input" required />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="vous@example.com" className="input" required />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 caractères" className="input pr-11" required minLength={8} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary h-12 mt-2">
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" /> : 'Créer mon compte'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <p className="text-slate-400 text-sm text-center">Entrez le code à 6 chiffres reçu par email</p>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                className="input text-center text-3xl font-black tracking-[0.5em] py-4"
                maxLength={6}
                required
              />
              <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary h-12">
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" /> : 'Vérifier'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-slate-400 text-sm hover:text-slate-200 transition-colors">
                ← Retour
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center text-slate-400 text-sm mt-5">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-primary-400 font-semibold hover:underline">Se connecter</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
