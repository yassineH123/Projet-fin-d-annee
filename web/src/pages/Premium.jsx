import { useState, useEffect } from 'react';
import { Crown, Check, Wallet, Zap, Star, Shield, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const PERKS = [
  { icon: Zap,         label: 'Réservation prioritaire — avant les autres' },
  { icon: Star,        label: 'Badge Premium visible sur votre profil' },
  { icon: Shield,      label: 'Vérification accélérée de votre profil' },
  { icon: Headphones,  label: 'Support prioritaire 24h/24' },
  { icon: Check,       label: 'Annonces sponsorisées dans la recherche' },
  { icon: Check,       label: 'Statistiques avancées conducteur' },
];

export default function Premium() {
  const [status,     setStatus]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [wallet,     setWallet]     = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/premium/status'),
      api.get('/wallet'),
    ]).then(([p, w]) => {
      setStatus(p.data);
      setWallet(parseFloat(w.data.balance));
    }).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    setSubscribing(plan);
    try {
      const { data } = await api.post('/premium/subscribe', { plan });
      toast.success(data.message);
      const p = await api.get('/premium/status');
      setStatus(p.data);
      const w = await api.get('/wallet');
      setWallet(parseFloat(w.data.balance));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSubscribing(null); }
  };

  if (loading) return <Spinner size="lg" />;

  const plans = status?.plans || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="text-center">
        <Crown size={40} className="text-yellow-400 mx-auto mb-3" />
        <h1 className="text-3xl font-black text-white mb-2">AtlasWay Premium</h1>
        <p className="text-slate-400">Profitez d'une expérience supérieure</p>
      </div>

      {/* Current status */}
      {status?.isPremium && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg,rgba(212,137,10,0.15),rgba(251,191,36,0.08))', border: '1px solid rgba(212,137,10,0.3)' }}>
          <Crown size={20} className="text-yellow-400 shrink-0" />
          <div>
            <p className="flex items-center gap-1 font-bold text-yellow-300"><Check size={14} /> Abonnement actif</p>
            <p className="text-xs text-yellow-400/70">
              Expire le {new Date(status.premium.endDate).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      )}

      {/* Perks */}
      <div className="card">
        <h2 className="font-bold text-white mb-4">Ce qui est inclus</h2>
        <div className="flex flex-col gap-3">
          {PERKS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,137,10,0.12)' }}>
                <Icon size={14} className="text-yellow-400" />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet balance info */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
        style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
        <Wallet size={14} className="text-green-400" />
        <span style={{ color: 'var(--text-secondary)' }}>Solde disponible : </span>
        <span className="font-bold text-white">{wallet.toFixed(2)} DH</span>
        <a href="/wallet" className="ml-auto text-xs text-primary-400 hover:text-primary-300 transition">Recharger →</a>
      </div>

      {/* Plans */}
      {!status?.isPremium && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(plans).map(([key, plan]) => (
            <div key={key} className="card flex flex-col gap-4 relative overflow-hidden"
              style={{ border: key === 'yearly' ? '2px solid #D4890A' : '1px solid var(--border-color)' }}>
              {key === 'yearly' && (
                <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: '#D4890A', color: 'white' }}>-32%</div>
              )}
              <div>
                <p className="font-black text-white text-lg">{plan.label}</p>
                <p className="text-3xl font-black mt-1" style={{ color: '#D4890A' }}>
                  {plan.price} <span className="text-base font-semibold text-slate-400">DH</span>
                </p>
                <p className="text-xs text-slate-500">{key === 'monthly' ? 'par mois' : 'par an · soit 33 DH/mois'}</p>
              </div>
              <button
                onClick={() => handleSubscribe(key)}
                disabled={!!subscribing || wallet < plan.price}
                className="w-full h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: wallet >= plan.price ? (key === 'yearly' ? '#D4890A' : '#C1272D') : 'var(--bg-600)',
                  color: wallet >= plan.price ? 'white' : 'var(--text-muted)',
                }}>
                {subscribing === key
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : wallet < plan.price ? `Solde insuffisant (${plan.price} DH requis)` : `S'abonner`
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
