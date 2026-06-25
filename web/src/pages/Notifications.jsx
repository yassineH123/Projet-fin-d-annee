import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Car, MessageSquare, Star, MapPin, CheckCheck, Clock, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import { SkeletonList } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const TYPE_CONFIG = {
  booking: { icon: Car,           color: '#C1272D', bg: 'rgba(193,39,45,0.10)',  label: 'Réservation' },
  message: { icon: MessageSquare, color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', label: 'Message'     },
  review:  { icon: Star,          color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', label: 'Avis'        },
  ride:    { icon: MapPin,        color: '#006233', bg: 'rgba(0,98,51,0.10)',    label: 'Trajet'      },
  system:  { icon: Bell,          color: '#9C27B0', bg: 'rgba(156,39,176,0.10)', label: 'Système'     },
};

const FILTERS = ['Toutes', 'Non lues', 'Réservations', 'Messages', 'Avis', 'Trajets'];
const FILTER_TYPES = { 'Réservations': 'booking', 'Messages': 'message', 'Avis': 'review', 'Trajets': 'ride' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3], opacity: 0.88 }} />
      ))}
    </div>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread,  setUnread]  = useState(0);
  const [filter,  setFilter]  = useState('Toutes');
  const [marking, setMarking] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/notifications')
      .then(({ data }) => {
        setNotifs(data.notifications || []);
        setUnread(data.unreadCount || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    setMarking(true);
    await api.put('/notifications/read-all').catch(() => {});
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
    setMarking(false);
  };

  const handleClick = async (notif) => {
    if (!notif.read) {
      api.put(`/notifications/${notif.id}/read`).catch(() => {});
      setNotifs(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x));
      setUnread(u => Math.max(0, u - 1));
    }
    if (notif.link) navigate(notif.link);
  };

  const filtered = notifs.filter(n => {
    if (filter === 'Non lues')   return !n.read;
    if (FILTER_TYPES[filter])    return n.type === FILTER_TYPES[filter];
    return true;
  });

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 16 }}>
        <ZelligeStripe />
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(193,39,45,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(193,39,45,0.2)' }}>
              <Bell size={20} style={{ color: '#C1272D' }} />
              {unread > 0 && (
                <div style={{
                  position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9,
                  background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 900, color: '#fff', border: '2px solid var(--card-bg)',
                  padding: '0 4px', animation: 'orbPulse 2s ease-in-out infinite',
                }}>
                  {unread > 9 ? '9+' : unread}
                </div>
              )}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
              <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Notifications</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {unread > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-700)', padding: '3px 9px', borderRadius: 8 }}>
                {unread} non lue{unread > 1 ? 's' : ''}
              </span>
            )}
            {unread > 0 && (
              <button onClick={markAllRead} disabled={marking} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10,
                border: '1px solid rgba(193,39,45,0.25)', background: 'rgba(193,39,45,0.07)',
                color: '#C1272D', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.07)'; }}
              >
                <CheckCheck size={13} /> {marking ? '...' : 'Tout lire'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const active = filter === f;
          const count  = f === 'Non lues' ? unread : f === 'Toutes' ? notifs.length : notifs.filter(n => n.type === FILTER_TYPES[f]).length;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', border: '1.5px solid', transition: 'all .18s',
              background: active ? 'rgba(193,39,45,0.10)' : 'var(--card-bg)',
              borderColor: active ? '#C1272D' : 'var(--border-color)',
              color: active ? '#C1272D' : 'var(--text-muted)',
              transform: active ? 'scale(1.03)' : 'scale(1)',
              boxShadow: active ? '0 2px 8px rgba(193,39,45,0.2)' : 'none',
            }}>
              {f}{count > 0 && ` (${count})`}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        filter === 'Non lues' ? (
          <EmptyState
            icon={<CheckCheck size={26} style={{ color: '#22C55E' }} />}
            title="Tout est lu ✓"
            description="Vous êtes à jour ! Aucune notification en attente."
            color="#22C55E"
          />
        ) : (
          <EmptyState
            icon={<Bell size={26} style={{ color: '#C1272D' }} />}
            title="Aucune notification"
            description="Les notifications apparaîtront ici au fil de votre activité."
            color="#C1272D"
          />
        )
      ) : (
        <div className="card-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(notif => {
            const cfg  = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div key={notif.id}
                onClick={() => handleClick(notif)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px', borderRadius: 14, cursor: notif.link ? 'pointer' : 'default',
                  background: notif.read ? 'var(--card-bg)' : `linear-gradient(135deg, ${cfg.bg}, var(--card-bg))`,
                  border: '1px solid var(--border-color)',
                  borderLeft: `3px solid ${notif.read ? 'var(--border-color)' : cfg.color}`,
                  transition: 'transform .18s, box-shadow .18s, background .18s',
                }}
                onMouseEnter={e => { if (notif.link) { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = `0 4px 18px ${cfg.color}20`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                  border: `1px solid ${cfg.color}25`,
                }}>
                  <Icon size={17} style={{ color: cfg.color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: notif.read ? 600 : 800, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${cfg.color}70` }} />
                    )}
                  </div>
                  {notif.message && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {notif.message}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={10} /> {timeAgo(notif.createdAt)}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: cfg.bg, color: cfg.color, marginLeft: 4 }}>
                        {cfg.label}
                      </span>
                    </span>
                    {notif.link && (
                      <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
