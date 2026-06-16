import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, ShieldCheck, Accessibility, X, ArrowUpDown, ExternalLink, Clock, Leaf } from 'lucide-react';
import api from '../services/api';
import RideCard from '../components/RideCard';
import Spinner from '../components/Spinner';
import { ONCF, CTM_ROUTES, GRAND_TAXI, FLIGHTS, findRoutes, formatDuration, co2Color } from '../data/transportData';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune'];
const SORT_OPTIONS = [
  { value: 'date_asc',    label: 'Départ le plus tôt' },
  { value: 'price_asc',   label: 'Prix croissant' },
  { value: 'price_desc',  label: 'Prix décroissant' },
  { value: 'rating_desc', label: 'Mieux notés' },
];

const TRANSPORT_TABS = [
  { id: 'covoiturage', label: 'Covoiturage', icon: '🚗', color: '#C1272D' },
  { id: 'train',       label: 'Train',       icon: '🚂', color: '#2196F3' },
  { id: 'bus',         label: 'Bus',         icon: '🚌', color: '#FF9800' },
  { id: 'grandtaxi',  label: 'Grand Taxi',  icon: '🚕', color: '#9C27B0' },
  { id: 'avion',      label: 'Avion',       icon: '✈️', color: '#00BCD4' },
];

function StaticTransportCard({ item, mode }) {
  const cfg = TRANSPORT_TABS.find(t => t.id === mode);
  const price = item.price ?? item.pricePerPerson ?? item.priceFrom;
  return (
    <div className="card p-4" style={{ borderTop: `3px solid ${cfg?.color}` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-black text-sm" style={{ color: cfg?.color }}>{item.operator}</p>
          {item.class && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.class}</p>}
        </div>
        <div className="text-right">
          <p className="font-black text-xl" style={{ color: cfg?.color }}>{price} DH</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/pers</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs mb-3 flex-wrap">
        {item.duration && <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Clock size={11}/> {formatDuration(item.duration)}</span>}
        {item.co2      && <span className="flex items-center gap-1 font-semibold" style={{ color: co2Color(item.co2) }}><Leaf size={11}/> {item.co2}kg CO₂</span>}
        {mode === 'grandtaxi' && <span style={{ color: 'var(--text-muted)' }}>~30 min attente · 5 passagers</span>}
        {mode === 'avion'     && <span style={{ color: 'var(--text-muted)' }}>Prix à partir de</span>}
      </div>
      {item.departures && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {item.departures.slice(0, 6).map(d => (
            <span key={d} className="text-xs px-2 py-0.5 rounded-lg font-mono"
              style={{ background: `${cfg?.color}15`, color: cfg?.color, border: `1px solid ${cfg?.color}30` }}>{d}</span>
          ))}
          {item.departures.length > 6 && <span className="text-xs px-2 py-0.5 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-700)' }}>+{item.departures.length - 6}</span>}
        </div>
      )}
      {item.bookingUrl ? (
        <a href={item.bookingUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold"
          style={{ background: `${cfg?.color}15`, color: cfg?.color, border: `1px solid ${cfg?.color}30` }}>
          Réserver <ExternalLink size={13}/>
        </a>
      ) : (
        <div className="flex items-center justify-center w-full py-2 rounded-xl text-sm" style={{ background: 'var(--bg-700)', color: 'var(--text-muted)' }}>
          Disponible en station
        </div>
      )}
    </div>
  );
}

export default function SearchRides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides,    setRides]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showAdv,  setShowAdv]  = useState(false);
  const [transportMode, setTransportMode] = useState('covoiturage');

  const [from,       setFrom]       = useState(searchParams.get('from') || '');
  const [to,         setTo]         = useState(searchParams.get('to')   || '');
  const [date,       setDate]       = useState(searchParams.get('date') || '');
  const [maxPrice,   setMaxPrice]   = useState('');
  const [minRating,  setMinRating]  = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pmrOnly,    setPmrOnly]    = useState(false);
  const [sortBy,     setSortBy]     = useState('date_asc');
  const [seats,      setSeats]      = useState(1);

  const activeFilters = [verifiedOnly, pmrOnly, minRating > 0, maxPrice].filter(Boolean).length;

  const staticResults = {
    train:      findRoutes(ONCF,       from, to),
    bus:        findRoutes(CTM_ROUTES, from, to),
    grandtaxi:  findRoutes(GRAND_TAXI, from, to),
    avion:      findRoutes(FLIGHTS,    from, to),
  };

  const fetchRides = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = { from, to, date, maxPrice, minRating, verifiedOnly, pmrOnly, sortBy, seats, ...overrides };
      Object.keys(params).forEach(k => !params[k] && params[k] !== 0 && delete params[k]);
      const { data } = await api.get('/rides/search', { params });
      setRides(data.rides || []);
    } catch { setRides([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRides(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = {};
    if (from) p.from = from;
    if (to)   p.to   = to;
    if (date) p.date = date;
    setSearchParams(p);
    fetchRides();
  };

  const resetFilters = () => { setMaxPrice(''); setMinRating(0); setVerifiedOnly(false); setPmrOnly(false); setSortBy('date_asc'); setSeats(1); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Rechercher un trajet</h1>
        <Link to="/compare" className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)' }}>
          🗺️ Comparer tous les transports
        </Link>
      </div>

      {/* Barre de recherche principale */}
      <form onSubmit={handleSearch} className="card mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={15} />
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ville de départ" className="input pl-9 text-sm" list="from-list" />
            <datalist id="from-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" size={15} />
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Ville d'arrivée" className="input pl-9 text-sm" list="to-list" />
            <datalist id="to-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input text-sm" min={new Date().toISOString().split('T')[0]} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm h-12">
              <Search size={15} /> Rechercher
            </button>
            <button type="button" onClick={() => setShowAdv(!showAdv)}
              className="relative h-12 px-3 rounded-xl border transition flex items-center gap-1.5 text-sm font-medium"
              style={{ background: showAdv ? 'rgba(193,39,45,0.1)' : 'var(--card-bg)', borderColor: showAdv ? '#C1272D' : 'var(--border-color)', color: showAdv ? '#C1272D' : 'var(--text-muted)' }}>
              <SlidersHorizontal size={15} />
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">{activeFilters}</span>
              )}
            </button>
          </div>
        </div>

        {/* Panel filtres avancés */}
        {showAdv && (
          <div className="mt-4 pt-4 border-t border-dark-500">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white">Filtres avancés</p>
              {activeFilters > 0 && (
                <button type="button" onClick={resetFilters} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition">
                  <X size={12} /> Réinitialiser
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Note minimum */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <Star size={12} className="text-yellow-400" /> Note minimum : <span className="text-white font-bold ml-1">{minRating > 0 ? `${minRating}★` : 'Toutes'}</span>
                </label>
                <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-600 mt-1"><span>Toutes</span><span>5★</span></div>
              </div>

              {/* Prix max */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Prix max (MAD)</label>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Ex: 150" className="input text-sm" min="0" />
              </div>

              {/* Places */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 block">Places souhaitées</label>
                <select value={seats} onChange={e => setSeats(Number(e.target.value))} className="input text-sm">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              {/* Trier par */}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5"><ArrowUpDown size={12} /> Trier par</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input text-sm">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-3 justify-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${verifiedOnly ? 'bg-green-500' : 'bg-dark-500'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-300 flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-400" /> Conducteurs vérifiés uniquement</span>
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="sr-only" />
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-9 h-5 rounded-full relative transition-colors ${pmrOnly ? 'bg-blue-500' : 'bg-dark-500'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${pmrOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-300 flex items-center gap-1.5"><Accessibility size={14} className="text-blue-400" /> Véhicule accessible PMR</span>
                  <input type="checkbox" checked={pmrOnly} onChange={e => setPmrOnly(e.target.checked)} className="sr-only" />
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-4 w-full flex items-center justify-center gap-2 text-sm h-11">
              <Search size={15} /> Appliquer les filtres
            </button>
          </div>
        )}
      </form>

      {/* ── Transport mode tabs ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: 'none' }} role="tablist" aria-label="Mode de transport">
        {TRANSPORT_TABS.map(tab => (
          <button key={tab.id} onClick={() => setTransportMode(tab.id)}
            role="tab"
            aria-selected={transportMode === tab.id}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: transportMode === tab.id ? `${tab.color}18` : 'var(--bg-700)',
              color:      transportMode === tab.id ? tab.color          : 'var(--text-secondary)',
              border:     transportMode === tab.id ? `1px solid ${tab.color}40` : '1px solid var(--border-color)',
              minHeight: 44,
            }}>
            <span aria-hidden="true">{tab.icon}</span> {tab.label}
            {tab.id !== 'covoiturage' && from && to && staticResults[tab.id]?.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: tab.color, color: '#fff', fontSize: 10 }}>
                {staticResults[tab.id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Résultats covoiturage ── */}
      {transportMode === 'covoiturage' && (
        loading ? <Spinner /> : rides.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Aucun trajet covoiturage trouvé</p>
            <p className="text-slate-600 text-sm mt-1">Essayez de modifier vos critères ou regardez les autres modes de transport</p>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 text-sm mb-4">{rides.length} trajet{rides.length > 1 ? 's' : ''} trouvé{rides.length > 1 ? 's' : ''}</p>
            <div className="flex flex-col gap-4">
              {rides.map(ride => <RideCard key={ride.id} ride={ride} />)}
            </div>
          </div>
        )
      )}

      {/* ── Résultats transport statique ── */}
      {transportMode !== 'covoiturage' && (() => {
        const results = staticResults[transportMode] || [];
        return results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{TRANSPORT_TABS.find(t => t.id === transportMode)?.icon}</div>
            <p className="text-slate-400 font-medium">
              {!from || !to
                ? 'Entrez une ville de départ et d\'arrivée pour voir les options'
                : `Pas de ${TRANSPORT_TABS.find(t => t.id === transportMode)?.label} direct pour ce trajet`}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              <Link to="/compare" className="underline" style={{ color: '#C1272D' }}>Essayez le comparateur</Link> pour toutes les combinaisons
            </p>
          </div>
        ) : (
          <div>
            <p className="text-slate-400 text-sm mb-4">{results.length} option{results.length > 1 ? 's' : ''} disponible{results.length > 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((item, i) => <StaticTransportCard key={i} item={item} mode={transportMode} />)}
            </div>
          </div>
        );
      })()}
    </div>
  );
}