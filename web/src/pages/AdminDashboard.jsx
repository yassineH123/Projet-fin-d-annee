import { useEffect, useState, useRef } from 'react';
import {
  Users, Car, BookOpen, Star, Search, Shield, Ban, Trash2, CheckCircle, Flag,
  Wallet, AlertTriangle, FileCheck, X, ExternalLink, ShieldCheck, ShieldOff,
  Activity, ScrollText, UserCog, UserCheck, ChevronLeft, ChevronRight, Plus, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { useAuth } from '../context/AuthContext';

/* ── Palette marocaine (branding existant) ── */
const RED = '#C1272D', GOLD = '#D4890A', GREEN = '#006233';
const COLORS = [RED, GOLD, GREEN, '#3B82F6', '#8B5CF6'];

const CHART_TOOLTIP = {
  contentStyle: { background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 12 },
  labelStyle: { color: '#CBD5E1' },
};

/* ── Compteur animé (KPI) ── */
function useCountUp(target = 0, duration = 900) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const to = Number(target) || 0;
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function ZelligeStripe({ height = 4 }) {
  return (
    <div style={{ height, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: [RED, GOLD, GREEN][i % 3] }} />
      ))}
    </div>
  );
}

/* ── KPI compact (compteur animé) ── */
function Kpi({ icon: Icon, label, value, accent = RED, suffix = '' }) {
  const display = useCountUp(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 130 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
          {display.toLocaleString('fr-FR')}{suffix}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  );
}

const REPORT_STATUS = {
  pending:     { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', label: 'En attente' },
  in_progress: { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6', label: 'En cours'   },
  resolved:    { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', label: 'Résolu'     },
  rejected:    { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', label: 'Rejeté'     },
};
const REASON_LABELS = {
  conduite_dangereuse: 'Conduite dangereuse', impolitesse: 'Impolitesse', no_show: 'No-show',
  escroquerie: 'Escroquerie', harcelement: 'Harcèlement', arnaque_prix: 'Arnaque prix', autre: 'Autre',
};

/* ── Journal d'audit : métadonnées par action ── */
const ACTION_META = {
  BAN_USER:             { icon: Ban,         color: '#EF4444', verb: 'a banni' },
  SUSPEND_USER:         { icon: UserCog,     color: '#F59E0B', verb: 'a désactivé' },
  REACTIVATE_USER:      { icon: UserCheck,   color: '#10B981', verb: 'a réactivé' },
  CHANGE_USER_ROLE:     { icon: Shield,      color: '#3B82F6', verb: 'a changé le rôle de' },
  DELETE_USER:          { icon: Trash2,      color: '#EF4444', verb: 'a supprimé' },
  CANCEL_RIDE:          { icon: X,           color: '#F59E0B', verb: 'a annulé un trajet' },
  DELETE_RIDE:          { icon: Trash2,      color: '#EF4444', verb: 'a supprimé un trajet' },
  UPDATE_REPORT_STATUS: { icon: Flag,        color: '#3B82F6', verb: 'a traité un signalement' },
  CREATE_ADMIN:         { icon: ShieldCheck, color: '#10B981', verb: 'a créé un admin' },
  DELETE_ADMIN:         { icon: ShieldOff,   color: '#EF4444', verb: 'a supprimé un admin' },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return "à l'instant";
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

/* ── Élément de timeline (journal d'audit) ── */
function TimelineItem({ log, last }) {
  const meta = ACTION_META[log.action] || { icon: Activity, color: '#94A3B8', verb: log.action };
  const Icon = meta.icon;
  const admin = log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : 'Admin';
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
          <Icon size={16} style={{ color: meta.color }} />
        </div>
        {!last && <div style={{ flex: 1, width: 2, background: 'var(--border-color)', marginTop: 2 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 18, flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)' }}>
          <strong style={{ fontWeight: 700 }}>{admin}</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{meta.verb}</span>
          {log.details?.email && <span style={{ color: 'var(--text-secondary)' }}> {log.details.email}</span>}
          {log.details?.role && <span style={{ color: 'var(--text-muted)' }}> → {log.details.role}</span>}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} /> {timeAgo(log.createdAt)}
        </p>
      </div>
    </div>
  );
}

/* ── Contrôles de pagination ── */
function Pager({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 0 2px' }}>
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="adash-pgbtn">
        <ChevronLeft size={16} />
      </button>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page {page} / {pages}</span>
      <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="adash-pgbtn">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const TH = ({ children }) => (
  <th style={{ paddingBottom: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>{children}</th>
);

export default function AdminDashboard() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'superadmin';

  // Onglet initial depuis l'URL (?tab=admins via le lien « Gestion des administrateurs »).
  const [tab, setTab] = useState(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    return ['overview', 'users', 'rides', 'reports', 'kyc', 'logs', 'admins'].includes(t) ? t : 'overview';
  });
  const [loading, setLoading] = useState(true);

  /* données vue d'ensemble (réelles) */
  const [stats, setStats]   = useState(null);
  const [charts, setCharts] = useState(null);
  const [kyc, setKyc]       = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs]     = useState([]);

  /* tables paginées */
  const [users, setUsers]       = useState({ list: [], page: 1, pages: 1 });
  const [rides, setRides]       = useState({ list: [], page: 1, pages: 1 });
  const [reportsTab, setReportsTab] = useState({ list: [], page: 1, pages: 1 });
  const [logsTab, setLogsTab]   = useState({ list: [], page: 1, pages: 1 });
  const [admins, setAdmins]     = useState([]);

  const [search, setSearch] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newAdmin, setNewAdmin] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'admin' });

  /* ── chargement initial : tout en données réelles ── */
  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/charts'),
      api.get('/admin/kyc/pending'),
      api.get('/admin/reports', { params: { status: 'pending' } }),
      api.get('/admin/logs'),
    ]).then(([d, c, k, r, l]) => {
      setStats(d.data.stats);
      setCharts(c.data);
      setKyc(k.data.users || []);
      setReports(r.data.reports || []);
      setLogs(l.data.logs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* ── chargement à la demande par onglet ── */
  const fetchUsers = (page = 1) =>
    api.get('/admin/users', { params: { search, page } })
      .then(({ data }) => setUsers({ list: data.users || [], page: data.page, pages: data.pages }))
      .catch(() => {});
  const fetchRides = (page = 1) =>
    api.get('/admin/rides', { params: { page } })
      .then(({ data }) => setRides({ list: data.rides || [], page: data.page, pages: data.pages }))
      .catch(() => {});
  const fetchReportsTab = (page = 1) =>
    api.get('/admin/reports', { params: { page } })
      .then(({ data }) => setReportsTab({ list: data.reports || [], page: data.page, pages: data.pages }))
      .catch(() => {});
  const fetchLogsTab = (page = 1) =>
    api.get('/admin/logs', { params: { page } })
      .then(({ data }) => setLogsTab({ list: data.logs || [], page: data.page, pages: data.pages }))
      .catch(() => {});
  const fetchKyc = () =>
    api.get('/admin/kyc/pending').then(({ data }) => setKyc(data.users || [])).catch(() => {});
  const fetchAdmins = () =>
    api.get('/superadmin/admins').then(({ data }) => setAdmins(data.admins || [])).catch(() => {});

  useEffect(() => {
    if (tab === 'users')   fetchUsers(1);
    if (tab === 'rides')   fetchRides(1);
    if (tab === 'reports') fetchReportsTab(1);
    if (tab === 'logs')    fetchLogsTab(1);
    if (tab === 'kyc')     fetchKyc();
    if (tab === 'admins')  fetchAdmins();
  }, [tab]); // eslint-disable-line

  /* ── actions (logique métier inchangée) ── */
  const blockUser   = async (id) => { await api.patch(`/admin/users/${id}/ban`);        toast.success('Bloqué');   fetchUsers(users.page); };
  const unblockUser = async (id) => { await api.patch(`/admin/users/${id}/reactivate`); toast.success('Débloqué'); fetchUsers(users.page); };
  const promoteUser = async (id) => { await api.patch(`/admin/users/${id}/role`, { role: 'admin' }); toast.success('Promu administrateur');  fetchUsers(users.page); };
  const demoteUser  = async (id) => { await api.patch(`/admin/users/${id}/role`, { role: 'user'  }); toast.success('Rétrogradé utilisateur'); fetchUsers(users.page); };
  const deleteUser  = (id) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Supprimer cet utilisateur ?</p>
        <p style={{ fontSize: 12, color: '#9CA3AF' }}>Cette action est irréversible.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #374151', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={async () => { toast.dismiss(t.id); await api.delete(`/admin/users/${id}`); toast.success('Supprimé'); fetchUsers(users.page); }}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Supprimer</button>
        </div>
      </div>
    ), { duration: 8000 });
  };
  const cancelRide   = async (id) => { await api.patch(`/admin/rides/${id}/cancel`); toast.success('Annulé'); fetchRides(rides.page); };
  const updateReport = async (id, status) => { await api.patch(`/admin/reports/${id}/status`, { status }); toast.success('Statut mis à jour'); fetchReportsTab(reportsTab.page); };
  const approveKyc   = async (id) => { await api.patch(`/admin/kyc/${id}/approve`); toast.success('Identité approuvée'); fetchKyc(); };
  const rejectKyc    = async (id) => {
    await api.patch(`/admin/kyc/${id}/reject`, { reason: rejectReason });
    toast.success('Identité refusée'); setRejectingId(null); setRejectReason(''); fetchKyc();
  };
  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/superadmin/admins', newAdmin);
      toast.success('Admin créé.');
      setNewAdmin({ firstName: '', lastName: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Échec de la création.'); }
  };
  const deleteAdmin = (id) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontWeight: 700, fontSize: 14 }}>Supprimer ce compte admin ?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => toast.dismiss(t.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #374151', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button onClick={async () => { toast.dismiss(t.id); try { await api.delete(`/superadmin/admins/${id}`); toast.success('Admin supprimé.'); fetchAdmins(); } catch (e) { toast.error(e.response?.data?.message || 'Échec.'); } }}
            style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Supprimer</button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  if (loading) return <Spinner size="lg" />;

  /* données graphiques (réelles) */
  const activite = (charts?.trajets || []).map((t, i) => ({
    month: t.month,
    trajets: t.count,
    inscriptions: charts?.inscriptions?.[i]?.count ?? 0,
  }));
  const reservations = charts?.reservations || [];
  const pendingReports = reports.length;
  const pendingKyc = kyc.length;

  const tabs = [
    ['overview', "Vue d'ensemble", null],
    ['users',    'Utilisateurs',  null],
    ['rides',    'Trajets',       null],
    ['reports',  'Signalements',  pendingReports || null],
    ['kyc',      'Identité',      pendingKyc || null],
    ['logs',     'Journal',       null],
    ...(isSuperAdmin ? [['admins', 'Admins', null]] : []),
  ];

  const sectionTitle = (Icon, label, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Icon size={15} style={{ color }} />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{label}</p>
    </div>
  );

  return (
    <div className="adash">
      <style>{`
        .adash { max-width: 1280px; margin: 0 auto; padding: 24px 16px 64px; }
        .adash-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1024px) { .adash-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .adash-grid { grid-template-columns: 1fr; } }
        .adash-s2 { grid-column: span 2; }
        .adash-s4 { grid-column: 1 / -1; }
        @media (max-width: 640px) { .adash-s2 { grid-column: 1 / -1; } }
        .adash-card {
          background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          transition: transform .18s ease, box-shadow .18s ease; overflow: hidden;
        }
        .adash-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.10); }
        .adash-fade { animation: adashFade .45s ease both; }
        @keyframes adashFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .adash-body { padding: 18px 20px; }
        .adash-pgbtn {
          width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border-color);
          background: var(--card-bg); color: var(--text-secondary); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all .15s ease;
        }
        .adash-pgbtn:hover:not(:disabled) { border-color: ${RED}; color: ${RED}; }
        .adash-pgbtn:disabled { opacity: .4; cursor: not-allowed; }
        .adash-tab { position: relative; padding: 9px 16px 11px; border: none; background: transparent; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-muted); transition: color .15s ease; }
        .adash-tab:hover { color: var(--text-secondary); }
        .adash-tab.active { color: ${RED}; }
      `}</style>

      {/* ── En-tête ── */}
      <div className="adash-card adash-fade" style={{ marginBottom: 20 }}>
        <ZelligeStripe height={5} />
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${RED}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} style={{ color: RED }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: RED }}>✦ AtlasWay</p>
            <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Dashboard Admin</h1>
          </div>
        </div>
      </div>

      {/* ── Onglets (soulignement zellige sur l'actif) ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border-color)', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {tabs.map(([v, label, badge]) => (
          <button key={v} onClick={() => setTab(v)} className={`adash-tab ${tab === v ? 'active' : ''}`}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {label}
              {badge ? (
                <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 99, background: GOLD, color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
              ) : null}
            </span>
            {tab === v && <div style={{ position: 'absolute', left: 8, right: 8, bottom: -1 }}><ZelligeStripe height={3} /></div>}
          </button>
        ))}
      </div>

      {/* ════════════ VUE D'ENSEMBLE ════════════ */}
      {tab === 'overview' && (
        <div className="adash-grid">

          {/* Hero — Vue d'ensemble de la plateforme */}
          <div className="adash-card adash-fade adash-s4">
            <div style={{ height: 3, background: `linear-gradient(90deg, ${RED}, ${GOLD}, ${GREEN})` }} />
            <div className="adash-body">
              <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)' }}>Vue d'ensemble de la plateforme</p>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  <Kpi icon={Users}    label="Utilisateurs" value={stats?.totalUsers}    accent={RED} />
                  <Kpi icon={Car}      label="Conducteurs"  value={stats?.totalDrivers}  accent={GREEN} />
                  <Kpi icon={Activity} label="Trajets"      value={stats?.totalRides}    accent={GOLD} />
                  <Kpi icon={BookOpen} label="Réservations" value={stats?.totalBookings} accent="#3B82F6" />
                  <Kpi icon={Star}     label="Avis"         value={stats?.totalReviews}  accent="#8B5CF6" />
                </div>
                {/* Sparkline résumé */}
                <div style={{ width: 200, height: 56 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activite} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={RED} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={RED} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="trajets" stroke={RED} strokeWidth={2} fill="url(#spark)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Flag size={13} style={{ color: '#F59E0B' }} /> {pendingReports} signalement(s) en attente</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><FileCheck size={13} style={{ color: '#3B82F6' }} /> {pendingKyc} vérification(s) KYC</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ban size={13} style={{ color: '#EF4444' }} /> {stats?.totalBanned ?? 0} compte(s) banni(s)</span>
              </div>
            </div>
          </div>

          {/* Graphe principal — Area (élément visuel dominant) */}
          <div className="adash-card adash-fade adash-s4">
            <div className="adash-body">
              {sectionTitle(Activity, 'Activité de la plateforme — 6 derniers mois', GREEN)}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activite} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTraj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gInsc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GREEN} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v === 'trajets' ? 'Trajets' : 'Inscriptions'}</span>} />
                  <Area type="monotone" dataKey="trajets" stroke={RED} strokeWidth={2.5} fill="url(#gTraj)" />
                  <Area type="monotone" dataKey="inscriptions" stroke={GREEN} strokeWidth={2.5} fill="url(#gInsc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barres — Inscriptions */}
          <div className="adash-card adash-fade adash-s2">
            <div className="adash-body">
              {sectionTitle(Users, 'Inscriptions / 6 mois', '#3B82F6')}
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={charts?.inscriptions || []} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Bar dataKey="count" name="Inscriptions" fill={GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut — Réservations par statut (réel) */}
          <div className="adash-card adash-fade adash-s2">
            <div className="adash-body">
              {sectionTitle(BookOpen, 'Réservations par statut', GOLD)}
              {reservations.length === 0 ? (
                <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Aucune réservation</div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={reservations} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {reservations.map((r, i) => <Cell key={i} fill={r.color || COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>} />
                    <Tooltip {...CHART_TOOLTIP} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Feed — Derniers signalements en attente */}
          <div className="adash-card adash-fade adash-s2">
            <div className="adash-body">
              {sectionTitle(AlertTriangle, 'Signalements en attente', '#EF4444')}
              {reports.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Aucun signalement en attente 🎉</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {reports.slice(0, 4).map((r, i, arr) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Flag size={15} style={{ color: '#EF4444' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.reportedUser?.firstName} {r.reportedUser?.lastName}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{REASON_LABELS[r.reason] || r.reason} · {timeAgo(r.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setTab('reports')} style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: RED, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                    Voir tous les signalements →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline — Journal d'audit récent */}
          <div className="adash-card adash-fade adash-s2">
            <div className="adash-body">
              {sectionTitle(ScrollText, "Journal d'audit récent", '#8B5CF6')}
              {logs.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Aucune action récente</div>
              ) : (
                <div>
                  {logs.slice(0, 5).map((l, i, arr) => <TimelineItem key={l.id} log={l} last={i === arr.length - 1} />)}
                  <button onClick={() => setTab('logs')} style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: RED, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Voir tout le journal →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ UTILISATEURS ════════════ */}
      {tab === 'users' && (
        <div className="adash-fade">
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: 16 }}>
              <Shield size={15} style={{ color: '#A78BFA', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(167,139,250,0.9)' }}>En tant que <strong>Super Admin</strong>, vous pouvez promouvoir/rétrograder des comptes.</p>
            </div>
          )}
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers(1)} placeholder="Rechercher..." className="input" style={{ paddingLeft: 36, fontSize: 13 }} />
          </div>
          <div className="adash-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr><TH>Utilisateur</TH><TH>Email</TH><TH>Rôle</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
              <tbody>
                {users.list.filter(u => u.id !== me?.id).map((u, i, arr) => {
                  const uIsAdmin = ['admin', 'superadmin'].includes(u.role);
                  const canAct = !uIsAdmin || isSuperAdmin;
                  const roleBg = u.role === 'superadmin' ? 'rgba(139,92,246,0.2)' : u.role === 'admin' ? 'rgba(59,130,246,0.2)' : 'var(--bg-700)';
                  const roleColor = u.role === 'superadmin' ? '#A78BFA' : u.role === 'admin' ? '#60A5FA' : 'var(--text-secondary)';
                  return (
                    <tr key={u.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '12px 0 12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {u.photo ? <img src={u.photo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{u.firstName?.[0]}</div>}
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '12px 8px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: roleBg, color: roleColor }}>{u.role}</span></td>
                      <td style={{ padding: '12px 8px' }}><BookingStatusBadge status={u.status} /></td>
                      <td style={{ padding: '12px 8px 12px 0' }}>
                        {canAct ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {u.status === 'active'
                              ? <IconBtn icon={<Ban size={15} />} onClick={() => blockUser(u.id)} color="#FBBF24" title="Bloquer" />
                              : <IconBtn icon={<CheckCircle size={15} />} onClick={() => unblockUser(u.id)} color="#22C55E" title="Débloquer" />}
                            {isSuperAdmin && u.role === 'user'  && <IconBtn icon={<ShieldCheck size={15} />} onClick={() => promoteUser(u.id)} color="#60A5FA" title="Promouvoir admin" />}
                            {isSuperAdmin && u.role === 'admin' && <IconBtn icon={<ShieldOff size={15} />} onClick={() => demoteUser(u.id)} color="#F97316" title="Rétrograder" />}
                            <IconBtn icon={<Trash2 size={15} />} onClick={() => deleteUser(u.id)} color="#EF4444" title="Supprimer" />
                          </div>
                        ) : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Super admin requis</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pager page={users.page} pages={users.pages} onPage={fetchUsers} />
          </div>
        </div>
      )}

      {/* ════════════ TRAJETS ════════════ */}
      {tab === 'rides' && (
        <div className="adash-fade adash-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr><TH>Trajet</TH><TH>Conducteur</TH><TH>Date</TH><TH>Prix</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
            <tbody>
              {rides.list.map((r, i, arr) => (
                <tr key={r.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '12px 0 12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.from} → {r.to}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{r.driver?.firstName} {r.driver?.lastName}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{new Date(r.departureDate).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontWeight: 700 }}>{Number(r.price).toFixed(0)} MAD</td>
                  <td style={{ padding: '12px 8px' }}><BookingStatusBadge status={r.status} /></td>
                  <td style={{ padding: '12px 8px 12px 0' }}>
                    {r.status === 'active' && (
                      <button onClick={() => cancelRide(r.id)} style={{ fontSize: 12, fontWeight: 700, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 8 }}>Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={rides.page} pages={rides.pages} onPage={fetchRides} />
        </div>
      )}

      {/* ════════════ SIGNALEMENTS ════════════ */}
      {tab === 'reports' && (
        <div className="adash-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reportsTab.list.length === 0 ? (
            <div className="adash-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <Flag size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Aucun signalement</p>
            </div>
          ) : reportsTab.list.map(r => {
            const sm = REPORT_STATUS[r.status] || REPORT_STATUS.pending;
            return (
              <div key={r.id} className="adash-card">
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {r.reporter?.photo ? <img src={r.reporter.photo} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reporter?.firstName?.[0]}</div>}
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reporter?.firstName} {r.reporter?.lastName}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>a signalé <span style={{ color: '#F87171' }}>{r.reportedUser?.firstName} {r.reportedUser?.lastName}</span></p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: sm.bg, color: sm.color }}>{sm.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div><p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)' }}>Motif</p><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{REASON_LABELS[r.reason] || r.reason}</p></div>
                    <div><p style={{ margin: '0 0 2px', fontSize: 11, color: 'var(--text-muted)' }}>Date</p><p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p></div>
                  </div>
                  {r.description && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{r.description}"</p>}
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => updateReport(r.id, 'resolved')} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>Marquer résolu</button>
                      <button onClick={() => updateReport(r.id, 'rejected')} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(107,114,128,0.12)', color: '#9CA3AF' }}>Rejeter</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <Pager page={reportsTab.page} pages={reportsTab.pages} onPage={fetchReportsTab} />
        </div>
      )}

      {/* ════════════ IDENTITÉ (KYC) ════════════ */}
      {tab === 'kyc' && (
        <div className="adash-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {kyc.length === 0 ? (
            <div className="adash-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <FileCheck size={36} style={{ color: '#22C55E', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Aucune vérification d'identité en attente</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Toutes les demandes ont été traitées.</p>
            </div>
          ) : kyc.map(u => (
            <div key={u.id} className="adash-card">
              <ZelligeStripe />
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {u.photo ? <img src={u.photo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${RED},${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff' }}>{u.firstName?.[0]}</div>}
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>En attente</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {u.kycSelfie && <a href={u.kycSelfie} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}><ExternalLink size={12} /> Voir le selfie</a>}
                  {u.cinDoc && <a href={u.cinDoc} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}><ExternalLink size={12} /> Voir la CIN</a>}
                </div>
                {rejectingId === u.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Motif du refus (optionnel)..." className="input" style={{ flex: 1, fontSize: 13 }} />
                    <button onClick={() => rejectKyc(u.id)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>Confirmer refus</button>
                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }} style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer', border: 'none', background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }}><X size={14} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => approveKyc(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.12)', color: '#34D399' }}><CheckCircle size={15} /> Approuver</button>
                    <button onClick={() => setRejectingId(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.1)', color: '#F87171' }}><X size={15} /> Refuser</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════ JOURNAL D'AUDIT (timeline) ════════════ */}
      {tab === 'logs' && (
        <div className="adash-fade adash-card">
          <div className="adash-body">
            {sectionTitle(ScrollText, "Journal d'audit", '#8B5CF6')}
            {logsTab.list.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Aucune action enregistrée</div>
            ) : (
              <div>
                {logsTab.list.map((l, i, arr) => <TimelineItem key={l.id} log={l} last={i === arr.length - 1} />)}
                <Pager page={logsTab.page} pages={logsTab.pages} onPage={fetchLogsTab} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ ADMINS (superadmin) ════════════ */}
      {tab === 'admins' && isSuperAdmin && (
        <div className="adash-fade" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div className="adash-card">
            <div className="adash-body">
              {sectionTitle(UserCog, 'Créer un compte administrateur', GREEN)}
              <form onSubmit={createAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, alignItems: 'end' }}>
                <input className="input" placeholder="Prénom" value={newAdmin.firstName} onChange={e => setNewAdmin({ ...newAdmin, firstName: e.target.value })} required style={{ fontSize: 13 }} />
                <input className="input" placeholder="Nom" value={newAdmin.lastName} onChange={e => setNewAdmin({ ...newAdmin, lastName: e.target.value })} required style={{ fontSize: 13 }} />
                <input className="input" type="email" placeholder="Email" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required style={{ fontSize: 13 }} />
                <input className="input" type="password" placeholder="Mot de passe" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required minLength={8} style={{ fontSize: 13 }} />
                <select className="input" value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })} style={{ fontSize: 13 }}>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, padding: '9px 16px' }}>
                  <Plus size={15} /> Créer
                </button>
              </form>
            </div>
          </div>

          <div className="adash-card" style={{ overflowX: 'auto' }}>
            <div className="adash-body" style={{ paddingBottom: 4 }}>{sectionTitle(Shield, 'Comptes administrateurs', '#3B82F6')}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr><TH>Administrateur</TH><TH>Email</TH><TH>Rôle</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
              <tbody>
                {admins.filter(a => a.id !== me?.id).map((a, i, arr) => (
                  <tr key={a.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <td style={{ padding: '12px 0 12px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.firstName} {a.lastName}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{a.email}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: a.role === 'superadmin' ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)', color: a.role === 'superadmin' ? '#A78BFA' : '#60A5FA' }}>{a.role}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}><BookingStatusBadge status={a.status} /></td>
                    <td style={{ padding: '12px 8px 12px 0' }}>
                      {a.role !== 'superadmin'
                        ? <IconBtn icon={<Trash2 size={15} />} onClick={() => deleteAdmin(a.id)} color="#EF4444" title="Supprimer l'admin" />
                        : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Protégé</span>}
                    </td>
                  </tr>
                ))}
                {admins.filter(a => a.id !== me?.id).length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Aucun autre administrateur.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ icon, onClick, color, title }) {
  return (
    <button onClick={onClick} title={title}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color, display: 'flex', padding: 4, transition: 'opacity 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {icon}
    </button>
  );
}
