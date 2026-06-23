import { useState, useEffect } from 'react';
import { Crown, Check, X, Wallet, Zap, Star, Shield, Headphones, BarChart2, Megaphone, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const PERKS = [
  { icon: Zap,         label: 'Réservation prioritaire',     desc: 'Avant les autres utilisateurs',        free: false, premium: true  },
  { icon: Star,        label: 'Badge Premium profil',         desc: 'Visible par tous',                     free: false, premium: true  },
  { icon: Shield,      label: 'Vérification accélérée',       desc: 'Profil certifié en 24h',               free: false, premium: true  },
  { icon: Headphones,  label: 'Support prioritaire',          desc: '24h/24, 7j/7',                         free: false, premium: true  },
  { icon: Megaphone,   label: 'Annonces sponsorisées',        desc: 'Mises en avant dans la recherche',     free: false, premium: true  },
  { icon: BarChart2,   label: 'Statistiques avancées',        desc: 'Revenus, tendances, historique',       free: false, premium: true  },
  { icon: Check,       label: 'Publication de trajets',       desc: 'Illimitée',                            free: true,  premium: true  },
  { icon: Check,       label: 'Messagerie',                   desc: 'Avec conducteurs et passagers',        free: true,  premium: true  },
];

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D', '#D4890A', '#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function GoldStripe() {
  return (
    <div style={{ height: 4, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: i % 2 === 0 ? '#D4890A' : '#FFD700', opacity: 0.9 }} />
      ))}
    </div>
  );
}

export default function Premium() {
  const [status,      setStatus]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [wallet,      setWallet]      = useState(0);

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
      const [p, w] = await Promise.all([api.get('/premium/status'), api.get('/wallet')]);
      setStatus(p.data);
      setWallet(parseFloat(w.data.balance));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setSubscribing(null); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="lg" /></div>;

  const plans = status?.plans || {};
  const isPremium = status?.isPremium;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{
          padding: '28px 24px 24px',
          background: 'linear-gradient(135deg, rgba(212,137,10,0.06) 0%, rgba(193,39,45,0.04) 100%)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(212,137,10,0.15), rgba(255,215,0,0.08))',
            border: '2px solid rgba(212,137,10,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(212,137,10,0.2)',
          }}>
            <Crown size={32} style={{ color: '#D4890A' }} />
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D4890A' }}>✦ AtlasWay</p>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>Premium</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Débloquez une expérience supérieure et voyagez comme un pro
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 14 }}>
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={14} fill="#D4890A" style={{ color: '#D4890A' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Active subscription badge ── */}
      {isPremium && (
        <div style={{
          borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)',
          border: '1.5px solid rgba(212,137,10,0.4)',
          boxShadow: '0 4px 24px rgba(212,137,10,0.12)',
        }}>
          <GoldStripe />
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(212,137,10,0.2), rgba(255,215,0,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={20} style={{ color: '#D4890A' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#D4890A' }}>Abonnement Premium actif ✓</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Expire le {new Date(status.premium.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div style={{ padding: '5px 10px', borderRadius: 99, background: 'rgba(212,137,10,0.12)', border: '1px solid rgba(212,137,10,0.3)' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#D4890A' }}>Actif</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Wallet balance ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12,
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={15} style={{ color: '#22C55E' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Solde disponible</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{wallet.toFixed(2)} DH</p>
        </div>
        <a href="/wallet" style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#22C55E', textDecoration: 'none',
          padding: '6px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
        }}>
          Recharger <ChevronRight size={13} />
        </a>
      </div>

      {/* ── Plans ── */}
      {!isPremium && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {Object.entries(plans).map(([key, plan]) => {
            const isYearly = key === 'yearly';
            const canAfford = wallet >= plan.price;
            return (
              <div key={key} style={{
                borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)',
                border: `${isYearly ? '2px' : '1px'} solid ${isYearly ? 'rgba(212,137,10,0.5)' : 'var(--border-color)'}`,
                boxShadow: isYearly ? '0 8px 32px rgba(212,137,10,0.12)' : 'none',
                position: 'relative', display: 'flex', flexDirection: 'column',
              }}>
                {isYearly ? <GoldStripe /> : <div style={{ height: 4, background: 'var(--border-color)' }} />}

                {isYearly && (
                  <div style={{
                    position: 'absolute', top: 16, right: 12, padding: '3px 10px', borderRadius: 99,
                    background: 'linear-gradient(135deg, #D4890A, #FFD700)', color: '#fff', fontSize: 10, fontWeight: 900,
                  }}>
                    -32%
                  </div>
                )}

                <div style={{ padding: '20px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: isYearly ? '#D4890A' : 'var(--text-muted)' }}>
                      {isYearly ? '👑 ' : ''}{plan.label}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                      <span style={{ fontSize: 32, fontWeight: 900, color: isYearly ? '#D4890A' : 'var(--text-primary)', lineHeight: 1 }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>DH</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                      {key === 'monthly' ? 'par mois' : 'par an · soit 33 DH/mois'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={!!subscribing || !canAfford}
                    style={{
                      height: 44, borderRadius: 12, border: 'none', cursor: !canAfford || subscribing ? 'not-allowed' : 'pointer',
                      fontWeight: 900, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: !canAfford ? 'var(--bg-700)' : isYearly
                        ? 'linear-gradient(135deg, #D4890A, #c87d09)'
                        : 'linear-gradient(135deg, #C1272D, #9e1f24)',
                      color: !canAfford ? 'var(--text-muted)' : '#fff',
                      boxShadow: !canAfford ? 'none' : isYearly ? '0 4px 16px rgba(212,137,10,0.35)' : '0 4px 16px rgba(193,39,45,0.3)',
                      transition: 'all 0.15s',
                    }}>
                    {subscribing === key ? (
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    ) : !canAfford ? (
                      'Solde insuffisant'
                    ) : (
                      <><Crown size={14} /> S&apos;abonner</>
                    )}
                  </button>

                  {!canAfford && (
                    <p style={{ margin: 0, fontSize: 10, color: '#EF4444', textAlign: 'center', fontWeight: 600 }}>
                      {plan.price} DH requis · solde : {wallet.toFixed(0)} DH
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Comparison table ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Crown size={14} style={{ color: '#D4890A' }} /> Comparaison des formules
          </p>

          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 8, marginBottom: 8 }}>
            <div />
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', padding: '6px 0', borderRadius: 8, background: 'var(--bg-700)' }}>
              Gratuit
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#D4890A', padding: '6px 0', borderRadius: 8, background: 'rgba(212,137,10,0.1)', border: '1px solid rgba(212,137,10,0.25)' }}>
              👑 Premium
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 8, alignItems: 'center',
                  padding: '10px 0', borderBottom: i < PERKS.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(212,137,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} style={{ color: perk.free ? '#22C55E' : '#D4890A' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{perk.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{perk.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {perk.free
                      ? <Check size={16} style={{ color: '#22C55E' }} />
                      : <X size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    }
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Check size={16} style={{ color: '#D4890A' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Questions fréquentes</p>
        {[
          { q: 'Comment payer ?', a: 'Le paiement est débité directement depuis votre solde Wallet AtlasWay.' },
          { q: 'Puis-je annuler ?', a: "L'abonnement court jusqu'à son terme. Aucun renouvellement automatique." },
          { q: 'Le badge est-il visible ?', a: 'Oui, la couronne Premium apparaît sur votre profil et dans les recherches.' },
        ].map((item, i) => (
          <div key={i} style={{ paddingBottom: i < 2 ? 10 : 0, marginBottom: i < 2 ? 10 : 0, borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
            <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.q}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.a}</p>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
