import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Star, TrendingUp, Users, Leaf, Plus, Calendar, MapPin, Copy, Check, Award, BarChart2, CheckCircle, Trophy, Accessibility, Medal, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const BADGE_META = {
  first_trip:   { label: 'Premier trajet',  Icon: Car,           color: '#C1272D' },
  five_star:    { label: 'Note parfaite',   Icon: Star,          color: '#D4890A' },
  verified:     { label: 'Vérifié',         Icon: CheckCircle,   color: '#006233' },
  top_driver:   { label: 'Top Conducteur',  Icon: Trophy,        color: '#D4890A' },
  pmr_friendly: { label: 'Accessible PMR',  Icon: Accessibility, color: '#3B82F6' },
  referral_5:   { label: '5 Parrainages',   Icon: Users,         color: '#8B5CF6' },
};

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D', '#D4890A', '#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    api.get('/users/driver-stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>;
  if (!stats)  return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>Erreur de chargement</div>;

  const ratingStars = stats.avgRating > 0
    ? `${'★'.repeat(Math.round(stats.avgRating))}${'☆'.repeat(5 - Math.round(stats.avgRating))}`
    : '—';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BarChart2 size={22} style={{ color: '#C1272D' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Tableau de bord conducteur</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Vos statistiques en temps réel</p>
            </div>
          </div>
          <Link to="/rides/publish" style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12,
            background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff',
            fontWeight: 800, fontSize: 13, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
          }}>
            <Plus size={15} /> Nouveau trajet
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard icon={Car}        label="Trajets publiés"  value={stats.totalRides}  sub={`${stats.completedRides} terminés`}         color="#C1272D" />
        <StatCard icon={TrendingUp} label="Revenus ce mois"  value={`${stats.monthlyEarnings} DH`} sub={`Total : ${stats.totalEarnings} DH`} color="#006233" />
        <StatCard icon={Star}       label="Note moyenne"     value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'} sub={`${stats.totalRatings} avis · ${ratingStars}`} color="#D4890A" />
        <StatCard icon={Leaf}       label="CO₂ économisé"    value={`${stats.co2Saved} kg`} sub={`${stats.totalPassengers} passagers`}   color="#22C55E" />
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

        {/* Prochains trajets */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px 20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={15} style={{ color: '#C1272D' }} /> Prochains trajets
          </p>
          {stats.upcomingRides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <Car size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Aucun trajet à venir</p>
              <Link to="/rides/publish" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
                background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff',
                fontWeight: 700, fontSize: 12, textDecoration: 'none',
              }}>
                <Plus size={13} /> Publier un trajet
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.upcomingRides.map(ride => (
                <Link key={ride.id} to={`/rides/${ride.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Car size={16} style={{ color: '#C1272D' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span>{ride.from}</span>
                      <ArrowRight size={11} style={{ color: '#C1272D' }} />
                      <span>{ride.to}</span>
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(ride.departureDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: 'var(--text-primary)' }}>{ride.price} DH</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{ride.seatsAvailable} pl.</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Badges */}
          {stats.badges?.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Award size={14} style={{ color: '#D4890A' }} /> Badges obtenus
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {stats.badges.map(b => {
                  const m = BADGE_META[b] || { label: b, Icon: Medal, color: '#888' };
                  return (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
                      <m.Icon size={12} /> {m.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Code parrainage */}
          {stats.referralCode && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Users size={14} style={{ color: '#8B5CF6' }} /> Code parrainage
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                {stats.referredCount} personne{stats.referredCount !== 1 ? 's' : ''} parrainée{stats.referredCount !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                <span style={{ flex: 1, fontFamily: 'monospace', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.15em', fontSize: 14 }}>
                  {stats.referralCode}
                </span>
                <button onClick={copyCode} style={{
                  padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(193,39,45,0.1)',
                  color: copied ? '#22C55E' : '#C1272D', transition: 'all 0.2s',
                }}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Actions rapides</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/rides/publish" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px', borderRadius: 10, fontWeight: 800, fontSize: 13,
                background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff', textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(193,39,45,0.3)',
              }}>
                <Plus size={14} /> Publier un trajet
              </Link>
              {[
                { to: '/bookings', label: 'Réservations reçues' },
                { to: '/rides/mine', label: 'Mes trajets' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                  background: 'var(--bg-700)', color: 'var(--text-secondary)', textDecoration: 'none',
                  border: '1px solid var(--border-color)', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`@media (max-width: 680px) { .driver-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
