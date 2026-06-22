import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, ArrowRight, Clock, Leaf, Star, Users, Zap,
  TrendingDown, ArrowLeftRight, ExternalLink, ChevronDown, ChevronUp,
  Plane, Train, Bus, Car, Bike, ArrowUpDown,
  Map, Sparkles, Wallet, Ban
} from 'lucide-react';
import {
  ONCF, CTM_ROUTES, GRAND_TAXI, FLIGHTS,
  findRoutes, formatDuration, co2Color, co2Label
} from '../data/transportData';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune','Kénitra','Chefchaouen','Essaouira','Dakhla','Al Hoceima','Nador'];

const MODE_CONFIG = {
  covoiturage: { label: 'Covoiturage', Icon: Car,   color: '#C1272D', bg: 'rgba(193,39,45,0.12)', border: 'rgba(193,39,45,0.3)' },
  train:        { label: 'Train',        Icon: Train, color: '#2196F3', bg: 'rgba(33,150,243,0.1)',  border: 'rgba(33,150,243,0.3)' },
  bus:          { label: 'Bus',          Icon: Bus,   color: '#FF9800', bg: 'rgba(255,152,0,0.1)',   border: 'rgba(255,152,0,0.3)' },
  grandtaxi:    { label: 'Grand Taxi',   Icon: Car,   color: '#9C27B0', bg: 'rgba(156,39,176,0.1)', border: 'rgba(156,39,176,0.3)' },
  avion:        { label: 'Avion',        Icon: Plane, color: '#00BCD4', bg: 'rgba(0,188,212,0.1)',  border: 'rgba(0,188,212,0.3)' },
};

/* Petit helper pour afficher l'icône d'un mode de transport inline */
function ModeIcon({ mode, size = 16, color }) {
  const cfg = MODE_CONFIG[mode];
  if (!cfg) return null;
  const I = cfg.Icon;
  return <I size={size} style={{ color: color || cfg.color, flexShrink: 0 }} />;
}

const SORT_OPTIONS = [
  { id: 'price',    label: 'Prix',     icon: TrendingDown },
  { id: 'duration', label: 'Durée',    icon: Clock },
  { id: 'eco',      label: 'Éco',      icon: Leaf },
];

function ComfortDots({ n = 0, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < n ? '#D4890A' : 'var(--border-muted)' }} />
      ))}
    </div>
  );
}

function BadgePill({ label, color, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      {Icon && <Icon size={11} />} {label}
    </span>
  );
}

function TransportCard({ option, from, to, badges = [] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = MODE_CONFIG[option.mode] || MODE_CONFIG.covoiturage;

  const content = (
    <div className="card p-0 overflow-hidden hover:scale-[1.01] transition-transform"
      style={{ borderTop: `3px solid ${cfg.color}` }}>

      {/* Top: mode + badges + price */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <cfg.Icon size={22} style={{ color: cfg.color, flexShrink: 0 }} />
            <div>
              <p className="font-black text-sm leading-none" style={{ color: cfg.color }}>{option.operator}</p>
              {option.class && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{option.class}</p>}
              {option.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{option.note}</p>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-black text-2xl leading-none" style={{ color: cfg.color }}>{option.price} DH</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/personne</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {badges.includes('cheapest')  && <BadgePill icon={Wallet} label="Le + économique" color="#22c55e" />}
            {badges.includes('fastest')   && <BadgePill icon={Zap}    label="Le + rapide"      color="#2196F3" />}
            {badges.includes('eco')       && <BadgePill icon={Leaf}   label="Le + éco"         color="#10b981" />}
            {badges.includes('comfort')   && <BadgePill icon={Star}   label="Le + confortable" color="#D4890A" />}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 flex-wrap">
          {option.duration && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={12} /> {formatDuration(option.duration)}
            </div>
          )}
          {option.co2 != null && (
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: co2Color(option.co2) }}>
              <Leaf size={12} /> {option.co2}kg CO₂ · {co2Label(option.co2)}
            </div>
          )}
          {option.comfort > 0 && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Confort <ComfortDots n={option.comfort} />
            </div>
          )}
          {option.rating > 0 && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#D4890A' }}>
              <Star size={11} className="fill-current" /> {option.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Departures for trains/buses */}
        {option.departures && (
          <div className="mt-3">
            <div className="flex gap-1.5 flex-wrap">
              {(expanded ? option.departures : option.departures.slice(0, 5)).map(d => (
                <span key={d} className="text-xs px-2 py-0.5 rounded-lg font-mono"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {d}
                </span>
              ))}
              {option.departures.length > 5 && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
                  className="text-xs px-2 py-0.5 rounded-lg font-semibold flex items-center gap-0.5"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-700)' }}>
                  {expanded
                    ? <><ChevronUp size={11} /> Moins</>
                    : <>+{option.departures.length - 5} <ChevronDown size={11} /></>
                  }
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: CTA */}
      <div className="px-4 pb-4 pt-0">
        {option.internal ? (
          <Link to={option.link}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: cfg.color, color: '#fff' }}>
            Voir le trajet <ArrowRight size={15} />
          </Link>
        ) : option.link ? (
          <a href={option.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            Réserver sur {option.operator.split(' ')[0]} <ExternalLink size={13} />
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--bg-700)', color: 'var(--text-muted)' }}>
            Disponible dans les gares / stations
          </div>
        )}
      </div>
    </div>
  );

  return content;
}

function SmartRecommendation({ cheapest, fastest, eco }) {
  if (!cheapest && !fastest && !eco) return null;
  return (
    <div className="rounded-2xl p-5 mb-6"
      style={{ background: 'linear-gradient(135deg,rgba(193,39,45,0.08),rgba(212,137,10,0.08))', border: '1px solid rgba(193,39,45,0.2)' }}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#D4890A' }}>
        <Sparkles size={13} /> Recommandation AtlasWay
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cheapest && (
          <div className="flex items-center gap-2.5">
            <Wallet size={22} style={{ color: '#22c55e', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold text-white">Le + économique</p>
              <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <ModeIcon mode={cheapest.mode} size={13} /> {cheapest.operator} · <span style={{ color: '#22c55e' }}>{cheapest.price} DH</span>
              </p>
            </div>
          </div>
        )}
        {fastest && (
          <div className="flex items-center gap-2.5">
            <Zap size={22} style={{ color: '#2196F3', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold text-white">Le + rapide</p>
              <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <ModeIcon mode={fastest.mode} size={13} /> {fastest.operator} · <span style={{ color: '#2196F3' }}>{formatDuration(fastest.duration)}</span>
              </p>
            </div>
          </div>
        )}
        {eco && (
          <div className="flex items-center gap-2.5">
            <Leaf size={22} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <p className="text-xs font-bold text-white">Le + écologique</p>
              <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <ModeIcon mode={eco.mode} size={13} /> {eco.operator} · <span style={{ color: '#10b981' }}>{eco.co2}kg CO₂</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [from,  setFrom]  = useState(searchParams.get('from') || '');
  const [to,    setTo]    = useState(searchParams.get('to')   || '');
  const [date,  setDate]  = useState(searchParams.get('date') || '');
  const [mode,  setMode]  = useState('all');
  const [sort,  setSort]  = useState('price');
  const [searched, setSearched] = useState(false);

  const [rides,        setRides]        = useState([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [trainRes,     setTrainRes]     = useState([]);
  const [busRes,       setBusRes]       = useState([]);
  const [taxiRes,      setTaxiRes]      = useState([]);
  const [flightRes,    setFlightRes]    = useState([]);

  const doSearch = useCallback((f = from, t = to, d = date) => {
    if (!f || !t) return;
    setSearched(true);
    setTrainRes(findRoutes(ONCF,       f, t));
    setBusRes(findRoutes(CTM_ROUTES,   f, t));
    setTaxiRes(findRoutes(GRAND_TAXI,  f, t));
    setFlightRes(findRoutes(FLIGHTS,   f, t));
    setLoadingRides(true);
    api.get('/rides/search', { params: { from: f, to: t, date: d } })
      .then(({ data }) => setRides(data.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoadingRides(false));
  }, [from, to, date]);

  useEffect(() => {
    if (from && to) doSearch();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = {};
    if (from) p.from = from;
    if (to)   p.to   = to;
    if (date) p.date = date;
    setSearchParams(p);
    doSearch(from, to, date);
  };

  const swap = () => { setFrom(to); setTo(from); };

  // Build unified list
  const allOptions = [
    ...rides.map(r => ({
      mode: 'covoiturage',
      price: r.price,
      duration: null,
      co2: parseFloat((r.price * 0.015).toFixed(1)),
      comfort: 4,
      operator: `${r.driver?.firstName || 'Conducteur'} ${r.driver?.lastName?.[0] || ''}.`,
      note: `${r.seatsAvailable} place${r.seatsAvailable !== 1 ? 's' : ''} dispo · ⭐ ${r.driver?.avgRating?.toFixed(1) || '—'}`,
      link: `/rides/${r.id}`,
      internal: true,
      rating: r.driver?.avgRating || 0,
    })),
    ...trainRes.map(r => ({ mode: 'train',     ...r, price: r.price })),
    ...busRes.map(r =>   ({ mode: 'bus',        ...r, price: r.price })),
    ...taxiRes.map(r =>  ({ mode: 'grandtaxi',  ...r, price: r.pricePerPerson, note: 'Départ dès que plein · ~30 min d\'attente' })),
    ...flightRes.map(r => ({ mode: 'avion',     ...r, price: r.priceFrom, note: `${r.operators.join(' · ')} · Prix à partir de` })),
  ];

  const filtered = allOptions
    .filter(o => mode === 'all' || o.mode === mode)
    .sort((a, b) => {
      if (sort === 'price')    return (a.price    || 0)   - (b.price    || 0);
      if (sort === 'duration') return (a.duration || 9999) - (b.duration || 9999);
      if (sort === 'eco')      return (a.co2      || 9999) - (b.co2      || 9999);
      return 0;
    });

  const cheapest = allOptions.length ? allOptions.reduce((m, o) => (o.price || Infinity) < (m.price || Infinity) ? o : m) : null;
  const fastest  = allOptions.filter(o => o.duration).reduce((m, o) => o.duration < m.duration ? o : m, allOptions.find(o => o.duration) || null);
  const eco      = allOptions.filter(o => o.co2).reduce((m, o) => o.co2 < m.co2 ? o : m, allOptions.find(o => o.co2) || null);

  const modeCounts = Object.fromEntries(
    ['covoiturage', 'train', 'bus', 'grandtaxi', 'avion'].map(m => [m, allOptions.filter(o => o.mode === m).length])
  );

  return (
    <div className="min-h-screen">

      {/* ── HEADER SEARCH ── */}
      <div className="py-10 px-4" style={{ background: 'linear-gradient(160deg,#C1272D 0%,#9e1f24 60%,#7e181d 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="flex items-center justify-center gap-2 text-3xl font-black text-white mb-1"><Map size={28} /> Comparateur de transport</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>Covoiturage, Train, Bus, Grand Taxi, Avion — tout en un coup d'œil</p>
          </div>

          <form onSubmit={handleSearch} className="rounded-2xl p-4 shadow-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* From */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ background: '#006233' }} />
                <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ville de départ"
                  className="input pl-8 text-sm" list="cmp-from" />
                <datalist id="cmp-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>

              {/* Swap + To */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ background: '#C1272D' }} />
                <input value={to} onChange={e => setTo(e.target.value)} placeholder="Ville d'arrivée"
                  className="input pl-8 text-sm" list="cmp-to" />
                <datalist id="cmp-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                <button type="button" onClick={swap}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden sm:flex items-center justify-center"
                  style={{ background: 'var(--card-bg)', border: '2px solid var(--border-muted)', color: '#C1272D' }}>
                  <ArrowLeftRight size={13} />
                </button>
              </div>

              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="input text-sm" min={new Date().toISOString().split('T')[0]} />

              <button type="submit" className="btn-primary flex items-center justify-center gap-2 text-sm h-12">
                Comparer <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {!searched ? (
          /* Landing state */
          <div className="text-center py-20">
            <div className="flex justify-center mb-4"><Map size={56} style={{ color: 'var(--text-muted)' }} /></div>
            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-base)' }}>Comparez tous les moyens de transport</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Entrez une ville de départ et d'arrivée pour voir toutes les options disponibles</p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  <cfg.Icon size={16} /> {cfg.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Smart recommendation */}
            <SmartRecommendation cheapest={cheapest} fastest={fastest} eco={eco} />

            {/* Mode tabs */}
            <div className="flex gap-1.5 flex-wrap mb-4 p-1 rounded-2xl" style={{ background: 'var(--bg-700)' }}>
              <button onClick={() => setMode('all')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: mode === 'all' ? 'var(--card-bg)' : 'transparent', color: mode === 'all' ? '#fff' : 'var(--text-muted)' }}>
                <Map size={15} /> Tous
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#C1272D', color: '#fff' }}>{allOptions.length}</span>
              </button>
              {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
                modeCounts[key] > 0 && (
                  <button key={key} onClick={() => setMode(key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background: mode === key ? cfg.bg : 'transparent', color: mode === key ? cfg.color : 'var(--text-muted)', border: mode === key ? `1px solid ${cfg.border}` : '1px solid transparent' }}>
                    <cfg.Icon size={15} /> {cfg.label}
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: mode === key ? cfg.color : 'var(--bg-800)', color: mode === key ? '#fff' : 'var(--text-muted)' }}>
                      {modeCounts[key]}
                    </span>
                  </button>
                )
              ))}
            </div>

            {/* Sort bar */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Trier :</span>
              {SORT_OPTIONS.map(s => (
                <button key={s.id} onClick={() => setSort(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: sort === s.id ? 'rgba(193,39,45,0.12)' : 'var(--bg-700)', color: sort === s.id ? '#C1272D' : 'var(--text-muted)', border: sort === s.id ? '1px solid rgba(193,39,45,0.3)' : '1px solid var(--border-color)' }}>
                  <s.icon size={12} /> {s.label}
                </button>
              ))}
              {from && to && (
                <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                  {from} → {to} · {filtered.length} option{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Cards */}
            {loadingRides && rides.length === 0 ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-3"><Ban size={40} style={{ color: 'var(--text-muted)' }} /></div>
                <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Aucune option trouvée pour ce trajet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Essayez d'autres villes ou un autre mode</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((option, i) => {
                  const bs = [];
                  if (cheapest && option === cheapest)                    bs.push('cheapest');
                  if (fastest  && option === fastest)                     bs.push('fastest');
                  if (eco      && option === eco)                         bs.push('eco');
                  if (option.comfort === Math.max(...allOptions.map(o => o.comfort))) bs.push('comfort');
                  return (
                    <TransportCard key={i} option={option} from={from} to={to} badges={bs} />
                  );
                })}
              </div>
            )}

            {/* CO2 comparison bar */}
            {allOptions.filter(o => o.co2).length > 1 && (
              <div className="mt-8 card p-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#10b981' }}>
                  <Leaf size={13} /> Comparaison CO₂ par personne
                </p>
                {allOptions
                  .filter(o => o.co2)
                  .sort((a, b) => a.co2 - b.co2)
                  .map((o, i, arr) => {
                    const pct = (o.co2 / arr[arr.length - 1].co2) * 100;
                    const cfg = MODE_CONFIG[o.mode];
                    return (
                      <div key={i} className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1"><ModeIcon mode={o.mode} size={12} /> {cfg?.label} · {o.operator}</span>
                          <span className="font-bold" style={{ color: co2Color(o.co2) }}>{o.co2}kg</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-700)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: co2Color(o.co2) }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
