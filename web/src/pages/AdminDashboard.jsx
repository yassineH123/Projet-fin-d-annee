import { useEffect, useState } from 'react';
import { Users, Car, BookOpen, Star, Search, Shield, Ban, Trash2, CheckCircle, Flag, TrendingUp, Wallet, AlertTriangle, FileCheck, X, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#C1272D', '#D4890A', '#10B981', '#3B82F6', '#8B5CF6'];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value ?? '—'}</p>
        <p className="text-slate-400 text-sm">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const REPORT_STATUS_COLORS = {
  pending:   { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'En attente' },
  reviewed:  { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Examiné'   },
  dismissed: { bg: 'rgba(107,114,128,0.1)',color: '#6B7280', label: 'Rejeté'    },
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

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'superadmin';
  const [tab,            setTab]            = useState('overview');
  const [stats,          setStats]          = useState(null);
  const [users,          setUsers]          = useState([]);
  const [rides,          setRides]          = useState([]);
  const [reports,        setReports]        = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [search,         setSearch]         = useState('');
  const [rejectReason,   setRejectReason]   = useState('');
  const [rejectingId,    setRejectingId]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock chart data derived from stats (replace with real endpoint if available)
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
  const fetchReports        = () => api.get('/reports').then(({ data }) => setReports(data.reports || [])).catch(() => setReports([]));
  const fetchPendingDrivers = () => api.get('/admin/drivers/pending').then(({ data }) => setPendingDrivers(data.drivers || [])).catch(() => setPendingDrivers([]));

  useEffect(() => {
    if (tab === 'rides')   fetchRides();
    if (tab === 'reports') fetchReports();
    if (tab === 'drivers') fetchPendingDrivers();
    if (tab === 'kyc')     fetchPendingKyc();
  }, [tab]);

  const blockUser   = async (id) => { await api.patch(`/admin/users/${id}/block`);   toast.success('Bloqué');    fetchUsers(); };
  const unblockUser = async (id) => { await api.patch(`/admin/users/${id}/unblock`); toast.success('Débloqué'); fetchUsers(); };
  const deleteUser  = async (id) => {
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
  const cancelRide  = async (id) => { await api.patch(`/admin/rides/${id}/cancel`);  toast.success('Annulé');   fetchRides(); };
  const updateReport = async (id, status) => {
    await api.patch(`/reports/${id}/status`, { status });
    toast.success('Statut mis à jour');
    fetchReports();
  };

  const approveDriver = async (id) => {
    await api.patch(`/admin/drivers/${id}/approve`);
    toast.success('Conducteur approuvé');
    fetchPendingDrivers();
  };

  const rejectDriver = async (id) => {
    await api.patch(`/admin/drivers/${id}/reject`, { reason: rejectReason });
    toast.success('Document refusé');
    setRejectingId(null);
    setRejectReason('');
    fetchPendingDrivers();
  };

  // ── KYC (vérification d'identité) ──
  const [pendingKyc, setPendingKyc] = useState([]);
  const fetchPendingKyc = () => api.get('/admin/kyc/pending').then(({ data }) => setPendingKyc(data.users || [])).catch(() => setPendingKyc([]));
  const approveKyc = async (id) => {
    await api.patch(`/admin/kyc/${id}/approve`);
    toast.success('Identité approuvée');
    fetchPendingKyc();
  };
  const rejectKyc = async (id) => {
    await api.patch(`/admin/kyc/${id}/reject`, { reason: rejectReason });
    toast.success('Identité refusée');
    setRejectingId(null);
    setRejectReason('');
    fetchPendingKyc();
  };

  if (loading) return <Spinner size="lg" />;

  const tabs = [
    ['overview', 'Vue d\'ensemble'],
    ['users',    'Utilisateurs'],
    ['rides',    'Trajets'],
    ['reports',  'Signalements'],
    ['drivers',  `Conducteurs${pendingDrivers.length ? ` (${pendingDrivers.length})` : ''}`],
    ['kyc',      `Identité${pendingKyc.length ? ` (${pendingKyc.length})` : ''}`],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-primary-400" size={28} />
        <h1 className="text-2xl font-black text-white">Dashboard Admin</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}    label="Utilisateurs" value={stats?.totalUsers}    color="bg-blue-600" />
        <StatCard icon={Car}      label="Trajets"       value={stats?.totalRides}    color="bg-green-600" />
        <StatCard icon={BookOpen} label="Réservations"  value={stats?.totalBookings} color="bg-yellow-600" />
        <StatCard icon={Star}     label="Avis"          value={stats?.totalReviews}  color="bg-purple-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-dark-800 border border-dark-500 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === v ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rides per month */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-green-400" />
              <h2 className="font-bold text-white">Trajets publiés (6 mois)</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ridesPerMonth}>
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="trajets" fill="#C1272D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User distribution */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-blue-400" />
              <h2 className="font-bold text-white">Répartition utilisateurs</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {roleDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#CBD5E1', fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bookings trend (line) */}
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-yellow-400" />
              <h2 className="font-bold text-white">Activité réservations</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={ridesPerMonth}>
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
                <Line type="monotone" dataKey="trajets" stroke="#D4890A" strokeWidth={2.5} dot={{ fill: '#D4890A', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quick stats */}
          <div className="card flex flex-col gap-3">
            <h2 className="font-bold text-white mb-1">Stats rapides</h2>
            {[
              { icon: Wallet,        color: 'text-green-400', label: 'Revenus estimés', value: `${((stats?.totalBookings ?? 0) * 45).toLocaleString()} MAD` },
              { icon: AlertTriangle, color: 'text-red-400',   label: 'Signalements',    value: reports.length || '—' },
              { icon: Flag,          color: 'text-yellow-400',label: 'En attente',       value: reports.filter(r => r.status === 'pending').length || '0' },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <Icon size={15} className={color} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <span className="font-bold text-white text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === 'users' && (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} placeholder="Rechercher..." className="input pl-9 text-sm" />
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-dark-500">
                  <th className="pb-3 text-slate-400 font-medium">Utilisateur</th>
                  <th className="pb-3 text-slate-400 font-medium">Email</th>
                  <th className="pb-3 text-slate-400 font-medium">Rôle</th>
                  <th className="pb-3 text-slate-400 font-medium">Statut</th>
                  <th className="pb-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter((u) => u.id !== me?.id).map((u) => {
                  const isAdmin   = ['admin', 'superadmin'].includes(u.role);
                  const canAct    = !isAdmin || isSuperAdmin;
                  return (
                    <tr key={u.id} className="border-b border-dark-500/50 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {u.photo
                            ? <img src={u.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                            : <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-white">{u.firstName?.[0]}</div>
                          }
                          <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                          u.role === 'admin'      ? 'bg-blue-500/20 text-blue-400' :
                          'bg-dark-600 text-slate-300'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-3"><BookingStatusBadge status={u.status} /></td>
                      <td className="py-3">
                        {canAct ? (
                          <div className="flex items-center gap-3">
                            {u.status === 'active'
                              ? <button onClick={() => blockUser(u.id)} title="Bloquer" className="text-yellow-400 hover:text-yellow-300 transition"><Ban size={15} /></button>
                              : <button onClick={() => unblockUser(u.id)} title="Débloquer" className="text-green-400 hover:text-green-300 transition"><CheckCircle size={15} /></button>
                            }
                            <button onClick={() => deleteUser(u.id)} title="Supprimer" className="text-red-400 hover:text-red-300 transition"><Trash2 size={15} /></button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic">Super admin requis</span>
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

      {/* ── Rides tab ── */}
      {tab === 'rides' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-dark-500">
                <th className="pb-3 text-slate-400 font-medium">Trajet</th>
                <th className="pb-3 text-slate-400 font-medium">Conducteur</th>
                <th className="pb-3 text-slate-400 font-medium">Date</th>
                <th className="pb-3 text-slate-400 font-medium">Prix</th>
                <th className="pb-3 text-slate-400 font-medium">Statut</th>
                <th className="pb-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r.id} className="border-b border-dark-500/50 last:border-0">
                  <td className="py-3 text-white font-medium">{r.from} → {r.to}</td>
                  <td className="py-3 text-slate-400">{r.driver?.firstName} {r.driver?.lastName}</td>
                  <td className="py-3 text-slate-400">{new Date(r.departureDate).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 text-white">{Number(r.price).toFixed(0)} MAD</td>
                  <td className="py-3"><BookingStatusBadge status={r.status} /></td>
                  <td className="py-3">
                    {r.status === 'active' && (
                      <button onClick={() => cancelRide(r.id)} className="text-red-400 hover:text-red-300 transition text-xs font-semibold">Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Drivers verification tab ── */}
      {tab === 'drivers' && (
        <div className="flex flex-col gap-4">
          {pendingDrivers.length === 0 ? (
            <div className="card text-center py-12">
              <FileCheck size={36} className="text-green-500 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">Aucune vérification en attente</p>
              <p className="text-slate-400 text-sm">Tous les documents ont été traités.</p>
            </div>
          ) : pendingDrivers.map(driver => (
            <div key={driver.id} className="card flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {driver.photo
                    ? <img src={driver.photo} alt="" className="w-11 h-11 rounded-full object-cover" />
                    : <div className="w-11 h-11 rounded-full bg-dark-600 flex items-center justify-center text-sm font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
                        {driver.firstName?.[0]}
                      </div>
                  }
                  <div>
                    <p className="font-black text-white">{driver.firstName} {driver.lastName}</p>
                    <p className="text-xs text-slate-400">{driver.email} · {driver.nationality === 'foreign' ? 'Étranger' : 'Marocain'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                  En attente de vérification
                </span>
              </div>

              {/* Documents */}
              <div className="flex flex-wrap gap-3">
                {driver.cinDoc && (
                  <a href={driver.cinDoc} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <ExternalLink size={12} /> Voir CIN
                  </a>
                )}
                {driver.passportDoc && (
                  <a href={driver.passportDoc} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <ExternalLink size={12} /> Voir Passeport
                  </a>
                )}
              </div>

              {/* Reject reason input (shown only for this driver) */}
              {rejectingId === driver.id && (
                <div className="flex gap-2">
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Motif du refus (optionnel)..."
                    className="input text-sm flex-1" />
                  <button onClick={() => rejectDriver(driver.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>
                    Confirmer refus
                  </button>
                  <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {rejectingId !== driver.id && (
                <div className="flex gap-3 pt-1">
                  <button onClick={() => approveDriver(driver.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={15} /> Approuver
                  </button>
                  <button onClick={() => setRejectingId(driver.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <X size={15} /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── KYC tab (vérification d'identité) ── */}
      {tab === 'kyc' && (
        <div className="flex flex-col gap-4">
          {pendingKyc.length === 0 ? (
            <div className="card text-center py-12">
              <FileCheck size={36} className="text-green-500 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">Aucune vérification d'identité en attente</p>
              <p className="text-slate-400 text-sm">Toutes les demandes ont été traitées.</p>
            </div>
          ) : pendingKyc.map(u => (
            <div key={u.id} className="card flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {u.photo
                    ? <img src={u.photo} alt="" className="w-11 h-11 rounded-full object-cover" />
                    : <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>{u.firstName?.[0]}</div>
                  }
                  <div>
                    <p className="font-black text-white">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                  En attente
                </span>
              </div>

              {/* Documents : selfie + CIN */}
              <div className="flex flex-wrap gap-3">
                {u.kycSelfie && (
                  <a href={u.kycSelfie} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <ExternalLink size={12} /> Voir le selfie
                  </a>
                )}
                {u.cinDoc && (
                  <a href={u.cinDoc} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <ExternalLink size={12} /> Voir la CIN
                  </a>
                )}
              </div>

              {rejectingId === u.id ? (
                <div className="flex gap-2">
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Motif du refus (optionnel)..." className="input text-sm flex-1" />
                  <button onClick={() => rejectKyc(u.id)} className="px-4 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>Confirmer refus</button>
                  <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}><X size={14} /></button>
                </div>
              ) : (
                <div className="flex gap-3 pt-1">
                  <button onClick={() => approveKyc(u.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={15} /> Approuver
                  </button>
                  <button onClick={() => setRejectingId(u.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <X size={15} /> Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Reports tab ── */}
      {tab === 'reports' && (
        <div className="flex flex-col gap-4">
          {reports.length === 0 ? (
            <div className="card text-center py-12">
              <Flag size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun signalement</p>
            </div>
          ) : reports.map(r => {
            const sm = REPORT_STATUS_COLORS[r.status] || REPORT_STATUS_COLORS.pending;
            return (
              <div key={r.id} className="card flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {r.reporter?.photo
                      ? <img src={r.reporter.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                      : <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-white">{r.reporter?.firstName?.[0]}</div>
                    }
                    <div>
                      <p className="text-sm font-bold text-white">{r.reporter?.firstName} {r.reporter?.lastName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>a signalé <span className="text-red-400">{r.reported?.firstName} {r.reported?.lastName}</span></p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Motif</p>
                    <p className="font-semibold text-white">{REASON_LABELS[r.reason] || r.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Date</p>
                    <p className="font-semibold text-white">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {r.description && (
                  <p className="text-sm text-slate-400 italic">"{r.description}"</p>
                )}

                {r.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateReport(r.id, 'reviewed')}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }}>
                      Marquer examiné
                    </button>
                    <button onClick={() => updateReport(r.id, 'dismissed')}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(107,114,128,0.12)', color: '#9CA3AF' }}>
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
