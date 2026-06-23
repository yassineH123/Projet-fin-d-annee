import { useState, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import { useSearchParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Search, SlidersHorizontal, MapPin, Star, ShieldCheck, Accessibility, X, ArrowUpDown, ExternalLink, Clock, Leaf, Map, Car, Train, Bus, Plane, Bike, Truck, Users, ArrowRight, Package, Banknote, RefreshCw } from 'lucide-react';
import api from '../services/api';
import RideCard from '../components/RideCard';
import { SkeletonList } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { ONCF, CTM_ROUTES, GRAND_TAXI, FLIGHTS, findRoutes, formatDuration, co2Color } from '../data/transportData';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune'];

const ARABIC_NAMES = {
  'Casablanca': 'الدار البيضاء', 'Rabat': 'الرباط', 'Marrakech': 'مراكش',
  'Fès': 'فاس', 'Tanger': 'طنجة', 'Agadir': 'أكادير',
  'Meknès': 'مكناس', 'Oujda': 'وجدة', 'Tétouan': 'تطوان', 'Laâyoune': 'العيون',
};

const SORT_OPTIONS = [
  { value: 'date_asc',    label: 'Départ le plus tôt' },
  { value: 'price_asc',   label: 'Prix croissant' },
  { value: 'price_desc',  label: 'Prix décroissant' },
  { value: 'rating_desc', label: 'Mieux notés' },
];

const TRANSPORT_TABS = [
  { id: 'covoiturage', label: 'Covoiturage', Icon: Car,   color: '#C1272D', ar: 'مشاركة السيارة' },
  { id: 'train',       label: 'Train ONCF',  Icon: Train, color: '#2196F3', ar: 'القطار' },
  { id: 'bus',         label: 'Bus CTM',     Icon: Bus,   color: '#FF9800', ar: 'الحافلة' },
  { id: 'grandtaxi',   label: 'Grand Taxi',  Icon: Car,   color: '#9C27B0', ar: 'التاكسي الكبير' },
  { id: 'avion',       label: 'Avion',       Icon: Plane, color: '#00BCD4', ar: 'الطائرة' },
];

const VEHICLE_MODES = [
  { id: 'all',      label: 'Tous',     Icon: Search },
  { id: 'voiture',  label: 'Voiture',  Icon: Car },
  { id: 'moto',     label: 'Moto',     Icon: Bike },
  { id: 'minibus',  label: 'Minibus',  Icon: Bus },
  { id: 'van',      label: 'Van',      Icon: Truck },
];

/* ── Zellige header stripe ── */
function ZelligeStripe() {
  const tile = '#C1272D'; const tile2 = '#D4890A'; const tile3 = '#006233';
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: i % 3 === 0 ? tile : i % 3 === 1 ? tile2 : tile3, opacity: 0.85 }} />
      ))}
    </div>
  );
}

/* ── Static transport card ── */
function StaticTransportCard({ item, mode }) {
  const cfg = TRANSPORT_TABS.find(t => t.id === mode);
  const price = item.price ?? item.pricePerPerson ?? item.priceFrom;
  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 14, overflow: 'hidden',
      border: '1px solid var(--border-color)', transition: 'transform .2s, box-shadow .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${cfg?.color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ height: 3, background: cfg?.color }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: cfg?.color }}>{item.operator}</p>
            {item.class && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{item.class}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: cfg?.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{price}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>DH/pers</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {item.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}><Clock size={11}/>{formatDuration(item.duration)}</span>}
          {item.co2      && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: co2Color(item.co2) }}><Leaf size={11}/>{item.co2}kg CO₂</span>}
          {mode === 'grandtaxi' && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>~30 min attente · 5 passagers</span>}
          {mode === 'avion'     && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prix à partir de</span>}
        </div>
        {item.departures && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {item.departures.slice(0, 6).map(d => (
              <span key={d} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace', background: `${cfg?.color}15`, color: cfg?.color, border: `1px solid ${cfg?.color}30` }}>{d}</span>
            ))}
            {item.departures.length > 6 && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, color: 'var(--text-muted)', background: 'var(--bg-700)' }}>+{item.departures.length - 6}</span>
            )}
          </div>
        )}
        {item.bookingUrl ? (
          <a href={item.bookingUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', background: `${cfg?.color}15`, color: cfg?.color, border: `1px solid ${cfg?.color}30` }}>
            Réserver <ExternalLink size={13}/>
          </a>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '8px 0', borderRadius: 10, fontSize: 13, background: 'var(--bg-700)', color: 'var(--text-muted)' }}>
            Disponible en station
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ checked, onChange, color = '#C1272D' }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, flexShrink: 0, cursor: 'pointer', border: 'none',
        background: checked ? color : 'var(--bg-500)', position: 'relative', transition: 'background .2s',
      }}>
      <span style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function SearchRides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides,    setRides]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showAdv,  setShowAdv]  = useState(false);
  const [transportMode, setTransportMode] = useState('covoiturage');
  const [vehicleMode,   setVehicleMode]   = useState('all');

  const revealResults = useScrollReveal({ staggerMs: 80 });

  const [from,       setFrom]       = useState(searchParams.get('from') || '');
  const [to,         setTo]         = useState(searchParams.get('to')   || '');
  const [date,       setDate]       = useState(searchParams.get('date') || '');
  const [maxPrice,   setMaxPrice]   = useState(500);
  const [minRating,  setMinRating]  = useState(0);
  const [timeSlot,   setTimeSlot]   = useState(null); // 'matin'|'aprem'|'soir'
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pmrOnly,    setPmrOnly]    = useState(false);
  const [womenOnly,       setWomenOnly]       = useState(false);
  const [acceptsCash,     setAcceptsCash]     = useState(false);
  const [acceptsPackages, setAcceptsPackages] = useState(false);
  const [recurringOnly,   setRecurringOnly]   = useState(false);
  const [sortBy,     setSortBy]     = useState('date_asc');
  const [seats,      setSeats]      = useState(1);

  const activeFilters = [verifiedOnly, pmrOnly, womenOnly, acceptsCash, acceptsPackages, recurringOnly, minRating > 0, maxPrice < 500, timeSlot].filter(Boolean).length;

  const TIME_SLOTS = [
    { id: 'matin', label: '🌅 Matin',      range: [6, 12],  color: '#F59E0B' },
    { id: 'aprem', label: '☀️ Après-midi', range: [12, 18], color: '#C1272D' },
    { id: 'soir',  label: '🌙 Soir',       range: [18, 24], color: '#6366F1' },
  ];

  const filterByTime = (ride) => {
    if (!timeSlot) return true;
    const slot = TIME_SLOTS.find(s => s.id === timeSlot);
    if (!slot || !ride.departureDate) return true;
    const h = new Date(ride.departureDate).getHours();
    return h >= slot.range[0] && h < slot.range[1];
  };

  const staticResults = {
    train:      findRoutes(ONCF,       from, to),
    bus:        findRoutes(CTM_ROUTES, from, to),
    grandtaxi:  findRoutes(GRAND_TAXI, from, to),
    avion:      findRoutes(FLIGHTS,    from, to),
  };

  const fetchRides = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = { from, to, date, maxPrice: maxPrice < 500 ? maxPrice : undefined, minRating, verifiedOnly, pmrOnly, womenOnly,
        acceptsCash, acceptsPackages, recurringOnly, sortBy, seats,
        transportMode: vehicleMode !== 'all' ? vehicleMode : undefined, ...overrides };
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

  const resetFilters = () => {
    setMaxPrice(500); setMinRating(0); setVerifiedOnly(false); setTimeSlot(null);
    setPmrOnly(false); setWomenOnly(false); setAcceptsCash(false);
    setAcceptsPackages(false); setRecurringOnly(false); setSortBy('date_asc'); setSeats(1);
  };

  const seoTitle = from && to ? `${from} → ${to}` : 'Rechercher un trajet';
  const seoDesc  = from && to
    ? `Trajets covoiturage de ${from} à ${to} au Maroc — prix, horaires et conducteurs vérifiés.`
    : 'Trouvez un covoiturage pas cher entre toutes les villes du Maroc.';

  const hasRoute = from && to;
  const activeTab = TRANSPORT_TABS.find(t => t.id === transportMode);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
      <SEO title={seoTitle} description={seoDesc} path="/rides/search" />

      {/* ── Hero header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        {hasRoute ? (
          <div style={{ padding: '20px 22px', background: 'linear-gradient(135deg, rgba(193,39,45,0.06) 0%, rgba(0,98,51,0.04) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ Résultats de recherche</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{from}</p>
                  <div style={{ flex: 1, maxWidth: 60, height: 2, background: 'linear-gradient(to right, #C1272D, #D4890A, #006233)', borderRadius: 1 }} />
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{to}</p>
                </div>
                {ARABIC_NAMES[from] && ARABIC_NAMES[to] && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(193,39,45,0.6)', fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                    {ARABIC_NAMES[to]} ← {ARABIC_NAMES[from]}
                  </p>
                )}
              </div>
              <Link to="/compare" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 10, textDecoration: 'none', flexShrink: 0, background: 'rgba(193,39,45,0.08)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)' }}>
                <Map size={13} /> Comparer
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Rechercher un trajet</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Toutes les villes du Maroc · 5 modes de transport</p>
              </div>
              <Link to="/compare" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 10, textDecoration: 'none', flexShrink: 0, background: 'rgba(193,39,45,0.08)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)' }}>
                <Map size={13} /> Comparer
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick filters (prominent) ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
        {[
          { label: '♀ Femmes uniquement', val: womenOnly,       set: setWomenOnly,       color: '#EC4899', bg: 'rgba(236,72,153,0.10)', border: 'rgba(236,72,153,0.35)' },
          { label: '📦 Colis acceptés',   val: acceptsPackages, set: setAcceptsPackages, color: '#D4890A', bg: 'rgba(212,137,10,0.10)', border: 'rgba(212,137,10,0.35)' },
          { label: '💵 Espèces OK',       val: acceptsCash,     set: setAcceptsCash,     color: '#006233', bg: 'rgba(0,98,51,0.10)',    border: 'rgba(0,98,51,0.35)'    },
          { label: '🔁 Récurrents',       val: recurringOnly,   set: setRecurringOnly,   color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.35)' },
        ].map(({ label, val, set, color, bg, border }) => (
          <button key={label} type="button"
            onClick={() => { set(!val); fetchRides(); }}
            style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800,
              cursor: 'pointer', border: `1.5px solid ${val ? border : 'var(--border-color)'}`,
              background: val ? bg : 'var(--card-bg)', color: val ? color : 'var(--text-muted)',
              transition: 'all .15s',
              boxShadow: val ? `0 2px 12px ${color}20` : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Search form ── */}
      <form onSubmit={handleSearch} style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#C1272D', pointerEvents: 'none' }} />
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ville de départ" list="from-list"
              className="input" style={{ paddingLeft: 34, fontSize: 14, height: 44 }} />
            <datalist id="from-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div style={{ position: 'relative' }}>
            <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#006233', pointerEvents: 'none' }} />
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Ville d'arrivée" list="to-list"
              className="input" style={{ paddingLeft: 34, fontSize: 14, height: 44 }} />
            <datalist id="to-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="input" style={{ fontSize: 14, height: 44 }}
            min={new Date().toISOString().split('T')[0]} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary"
              style={{ height: 44, paddingInline: 18, display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
              <Search size={15} /> Rechercher
            </button>
            <button type="button" onClick={() => setShowAdv(!showAdv)}
              style={{
                position: 'relative', height: 44, padding: '0 14px', borderRadius: 10, border: '1px solid',
                borderColor: showAdv ? '#C1272D' : 'var(--border-color)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                background: showAdv ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)',
                color: showAdv ? '#C1272D' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              }}>
              <SlidersHorizontal size={14} />
              {activeFilters > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
                  background: '#C1272D', color: '#fff', fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                }}>{activeFilters}</span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdv && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Filtres avancés</p>
              {activeFilters > 0 && (
                <button type="button" onClick={resetFilters} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <X size={12} /> Réinitialiser ({activeFilters})
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 14 }}>
              {/* Note min */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <Star size={11} style={{ color: '#F59E0B' }} />
                  Note min : <span style={{ color: 'var(--text-primary)', fontWeight: 800, marginLeft: 3 }}>{minRating > 0 ? `${minRating}★` : 'Toutes'}</span>
                </label>
                <input type="range" min="0" max="5" step="0.5" value={minRating}
                  onChange={e => setMinRating(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }} />
              </div>

              {/* Prix max slider */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  Prix max
                  <span style={{ color: maxPrice < 500 ? '#C1272D' : 'var(--text-muted)', fontWeight: 800 }}>
                    {maxPrice < 500 ? `${maxPrice} DH` : 'Tous'}
                  </span>
                </label>
                <input type="range" min="30" max="500" step="10" value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#C1272D', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  <span>30 DH</span><span>500 DH</span>
                </div>
              </div>

              {/* Places */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Places souhaitées</label>
                <select value={seats} onChange={e => setSeats(Number(e.target.value))} className="input" style={{ fontSize: 13 }}>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              {/* Tri */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <ArrowUpDown size={11} /> Trier par
                </label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input" style={{ fontSize: 13 }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Heure de départ */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={11} /> Heure de départ
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {TIME_SLOTS.map(({ id, label, color }) => (
                  <button key={id} type="button" onClick={() => setTimeSlot(timeSlot === id ? null : id)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 800, border: '1.5px solid',
                    borderColor: timeSlot === id ? color : 'var(--border-color)',
                    background: timeSlot === id ? `${color}15` : 'var(--bg-700)',
                    color: timeSlot === id ? color : 'var(--text-muted)', cursor: 'pointer', transition: 'all .15s',
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Toggle switches */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
              {[
                { label: 'Conducteurs vérifiés', icon: <ShieldCheck size={13} style={{ color: '#22C55E' }} />, val: verifiedOnly, set: setVerifiedOnly, color: '#22C55E' },
                { label: 'Véhicule PMR', icon: <Accessibility size={13} style={{ color: '#3B82F6' }} />, val: pmrOnly, set: setPmrOnly, color: '#3B82F6' },
                { label: 'Femmes uniquement', icon: <Users size={13} style={{ color: '#EC4899' }} />, val: womenOnly, set: setWomenOnly, color: '#EC4899' },
              ].map(({ label, icon, val, set, color }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <Toggle checked={val} onChange={set} color={color} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {icon}{label}
                  </span>
                </label>
              ))}
            </div>

            <button type="submit" className="btn-primary"
              style={{ width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
              <Search size={14} /> Appliquer les filtres
            </button>
          </div>
        )}
      </form>

      {/* ── Transport mode tabs ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {TRANSPORT_TABS.map(tab => {
          const active = transportMode === tab.id;
          const count = tab.id !== 'covoiturage' && hasRoute ? staticResults[tab.id]?.length : null;
          return (
            <button key={tab.id} onClick={() => setTransportMode(tab.id)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', border: '1.5px solid', transition: 'all .2s',
                background: active ? `${tab.color}14` : 'var(--card-bg)',
                borderColor: active ? tab.color : 'var(--border-color)',
                color: active ? tab.color : 'var(--text-muted)',
                boxShadow: active ? `0 4px 14px ${tab.color}15` : 'none',
              }}>
              <tab.Icon size={15} />
              {tab.label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: tab.color, color: '#fff' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Covoiturage results ── */}
      {transportMode === 'covoiturage' && (
        <>
          {/* Vehicle sub-filters */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, marginBottom: 14, scrollbarWidth: 'none' }}>
            {VEHICLE_MODES.map(({ id, label, Icon }) => {
              const active = vehicleMode === id;
              return (
                <button key={id} onClick={() => { setVehicleMode(id); fetchRides({ transportMode: id !== 'all' ? id : undefined }); }}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', border: '1.5px solid', transition: 'all .15s',
                    background: active ? 'rgba(193,39,45,0.10)' : 'var(--bg-700)',
                    borderColor: active ? '#C1272D' : 'var(--border-color)',
                    color: active ? '#C1272D' : 'var(--text-muted)',
                  }}>
                  <Icon size={13} />{label}
                </button>
              );
            })}
          </div>

          {loading ? <SkeletonList count={4} card="ride" /> : rides.filter(filterByTime).length === 0 ? (
            <EmptyState
              icon={(() => { const I = VEHICLE_MODES.find(v => v.id === vehicleMode)?.Icon || Search; return <I size={28} style={{ color: 'var(--text-muted)' }} />; })()}
              title="Aucun trajet trouvé"
              description="Essayez un autre véhicule ou regardez les autres modes de transport ci-dessus."
              actionLabel="Voir tous les trajets"
              actionTo="/rides/search"
            />
          ) : (
            <>
              {/* Result count bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, padding: '9px 14px', borderRadius: 10,
                background: 'rgba(193,39,45,0.05)', border: '1px solid rgba(193,39,45,0.12)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
                    display: 'inline-block', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rides.filter(filterByTime).length} trajet{rides.filter(filterByTime).length > 1 ? 's' : ''} disponible{rides.filter(filterByTime).length > 1 ? 's' : ''}
                  </span>
                  {hasRoute && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      · {from} <ArrowRight size={10} /> {to}
                    </span>
                  )}
                </div>
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); fetchRides({ sortBy: e.target.value }); }}
                  style={{ fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div ref={revealResults} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rides.filter(filterByTime).map(ride => (
                  <div key={ride.id} data-reveal style={{ position: 'relative' }}>
                    {ride.transportMode && ride.transportMode !== 'voiture' && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12, zIndex: 10,
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: 'rgba(193,39,45,0.10)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)',
                      }}>
                        {(() => { const I = VEHICLE_MODES.find(v => v.id === ride.transportMode)?.Icon; return I ? <I size={11} /> : null; })()}
                        {VEHICLE_MODES.find(v => v.id === ride.transportMode)?.label}
                      </div>
                    )}
                    <RideCard ride={ride} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Static transport results ── */}
      {transportMode !== 'covoiturage' && (() => {
        const results = staticResults[transportMode] || [];
        return results.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '56px 20px',
            background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>
              {transportMode === 'train' ? '🚆' : transportMode === 'bus' ? '🚌' : transportMode === 'grandtaxi' ? '🚕' : '✈️'}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {!from || !to ? 'Entrez une ville de départ et d\'arrivée' : `Pas de ${activeTab?.label} direct pour ce trajet`}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <Link to="/compare" style={{ color: '#C1272D', textDecoration: 'none', fontWeight: 700 }}>Essayez le comparateur</Link>
              {' '}pour toutes les combinaisons
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              padding: '9px 14px', borderRadius: 10,
              background: `${activeTab?.color}08`, border: `1px solid ${activeTab?.color}20`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeTab?.color, display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {results.length} option{results.length > 1 ? 's' : ''} {activeTab?.label}
              </span>
              {hasRoute && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {from} → {to}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {results.map((item, i) => <StaticTransportCard key={i} item={item} mode={transportMode} />)}
            </div>
          </>
        );
      })()}
    </div>
  );
}
