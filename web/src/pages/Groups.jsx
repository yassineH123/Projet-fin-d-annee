import { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Lock, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Groups() {
  const { user } = useAuth();
  const [groups,  setGroups]  = useState([]);
  const [myIds,   setMyIds]   = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', from: '', to: '', isPrivate: false });

  const load = async () => {
    try {
      const [all, mine] = await Promise.all([
        api.get('/groups').then(r => r.data.groups || []),
        user ? api.get('/groups/me').then(r => r.data.groups || []) : Promise.resolve([]),
      ]);
      setGroups(all);
      setMyIds(new Set(mine.map(g => g.id)));
    } catch { setGroups([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Nom requis'); return; }
    setCreating(true);
    try {
      await api.post('/groups', form);
      toast.success('Groupe créé !');
      setForm({ name: '', description: '', from: '', to: '', isPrivate: false });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setCreating(false); }
  };

  const handleJoin = async (id) => {
    try {
      if (myIds.has(id)) {
        await api.post(`/groups/${id}/leave`);
        setMyIds(s => { const n = new Set(s); n.delete(id); return n; });
        toast.success('Groupe quitté');
      } else {
        await api.post(`/groups/${id}/join`);
        setMyIds(s => new Set([...s, id]));
        toast.success('Groupe rejoint !');
      }
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Users size={22} className="text-blue-400" />
        <h1 className="text-2xl font-black text-white">Groupes de covoiturage</h1>
      </div>

      {/* Create form */}
      {user && (
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Plus size={15} className="text-green-400" /> Créer un groupe</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" placeholder="Nom du groupe (ex: Casablanca → Rabat quotidien)" required />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                className="input" placeholder="Ville de départ" />
              <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                className="input" placeholder="Ville d'arrivée" />
            </div>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input resize-none text-sm" rows={2} placeholder="Description (optionnel)" />
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.isPrivate} onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))}
                className="accent-primary-500" />
              <Lock size={13} /> Groupe privé (sur invitation)
            </label>
            <button type="submit" disabled={creating} className="btn-primary h-11">{creating ? 'Création...' : 'Créer le groupe'}</button>
          </form>
        </div>
      )}

      {/* Groups list */}
      {loading ? <Spinner /> : groups.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Aucun groupe pour l'instant</p>
          <p className="text-slate-500 text-sm mt-1">Créez le premier groupe de votre trajet !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map(g => (
            <div key={g.id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white truncate">{g.name}</p>
                    {g.isPrivate && <Lock size={11} className="text-slate-500 shrink-0" />}
                  </div>
                  {(g.from && g.to) && (
                    <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={10} /> {g.from} → {g.to}
                    </p>
                  )}
                  {g.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{g.description}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Users size={11} /> {g.memberCount} membre{g.memberCount > 1 ? 's' : ''}
                </span>
                {user && (
                  <button onClick={() => handleJoin(g.id)}
                    className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: myIds.has(g.id) ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                      color: myIds.has(g.id) ? '#F87171' : '#60A5FA',
                    }}>
                    {myIds.has(g.id) ? <><LogOut size={12} /> Quitter</> : <><LogIn size={12} /> Rejoindre</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
