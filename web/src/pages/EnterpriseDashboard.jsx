import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, Car, Leaf, DollarSign, TrendingUp, MapPin, Clock,
  ArrowRight, Plus, Download, ChevronRight, Check, BarChart2, RefreshCw,
  Shield, Star, Zap, ArrowUpRight, Mail, Phone,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import api from '../services/api';

/* ─── Zellige stripe ─── */
function ZelligeStripe({ radius = '16px 16px 0 0' }) {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: radius }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.88 }} />
      ))}
    </div>
  );
}

/* ─── Section title ─── */
function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {children}
      </p>
      {action}
    </div>
  );
}

/* ─── KPI card ─── */
function KPICard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div style={{
      borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)',
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</p>}
      {trend != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#22C55E' : '#EF4444' }}>
          <ArrowUpRight size={12} style={{ transform: trend < 0 ? 'rotate(90deg)' : 'none' }} />
          {trend >= 0 ? '+' : ''}{trend}% vs mois dernier
        </div>
      )}
    </div>
  );
}

/* ─── Tooltip recharts ─── */
const TOOLTIP = {
  contentStyle: { background: '#11151f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#fff' },
};

/* ─── Mock data (remplacé par l'API en prod) ─── */
const MOCK_STATS = {
  totalRides:     248,
  activeEmployees: 87,
  co2Saved:       1840,
  budgetSpent:    24600,
  budgetTotal:    40000,
  avgRating:      4.7,
  ridesThisMonth: 62,
  trendRides:     +18,
  trendBudget:    -6,
};

const MOCK_MONTHLY = [
  { month: 'Jan', rides: 28, co2: 210 },
  { month: 'Fév', rides: 35, co2: 260 },
  { month: 'Mar', rides: 41, co2: 305 },
  { month: 'Avr', rides: 38, co2: 285 },
  { month: 'Mai', rides: 52, co2: 390 },
  { month: 'Jun', rides: 62, co2: 465 },
];

const MOCK_ROUTES = [
  { from: 'Casablanca',  to: 'Rabat',      rides: 94, employees: 32, saving: 18800 },
  { from: 'Rabat',       to: 'Casablanca', rides: 78, employees: 28, saving: 15600 },
  { from: 'Casablanca',  to: 'Berrechid',  rides: 41, employees: 15, saving:  8200 },
  { from: 'Salé',        to: 'Rabat',      rides: 35, employees: 12, saving:  7000 },
];

const MOCK_EMPLOYEES = [
  { id: 1, name: 'Fatima Zahra El Amrani', dept: 'DSI',     rides: 22, co2: 165, status: 'active' },
  { id: 2, name: 'Youssef Benali',         dept: 'Finance', rides: 18, co2: 135, status: 'active' },
  { id: 3, name: 'Aicha Moussaoui',        dept: 'RH',      rides: 16, co2: 120, status: 'active' },
  { id: 4, name: 'Karim Tahiri',           dept: 'Tech',    rides: 14, co2: 105, status: 'active' },
  { id: 5, name: 'Leila Berrada',          dept: 'DSI',     rides: 12, co2:  90, status: 'inactive' },
];

const MOCK_NAVETTES = [
  { id: 1, from: 'Casa-Voyageurs', to: 'Siège OCP Jorf Lasfar', days: ['Lun','Mar','Mer','Jeu','Ven'], departure: '07:30', seats: 4, enrolled: 4 },
  { id: 2, from: 'Hay Riad',       to: 'Direction Régionale',   days: ['Lun','Mer','Ven'],             departure: '08:00', seats: 3, enrolled: 2 },
  { id: 3, from: 'Ain Sebaa',      to: 'Centre de formation',   days: ['Mar','Jeu'],                   departure: '08:30', seats: 5, enrolled: 3 },
];

const DEPT_COLORS = { DSI: '#3B82F6', Finance: '#F59E0B', RH: '#EC4899', Tech: '#22C55E', default: '#6B7280' };

export default function EnterpriseDashboard() {
  const [tab,        setTab]        = useState('overview');
  const [stats,      setStats]      = useState(MOCK_STATS);
  const [monthly,    setMonthly]    = useState(MOCK_MONTHLY);
  const [routes,     setRoutes]     = useState(MOCK_ROUTES);
  const [employees,  setEmployees]  = useState(MOCK_EMPLOYEES);
  const [navettes,   setNavettes]   = useState(MOCK_NAVETTES);
  const [chartMode,  setChartMode]  = useState('rides'); // 'rides' | 'co2'
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    // Tentative API réelle — fallback silencieux sur mock data
    setLoading(true);
    Promise.all([
      api.get('/enterprise/stats').catch(() => null),
      api.get('/enterprise/routes').catch(() => null),
      api.get('/enterprise/employees').catch(() => null),
    ]).then(([s, r, e]) => {
      if (s?.data?.stats)     setStats(s.data.stats);
      if (r?.data?.routes)    setRoutes(r.data.routes);
      if (e?.data?.employees) setEmployees(e.data.employees);
    }).finally(() => setLoading(false));
  }, []);

  const budgetPct = Math.round((stats.budgetSpent / stats.budgetTotal) * 100);

  const TABS = [
    { id: 'overview',   label: 'Vue d\'ensemble' },
    { id: 'routes',     label: 'Trajets & navettes' },
    { id: 'employees',  label: 'Employés' },
    { id: 'budget',     label: 'Budget & rapports' },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 20 }}>
        <ZelligeStripe />
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #C1272D 0%, #D4890A 100%)',
              boxShadow: '0 4px 16px rgba(193,39,45,0.35)',
            }}>
              <Building2 size={26} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  Espace Entreprise
                </p>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99,
                  background: 'rgba(193,39,45,0.12)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.25)',
                  letterSpacing: '0.06em',
                }}>BETA</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Gestion des trajets domicile-travail de vos équipes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
              border: '1px solid var(--border-color)', background: 'var(--bg-700)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}>
              <Download size={14} /> Exporter
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
              border: 'none', background: 'linear-gradient(135deg, #C1272D, #a01f24)',
              color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 800,
              boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
            }}>
              <Plus size={14} /> Inviter des employés
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--border-color)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flexShrink: 0, padding: '12px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#C1272D' : 'transparent'}`,
              color: tab === t.id ? '#C1272D' : 'var(--text-muted)', transition: 'all .15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <KPICard icon={Car}     label="Trajets ce mois"    value={stats.ridesThisMonth} sub={`${stats.totalRides} au total`}          color="#C1272D" trend={stats.trendRides} />
            <KPICard icon={Users}   label="Employés actifs"    value={stats.activeEmployees} sub="sur la plateforme"                       color="#3B82F6" />
            <KPICard icon={Leaf}    label="CO₂ économisé"      value={`${(stats.co2Saved/1000).toFixed(1)}t`} sub="depuis le début"       color="#006233" trend={+12} />
            <KPICard icon={DollarSign} label="Budget utilisé"  value={`${(stats.budgetSpent/1000).toFixed(0)}k DH`} sub={`sur ${stats.budgetTotal/1000}k DH`} color="#D4890A" trend={stats.trendBudget} />
          </div>

          {/* Graphique évolution */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Évolution mensuelle</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['rides', 'Trajets', '#C1272D'], ['co2', 'CO₂ kg', '#006233']].map(([id, label, color]) => (
                  <button key={id} onClick={() => setChartMode(id)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: chartMode === id ? `${color}15` : 'var(--bg-700)',
                      color: chartMode === id ? color : 'var(--text-muted)',
                      border: `1px solid ${chartMode === id ? color + '40' : 'var(--border-color)'}`,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartMode === 'rides' ? '#C1272D' : '#006233'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartMode === 'rides' ? '#C1272D' : '#006233'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP} />
                <Area type="monotone" dataKey={chartMode}
                  stroke={chartMode === 'rides' ? '#C1272D' : '#006233'} strokeWidth={2.5}
                  fill="url(#grad)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top routes + Avantages en grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
            {/* Top routes */}
            <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '18px 20px' }}>
              <SectionTitle>Top routes</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {routes.slice(0, 3).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-700)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: ['rgba(193,39,45,0.15)','rgba(212,137,10,0.15)','rgba(0,98,51,0.15)'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: ['#C1272D','#D4890A','#006233'][i] }}>{i+1}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.from}</span>
                        <ArrowRight size={11} style={{ color: '#C1272D', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.to}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.rides} trajets · {r.employees} employés
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#006233' }}>{(r.saving/1000).toFixed(1)}k DH</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>économisés</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avantages */}
            <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '18px 20px' }}>
              <SectionTitle>Avantages clés</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: DollarSign, color: '#006233', title: 'Réduction des coûts',   sub: 'Jusqu\'à 60% vs taxi/transport individuel' },
                  { icon: Leaf,       color: '#22C55E', title: 'Impact environnemental', sub: `${stats.co2Saved} kg CO₂ économisés` },
                  { icon: Shield,     color: '#3B82F6', title: 'Conducteurs vérifiés',   sub: 'KYC + historique visible pour l\'entreprise' },
                  { icon: BarChart2,  color: '#D4890A', title: 'Rapports détaillés',     sub: 'Export Excel, PDF par département' },
                ].map(({ icon: Icon, color, title, sub }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Trajets & navettes ── */}
      {tab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Toutes les routes */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Routes entreprise</p>
              <Link to="/rides/search" style={{ fontSize: 12, fontWeight: 700, color: '#C1272D', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Voir tous les trajets <ChevronRight size={13} />
              </Link>
            </div>
            <div>
              {/* Header table */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border-color)' }}>
                {['Route', 'Trajets', 'Employés', 'Économies'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{h}</span>
                ))}
              </div>
              {routes.map((r, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '14px 20px',
                  borderBottom: i < routes.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={12} style={{ color: '#C1272D', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.from} → {r.to}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', alignSelf: 'center' }}>{r.rides}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>{r.employees} pers.</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#006233', alignSelf: 'center' }}>{r.saving.toLocaleString('fr-FR')} DH</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navettes récurrentes */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <ZelligeStripe radius="16px 16px 0 0" />
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Navettes récurrentes</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Trajets domicile-travail planifiés à la semaine</p>
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
                background: 'rgba(193,39,45,0.08)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.22)',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
              }}>
                <Plus size={13} /> Nouvelle navette
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {navettes.map((n, i) => (
                <div key={n.id} style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  borderBottom: i < navettes.length - 1 ? '1px solid var(--border-color)' : 'none',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(193,39,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <RefreshCw size={17} style={{ color: '#C1272D' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{n.from}</span>
                      <ArrowRight size={11} style={{ color: '#C1272D' }} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{n.to}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 11, color: '#C1272D', fontWeight: 700 }}>{n.departure}</span>
                      {n.days.map(d => (
                        <span key={d} style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(193,39,45,0.08)', color: '#C1272D' }}>{d}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', align: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>{n.enrolled}/{n.seats}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>inscrits</p>
                    </div>
                    <div style={{ width: 8, height: 40, borderRadius: 4, background: 'var(--bg-700)', overflow: 'hidden', alignSelf: 'center' }}>
                      <div style={{ width: '100%', height: `${(n.enrolled/n.seats)*100}%`, background: n.enrolled === n.seats ? '#C1272D' : '#22C55E', marginTop: 'auto', borderRadius: 4 }} />
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                    background: n.enrolled === n.seats ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)',
                    color: n.enrolled === n.seats ? '#F87171' : '#22C55E',
                    border: `1px solid ${n.enrolled === n.seats ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                    flexShrink: 0,
                  }}>
                    {n.enrolled === n.seats ? 'Complet' : `${n.seats - n.enrolled} place${n.seats - n.enrolled > 1 ? 's' : ''} dispo`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Employés ── */}
      {tab === 'employees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Barre de recherche + invite */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="Rechercher un employé…"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', outline: 'none',
              }} />
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
              background: 'linear-gradient(135deg, #C1272D, #a01f24)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800, flexShrink: 0,
              boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
            }}>
              <Plus size={14} /> Inviter
            </button>
          </div>

          {/* Table employés */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border-color)' }}>
              {['Employé', 'Département', 'Trajets', 'CO₂ économisé', 'Statut'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{h}</span>
              ))}
            </div>
            {employees.map((emp, i) => {
              const deptColor = DEPT_COLORS[emp.dept] || DEPT_COLORS.default;
              return (
                <div key={emp.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 12,
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < employees.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${deptColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: deptColor, flexShrink: 0 }}>
                      {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${deptColor}15`, color: deptColor, display: 'inline-block' }}>{emp.dept}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{emp.rides}</span>
                  <span style={{ fontSize: 13, color: '#22C55E', fontWeight: 700 }}>{emp.co2} kg</span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, textAlign: 'center',
                    background: emp.status === 'active' ? 'rgba(34,197,94,0.10)' : 'rgba(107,114,128,0.10)',
                    color: emp.status === 'active' ? '#22C55E' : '#6B7280',
                    border: `1px solid ${emp.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(107,114,128,0.25)'}`,
                  }}>
                    {emp.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Invitation par email */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '20px' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Inviter par email</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input placeholder="email@entreprise.ma" type="email"
                  style={{
                    width: '100%', padding: '10px 12px 10px 34px', borderRadius: 10, fontSize: 13,
                    background: 'var(--bg-700)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
              <button style={{
                padding: '10px 16px', borderRadius: 10, background: 'rgba(193,39,45,0.10)',
                color: '#C1272D', border: '1px solid rgba(193,39,45,0.25)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                Envoyer l'invitation
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              L'employé recevra un lien pour rejoindre l'espace entreprise et ses trajets seront automatiquement rattachés.
            </p>
          </div>
        </div>
      )}

      {/* ── Budget & rapports ── */}
      {tab === 'budget' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Budget gauge */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>Budget mobilité — Juin 2026</p>
                <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {stats.budgetSpent.toLocaleString('fr-FR')}
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 6 }}>DH</span>
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>sur {stats.budgetTotal.toLocaleString('fr-FR')} DH alloués</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 32, fontWeight: 900, color: budgetPct > 80 ? '#EF4444' : budgetPct > 60 ? '#F59E0B' : '#22C55E' }}>{budgetPct}%</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>utilisé</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-700)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${budgetPct}%`, borderRadius: 6, transition: 'width .6s ease',
                background: budgetPct > 80 ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                           : budgetPct > 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                           : 'linear-gradient(90deg, #22C55E, #16A34A)',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0 DH</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stats.budgetTotal.toLocaleString('fr-FR')} DH</span>
            </div>
          </div>

          {/* Graphique dépenses par département */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '18px 20px' }}>
            <SectionTitle>Dépenses par département</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { dept: 'DSI',     amount: 8400 },
                { dept: 'Finance', amount: 6200 },
                { dept: 'Tech',    amount: 5100 },
                { dept: 'RH',      amount: 3800 },
                { dept: 'Autres',  amount: 1100 },
              ]} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dept" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP} formatter={v => [`${v.toLocaleString('fr-FR')} DH`]} />
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {['#C1272D','#D4890A','#006233','#3B82F6','#6B7280'].map((c, i) => (
                    <Cell key={i} fill={c} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Export */}
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '20px' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>Exporter les rapports</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {[
                { label: 'Rapport mensuel',    fmt: 'PDF', color: '#EF4444' },
                { label: 'Détail employés',    fmt: 'Excel', color: '#22C55E' },
                { label: 'Impact CO₂',         fmt: 'PDF', color: '#006233' },
                { label: 'Facturation',        fmt: 'PDF', color: '#D4890A' },
              ].map(({ label, fmt, color }) => (
                <button key={label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: 'var(--bg-700)', border: '1px solid var(--border-color)', transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-700)'; }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${color}20`, color }}>{fmt}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                  <Download size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
