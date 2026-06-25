import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Calendar, DollarSign, Users, Zap, RefreshCw, Car, Bike, Bus,
  Truck, AlertCircle, Tag, Package, Plus, Trash2, ChevronDown, ChevronUp,
  CreditCard, Banknote,
} from 'lucide-react';
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
  { val: 1, short: 'Lun' }, { val: 2, short: 'Mar' }, { val: 3, short: 'Mer' },
  { val: 4, short: 'Jeu' }, { val: 5, short: 'Ven' }, { val: 6, short: 'Sam' },
  { val: 0, short: 'Dim' },
];

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune','Essaouira','El Jadida','Kenitra','Béni Mellal','Nador'];

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ height: 1, flex: 1, background: 'var(--border-color)' }} />
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {children}
      </span>
      <div style={{ height: 1, flex: 1, background: 'var(--border-color)' }} />
    </div>
  );
}

function Toggle({ checked, onChange, accent = '#C1272D', label, sublabel, icon: Icon }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      padding: '14px 16px', borderRadius: 14, transition: 'border-color .15s',
      background: 'var(--bg-700)', border: `1px solid ${checked ? accent + '55' : 'var(--border-color)'}`,
    }}>
      <div style={{
        width: 44, height: 24, borderRadius: 12, background: checked ? accent : 'var(--bg-500)',
        position: 'relative', flexShrink: 0, transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, width: 18, height: 18, background: '#fff',
          borderRadius: '50%', transition: 'transform .2s',
          transform: checked ? 'translateX(23px)' : 'translateX(3px)',
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={14} style={{ color: accent }} />} {label}
        </p>
        {sublabel && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</p>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
    </label>
  );
}

export default function PublishRide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    from: searchParams.get('from') || '', to: searchParams.get('to') || '', departureDate: '', price: '', seats: 1,
    description: '', instantBooking: false, isRecurring: false, recurringDays: [],
    transportMode: 'voiture', womenOnly: false,
    // Multi-stops
    stops: [],
    // Bagages & colis
    baggageAllowed: true, maxBaggageKg: 10,
    acceptsPackages: false, packagePricePerKg: '',
    // Paiement
    acceptCash: true, acceptOnline: true,
    // Préférences conducteur
    prefMusic: false, prefSilence: false, prefSmoking: false,
    prefPets: false, prefAC: false, prefTalkative: false,
  });
  const [loading, setLoading] = useState(false);
  const [fErr, setFErr]       = useState({});
  const [newStop, setNewStop] = useState('');

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    if (fErr[k]) setFErr(p => ({ ...p, [k]: undefined }));
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
    if (!form.acceptCash && !form.acceptOnline) e.payment = 'Acceptez au moins un mode de paiement';
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

  const addStop = () => {
    const city = newStop.trim();
    if (!city) return;
    if (form.stops.includes(city)) { toast.error('Escale déjà ajoutée'); return; }
    setForm(f => ({ ...f, stops: [...f.stops, city] }));
    setNewStop('');
  };

  const removeStop = (i) => setForm(f => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }));

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

  const minDate  = new Date().toISOString().slice(0, 16);
  const suggestion = suggestPrice(form.from.trim(), form.to.trim());

  const steps = [
    { n: 1, label: 'Transport' },
    { n: 2, label: 'Itinéraire' },
    { n: 3, label: 'Détails' },
    { n: 4, label: 'Options' },
  ];
  const currentStep = form.transportMode && form.from && form.to && form.departureDate && form.price ? 4
    : form.transportMode && form.from && form.to ? 3
    : form.transportMode ? 2 : 1;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        {/* Zellige stripe */}
        <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3], opacity: 0.9 }} />
          ))}
        </div>
        <div style={{ padding: '20px 22px', background: 'linear-gradient(135deg, rgba(193,39,45,0.04) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={22} style={{ color: '#C1272D' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Publier un trajet</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Partagez votre trajet et réduisez vos frais</p>
            </div>
          </div>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map(({ n, label }, i) => {
              const done    = currentStep > n;
              const active  = currentStep === n;
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 12, border: '2px solid',
                      borderColor: done ? '#006233' : active ? '#C1272D' : 'var(--border-color)',
                      background: done ? '#006233' : active ? '#C1272D' : 'var(--bg-700)',
                      color: done || active ? '#fff' : 'var(--text-muted)',
                      transition: 'all 0.3s',
                    }}>
                      {done ? '✓' : n}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: active ? '#C1272D' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 16, borderRadius: 1, background: done ? '#006233' : 'var(--border-color)', transition: 'background 0.3s' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Transport ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Moyen de transport</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {TRANSPORT_MODES.map(({ id, label, Icon, desc }) => {
              const active = form.transportMode === id;
              return (
                <button key={id} type="button" onClick={() => setForm(f => ({ ...f, transportMode: id }))}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 8px', borderRadius: 14, border: '2px solid', textAlign: 'center',
                    cursor: 'pointer', transition: 'all .15s',
                    borderColor: active ? '#C1272D' : 'var(--border-color)',
                    background:  active ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)',
                    transform:   active ? 'scale(1.04)' : 'scale(1)',
                    boxShadow:   active ? '0 0 0 3px rgba(193,39,45,0.15)' : 'none',
                  }}>
                  <Icon size={24} style={{ color: active ? '#C1272D' : 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: active ? '#C1272D' : 'var(--text-primary)' }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Itinéraire ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Itinéraire</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MapPin size={13} style={{ color: '#C1272D' }} /> Départ
              </label>
              <input value={form.from} onChange={set('from')} placeholder="ex: Casablanca"
                list="from-cities"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
                  background: 'var(--bg-700)', border: `1.5px solid ${fErr.from ? '#EF4444' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                }} />
              <datalist id="from-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              {fErr.from && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{fErr.from}</p>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <MapPin size={13} style={{ color: '#006233' }} /> Arrivée
              </label>
              <input value={form.to} onChange={set('to')} placeholder="ex: Rabat"
                list="to-cities"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
                  background: 'var(--bg-700)', border: `1.5px solid ${fErr.to ? '#EF4444' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                }} />
              <datalist id="to-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              {fErr.to && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{fErr.to}</p>}
            </div>
          </div>

          {/* Multi-stops */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
              Escales intermédiaires <span style={{ fontWeight: 400 }}>(optionnel)</span>
            </p>

            {/* Timeline visuelle */}
            {(form.stops.length > 0 || form.from || form.to) && (
              <div style={{ marginBottom: 10, paddingLeft: 8 }}>
                {[form.from, ...form.stops, form.to].filter(Boolean).map((city, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < arr.length - 1 ? 0 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        background: i === 0 ? '#C1272D' : i === arr.length - 1 ? '#006233' : '#D4890A',
                        border: '2px solid var(--bg-700)',
                      }} />
                      {i < arr.length - 1 && <div style={{ width: 2, height: 20, background: 'var(--border-color)' }} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{city}</span>
                      {i > 0 && i < arr.length - 1 && (
                        <button type="button" onClick={() => removeStop(i - 1)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                          <Trash2 size={13} style={{ color: '#EF4444' }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newStop} onChange={e => setNewStop(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addStop())}
                placeholder="Ajouter une escale…" list="stop-cities"
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 10, fontSize: 13,
                  background: 'var(--bg-700)', border: '1.5px solid var(--border-color)',
                  color: 'var(--text-primary)', outline: 'none',
                }} />
              <datalist id="stop-cities">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              <button type="button" onClick={addStop}
                style={{
                  padding: '9px 14px', borderRadius: 10, background: 'rgba(212,137,10,0.12)',
                  border: '1.5px solid rgba(212,137,10,0.35)', color: '#D4890A',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700,
                }}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* ── Date & Places & Prix ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Date, places & prix</SectionTitle>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Calendar size={13} style={{ color: '#C1272D' }} /> Date et heure de départ
            </label>
            <input type="datetime-local" value={form.departureDate} onChange={set('departureDate')} min={minDate}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
                background: 'var(--bg-700)', border: `1.5px solid ${fErr.departureDate ? '#EF4444' : 'var(--border-color)'}`,
                color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
              }} />
            {fErr.departureDate && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{fErr.departureDate}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <DollarSign size={13} style={{ color: '#C1272D' }} /> Prix / place (MAD)
              </label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0" min="0" step="0.5"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
                  background: 'var(--bg-700)', border: `1.5px solid ${fErr.price ? '#EF4444' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                }} />
              {fErr.price && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{fErr.price}</p>}
              {suggestion && (
                <button type="button"
                  onClick={() => { setForm(f => ({ ...f, price: String(suggestion.price) })); setFErr(p => ({ ...p, price: undefined })); }}
                  style={{
                    marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11,
                    fontWeight: 700, padding: '5px 10px', borderRadius: 8,
                    background: 'rgba(0,98,51,0.10)', color: '#006233',
                    border: '1px solid rgba(0,98,51,0.25)', cursor: 'pointer',
                  }}>
                  <Tag size={11} /> Conseillé : {suggestion.price} DH
                </button>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Users size={13} style={{ color: '#C1272D' }} /> Nombre de places
              </label>
              <select value={form.seats} onChange={set('seats')}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14,
                  background: 'var(--bg-700)', border: '1.5px solid var(--border-color)',
                  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                }}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Bagages & Colis ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Bagages & Colis</SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle
              checked={form.baggageAllowed}
              onChange={e => setForm(f => ({ ...f, baggageAllowed: e.target.checked }))}
              accent="#006233" icon={Users}
              label="Bagages acceptés"
              sublabel="Les passagers peuvent emporter des valises"
            />

            {form.baggageAllowed && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(0,98,51,0.06)', border: '1px solid rgba(0,98,51,0.15)' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#006233', marginBottom: 8, display: 'block' }}>
                  Poids max par passager
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[5, 10, 15, 20, 30].map(kg => (
                    <button key={kg} type="button"
                      onClick={() => setForm(f => ({ ...f, maxBaggageKg: kg }))}
                      style={{
                        padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        background: form.maxBaggageKg === kg ? 'rgba(0,98,51,0.20)' : 'var(--bg-700)',
                        color: form.maxBaggageKg === kg ? '#006233' : 'var(--text-muted)',
                        border: `1.5px solid ${form.maxBaggageKg === kg ? '#006233' : 'var(--border-color)'}`,
                      }}>
                      {kg} kg
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colis */}
            <Toggle
              checked={form.acceptsPackages}
              onChange={e => setForm(f => ({ ...f, acceptsPackages: e.target.checked }))}
              accent="#D4890A" icon={Package}
              label="Livraison de colis"
              sublabel="Transporter un colis sur votre route (remplace Amana)"
            />

            {form.acceptsPackages && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(212,137,10,0.06)', border: '1px solid rgba(212,137,10,0.20)' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#D4890A', marginBottom: 6, display: 'block' }}>
                  Tarif colis (MAD / kg) — optionnel
                </label>
                <input
                  type="number" value={form.packagePricePerKg} onChange={set('packagePricePerKg')}
                  placeholder="ex: 5 DH/kg (laisser vide si gratuit)"
                  min="0" step="0.5"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
                    background: 'var(--bg-700)', border: '1.5px solid rgba(212,137,10,0.30)',
                    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  💡 Le colis sera remis en main propre à l'arrivée. Prévenez l'expéditeur avant d'accepter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Paiement ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: `1px solid ${fErr.payment ? '#EF444455' : 'var(--border-color)'}`, padding: 20 }}>
          <SectionTitle>Modes de paiement acceptés</SectionTitle>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'acceptCash',   label: 'Espèces', icon: Banknote,    color: '#006233' },
              { key: 'acceptOnline', label: 'Carte / Wallet', icon: CreditCard, color: '#3B82F6' },
            ].map(({ key, label, icon: Icon, color }) => {
              const active = form[key];
              return (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '16px 12px', borderRadius: 14, cursor: 'pointer', transition: 'all .15s',
                    background: active ? `rgba(${color === '#006233' ? '0,98,51' : '59,130,246'},0.10)` : 'var(--bg-700)',
                    border: `2px solid ${active ? color : 'var(--border-color)'}`,
                  }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: active ? `rgba(${color === '#006233' ? '0,98,51' : '59,130,246'},0.15)` : 'var(--bg-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} style={{ color: active ? color : 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: active ? color : 'var(--text-muted)' }}>{label}</span>
                  {active && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: color, color: '#fff' }}>
                      ✓ Accepté
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {fErr.payment && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} />{fErr.payment}</p>}
        </div>

        {/* ── Options ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Options</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            <Toggle
              checked={form.instantBooking}
              onChange={set('instantBooking')}
              accent="#F59E0B" icon={Zap}
              label="Réservation instantanée"
              sublabel="Les passagers réservent sans confirmation de votre part"
            />

            <Toggle
              checked={form.womenOnly}
              onChange={set('womenOnly')}
              accent="#EC4899" icon={Users}
              label="Réservé aux femmes"
              sublabel="Seules les passagères pourront réserver ce trajet"
            />

            <Toggle
              checked={form.isRecurring}
              onChange={set('isRecurring')}
              accent="#3B82F6" icon={RefreshCw}
              label="Trajet récurrent"
              sublabel="Ce trajet se répète chaque semaine aux jours sélectionnés"
            />

            {form.isRecurring && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.20)' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#60A5FA', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Jours de la semaine
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAYS.map(({ val, short }) => {
                    const active = form.recurringDays.includes(val);
                    return (
                      <button key={val} type="button" onClick={() => toggleDay(val)}
                        style={{
                          width: 46, height: 38, borderRadius: 10, fontSize: 12, fontWeight: 800,
                          cursor: 'pointer', transition: 'all .15s',
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
          </div>
        </div>

        {/* ── Préférences conducteur ── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Préférences dans le véhicule</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { key: 'prefMusic',    emoji: '🎵', label: 'Musique OK',      sub: 'Musique pendant le trajet',       color: '#8B5CF6' },
              { key: 'prefSilence',  emoji: '🤫', label: 'Silence apprécié', sub: 'Trajet calme, peu de discussion', color: '#6B7280' },
              { key: 'prefSmoking',  emoji: '🚬', label: 'Fumeur OK',        sub: 'Pauses cigarette acceptées',      color: '#F59E0B' },
              { key: 'prefPets',     emoji: '🐾', label: 'Animaux OK',       sub: 'Animaux de compagnie acceptés',   color: '#10B981' },
              { key: 'prefAC',       emoji: '❄️', label: 'Clim disponible',  sub: 'Véhicule avec climatisation',     color: '#2196F3' },
              { key: 'prefTalkative',emoji: '💬', label: 'Bavard',           sub: 'J\'aime discuter en route',       color: '#C1272D' },
            ].map(({ key, emoji, label, sub, color }) => {
              const active = form[key];
              return (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  style={{
                    padding: '12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${active ? color : 'var(--border-color)'}`,
                    background: active ? `${color}12` : 'var(--bg-700)',
                    transition: 'all .15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    {active && <span style={{ fontSize: 10, fontWeight: 800, color, background: `${color}20`, padding: '2px 6px', borderRadius: 6 }}>✓</span>}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 800, color: active ? color : 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <SectionTitle>Description</SectionTitle>
          <textarea value={form.description} onChange={set('description')}
            placeholder="Infos utiles : point de rendez-vous, règles dans le véhicule, colis acceptés jusqu'à X kg…"
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 14, resize: 'none',
              background: 'var(--bg-700)', border: '1.5px solid var(--border-color)',
              color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
          />
        </div>

        <button type="submit" disabled={loading}
          style={{
            height: 58, borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'var(--bg-700)' : 'linear-gradient(135deg, #C1272D 0%, #9e1f24 50%, #C1272D 100%)',
            color: loading ? 'var(--text-muted)' : '#fff',
            fontSize: 16, fontWeight: 900, letterSpacing: '0.02em',
            boxShadow: loading ? 'none' : '0 6px 24px rgba(193,39,45,0.4)',
            transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          {loading
            ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Publication en cours…</>
            : <><Car size={18} /> Publier le trajet →</>
          }
        </button>
        <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      </form>
    </div>
  );
}
