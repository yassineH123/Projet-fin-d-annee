import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const CATEGORIES = [
  { id: 'concert', label: 'Concert 🎵' }, { id: 'sport', label: 'Sport ⚽' },
  { id: 'festival', label: 'Festival 🎉' }, { id: 'conference', label: 'Conférence 💼' },
  { id: 'autre', label: 'Autre 📌' },
];
const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès'];

export default function Events() {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ city: '', category: '' });
  const [form, setForm] = useState({ title: '', description: '', city: '', address: '', eventDate: '', category: 'autre' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (filter.city) params.set('city', filter.city);
    if (filter.category) params.set('category', filter.category);
    setLoading(true);
    api.get(`/events?${params}`).then(({ data }) => setEvents(data.events)).finally(() => setLoading(false));
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
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={22} className="text-purple-400" />
          <h1 className="text-2xl font-black text-white">Événements</h1>
        </div>
        {user && (
          <button onClick={() => setShowForm(s => !s)} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Plus size={15} /> Créer
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filter.city} onChange={e => setFilter(f => ({ ...f, city: e.target.value }))} className="input w-auto text-sm">
          <option value="">Toutes les villes</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} className="input w-auto text-sm">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <h2 className="font-bold text-white mb-4">Nouvel événement</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input" placeholder="Titre de l'événement" required />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input" required>
                <option value="">Ville</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="input" placeholder="Adresse (optionnel)" />
            <input type="datetime-local" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
              className="input text-slate-300" required />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input resize-none text-sm" rows={2} placeholder="Description" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 h-11 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)' }}>
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary h-11">
                {saving ? 'Création...' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner /> : events.length === 0 ? (
        <div className="card text-center py-12"><p className="text-slate-500">Aucun événement à venir</p></div>
      ) : (
        <div className="grid gap-4">
          {events.map(ev => (
            <div key={ev.id} className="card flex gap-4">
              {ev.photo && <img src={ev.photo} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">{ev.title}</p>
                    <p className="text-xs text-purple-400 mt-0.5">{CATEGORIES.find(c => c.id === ev.category)?.label}</p>
                  </div>
                  {user && (
                    <button onClick={() => handleAttend(ev.id)}
                      className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                      Participer
                    </button>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><MapPin size={11} /> {ev.city}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(ev.eventDate).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {ev.attendees} participant{ev.attendees !== 1 ? 's' : ''}</span>
                </div>
                {ev.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
