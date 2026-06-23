import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Users, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  { id: 'concert',    label: 'Concert',      emoji: '🎵', color: '#8B5CF6' },
  { id: 'sport',      label: 'Sport',        emoji: '⚽', color: '#10B981' },
  { id: 'festival',   label: 'Festival',     emoji: '🎉', color: '#F59E0B' },
  { id: 'conference', label: 'Conférence',   emoji: '🎤', color: '#3B82F6' },
  { id: 'autre',      label: 'Autre',        emoji: '📌', color: '#6B7280' },
];
const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès'];

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function Events() {
  const { user } = useAuth();
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter,   setFilter]   = useState({ city: '', category: '' });
  const [form,     setForm]     = useState({ title: '', description: '', city: '', address: '', eventDate: '', category: 'autre' });
  const [saving,   setSaving]   = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (filter.city)     params.set('city', filter.city);
    if (filter.category) params.set('category', filter.category);
    setLoading(true);
    api.get(`/events?${params}`).then(({ data }) => setEvents(data.events || [])).catch(() => setEvents([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/events', form);
      toast.success('Événement créé !');
      setShowForm(false);
      setForm({ title: '', description: '', city: '', address: '', eventDate: '', category: 'autre' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleAttend = async (id) => {
    await api.post(`/events/${id}/attend`);
    setEvents(ev => ev.map(e => e.id === id ? { ...e, attendees: e.attendees + 1 } : e));
    toast.success('Participation enregistrée !');
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} style={{ color: '#8B5CF6' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B5CF6' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Événements</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Concerts, festivals, sports & plus au Maroc</p>
            </div>
            {user && (
              <button onClick={() => setShowForm(s => !s)} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12,
                background: showForm ? 'var(--bg-700)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                border: showForm ? '1px solid var(--border-color)' : 'none',
                color: showForm ? 'var(--text-muted)' : '#fff',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: showForm ? 'none' : '0 4px 14px rgba(139,92,246,0.3)',
              }}>
                {showForm ? <X size={15} /> : <Plus size={15} />}
                {showForm ? 'Annuler' : 'Créer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/* Category pills */}
        <button onClick={() => setFilter(f => ({ ...f, category: '' }))} style={{
          padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          border: '1px solid', transition: 'all 0.15s',
          borderColor: !filter.category ? '#8B5CF6' : 'var(--border-color)',
          background: !filter.category ? 'rgba(139,92,246,0.12)' : 'var(--card-bg)',
          color: !filter.category ? '#8B5CF6' : 'var(--text-muted)',
        }}>Tout</button>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setFilter(f => ({ ...f, category: filter.category === c.id ? '' : c.id }))} style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            borderColor: filter.category === c.id ? c.color : 'var(--border-color)',
            background: filter.category === c.id ? `${c.color}18` : 'var(--card-bg)',
            color: filter.category === c.id ? c.color : 'var(--text-muted)',
          }}>{c.emoji} {c.label}</button>
        ))}
        {/* City select */}
        <select value={filter.city} onChange={e => setFilter(f => ({ ...f, city: e.target.value }))}
          className="input" style={{ height: 36, fontSize: 12, padding: '0 12px', borderRadius: 20, width: 'auto' }}>
          <option value="">Toutes les villes</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', animation: 'esEnter 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
          <ZelligeStripe />
          <div style={{ padding: '20px 22px' }}>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-primary)', margin: '0 0 16px' }}>Nouvel événement</p>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input" placeholder="Titre de l'événement" required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input" required>
                  <option value="">Ville</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="input" placeholder="Adresse (optionnel)" />
              <input type="datetime-local" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                className="input" required />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input" style={{ resize: 'none', fontSize: 14 }} rows={2} placeholder="Description" />
              <button type="submit" disabled={saving} style={{
                height: 46, borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                background: saving ? 'var(--bg-700)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                color: saving ? 'var(--text-muted)' : '#fff', fontWeight: 900, fontSize: 14,
                boxShadow: saving ? 'none' : '0 4px 14px rgba(139,92,246,0.3)',
              }}>{saving ? 'Création...' : 'Publier l\'événement'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? <Spinner /> : events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={26} style={{ color: '#8B5CF6' }} />}
          title="Aucun événement à venir"
          description="Créez le premier événement et invitez la communauté à se retrouver !"
          actionLabel="Créer un événement"
          onAction={() => setShowForm(true)}
          color="#8B5CF6"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(ev => {
            const cat = CATEGORIES.find(c => c.id === ev.category) || CATEGORIES[4];
            const evDate = new Date(ev.eventDate);
            return (
              <div key={ev.id} style={{
                borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                display: 'flex', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${cat.color}50`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                {/* Date chip */}
                <div style={{ width: 68, flexShrink: 0, background: `${cat.color}12`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', borderRight: `1px solid ${cat.color}25` }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: cat.color, lineHeight: 1 }}>{evDate.getDate()}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700, color: cat.color, textTransform: 'uppercase' }}>
                    {evDate.toLocaleDateString('fr-FR', { month: 'short' })}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 22 }}>{cat.emoji}</p>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                      <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${cat.color}18`, color: cat.color }}>
                        {cat.label}
                      </span>
                    </div>
                    {user && (
                      <button onClick={() => handleAttend(ev.id)} style={{
                        flexShrink: 0, fontSize: 12, padding: '7px 14px', borderRadius: 10, fontWeight: 800, cursor: 'pointer',
                        border: 'none', background: `${cat.color}18`, color: cat.color, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = cat.color; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${cat.color}18`; e.currentTarget.style.color = cat.color; }}>
                        Participer
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <MapPin size={11} /> {ev.city}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Calendar size={11} /> {evDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Users size={11} /> {ev.attendees} participant{ev.attendees !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {ev.description && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>}
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
