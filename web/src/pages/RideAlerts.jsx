import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan'];

export default function RideAlerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ from: '', to: '', maxPrice: '', date: '' });
  const [adding,  setAdding]  = useState(false);

  const load = () => api.get('/ride-alerts').then(({ data }) => setAlerts(data.alerts)).finally(() => setLoading(false));
  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to) { toast.error('Renseignez les villes'); return; }
    setAdding(true);
    try {
      await api.post('/ride-alerts', { ...form, maxPrice: form.maxPrice || undefined, date: form.date || undefined });
      toast.success('Alerte créée ! Vous serez notifié dès qu\'un trajet correspond.');
      setForm({ from: '', to: '', maxPrice: '', date: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/ride-alerts/${id}`);
    setAlerts(a => a.filter(x => x.id !== id));
    toast.success('Alerte supprimée');
  };

  const handleToggle = async (id) => {
    const { data } = await api.patch(`/ride-alerts/${id}/toggle`);
    setAlerts(a => a.map(x => x.id === id ? data.alert : x));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Bell size={22} className="text-yellow-400" />
        <h1 className="text-2xl font-black text-white">Alertes trajets</h1>
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Plus size={15} className="text-green-400" /> Nouvelle alerte</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Départ</label>
              <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                className="input" placeholder="ex: Casablanca" list="alert-from" required />
              <datalist id="alert-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Arrivée</label>
              <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                className="input" placeholder="ex: Rabat" list="alert-to" required />
              <datalist id="alert-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Prix max (optionnel)</label>
              <input type="number" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                className="input" placeholder="ex: 100 DH" min="0" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date (optionnel)</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="input text-slate-300" />
            </div>
          </div>
          <button type="submit" disabled={adding} className="btn-primary h-11 flex items-center justify-center gap-2">
            <Bell size={15} /> {adding ? 'Création...' : 'Créer l\'alerte'}
          </button>
        </form>
      </div>

      {/* List */}
      {loading ? <Spinner /> : alerts.length === 0 ? (
        <div className="card text-center py-10">
          <Bell size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune alerte configurée</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(a => (
            <div key={a.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MapPin size={16} className="text-primary-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{a.from} → {a.to}</p>
                  <div className="flex gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                    {a.maxPrice && <span>Max {a.maxPrice} DH</span>}
                    {a.date && <span>{new Date(a.date).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => handleToggle(a.id)} className="transition-colors">
                  {a.active
                    ? <ToggleRight size={24} className="text-green-400" />
                    : <ToggleLeft  size={24} className="text-slate-500" />}
                </button>
                <button onClick={() => handleDelete(a.id)} className="text-slate-500 hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
