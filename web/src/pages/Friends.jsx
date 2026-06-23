import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, MessageSquare, Star, Car, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const STATUS_COLORS = { available: '#22C55E', busy: '#D4890A', offline: '#6B7280' };
const STATUS_LABELS = { available: 'En ligne',  busy: 'Occupé',   offline: 'Hors ligne' };

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function Avatar({ user, size = 48 }) {
  if (user?.photo) return <img src={user.photo} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: size * 0.38, flexShrink: 0 }}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  );
}

function FriendCard({ friend, onRemove }) {
  const dot   = STATUS_COLORS[friend.availabilityStatus] || '#6B7280';
  const label = STATUS_LABELS[friend.availabilityStatus] || 'Hors ligne';
  const isOnline = friend.availabilityStatus === 'available';

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)',
      borderLeft: `3px solid ${dot}`,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.15)`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>

      {/* Avatar + statut */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar user={friend} size={52} />
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: 13, height: 13, borderRadius: '50%',
          background: dot, border: '2.5px solid var(--card-bg)',
          boxShadow: isOnline ? `0 0 6px ${dot}80` : 'none',
        }} />
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {friend.firstName} {friend.lastName}
          </p>
          {friend.isDriver && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(193,39,45,0.1)', color: '#C1272D', flexShrink: 0 }}>
              <Car size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />Conducteur
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: dot, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
            {label}
          </span>
          {friend.avgRating > 0 && (
            <span style={{ fontSize: 11, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
              <Star size={10} fill="currentColor" /> {friend.avgRating.toFixed(1)}
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>· {friend.totalTrips} trajet{friend.totalTrips !== 1 ? 's' : ''}</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Link
          to={`/messages?with=${friend.id}&name=${encodeURIComponent(friend.firstName + ' ' + friend.lastName)}&photo=${encodeURIComponent(friend.photo || '')}`}
          title="Envoyer un message"
          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(193,39,45,0.08)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)', textDecoration: 'none', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.08)'; }}>
          <MessageSquare size={15} />
        </Link>
        <Link
          to={`/profile/${friend.id}`}
          title="Voir le profil"
          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <Users size={15} />
        </Link>
        <button
          onClick={() => onRemove(friend.id)}
          title="Retirer de mes amis"
          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
          <UserX size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Friends() {
  const [tab,      setTab]      = useState('friends');
  const [friends,  setFriends]  = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/friends').then(({ data }) => setFriends(data.friends || [])),
      api.get('/friends/requests').then(({ data }) => setRequests(data.requests || [])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    await api.put(`/friends/${id}/accept`);
    toast.success('Ami ajouté !');
    load();
  };

  const refuse = async (id) => {
    await api.put(`/friends/${id}/refuse`);
    load();
  };

  const remove = async (friendId) => {
    await api.delete(`/friends/${friendId}/remove`);
    toast.success('Ami retiré');
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const filtered = friends.filter(f =>
    `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const online = friends.filter(f => f.availabilityStatus === 'available').length;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg, rgba(193,39,45,0.04) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} style={{ color: '#C1272D' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
                <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Amis & Réseau</h1>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Votre réseau de covoiturage</p>
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: friends.length, label: 'Amis', color: '#C1272D' },
                { val: online,         label: 'En ligne', color: '#22C55E' },
                { val: requests.length,label: 'Demandes', color: '#D4890A' },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ textAlign: 'center', padding: '7px 10px', borderRadius: 10, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color }}>{val}</p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 5 }}>
        {[
          { id: 'friends',  label: `Mes amis`,   count: friends.length,  color: '#C1272D' },
          { id: 'requests', label: 'Demandes',    count: requests.length, color: '#D4890A' },
        ].map(({ id, label, count, color }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '9px 8px', borderRadius: 10, fontSize: 13, fontWeight: 800,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            background: tab === id ? color : 'transparent',
            color: tab === id ? '#fff' : 'var(--text-muted)',
            boxShadow: tab === id ? `0 4px 12px ${color}35` : 'none',
            transition: 'all 0.15s',
          }}>
            {label}
            {count > 0 && (
              <span style={{ fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 99, background: tab === id ? 'rgba(255,255,255,0.2)' : 'var(--bg-700)', color: tab === id ? '#fff' : color }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : (
        <>
          {/* ── Onglet Amis ── */}
          {tab === 'friends' && (
            <div>
              {friends.length > 0 && (
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un ami…"
                    className="input" style={{ paddingLeft: 38, fontSize: 14 }} />
                </div>
              )}

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>👥</p>
                  <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {friends.length === 0 ? 'Aucun ami pour le moment' : 'Aucun résultat'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                    Visitez des profils de conducteurs ou passagers<br />pour les ajouter à votre réseau
                  </p>
                  <Link to="/rides/search" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                    borderRadius: 12, background: 'linear-gradient(135deg, #C1272D, #9e1f24)',
                    color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(193,39,45,0.35)',
                  }}>
                    <Car size={14} /> Trouver des trajets
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map(f => <FriendCard key={f.id} friend={f} onRemove={remove} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Onglet Demandes ── */}
          {tab === 'requests' && (
            <div>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>🤝</p>
                  <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Aucune demande en attente</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Les nouvelles demandes d'amis apparaîtront ici</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {requests.map(req => (
                    <div key={req.id} style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', borderLeft: '3px solid #D4890A', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <Link to={`/profile/${req.requester.id}`} style={{ flexShrink: 0 }}>
                        <Avatar user={req.requester} size={52} />
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/profile/${req.requester.id}`} style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.requester.firstName} {req.requester.lastName}
                        </Link>
                        {req.requester.avgRating > 0 && (
                          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                            <Star size={10} fill="currentColor" /> {req.requester.avgRating.toFixed(1)}
                          </span>
                        )}
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Souhaite rejoindre votre réseau</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => accept(req.id)} style={{
                          padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer',
                          background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)',
                          display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
                        }}>
                          <UserCheck size={14} /> Accepter
                        </button>
                        <button onClick={() => refuse(req.id)} style={{
                          width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-color)', cursor: 'pointer',
                          background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                          <UserX size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
