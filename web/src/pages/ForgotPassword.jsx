import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1); // 1=email, 2=code+newpwd
  const [email, setEmail]       = useState('');
  const [code, setCode]         = useState('');
  const [newPassword, setNew]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-4">
            <Car className="text-primary-400" size={28} />
          </div>
          <h1 className="text-3xl font-black text-white">
            {step === 1 ? 'Mot de passe oublié' : 'Nouveau mot de passe'}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {step === 1 ? 'Entrez votre email pour recevoir un code' : `Code envoyé à ${email}`}
          </p>
        </div>

        <div className="card p-6">
          {step === 1 ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  className="input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary h-12 mt-1">
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" /> : 'Envoyer le code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Code à 6 chiffres</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  className="input text-center text-2xl font-black tracking-[0.5em] py-4"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNew(e.target.value)}
                    placeholder="Min. 8 caractères"
                    className="input pr-11"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || code.length !== 6} className="btn-primary h-12 mt-1">
                {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" /> : 'Réinitialiser'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-slate-400 text-sm hover:text-slate-200 transition-colors">
                ← Retour
              </button>
            </form>
          )}

          <p className="text-center text-slate-400 text-sm mt-5">
            <Link to="/login" className="text-primary-400 font-semibold hover:underline">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
