import { useEffect, useState } from 'react';
import { Users, Car, BookOpen, Star, Search, Shield, Ban, Trash2, CheckCircle, Flag, TrendingUp, Wallet, AlertTriangle, FileCheck, X, ExternalLink, ShieldCheck, ShieldOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#C1272D', '#D4890A', '#10B981', '#3B82F6', '#8B5CF6'];

const STAT_COLORS = {
  blue:   '#2563EB',
  green:  '#16A34A',
  yellow: '#CA8A04',
  purple: '#9333EA',
};

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const hex = STAT_COLORS[color] || '#C1272D';
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: hex, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} style={{ color: '#fff' }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>{value ?? '—'}</p>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  );
}

const REPORT_STATUS_COLORS = {
  pending:     { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', label: 'En attente' },
  in_progress: { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6', label: 'En cours'   },
  resolved:    { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', label: 'Résolu'     },
  rejected:    { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: 'Rejeté'     },
};

const REASON_LABELS = {
  conduite_dangereuse: 'Conduite dangereuse',
  impolitesse:         'Impolitesse',
  no_show:             'No-show',
  escroquerie:         'Escroquerie',
  harcelement:         'Harcèlement',
  arnaque_prix:        'Arnaque prix',
  autre:               'Autre',
};

const TH = ({ children }) => (
  <th style={{ paddingBottom: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
    {children}
  </th>
);

const CHART_TOOLTIP = {
  contentStyle: { background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#fff' },
};

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'superadmin';
  const [tab,            setTab]            = useState('overview');
  const [stats,          setStats]          = useState(null);
  const [users,          setUsers]          = useState([]);
  const [rides,          setRides]          = useState([]);
  const [reports,        setReports]        = useState([]);
  const [search,         setSearch]         = useState('');
  const [rejectReason,   setRejectReason]   = useState('');
  const [rejectingId,    setRejectingId]    = useState(null);
  const [loading, setLoading] = useState(true);

  const ridesPerMonth = [
    { month: 'Jan', trajets: 12 }, { month: 'Fév', trajets: 19 },
    { month: 'Mar', trajets: 28 }, { month: 'Avr', trajets: 35 },
    { month: 'Mai', trajets: 42 }, { month: 'Jun', trajets: stats?.totalRides ?? 50 },
  ];

  const roleDistribution = [
    { name: 'Passagers',   value: Math.round((stats?.totalUsers ?? 10) * 0.65) },
    { name: 'Conducteurs', value: Math.round((stats?.totalUsers ?? 10) * 0.30) },
    { name: 'Admins',      value: Math.round((stats?.totalUsers ?? 10) * 0.05) },
  ];

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
    ]).then(([s, u]) => {
      setStats(s.data.stats);
      setUsers(u.data.users);
    }).finally(() => setLoading(false));
  }, []);

  const fetchUsers          = () => api.get('/admin/users', { params: { search } }).then(({ data }) => setUsers(data.users || [])).catch(() => setUsers([]));
  const fetchRides          = () => api.get('/admin/rides').then(({ data }) => setRides(data.rides || [])).catch(() => setRides([]));
  const fetchReports        = () => api.get('/admin/reports').then(({ data }) => setReports(data.reports || [])).catch(() => setReports([]));

  useEffect(() => {
    if (tab === 'rides')   fetchRides();
    if (tab === 'reports') fetchReports();
    if (tab === 'kyc')     fetchPendingKyc();
  }, [tab]);

  // Le conducteur est vérifié automatiquement par l'IA (CIN/permis/véhicule) à l'onboarding —
  // pas de file d'attente d'approbation manuelle côté admin.
  const blockUser   = async (id) => { await api.patch(`/admin/users/${id}/ban`);          toast.success('Bloqué');                fetchUsers(); };
  const unblockUser = async (id) => { await api.patch(`/admin/users/${id}/reactivate`);   toast.success('Débloqué');              fetchUsers(); };
  const promoteUser = async (id) => { await api.patch(`/admin/users/${id}/role`, { role: 'admin' });      toast.success('Promu administrateur');  fetchUsers(); };
  const demoteUser  = async (id) => { await api.patch(`/admin/users/${id}/role`, { role: 'user' });       toast.success('Rétrogradé utilisateur'); fetchUsers(); };

  const deleteUser = async (id) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Supprimer cet utilisateur ?</p>
        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Cette action est irréversible.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #374151', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={async () => { toast.dismiss(t.id); await api.delete(`/admin/users/${id}`); toast.success('Supprimé'); fetchUsers(); }}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Supprimer</button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const cancelRide   = async (id) => { await api.patch(`/admin/rides/${id}/cancel`);      toast.success('Annulé');           fetchRides(); };
  const updateReport = async (id, status) => { await api.patch(`/admin/reports/${id}/status`, { status }); toast.success('Statut mis à jour'); fetchReports(); };

  const [pendingKyc, setPendingKyc] = useState([]);
  const fetchPendingKyc = () => api.get('/admin/kyc/pending').then(({ data }) => setPendingKyc(data.users || [])).catch(() => setPendingKyc([]));
  const approveKyc = async (id) => { await api.patch(`/admin/kyc/${id}/approve`); toast.success('Identité approuvée'); fetchPendingKyc(); };
  const rejectKyc  = async (id) => {
    await api.patch(`/admin/kyc/${id}/reject`, { reason: rejectReason });
    toast.success('Identité refusée');
    setRejectingId(null); setRejectReason('');
    fetchPendingKyc();
  };

  if (loading) return <Spinner size="lg" />;

  const tabs = [
    ['overview', "Vue d'ensemble"],
    ['users',    'Utilisateurs'],
    ['rides',    'Trajets'],
    ['reports',  'Signalements'],
    ['kyc',      `Identité${pendingKyc.length ? ` (${pendingKyc.length})` : ''}`],
  ];

  const sectionCard = { background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' };
  const sectionBody = { padding: '18px 20px' };
  const sectionTitle = (icon, label, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {icon}
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{label}</p>
    </div>
  );

  const actionBtn = (label, onClick, color, border) => (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: border || 'none', background: `${color}1A`, color, transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {label}
    </button>
  );

  const iconBtn = (icon, onClick, color, title) => (
    <button onClick={onClick} title={title}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color, display: 'flex', padding: 4, transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {icon}
    </button>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 24 }}>
        <ZelligeStripe />
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(193,39,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} style={{ color: '#C1272D' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
            <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Dashboard Admin</h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard icon={Users}    label="Utilisateurs" value={stats?.totalUsers}    color="blue"   />
        <StatCard icon={Car}      label="Trajets"       value={stats?.totalRides}    color="green"  />
        <StatCard icon={BookOpen} label="Réservations"  value={stats?.totalBookings} color="yellow" />
        <StatCard icon={Star}     label="Avis"          value={stats?.totalReviews}  color="purple" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg-700)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 4, flexWrap: 'wrap', width: 'fit-content' }}>
        {tabs.map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)}
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: tab === v ? '#C1272D' : 'transparent', color: tab === v ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          <div style={sectionCard}>
            <ZelligeStripe />
            <div style={sectionBody}>
              {sectionTitle(<TrendingUp size={15} style={{ color: '#22C55E' }} />, 'Trajets publiés (6 mois)')}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ridesPerMonth}>
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Bar dataKey="trajets" fill="#C1272D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={sectionCard}>
            <ZelligeStripe />
            <div style={sectionBody}>
              {sectionTitle(<Users size={15} style={{ color: '#3B82F6' }} />, 'Répartition utilisateurs')}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ color: '#CBD5E1', fontSize: 12 }}>{v}</span>} />
                  <Tooltip {...CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...sectionCard, gridColumn: '1 / -1' }}>
            <ZelligeStripe />
            <div style={sectionBody}>
              {sectionTitle(<BookOpen size={15} style={{ color: '#D4890A' }} />, 'Activité réservations')}
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={ridesPerMonth}>
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Line type="monotone" dataKey="trajets" stroke="#D4890A" strokeWidth={2.5} dot={{ fill: '#D4890A', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ ...sectionCard, gridColumn: '1 / -1' }}>
            <div style={{ ...sectionBody, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Stats rapides</p>
              {[
                { Icon: Wallet,        color: '#22C55E', label: 'Revenus estimés', value: `${((stats?.totalBookings ?? 0) * 45).toLocaleString()} MAD` },
                { Icon: AlertTriangle, color: '#EF4444', label: 'Signalements',    value: reports.length || '—' },
                { Icon: Flag,          color: '#FBBF24', label: 'En attente',      value: reports.filter(r => r.status === 'pending').length || '0' },
              ].map(({ Icon, color, label, value }, i, arr) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={15} style={{ color }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <>
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: 16 }}>
              <Shield size={15} style={{ color: '#A78BFA', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(167,139,250,0.85)' }}>
                En tant que <strong>Super Admin</strong>, vous pouvez promouvoir des utilisateurs en admin ou rétrograder des admins.
              </p>
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} placeholder="Rechercher..." className="input" style={{ paddingLeft: 36, fontSize: 13 }} />
          </div>

          <div style={{ ...sectionCard, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <TH>Utilisateur</TH>
                  <TH>Email</TH>
                  <TH>Rôle</TH>
                  <TH>Statut</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.id !== me?.id).map((u, i, arr) => {
                  const isAdmin = ['admin', 'superadmin'].includes(u.role);
                  const canAct  = !isAdmin || isSuperAdmin;
                  const roleBg  = u.role === 'superadmin' ? 'rgba(139,92,246,0.2)' : u.role === 'admin' ? 'rgba(59,130,246,0.2)' : 'var(--bg-700)';
                  const roleColor = u.role === 'superadmin' ? '#A78BFA' : u.role === 'admin' ? '#60A5FA' : 'var(--text-secondary)';
                  return (
                    <tr key={u.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '12px 0 12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {u.photo
                            ? <img src={u.photo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{u.firstName?.[0]}</div>
                          }
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: roleBg, color: roleColor }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}><BookingStatusBadge status={u.status} /></td>
                      <td style={{ padding: '12px 8px 12px 0' }}>
                        {canAct ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {u.status === 'active'
                              ? iconBtn(<Ban size={15} />, () => blockUser(u.id), '#FBBF24', 'Bloquer')
                              : iconBtn(<CheckCircle size={15} />, () => unblockUser(u.id), '#22C55E', 'Débloquer')}
                            {isSuperAdmin && u.role === 'user'  && iconBtn(<ShieldCheck size={15} />, () => promoteUser(u.id), '#60A5FA', 'Promouvoir admin')}
                            {isSuperAdmin && u.role === 'admin' && iconBtn(<ShieldOff   size={15} />, () => demoteUser(u.id),  '#F97316', 'Rétrograder')}
                            {iconBtn(<Trash2 size={15} />, () => deleteUser(u.id), '#EF4444', 'Supprimer')}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Super admin requis</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Rides ── */}
      {tab === 'rides' && (
        <div style={{ ...sectionCard, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <TH>Trajet</TH>
                <TH>Conducteur</TH>
                <TH>Date</TH>
                <TH>Prix</TH>
                <TH>Statut</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {rides.map((r, i, arr) => (
                <tr key={r.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '12px 0 12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.from} → {r.to}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{r.driver?.firstName} {r.driver?.lastName}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{new Date(r.departureDate).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontWeight: 700 }}>{Number(r.price).toFixed(0)} MAD</td>
                  <td style={{ padding: '12px 8px' }}><BookingStatusBadge status={r.status} /></td>
                  <td style={{ padding: '12px 8px 12px 0' }}>
                    {r.status === 'active' && (
                      <button onClick={() => cancelRide(r.id)}
                        style={{ fontSize: 12, fontWeight: 700, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8 }}>
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── KYC ── */}
      {tab === 'kyc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pendingKyc.length === 0 ? (
            <div style={{ ...sectionCard, padding: '48px 20px', textAlign: 'center' }}>
              <FileCheck size={36} style={{ color: '#22C55E', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Aucune vérification d'identité en attente</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Toutes les demandes ont été traitées.</p>
            </div>
          ) : pendingKyc.map(u => (
            <div key={u.id} style={{ ...sectionCard }}>
              <ZelligeStripe />
              <div style={{ ...sectionBody, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {u.photo
                      ? <img src={u.photo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff' }}>{u.firstName?.[0]}</div>
                    }
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>En attente</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {u.kycSelfie && (
                    <a href={u.kycSelfie} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <ExternalLink size={12} /> Voir le selfie
                    </a>
                  )}
                  {u.cinDoc && (
                    <a href={u.cinDoc} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <ExternalLink size={12} /> Voir la CIN
                    </a>
                  )}
                </div>

                {rejectingId === u.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Motif du refus (optionnel)..." className="input" style={{ flex: 1, fontSize: 13 }} />
                    <button onClick={() => rejectKyc(u.id)}
                      style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>
                      Confirmer refus
                    </button>
                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                      style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer', border: 'none', background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => approveKyc(u.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>
                      <CheckCircle size={15} /> Approuver
                    </button>
                    <button onClick={() => setRejectingId(u.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.1)', color: '#F87171' }}>
                      <X size={15} /> Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reports ── */}
      {tab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reports.length === 0 ? (
            <div style={{ ...sectionCard, padding: '48px 20px', textAlign: 'center' }}>
              <Flag size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Aucun signalement</p>
            </div>
          ) : reports.map(r => {
            const sm = REPORT_STATUS_COLORS[r.status] || REPORT_STATUS_COLORS.pending;
            return (
              <div key={r.id} style={{ ...sectionCard }}>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {r.reporter?.photo
                        ? <img src={r.reporter.photo} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reporter?.firstName?.[0]}</div>
                      }
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reporter?.firstName} {r.reporter?.lastName}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>a signalé <span style={{ color: '#F87171' }}>{r.reportedUser?.firstName} {r.reportedUser?.lastName}</span></p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>{sm.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 24 }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)' }}>Motif</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{REASON_LABELS[r.reason] || r.reason}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)' }}>Date</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  {r.description && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{r.description}"</p>
                  )}

                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => updateReport(r.id, 'resolved')}
                        style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>
                        Marquer résolu
                      </button>
                      <button onClick={() => updateReport(r.id, 'rejected')}
                        style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(107,114,128,0.12)', color: '#9CA3AF' }}>
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
