import { useEffect, useState } from 'react';
import { Users, Car, BookOpen, Star, Search, Shield, Ban, Trash2, CheckCircle, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';
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

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'superadmin';
  const [tab,    setTab]    = useState('users');
  const [stats,  setStats]  = useState(null);
  const [charts, setCharts] = useState(null);
  const [users,  setUsers]  = useState([]);
  const [rides,  setRides]  = useState([]);
  const [search, setSearch] = useState('');
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

  const fetchUsers = () => api.get('/admin/users', { params: { search } }).then(({ data }) => setUsers(data.users));
  const fetchRides = () => api.get('/admin/rides').then(({ data }) => setRides(data.rides));

  useEffect(() => { if (tab === 'rides') fetchRides(); }, [tab]);

  const blockUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      toast.success('Utilisateur bloqué');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };
  const unblockUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/unblock`);
      toast.success('Utilisateur débloqué');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };
  const cancelRide = async (id) => {
    try {
      await api.patch(`/admin/rides/${id}/cancel`);
      toast.success('Trajet annulé');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
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
        <StatCard icon={Users}    label="Utilisateurs" value={stats?.totalUsers}    color="bg-blue-600" />
        <StatCard icon={Car}      label="Trajets"       value={stats?.totalRides}    color="bg-green-600" />
        <StatCard icon={BookOpen} label="Réservations"  value={stats?.totalBookings} color="bg-yellow-600" />
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
      <div className="flex gap-2 mb-6 bg-dark-800 border border-dark-500 rounded-xl p-1 w-fit">
        {[['users','Utilisateurs'],['rides','Trajets']].map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === v ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Users tab */}
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
                {users
                  .filter((u) => u.id !== me?.id)
                  .map((u) => {
                    const isAdmin       = u.role === 'admin' || u.role === 'superadmin';
                    const canActOnAdmin = isSuperAdmin;
                    const canAct        = !isAdmin || canActOnAdmin;
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
                        <td className="py-3">
                          <BookingStatusBadge status={u.status} />
                        </td>
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
                  })
                }
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Rides tab */}
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
    </div>
  );
}
