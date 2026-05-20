import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Star, TrendingUp, Users, Leaf, Plus, Calendar, MapPin, Copy, Check, Award, BarChart2 } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const BADGE_META = {
  first_trip:   { label: 'Premier trajet',   icon: '🚗', color: '#C1272D' },
  five_star:    { label: 'Note parfaite',    icon: '⭐', color: '#D4890A' },
  verified:     { label: 'Vérifié',          icon: '✅', color: '#006233' },
  top_driver:   { label: 'Top Conducteur',   icon: '🏆', color: '#D4890A' },
  pmr_friendly: { label: 'Accessible PMR',   icon: '♿', color: '#3B82F6' },
  referral_5:   { label: '5 Parrainages',    icon: '👥', color: '#8B5CF6' },
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
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

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!stats)  return <div className="text-center py-20 text-slate-400">Erreur de chargement</div>;

  const ratingStars = stats.avgRating > 0
    ? `${'★'.repeat(Math.round(stats.avgRating))}${'☆'.repeat(5 - Math.round(stats.avgRating))}`
    : '—';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart2 size={24} style={{ color: '#C1272D' }} /> Tableau de bord conducteur
          </h1>
          <p className="text-slate-400 text-sm mt-1">Vos statistiques en temps réel</p>
        </div>
        <Link to="/rides/publish" className="btn-primary flex items-center gap-2 text-sm h-10 px-4">
          <Plus size={16} /> Nouveau trajet
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Car}        label="Trajets publiés"  value={stats.totalRides}      sub={`${stats.completedRides} terminés`}        color="#C1272D" />
        <StatCard icon={TrendingUp} label="Revenus ce mois"  value={`${stats.monthlyEarnings} MAD`} sub={`Total : ${stats.totalEarnings} MAD`} color="#006233" />
        <StatCard icon={Star}       label="Note moyenne"     value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'} sub={`${stats.totalRatings} avis · ${ratingStars}`} color="#D4890A" />
        <StatCard icon={Leaf}       label="CO₂ économisé"    value={`${stats.co2Saved} kg`} sub={`${stats.totalPassengers} passagers`}       color="#22C55E" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Upcoming rides */}
        <div className="lg:col-span-2 card">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-primary-400" /> Prochains trajets
          </h2>
          {stats.upcomingRides.length === 0 ? (
            <div className="text-center py-8">
              <Car size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Aucun trajet à venir</p>
              <Link to="/rides/publish"
                className="btn-primary mt-3 text-sm inline-flex items-center gap-1.5 px-4 py-2">
                <Plus size={14} /> Publier un trajet
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.upcomingRides.map(ride => (
                <Link key={ride.id} to={`/rides/${ride.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ border: '1px solid var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(193,39,45,0.1)' }}>
                    <Car size={16} style={{ color: '#C1272D' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white flex items-center gap-1 flex-wrap">
                      <MapPin size={11} className="text-primary-400 flex-shrink-0" />
                      <span>{ride.from}</span>
                      <span className="text-slate-500">→</span>
                      <MapPin size={11} className="text-green-400 flex-shrink-0" />
                      <span>{ride.to}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(ride.departureDate).toLocaleDateString('fr-FR', {
                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-white">{ride.price} MAD</p>
                    <p className="text-xs text-slate-400">{ride.seatsAvailable} pl.</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Badges */}
          {stats.badges.length > 0 && (
            <div className="card">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Award size={16} className="text-yellow-400" /> Badges obtenus
              </h2>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map(b => {
                  const m = BADGE_META[b] || { label: b, icon: '🏅', color: '#888' };
                  return (
                    <div key={b}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
                      {m.icon} {m.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Referral code */}
          {stats.referralCode && (
            <div className="card">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Code de parrainage
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                {stats.referredCount} personne{stats.referredCount !== 1 ? 's' : ''} parrainée{stats.referredCount !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                <span className="flex-1 font-mono font-black text-white tracking-widest text-sm">
                  {stats.referralCode}
                </span>
                <button onClick={copyCode}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(193,39,45,0.1)', color: copied ? '#22C55E' : '#C1272D' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="card">
            <h2 className="text-base font-bold text-white mb-3">Actions rapides</h2>
            <div className="flex flex-col gap-2">
              <Link to="/rides/publish"
                className="btn-primary text-sm text-center py-2.5 flex items-center justify-center gap-2">
                <Plus size={14} /> Publier un trajet
              </Link>
              <Link to="/bookings"
                className="text-sm py-2.5 flex items-center justify-center gap-2 rounded-xl font-medium transition-all"
                style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                Voir les réservations
              </Link>
              <Link to="/rides/mine"
                className="text-sm py-2.5 flex items-center justify-center gap-2 rounded-xl font-medium transition-all"
                style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                Mes trajets
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
