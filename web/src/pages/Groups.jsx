import { useState, useEffect } from 'react';
import { Users, Plus, MapPin, Lock, LogIn, LogOut, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function Groups() {
  const { user } = useAuth();
  const [groups,   setGroups]   = useState([]);
  const [myIds,    setMyIds]    = useState(new Set());
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ name: '', description: '', from: '', to: '', isPrivate: false });

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
      setShowForm(false);
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
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} style={{ color: '#3B82F6' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B82F6' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Groupes</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{groups.length} groupe{groups.length !== 1 ? 's' : ''} de covoiturage actifs</p>
            </div>
            {user && (
              <button onClick={() => setShowForm(s => !s)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12,
                background: showForm ? 'var(--bg-700)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                border: showForm ? '1px solid var(--border-color)' : 'none',
                color: showForm ? 'var(--text-muted)' : '#fff',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: showForm ? 'none' : '0 4px 14px rgba(59,130,246,0.3)',
              }}>
                {showForm ? <X size={15} /> : <Plus size={15} />}
                {showForm ? 'Annuler' : 'Créer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Create form */}
      {user && showForm && (
        <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', animation: 'esEnter 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
          <ZelligeStripe />
          <div style={{ padding: '20px 22px' }}>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={14} style={{ color: '#3B82F6' }} /> Créer un groupe
            </p>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input" placeholder="Nom du groupe (ex: Casa → Rabat quotidien)" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                  className="input" placeholder="Ville de départ" />
                <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                  className="input" placeholder="Ville d'arrivée" />
              </div>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input" style={{ resize: 'none', fontSize: 14 }} rows={2} placeholder="Description (optionnel)" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 10, background: form.isPrivate ? 'rgba(193,39,45,0.06)' : 'var(--bg-700)', border: '1px solid', borderColor: form.isPrivate ? '#C1272D30' : 'var(--border-color)', transition: 'all 0.15s' }}>
                <input type="checkbox" checked={form.isPrivate} onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))} style={{ accentColor: '#C1272D' }} />
                <Lock size={13} style={{ color: form.isPrivate ? '#C1272D' : 'var(--text-muted)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: form.isPrivate ? '#C1272D' : 'var(--text-muted)' }}>Groupe privé (sur invitation)</span>
              </label>
              <button type="submit" disabled={creating} style={{
                height: 46, borderRadius: 12, border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                background: creating ? 'var(--bg-700)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                color: creating ? 'var(--text-muted)' : '#fff', fontWeight: 900, fontSize: 14,
                boxShadow: creating ? 'none' : '0 4px 14px rgba(59,130,246,0.3)',
              }}>{creating ? 'Création...' : 'Créer le groupe'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Groups list */}
      {loading ? <Spinner /> : groups.length === 0 ? (
        <EmptyState
          icon={<Users size={26} style={{ color: '#3B82F6' }} />}
          title="Aucun groupe pour l'instant"
          description="Créez le premier groupe de covoiturage et invitez vos collègues de trajet !"
          actionLabel="Créer un groupe"
          onAction={() => setShowForm(true)}
          color="#3B82F6"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {groups.map(g => {
            const isMine = myIds.has(g.id);
            return (
              <div key={g.id} style={{
                borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)',
                border: `1px solid ${isMine ? '#3B82F640' : 'var(--border-color)'}`,
                display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F660'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isMine ? '#3B82F640' : 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Top accent bar */}
                <div style={{ height: 3, background: isMine ? 'linear-gradient(90deg, #3B82F6, #60A5FA)' : 'var(--border-color)' }} />

                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Name + privacy */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                      {(g.from && g.to) && (
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={10} /> {g.from} → {g.to}
                        </p>
                      )}
                    </div>
                    {g.isPrivate && (
                      <div style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 6, background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={10} style={{ color: '#C1272D' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#C1272D' }}>Privé</span>
                      </div>
                    )}
                  </div>

                  {g.description && (
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.description}</p>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={11} style={{ color: '#3B82F6' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {g.memberCount} membre{g.memberCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    {user && (
                      <button onClick={() => handleJoin(g.id)} style={{
                        fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5,
                        padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: isMine ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                        color: isMine ? '#F87171' : '#60A5FA',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isMine ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isMine ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'; }}>
                        {isMine ? <><LogOut size={12} /> Quitter</> : <><LogIn size={12} /> Rejoindre</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes esEnter { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
