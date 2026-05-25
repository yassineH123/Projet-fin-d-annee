import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [step, setStep]                 = useState(1);
  const [form, setForm]                 = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [verificationMethod, setMethod] = useState('email');
  const [otp, setOtp]                   = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [loading, setLoading]           = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (verificationMethod === 'sms' && !form.phone) {
      toast.error('Entrez votre numéro de téléphone pour recevoir le code par SMS');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, verificationMethod });
      toast.success(verificationMethod === 'sms' ? 'Code envoyé par SMS !' : 'Code envoyé à votre email !');
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Car className="text-primary-500" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white">{step === 1 ? 'Inscription' : 'Vérification'}</h1>
          <p className="text-slate-400 mt-2">
            {step === 1 ? 'Créez votre compte AtlasWay' : `Code envoyé ${verificationMethod === 'sms' ? `au ${form.phone}` : `à ${form.email}`}`}
          </p>
        </div>

        <div className="card">
          {step === 1 ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Recevoir le code de vérification par</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${verificationMethod === 'email' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    <Mail size={16} /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('sms')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${verificationMethod === 'sms' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    <Phone size={16} /> SMS
                  </button>
                </div>
              </div>

              {verificationMethod === 'sms' && (
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+212600000000" className="input" required />
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary h-12 mt-2">
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" /> : 'Créer mon compte'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <p className="text-slate-400 text-sm text-center">Entrez le code à 6 chiffres reçu par {verificationMethod === 'sms' ? 'SMS' : 'email'}</p>
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
