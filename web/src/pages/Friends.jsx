import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, MessageSquare, Star, Car, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const STATUS_COLORS = { available: '#22C55E', busy: '#D4890A', offline: '#6B7280' };
const STATUS_LABELS = { available: 'Disponible', busy: 'Occupé', offline: 'Hors ligne' };

function Avatar({ user, size = 10 }) {
  const s = `w-${size} h-${size}`;
  return user.photo
    ? <img src={user.photo} alt="" className={`${s} rounded-full object-cover flex-shrink-0`} />
    : <div className={`${s} rounded-full flex items-center justify-center text-white font-black flex-shrink-0`}
        style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)', fontSize: size < 10 ? 12 : 16 }}>
        {user.firstName?.[0]}
      </div>;
}

function FriendCard({ friend, onRemove }) {
  const dot = STATUS_COLORS[friend.availabilityStatus] || '#6B7280';
  return (
    <div className="card flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <Avatar user={friend} size={12} />
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
          style={{ background: dot, borderColor: 'var(--card-bg)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white truncate">{friend.firstName} {friend.lastName}</p>
        <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: dot }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: dot }} />
          {STATUS_LABELS[friend.availabilityStatus] || 'Hors ligne'}
          {friend.isDriver && <span className="ml-2 text-slate-500 flex items-center gap-1"><Car size={11} /> Conducteur</span>}
        </p>
        {friend.avgRating > 0 && (
          <p className="text-xs text-yellow-400 flex items-center gap-1 mt-0.5">
            <Star size={10} fill="currentColor" /> {friend.avgRating.toFixed(1)} · {friend.totalTrips} trajet{friend.totalTrips !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Link to={`/messages?with=${friend.id}&name=${encodeURIComponent(friend.firstName + ' ' + friend.lastName)}&photo=${encodeURIComponent(friend.photo || '')}`}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)' }}
          title="Envoyer un message">
          <MessageSquare size={16} />
        </Link>
        <Link to={`/profile/${friend.id}`}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          title="Voir le profil">
          <Users size={16} />
        </Link>
        <button onClick={() => onRemove(friend.id)}
          className="p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.08)'; e.currentTarget.style.color = '#C1272D'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Retirer de mes amis">
          <UserX size={16} />
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

  const TABS = [
    { id: 'friends',  label: `Mes amis (${friends.length})` },
    { id: 'requests', label: `Demandes (${requests.length})`, badge: requests.length },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        <Users size={24} style={{ color: '#C1272D' }} /> Amis & Réseau
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-700)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all relative"
            style={{
              background: tab === t.id ? 'var(--card-bg)' : 'transparent',
              color: tab === t.id ? '#C1272D' : 'var(--text-muted)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            {t.label}
            {t.badge > 0 && tab !== t.id && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : (
        <>
          {/* Friends tab */}
          {tab === 'friends' && (
            <div>
              {friends.length > 0 && (
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un ami…" className="input pl-9 text-sm" />
                </div>
              )}
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Users size={40} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">
                    {friends.length === 0 ? 'Aucun ami pour le moment' : 'Aucun résultat'}
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Visitez des profils de conducteurs ou passagers pour les ajouter
                  </p>
                  <Link to="/rides/search" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm px-5 py-2.5">
                    Trouver des trajets
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filtered.map(f => <FriendCard key={f.id} friend={f} onRemove={remove} />)}
                </div>
              )}
            </div>
          )}

          {/* Requests tab */}
          {tab === 'requests' && (
            <div>
              {requests.length === 0 ? (
                <div className="text-center py-16">
                  <UserCheck size={40} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Aucune demande en attente</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {requests.map(req => (
                    <div key={req.id} className="card flex items-center gap-4">
                      <Link to={`/profile/${req.requester.id}`}>
                        <Avatar user={req.requester} size={12} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${req.requester.id}`}
                          className="font-bold text-white hover:text-primary-400 transition-colors">
                          {req.requester.firstName} {req.requester.lastName}
                        </Link>
                        {req.requester.avgRating > 0 && (
                          <p className="text-xs text-yellow-400 flex items-center gap-1 mt-0.5">
                            <Star size={10} fill="currentColor" /> {req.requester.avgRating.toFixed(1)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => accept(req.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                          style={{ background: 'rgba(0,98,51,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                          <UserCheck size={15} /> Accepter
                        </button>
                        <button onClick={() => refuse(req.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                          style={{ background: 'var(--bg-700)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#C1272D'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                          <UserX size={15} /> Refuser
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