import { useState, useEffect } from 'react';
import { TrendingUp, Star, MapPin, Leaf, DollarSign, Car, Trophy, Award, Percent } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CHART_TOOLTIP = {
  contentStyle: { background: '#11151f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#fff' },
};
const DEST_COLORS = ['#C1272D', '#D4890A', '#10B981', '#3B82F6', '#8B5CF6'];

const LEVEL_META = {
  bronze:  { color: '#CD7F32', label: 'Bronze',  next: 'Argent',  target: 10  },
  argent:  { color: '#C0C0C0', label: 'Argent',  next: 'Or',      target: 25  },
  or:      { color: '#FFD700', label: 'Or',       next: 'Platine', target: 50  },
  platine: { color: '#E5E4E2', label: 'Platine',  next: 'Diamant', target: 100 },
  diamant: { color: '#B9F2FF', label: 'Diamant',  next: null,      target: null },
};

function StatCard({ icon: Icon, label, value, sub, color = '#C1272D' }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function DriverAnalytics() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/driver').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;
  if (!stats) return <p className="text-center text-slate-400 py-16">Aucune donnée disponible.</p>;

  const lm = LEVEL_META[stats.level] || LEVEL_META.bronze;
  const progress = lm.target ? Math.min(100, Math.round((stats.totalTrips / lm.target) * 100)) : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-black text-white flex items-center gap-2">
        <TrendingUp size={22} className="text-primary-400" /> Mes statistiques
      </h1>

      {/* Level card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Niveau actuel</p>
            <p className="text-xl font-black" style={{ color: lm.color }}>{lm.label}</p>
          </div>
          <Trophy size={32} style={{ color: lm.color }} />
        </div>
        <div className="w-full rounded-full h-2.5 mb-2" style={{ background: 'var(--bg-700)' }}>
          <div className="h-2.5 rounded-full transition-all" style={{ width: `${progress}%`, background: lm.color }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {lm.target
            ? `${stats.totalTrips} / ${lm.target} trajets pour atteindre ${lm.next}`
            : 'Niveau maximum atteint ! 🏆'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={Car}       label="Trajets"         value={stats.totalTrips}         sub="complétés"           color="#C1272D" />
        <StatCard icon={DollarSign} label="Revenus estimés" value={`${stats.totalEarnings} DH`} sub="total"           color="#10B981" />
        <StatCard icon={MapPin}    label="Km parcourus"    value={`${stats.totalKm} km`}    sub="au total"            color="#3B82F6" />
        <StatCard icon={Leaf}      label="CO₂ économisé"   value={`${stats.co2Saved} kg`}   sub="vs trajets solo"     color="#10B981" />
        <StatCard icon={Star}      label="Note moyenne"    value={stats.avgRating?.toFixed(1) || '–'} sub="/ 5"       color="#FBBF24" />
        <StatCard icon={Percent}   label="Taux de remplissage" value={`${stats.fillRate ?? 0} %`} sub="places vendues"  color="#D4890A" />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par mois */}
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-green-400" /> Revenus (6 derniers mois)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.monthlyEarnings || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v} DH`, 'Revenus']} />
              <Area type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} fill="url(#earnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trajets par mois */}
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Car size={16} className="text-primary-400" /> Trajets publiés (6 derniers mois)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyTrips || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [v, 'Trajets']} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="trips" fill="#C1272D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top destinations */}
      {stats.topDestinations?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" /> Destinations les plus populaires
          </h2>
          <ResponsiveContainer width="100%" height={Math.max(140, stats.topDestinations.length * 42)}>
            <BarChart data={stats.topDestinations} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="city" width={90} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [v, 'Trajets']} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {stats.topDestinations.map((d, i) => <Cell key={d.city} fill={DEST_COLORS[i % DEST_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Badges */}
      {stats.badges?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-yellow-400" /> Mes badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.badges.map(b => (
              <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                <span className="text-xl">{b.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-white">{b.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(b.earnedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating evolution */}
      {stats.ratingEvolution?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" /> Évolution de la note (6 derniers mois)
          </h2>
          <div className="flex items-end gap-2 h-24">
            {stats.ratingEvolution.map(({ month, avg }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold" style={{ color: '#FBBF24' }}>{avg}</span>
                <div className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.round((avg / 5) * 80)}px`,
                    background: avg >= 4.5 ? '#10B981' : avg >= 3.5 ? '#FBBF24' : '#EF4444',
                    minHeight: 6,
                  }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {month.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
