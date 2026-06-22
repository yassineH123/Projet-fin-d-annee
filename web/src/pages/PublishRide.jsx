import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Zap, RefreshCw, Car, Bike, Bus, Truck, AlertCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { suggestPrice } from '../utils/geocode';

const TRANSPORT_MODES = [
  { id: 'voiture',  label: 'Voiture',  Icon: Car,   desc: 'Berline, SUV, citadine…'   },
  { id: 'moto',     label: 'Moto',     Icon: Bike,  desc: 'Moto ou scooter'            },
  { id: 'minibus',  label: 'Minibus',  Icon: Bus,   desc: 'Van, minibus jusqu\'à 9 places' },
  { id: 'van',      label: 'Van',      Icon: Truck, desc: 'Grand van ou bus privé'     },
];

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
    transportMode: 'voiture', womenOnly: false,
  });
  const [loading, setLoading] = useState(false);
  const [fErr, setFErr]       = useState({});

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    if (fErr[k]) setFErr((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.from.trim()) e.from = 'Ville de départ requise';
    if (!form.to.trim())   e.to   = "Ville d'arrivée requise";
    if (form.from.trim() && form.to.trim() && form.from.trim().toLowerCase() === form.to.trim().toLowerCase())
      e.to = 'Doit être différente du départ';
    if (!form.departureDate) e.departureDate = 'Date requise';
    else if (new Date(form.departureDate) < new Date()) e.departureDate = 'La date doit être dans le futur';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Prix invalide';
    setFErr(e);
    return Object.keys(e).length === 0;
  };

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
    if (!validate()) return;
    if (form.isRecurring && form.recurringDays.length === 0) {
      toast.error('Sélectionnez au moins un jour pour le trajet récurrent.');
      return;
    }
    setLoading(true);
    try {
      const dist = suggestPrice(form.from.trim(), form.to.trim());
      const { data } = await api.post('/rides', { ...form, distanceKm: dist?.km });
      toast.success(
        data.recurringCount > 0
          ? `Trajet publié + ${data.recurringCount} trajets récurrents créés !`
          : 'Trajet publié !'
      );
      navigate('/rides/mine');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur publication');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().slice(0, 16);
  // Prix conseillé selon la distance entre les deux villes (si reconnues)
  const suggestion = suggestPrice(form.from.trim(), form.to.trim());

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Publier un trajet</h1>
      <p className="text-slate-400 mb-8">Partagez votre trajet et réduisez vos frais</p>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Transport Mode */}
          <div>
            <label className="text-sm text-slate-400 mb-3 block font-semibold">Moyen de transport</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRANSPORT_MODES.map(({ id, label, Icon, desc }) => {
                const active = form.transportMode === id;
                return (
                  <button key={id} type="button" onClick={() => setForm(f => ({ ...f, transportMode: id }))}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center"
                    style={{
                      borderColor: active ? '#C1272D' : 'var(--border-color)',
                      background:  active ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)',
                      transform:   active ? 'scale(1.04)' : 'scale(1)',
                      boxShadow:   active ? '0 0 0 3px rgba(193,39,45,0.15)' : 'none',
                    }}>
                    <Icon size={26} style={{ color: active ? '#C1272D' : 'var(--text-secondary)' }} />
                    <span className="font-black text-sm" style={{ color: active ? '#C1272D' : 'var(--text-base)' }}>{label}</span>
                    <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-400" /> Ville de départ
              </label>
              <input value={form.from} onChange={set('from')} placeholder="ex: Casablanca"
                className={`input ${fErr.from ? 'input-error' : ''}`} list="from-cities" />
              <datalist id="from-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              {fErr.from && <p className="field-error"><AlertCircle size={12} /> {fErr.from}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-green-400" /> Ville d'arrivée
              </label>
              <input value={form.to} onChange={set('to')} placeholder="ex: Rabat"
                className={`input ${fErr.to ? 'input-error' : ''}`} list="to-cities" />
              <datalist id="to-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              {fErr.to && <p className="field-error"><AlertCircle size={12} /> {fErr.to}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary-400" /> Date et heure de départ
            </label>
            <input type="datetime-local" value={form.departureDate} onChange={set('departureDate')}
              min={minDate} className={`input text-slate-300 ${fErr.departureDate ? 'input-error' : ''}`} />
            {fErr.departureDate && <p className="field-error"><AlertCircle size={12} /> {fErr.departureDate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={14} className="text-primary-400" /> Prix par place (MAD)
              </label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0"
                className={`input ${fErr.price ? 'input-error' : ''}`} min="0" step="0.5" />
              {fErr.price && <p className="field-error"><AlertCircle size={12} /> {fErr.price}</p>}
              {suggestion && (
                <button type="button"
                  onClick={() => { setForm(f => ({ ...f, price: String(suggestion.price) })); if (fErr.price) setFErr(p => ({ ...p, price: undefined })); }}
                  title={`~${suggestion.km} km · participation aux frais conseillée`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(0,135,90,0.1)', color: '#00875A', border: '1px solid rgba(0,135,90,0.25)' }}>
                  <Tag size={12} /> Prix conseillé : {suggestion.price} DH
                </button>
              )}
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

          {/* Trajet réservé aux femmes */}
          <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl transition"
            style={{ background: 'var(--bg-700)', border: `1px solid ${form.womenOnly ? 'rgba(236,72,153,0.5)' : 'var(--border-color)'}` }}>
            <div className="w-12 h-6 rounded-full transition-colors relative" style={{ background: form.womenOnly ? '#EC4899' : 'var(--bg-500)' }}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.womenOnly ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-white font-medium flex items-center gap-1.5">
                <Users size={15} style={{ color: '#EC4899' }} /> Réservé aux femmes
              </p>
              <p className="text-slate-400 text-xs">Seules les passagères pourront réserver ce trajet</p>
            </div>
            <input type="checkbox" checked={form.womenOnly} onChange={set('womenOnly')} className="sr-only" />
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
                      className="w-12 h-10 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: active ? 'rgba(59,130,246,0.25)' : 'var(--bg-700)',
                        color: active ? '#60A5FA' : 'var(--text-muted)',
                        border: `1.5px solid ${active ? '#3B82F6' : 'var(--border-color)'}`,
                      }}>
                      {short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary h-12">
            {loading ? 'Publication…' : 'Publier le trajet'}
          </button>
        </form>
      </div>
    </div>
  );
}
