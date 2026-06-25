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

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D', '#D4890A', '#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = '#C1272D' }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
      <ZelligeStripe />
      <div style={{ padding: '18px 20px' }}>
        <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={15} style={{ color: iconColor }} /> {title}
        </p>
        {children}
      </div>
    </div>
  );
}

export default function DriverAnalytics() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/driver').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="lg" /></div>;
  if (!stats)  return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>Aucune donnée disponible.</div>;

  const lm = LEVEL_META[stats.level] || LEVEL_META.bronze;
  const progress = lm.target ? Math.min(100, Math.round((stats.totalTrips / lm.target) * 100)) : 100;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} style={{ color: '#10B981' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10B981' }}>✦ AtlasWay</p>
            <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Mes statistiques</h1>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Tableau de bord analytique conducteur</p>
          </div>
        </div>
      </div>

      {/* Level card */}
      <div style={{ background: 'var(--card-bg)', border: `1.5px solid ${lm.color}40`, borderRadius: 14, padding: '18px 20px', boxShadow: `0 4px 20px ${lm.color}12` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Niveau actuel</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: lm.color }}>{lm.label}</p>
          </div>
          <Trophy size={32} style={{ color: lm.color }} />
        </div>
        <div style={{ width: '100%', height: 10, borderRadius: 99, background: 'var(--bg-700)', marginBottom: 8 }}>
          <div style={{ height: 10, borderRadius: 99, background: lm.color, width: `${progress}%`, transition: 'width 0.6s ease' }} />
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
          {lm.target
            ? `${stats.totalTrips} / ${lm.target} trajets pour atteindre ${lm.next}`
            : 'Niveau maximum atteint ! 🏆'}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <StatCard icon={Car}       label="Trajets"              value={stats.totalTrips}              sub="complétés"        color="#C1272D" />
        <StatCard icon={DollarSign} label="Revenus estimés"     value={`${stats.totalEarnings} DH`}   sub="total"            color="#10B981" />
        <StatCard icon={MapPin}    label="Km parcourus"         value={`${stats.totalKm} km`}          sub="au total"         color="#3B82F6" />
        <StatCard icon={Leaf}      label="CO₂ économisé"        value={`${stats.co2Saved} kg`}         sub="vs trajets solo"  color="#10B981" />
        <StatCard icon={Star}      label="Note moyenne"         value={stats.avgRating?.toFixed(1) || '–'} sub="/ 5"          color="#FBBF24" />
        <StatCard icon={Percent}   label="Taux remplissage"     value={`${stats.fillRate ?? 0} %`}    sub="places vendues"   color="#D4890A" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard title="Revenus (6 derniers mois)" icon={DollarSign} iconColor="#10B981">
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
        </SectionCard>

        <SectionCard title="Trajets publiés (6 derniers mois)" icon={Car} iconColor="#C1272D">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyTrips || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [v, 'Trajets']} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="trips" fill="#C1272D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Top destinations */}
      {stats.topDestinations?.length > 0 && (
        <SectionCard title="Destinations les plus populaires" icon={MapPin} iconColor="#3B82F6">
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
        </SectionCard>
      )}

      {/* Badges */}
      {stats.badges?.length > 0 && (
        <SectionCard title="Mes badges" icon={Award} iconColor="#D4890A">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {stats.badges.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 20 }}>{b.emoji}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{b.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(b.earnedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Rating evolution */}
      {stats.ratingEvolution?.length > 0 && (
        <SectionCard title="Évolution de la note (6 derniers mois)" icon={TrendingUp} iconColor="#10B981">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 96 }}>
            {stats.ratingEvolution.map(({ month, avg }) => (
              <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FBBF24' }}>{avg}</span>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${Math.round((avg / 5) * 70)}px`,
                  background: avg >= 4.5 ? '#10B981' : avg >= 3.5 ? '#FBBF24' : '#EF4444',
                  minHeight: 6, transition: 'height 0.4s ease',
                }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{month.slice(5)}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
