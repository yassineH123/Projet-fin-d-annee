import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const DAYS = [
  { val: 1, short: 'Lun' },
  { val: 2, short: 'Mar' },
  { val: 3, short: 'Mer' },
  { val: 4, short: 'Jeu' },
  { val: 5, short: 'Ven' },
  { val: 6, short: 'Sam' },
  { val: 0, short: 'Dim' },
];

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune'];

export default function PublishRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: '', to: '', departureDate: '', price: '', seats: 1,
    description: '', instantBooking: false, isRecurring: false, recurringDays: [],
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const toggleDay = (val) => {
    setForm(f => ({
      ...f,
      recurringDays: f.recurringDays.includes(val)
        ? f.recurringDays.filter(d => d !== val)
        : [...f.recurringDays, val],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.isRecurring && form.recurringDays.length === 0) {
      toast.error('Sélectionnez au moins un jour pour le trajet récurrent.');
      return;
    }
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
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-400" /> Ville de départ
              </label>
              <input value={form.from} onChange={set('from')} placeholder="ex: Casablanca"
                className="input" list="from-cities" required />
              <datalist id="from-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-green-400" /> Ville d'arrivée
              </label>
              <input value={form.to} onChange={set('to')} placeholder="ex: Rabat"
                className="input" list="to-cities" required />
              <datalist id="to-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary-400" /> Date et heure de départ
            </label>
            <input type="datetime-local" value={form.departureDate} onChange={set('departureDate')}
              min={minDate} className="input text-slate-300" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={14} className="text-primary-400" /> Prix par place (MAD)
              </label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0"
                className="input" min="0" step="0.5" required />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Users size={14} className="text-primary-400" /> Nombre de places
              </label>
              <select value={form.seats} onChange={set('seats')} className="input">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Description (optionnelle)</label>
            <textarea value={form.description} onChange={set('description')}
              placeholder="Infos utiles pour les passagers (point de rendez-vous, bagages…)"
              className="input resize-none" rows={3} />
          </div>

          {/* Réservation instantanée */}
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-dark-700 rounded-xl border border-dark-500 hover:border-primary-500/50 transition">
            <div className={`w-12 h-6 rounded-full transition-colors ${form.instantBooking ? 'bg-primary-500' : 'bg-dark-500'} relative`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.instantBooking ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-white font-medium flex items-center gap-1.5">
                <Zap size={15} className="text-yellow-400" /> Réservation instantanée
              </p>
              <p className="text-slate-400 text-xs">Les passagers réservent sans confirmation</p>
            </div>
            <input type="checkbox" checked={form.instantBooking} onChange={set('instantBooking')} className="sr-only" />
          </label>

          {/* Trajet récurrent */}
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-dark-700 rounded-xl border border-dark-500 hover:border-primary-500/50 transition">
            <div className={`w-12 h-6 rounded-full transition-colors ${form.isRecurring ? 'bg-blue-500' : 'bg-dark-500'} relative`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isRecurring ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-white font-medium flex items-center gap-1.5">
                <RefreshCw size={15} className="text-blue-400" /> Trajet récurrent
              </p>
              <p className="text-slate-400 text-xs">Ce trajet se répète chaque semaine</p>
            </div>
            <input type="checkbox" checked={form.isRecurring} onChange={set('isRecurring')} className="sr-only" />
          </label>

          {/* Day selector */}
          {form.isRecurring && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-xs font-semibold text-blue-400 mb-3">Jours de la semaine</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(({ val, short }) => {
                  const active = form.recurringDays.includes(val);
                  return (
                    <button key={val} type="button" onClick={() => toggleDay(val)}
                      className="w-12 h-11 rounded-xl text-sm font-bold transition-all hover:scale-105"
                      style={{
                        background: active ? 'rgba(59,130,246,0.3)' : 'var(--bg-700)',
                        color: active ? '#93C5FD' : 'var(--text-secondary)',
                        border: `1.5px solid ${active ? '#3B82F6' : 'var(--border-color)'}`,
                        boxShadow: active ? '0 0 0 2px rgba(59,130,246,0.2)' : 'none',
                      }}>
                      {short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary h-12 flex items-center justify-center gap-2">
            {loading
              ? <><span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5 inline-block" /> Publication en cours…</>
              : 'Publier le trajet'}
          </button>
        </form>
      </div>
    </div>
  );
}
