import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Car, BookOpen, Star, Search, Shield, Ban, Trash2, CheckCircle, BarChart2, Flag, ScrollText, PauseCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { StarDisplay } from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value ?? '—'}</p>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  );
}

const REPORT_REASON_LABELS = {
  comportement: 'Comportement',
  fraude: 'Fraude',
  securite: 'Sécurité',
  contenu_inapproprie: 'Contenu inapproprié',
  trajet_suspect: 'Trajet suspect',
  autre: 'Autre',
};

function UserDetailModal({ userId, onClose }) {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setData(null);
    setError(null);
    api.get(`/admin/users/${userId}`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger cet utilisateur.'));
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Détails utilisateur</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : !data ? <Spinner /> : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {data.user.photo
                ? <img src={data.user.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                : <div className="w-12 h-12 rounded-full bg-dark-600 flex items-center justify-center font-bold text-white">{data.user.firstName?.[0]}</div>
              }
              <div>
                <p className="text-white font-semibold">{data.user.firstName} {data.user.lastName}</p>
                <p className="text-slate-400 text-sm">{data.user.email}</p>
              </div>
              <BookingStatusBadge status={data.user.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-dark-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Téléphone</p><p className="text-white">{data.user.phone || '—'}</p></div>
              <div className="bg-dark-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Rôle</p><p className="text-white">{data.user.role}</p></div>
              <div className="bg-dark-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Trajets (conducteur)</p><p className="text-white">{data.stats.ridesAsDriver}</p></div>
              <div className="bg-dark-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Réservations (passager)</p><p className="text-white">{data.stats.bookingsAsPassenger}</p></div>
              <div className="bg-dark-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Signalements reçus</p><p className="text-white">{data.stats.reportsReceived}</p></div>
              <div className="bg-dark-700 rounded-lg p-3"><p className="text-slate-400 text-xs">Signalements envoyés</p><p className="text-white">{data.stats.reportsFiled}</p></div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold mb-2">Commentaires reçus ({data.reviews.length})</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {data.reviews.length === 0 && (
                  <p className="text-slate-500 text-sm">Aucun commentaire pour le moment.</p>
                )}
                {data.reviews.map((r) => (
                  <div key={r.id} className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{r.reviewer?.firstName} {r.reviewer?.lastName}</span>
                      <StarDisplay rating={r.rating} size={13} />
                    </div>
                    {r.comment && <p className="text-slate-400 text-xs">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportDetailModal({ reportId, onClose, onViewUser }) {
  const [report, setReport] = useState(null);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!reportId) return;
    setReport(null);
    setError(null);
    api.get(`/admin/reports/${reportId}`)
      .then(({ data }) => setReport(data.report))
      .catch((err) => setError(err.response?.data?.message || 'Impossible de charger ce signalement.'));
  }, [reportId]);

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Flag size={18} className="text-orange-400" /> Détails du signalement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : !report ? <Spinner /> : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-dark-600 text-slate-300">
                {REPORT_REASON_LABELS[report.reason] || report.reason}
              </span>
              <BookingStatusBadge status={report.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Signalé par</p>
                <p className="text-white">{report.reporter?.firstName} {report.reporter?.lastName}</p>
                <p className="text-slate-500 text-xs">{report.reporter?.email}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Utilisateur visé</p>
                <button onClick={() => onViewUser(report.reportedUser?.id)} className="text-white hover:underline text-left">
                  {report.reportedUser?.firstName} {report.reportedUser?.lastName}
                </button>
                <p className="text-slate-500 text-xs">{report.reportedUser?.email} — {report.reportedUser?.phone || 'pas de tél.'}</p>
              </div>
            </div>

            {report.ride && (
              <div className="bg-dark-700 rounded-lg p-3 text-sm">
                <p className="text-slate-400 text-xs mb-1">Trajet concerné</p>
                <Link to={`/rides/${report.ride.id}`} className="text-primary-400 hover:underline">
                  {report.ride.from} → {report.ride.to}
                </Link>
              </div>
            )}

            <div>
              <p className="text-slate-400 text-xs font-semibold mb-1.5">Description du signaleur</p>
              <p className="bg-dark-700 rounded-lg p-3 text-sm text-slate-300">
                {report.description || <span className="text-slate-500 italic">Aucune description fournie.</span>}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold mb-1.5">Note administrative</p>
              <p className="bg-dark-700 rounded-lg p-3 text-sm text-slate-300">
                {report.adminNote || <span className="text-slate-500 italic">Aucune note pour le moment.</span>}
              </p>
              {report.handledByAdmin && (
                <p className="text-slate-500 text-xs mt-1.5">
                  Traité par {report.handledByAdmin.firstName} {report.handledByAdmin.lastName}
                  {report.resolvedAt && ` le ${new Date(report.resolvedAt).toLocaleDateString('fr-FR')}`}
                </p>
              )}
            </div>

            <p className="text-slate-600 text-xs">Signalé le {new Date(report.createdAt).toLocaleString('fr-FR')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'superadmin';
  const [tab,    setTab]    = useState('users');
  const [stats,  setStats]  = useState(null);
  const [charts, setCharts] = useState(null);
  const [users,  setUsers]  = useState([]);
  const [rides,  setRides]  = useState([]);
  const [reports, setReports] = useState([]);
  const [logs,    setLogs]    = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [rideSearch, setRideSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [rideStatusFilter, setRideStatusFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('');
  const [detailUserId, setDetailUserId] = useState(null);
  const [detailReportId, setDetailReportId] = useState(null);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
      api.get('/admin/charts'),
    ]).then(([s, u, c]) => {
      setStats(s.data.stats);
      setUsers(u.data.users);
      setCharts(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const fetchUsers = useCallback(() => {
    api.get('/admin/users', { params: { search: userSearch, role: roleFilter || undefined } }).then(({ data }) => setUsers(data.users));
  }, [userSearch, roleFilter]);
  const fetchRides = useCallback(() => {
    api.get('/admin/rides', { params: { search: rideSearch, status: rideStatusFilter || undefined } }).then(({ data }) => setRides(data.rides));
  }, [rideSearch, rideStatusFilter]);
  const fetchReports = useCallback(() => {
    api.get('/admin/reports', { params: { status: reportStatusFilter || undefined } }).then(({ data }) => setReports(data.reports));
  }, [reportStatusFilter]);
  const fetchLogs = useCallback(() => {
    api.get('/admin/logs').then(({ data }) => setLogs(data.logs));
  }, []);

  useEffect(() => { if (tab === 'rides')   fetchRides(); },   [tab, rideStatusFilter]);
  useEffect(() => { if (tab === 'reports') fetchReports(); }, [tab, reportStatusFilter]);
  useEffect(() => { if (tab === 'logs')    fetchLogs(); },    [tab]);
  useEffect(() => { if (tab === 'users')   fetchUsers(); },   [roleFilter]);

  const runAction = async (promise, successMsg, refresh) => {
    try {
      await promise;
      toast.success(successMsg);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const suspendUser    = (id) => runAction(api.patch(`/admin/users/${id}/suspend`),    'Utilisateur suspendu',  fetchUsers);
  const reactivateUser = (id) => runAction(api.patch(`/admin/users/${id}/reactivate`), 'Utilisateur réactivé',  fetchUsers);
  const banUser        = (id) => runAction(api.patch(`/admin/users/${id}/ban`),        'Utilisateur banni',     fetchUsers);
  const deleteUser     = (id) => {
    if (!window.confirm('Supprimer définitivement cet utilisateur ?')) return;
    runAction(api.delete(`/admin/users/${id}`), 'Utilisateur supprimé', fetchUsers);
  };
  const cancelRide = (id) => runAction(api.patch(`/admin/rides/${id}/cancel`), 'Trajet annulé', fetchRides);
  const deleteRide = (id) => {
    if (!window.confirm('Supprimer définitivement ce trajet (et ses réservations) ?')) return;
    runAction(api.delete(`/admin/rides/${id}`), 'Trajet supprimé', fetchRides);
  };

  const updateReportStatus = (id, status) => {
    runAction(api.patch(`/admin/reports/${id}/status`, { status }), 'Signalement mis à jour', fetchReports);
  };

  const addReportNote = (report) => {
    const adminNote = window.prompt('Note administrative :', report.adminNote || '');
    if (adminNote === null) return; // annulé
    runAction(
      api.patch(`/admin/reports/${report.id}/status`, { status: report.status, adminNote }),
      'Note enregistrée',
      fetchReports
    );
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-primary-400" size={28} />
        <h1 className="text-2xl font-black text-white">Dashboard Admin</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}    label="Utilisateurs"  value={stats?.totalUsers}    color="bg-blue-600" />
        <StatCard icon={Car}      label="Conducteurs"   value={stats?.totalDrivers}  color="bg-teal-600" />
        <StatCard icon={Car}      label="Trajets"       value={stats?.totalRides}    color="bg-green-600" />
        <StatCard icon={BookOpen} label="Réservations"  value={stats?.totalBookings} color="bg-yellow-600" />
        <StatCard icon={Flag}     label="Signalements"  value={stats?.totalReports}  color="bg-orange-600" />
        <StatCard icon={Ban}      label="Comptes bannis" value={stats?.totalBanned}  color="bg-red-600" />
        <StatCard icon={Star}     label="Avis"          value={stats?.totalReviews}  color="bg-purple-600" />
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-primary-400" />
              <h2 className="text-sm font-semibold text-slate-300">Inscriptions — 6 derniers mois</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.inscriptions} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                <Bar dataKey="count" name="Inscriptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-primary-400" />
              <h2 className="text-sm font-semibold text-slate-300">Statuts réservations</h2>
            </div>
            {charts.reservations.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={charts.reservations} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {charts.reservations.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm text-center mt-12">Aucune réservation</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Flag size={16} className="text-primary-400" />
              <h2 className="text-sm font-semibold text-slate-300">Statuts signalements</h2>
            </div>
            {charts.reports?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={charts.reports} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {charts.reports.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm text-center mt-12">Aucun signalement</p>
            )}
          </div>

          <div className="card lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Car size={16} className="text-primary-400" />
              <h2 className="text-sm font-semibold text-slate-300">Trajets publiés — 6 derniers mois</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={charts.trajets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="count" name="Trajets" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-dark-800 border border-dark-500 rounded-xl p-1 w-fit overflow-x-auto">
        {[['users','Utilisateurs'],['rides','Trajets'],['reports','Signalements'],['logs',"Journal d'audit"]].map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === v ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} placeholder="Nom, email ou téléphone..." className="input pl-9 text-sm w-full" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input text-sm w-auto">
              <option value="">Tous les rôles</option>
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
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
                {users
                  .filter((u) => u.id !== me?.id)
                  .map((u) => {
                    const isAdmin       = u.role === 'admin' || u.role === 'superadmin';
                    const canActOnAdmin = isSuperAdmin;
                    const canAct        = !isAdmin || canActOnAdmin;
                    return (
                      <tr key={u.id} className="border-b border-dark-500/50 last:border-0">
                        <td className="py-3">
                          <button onClick={() => setDetailUserId(u.id)} className="flex items-center gap-2 hover:underline">
                            {u.photo
                              ? <img src={u.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                              : <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-white">{u.firstName?.[0]}</div>
                            }
                            <span className="text-white font-medium">{u.firstName} {u.lastName}</span>
                          </button>
                        </td>
                        <td className="py-3 text-slate-400">{u.email}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            u.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                            u.role === 'admin'      ? 'bg-blue-500/20 text-blue-400' :
                            'bg-dark-600 text-slate-300'
                          }`}>{u.role}</span>
                        </td>
                        <td className="py-3">
                          <BookingStatusBadge status={u.status} />
                        </td>
                        <td className="py-3">
                          {canAct ? (
                            <div className="flex items-center gap-3">
                              {u.status !== 'active' &&
                                <button onClick={() => reactivateUser(u.id)} title="Réactiver" className="text-green-400 hover:text-green-300 transition"><CheckCircle size={15} /></button>
                              }
                              {u.status !== 'suspended' &&
                                <button onClick={() => suspendUser(u.id)} title="Suspendre" className="text-yellow-400 hover:text-yellow-300 transition"><PauseCircle size={15} /></button>
                              }
                              {u.status !== 'blocked' &&
                                <button onClick={() => banUser(u.id)} title="Bannir" className="text-red-400 hover:text-red-300 transition"><Ban size={15} /></button>
                              }
                              <button onClick={() => deleteUser(u.id)} title="Supprimer" className="text-slate-400 hover:text-red-400 transition"><Trash2 size={15} /></button>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs italic">Super admin requis</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Rides tab */}
      {tab === 'rides' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={rideSearch} onChange={(e) => setRideSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchRides()} placeholder="Ville de départ ou d'arrivée..." className="input pl-9 text-sm w-full" />
            </div>
            <select value={rideStatusFilter} onChange={(e) => setRideStatusFilter(e.target.value)} className="input text-sm w-auto">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
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
                      <div className="flex items-center gap-3">
                        {r.status === 'active' && (
                          <button onClick={() => cancelRide(r.id)} className="text-yellow-400 hover:text-yellow-300 transition text-xs font-semibold">Annuler</button>
                        )}
                        <button onClick={() => deleteRide(r.id)} title="Supprimer" className="text-red-400 hover:text-red-300 transition"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select value={reportStatusFilter} onChange={(e) => setReportStatusFilter(e.target.value)} className="input text-sm w-auto">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-dark-500">
                  <th className="pb-3 text-slate-400 font-medium">Signalé par</th>
                  <th className="pb-3 text-slate-400 font-medium">Utilisateur visé</th>
                  <th className="pb-3 text-slate-400 font-medium">Trajet</th>
                  <th className="pb-3 text-slate-400 font-medium">Motif</th>
                  <th className="pb-3 text-slate-400 font-medium">Date</th>
                  <th className="pb-3 text-slate-400 font-medium">Statut</th>
                  <th className="pb-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 && (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-500">Aucun signalement</td></tr>
                )}
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-dark-500/50 last:border-0">
                    <td className="py-3 text-white">{r.reporter?.firstName} {r.reporter?.lastName}</td>
                    <td className="py-3">
                      <button onClick={() => setDetailUserId(r.reportedUser?.id)} className="text-white hover:underline">
                        {r.reportedUser?.firstName} {r.reportedUser?.lastName}
                      </button>
                    </td>
                    <td className="py-3 text-slate-400">
                      {r.ride ? <Link to={`/rides/${r.ride.id}`} className="hover:underline">{r.ride.from} → {r.ride.to}</Link> : '—'}
                    </td>
                    <td className="py-3 text-slate-400">{REPORT_REASON_LABELS[r.reason] || r.reason}</td>
                    <td className="py-3 text-slate-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3"><BookingStatusBadge status={r.status} /></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDetailReportId(r.id)} title="Voir les détails"
                          className="text-slate-400 hover:text-white transition text-xs underline">
                          Détails
                        </button>
                        <select
                          value={r.status}
                          onChange={(e) => updateReportStatus(r.id, e.target.value)}
                          className="input text-xs py-1 w-auto"
                        >
                          <option value="pending">En attente</option>
                          <option value="in_progress">En cours</option>
                          <option value="resolved">Résolu</option>
                          <option value="rejected">Rejeté</option>
                        </select>
                        <button onClick={() => addReportNote(r)} title="Note administrative"
                          className="text-slate-400 hover:text-primary-400 transition text-xs underline">
                          Note
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Audit log tab */}
      {tab === 'logs' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-dark-500">
                <th className="pb-3 text-slate-400 font-medium">Date</th>
                <th className="pb-3 text-slate-400 font-medium">Admin</th>
                <th className="pb-3 text-slate-400 font-medium">Action</th>
                <th className="pb-3 text-slate-400 font-medium">Cible</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500">Aucune action enregistrée</td></tr>
              )}
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-dark-500/50 last:border-0">
                  <td className="py-3 text-slate-400">{new Date(l.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="py-3 text-white">{l.admin?.firstName} {l.admin?.lastName}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-dark-600 text-slate-300">{l.action}</span>
                  </td>
                  <td className="py-3 text-slate-400">{l.targetType}{l.targetId ? ` #${l.targetId.slice(0, 8)}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />
      <ReportDetailModal reportId={detailReportId} onClose={() => setDetailReportId(null)} onViewUser={setDetailUserId} />
    </div>
  );
}
