import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function PublishRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: '', to: '', departureDate: '', price: '', seats: 1, description: '', instantBooking: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/rides', form);
      toast.success('Trajet publié !');
      navigate('/rides/mine');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Publier un trajet</h1>
      <p className="text-slate-400 mb-8">Partagez votre trajet et réduisez vos frais</p>

      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5"><MapPin size={14} className="text-primary-400" /> Ville de départ</label>
              <input value={form.from} onChange={set('from')} placeholder="ex: Casablanca" className="input" required />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5"><MapPin size={14} className="text-green-400" /> Ville d'arrivée</label>
              <input value={form.to} onChange={set('to')} placeholder="ex: Rabat" className="input" required />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5"><Calendar size={14} className="text-primary-400" /> Date et heure de départ</label>
            <input type="datetime-local" value={form.departureDate} onChange={set('departureDate')} min={minDate} className="input text-slate-300" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5"><DollarSign size={14} className="text-primary-400" /> Prix par place (MAD)</label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0" className="input" min="0" step="0.5" required />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5"><Users size={14} className="text-primary-400" /> Nombre de places</label>
              <select value={form.seats} onChange={set('seats')} className="input">
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Description (optionnelle)</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Infos utiles pour les passagers (point de rendez-vous, bagages...)" className="input resize-none" rows={3} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-4 bg-dark-700 rounded-xl border border-dark-500 hover:border-primary-500/50 transition">
            <div className={`w-12 h-6 rounded-full transition-colors ${form.instantBooking ? 'bg-primary-500' : 'bg-dark-500'} relative`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.instantBooking ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-white font-medium flex items-center gap-1.5"><Zap size={15} className="text-yellow-400" /> Réservation instantanée</p>
              <p className="text-slate-400 text-xs">Les passagers peuvent réserver sans votre confirmation</p>
            </div>
            <input type="checkbox" checked={form.instantBooking} onChange={set('instantBooking')} className="sr-only" />
          </label>

          <button type="submit" disabled={loading} className="btn-primary h-12">
            {loading ? 'Publication...' : 'Publier le trajet'}
          </button>
        </form>
      </div>
    </div>
  );
}
