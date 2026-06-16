import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FriendButton({ userId, size = 'md' }) {
  const { user } = useAuth();
  const [status,   setStatus]   = useState(null);
  const [friendId, setFriendId] = useState(null);
  const [isMine,   setIsMine]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(false);

  useEffect(() => {
    if (!user || !userId || userId === user.id) { setLoading(false); return; }
    api.get(`/friends/status/${userId}`)
      .then(({ data }) => { setStatus(data.status); setFriendId(data.id); setIsMine(data.isMine ?? false); })
      .catch(() => setStatus('none'))
      .finally(() => setLoading(false));
  }, [userId, user]);

  if (!user || !userId || userId === user.id || loading) return null;

  const sm = size === 'sm';

  const btn = (onClick, icon, label, style) => (
    <button onClick={onClick} disabled={acting}
      className={`flex items-center gap-1.5 rounded-xl font-bold transition-all disabled:opacity-60 ${sm ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'}`}
      style={style}>
      {icon} {label}
    </button>
  );

  const act = async (fn) => { setActing(true); try { await fn(); } finally { setActing(false); } };

  if (status === 'accepted') return btn(
    () => act(async () => { await api.delete(`/friends/${userId}/remove`); setStatus('none'); setFriendId(null); toast.success('Ami retiré'); }),
    <UserCheck size={sm ? 13 : 15} />, 'Amis',
    { background: 'rgba(0,98,51,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
  );

  if (status === 'pending' && !isMine) return btn(
    () => act(async () => { await api.put(`/friends/${friendId}/accept`); setStatus('accepted'); toast.success("Ami ajouté !"); }),
    <UserCheck size={sm ? 13 : 15} />, 'Accepter',
    { background: 'rgba(0,98,51,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
  );

  if (status === 'pending' && isMine) return btn(
    null, <Clock size={sm ? 13 : 15} />, 'Demande envoyée',
    { background: 'var(--bg-700)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'default' }
  );

  return btn(
    () => act(async () => {
      const { data } = await api.post('/friends/request', { receiverId: userId });
      setStatus('pending'); setFriendId(data.friendship.id); setIsMine(true);
      toast.success('Demande envoyée !');
    }),
    <UserPlus size={sm ? 13 : 15} />, 'Ajouter en ami',
    { background: 'rgba(193,39,45,0.1)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.3)' }
  );
}