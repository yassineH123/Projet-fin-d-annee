import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, ArrowRight, Clock, Leaf, Star, Users, Zap,
  TrendingDown, ArrowLeftRight, ExternalLink, ChevronDown, ChevronUp,
  Plane, Train, Bus, Car, Bike, ArrowUpDown,
  Map, Sparkles, Wallet, Ban, List, Navigation, Locate, X
} from 'lucide-react';
const RouteMap = lazy(() => import('../components/RouteMap'));
import {
  ONCF, CTM_ROUTES, GRAND_TAXI, FLIGHTS,
  findRoutes, formatDuration, co2Color, co2Label
} from '../data/transportData';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune','Kénitra','Chefchaouen','Essaouira','Dakhla','Al Hoceima','Nador'];

/* ── Toutes les gares et stations du Maroc ── */
const MOROCCO_STATIONS = [
  // ONCF — Trains
  { type: 'train', name: 'Casa Voyageurs',      city: 'Casablanca', lat: 33.5892, lng: -7.5903, line: 'ONCF' },
  { type: 'train', name: 'Casa Port',            city: 'Casablanca', lat: 33.5967, lng: -7.6183, line: 'ONCF' },
  { type: 'train', name: 'Casa Aïn Sebaâ',       city: 'Casablanca', lat: 33.6122, lng: -7.5331, line: 'ONCF' },
  { type: 'train', name: 'Mohammedia',           city: 'Mohammedia',  lat: 33.6886, lng: -7.3829, line: 'ONCF' },
  { type: 'train', name: 'Rabat Ville',          city: 'Rabat',       lat: 34.0175, lng: -6.8428, line: 'ONCF' },
  { type: 'train', name: 'Rabat Agdal',          city: 'Rabat',       lat: 33.9924, lng: -6.8608, line: 'ONCF' },
  { type: 'train', name: 'Salé Tabriquet',       city: 'Salé',        lat: 34.0379, lng: -6.8019, line: 'ONCF' },
  { type: 'train', name: 'Kénitra',              city: 'Kénitra',     lat: 34.2551, lng: -6.5756, line: 'ONCF' },
  { type: 'train', name: 'Meknès',               city: 'Meknès',      lat: 33.8945, lng: -5.5473, line: 'ONCF' },
  { type: 'train', name: 'Fès',                  city: 'Fès',         lat: 34.0300, lng: -5.0004, line: 'ONCF' },
  { type: 'train', name: 'Tanger Ville',         city: 'Tanger',      lat: 35.7593, lng: -5.8309, line: 'ONCF' },
  { type: 'train', name: 'Tanger Med',           city: 'Tanger',      lat: 35.8816, lng: -5.5015, line: 'ONCF' },
  { type: 'train', name: 'Marrakech',            city: 'Marrakech',   lat: 31.6257, lng: -8.0109, line: 'ONCF' },
  { type: 'train', name: 'Settat',               city: 'Settat',      lat: 33.0014, lng: -7.6266, line: 'ONCF' },
  { type: 'train', name: 'El Jadida',            city: 'El Jadida',   lat: 33.2388, lng: -8.5083, line: 'ONCF' },
  { type: 'train', name: 'Oujda',                city: 'Oujda',       lat: 34.6830, lng: -1.9030, line: 'ONCF' },
  { type: 'train', name: 'Nador',                city: 'Nador',       lat: 35.1640, lng: -2.9285, line: 'ONCF' },
  { type: 'train', name: 'Taourirt',             city: 'Taourirt',    lat: 34.4076, lng: -2.8933, line: 'ONCF' },
  // CTM — Bus
  { type: 'bus',   name: 'Gare CTM Casablanca',  city: 'Casablanca', lat: 33.5836, lng: -7.6099, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Rabat',        city: 'Rabat',      lat: 34.0191, lng: -6.8283, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Marrakech',    city: 'Marrakech',  lat: 31.6335, lng: -8.0097, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Fès',          city: 'Fès',        lat: 34.0442, lng: -5.0019, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Tanger',       city: 'Tanger',     lat: 35.7710, lng: -5.7987, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Agadir',       city: 'Agadir',     lat: 30.4221, lng: -9.5978, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Meknès',       city: 'Meknès',     lat: 33.8979, lng: -5.5411, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Oujda',        city: 'Oujda',      lat: 34.6892, lng: -1.9078, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Tétouan',      city: 'Tétouan',    lat: 35.5741, lng: -5.3697, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Laâyoune',     city: 'Laâyoune',   lat: 27.1495, lng: -13.1878, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Dakhla',       city: 'Dakhla',     lat: 23.7148, lng: -15.9356, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Essaouira',    city: 'Essaouira',  lat: 31.5142, lng: -9.7704, line: 'CTM' },
  { type: 'bus',   name: 'Gare CTM Safi',         city: 'Safi',       lat: 32.2994, lng: -9.2378, line: 'CTM' },
  { type: 'bus',   name: 'Gare Supratours Agadir',city: 'Agadir',     lat: 30.4283, lng: -9.5887, line: 'Supratours' },
  { type: 'bus',   name: 'Gare Supratours Marrakech', city: 'Marrakech', lat: 31.6245, lng: -8.0118, line: 'Supratours' },
];

/* ── Haversine distance (km) ── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ── Composant Carte "Autour de moi" ── */
function NearbyStationsMap({ onClose }) {
  const mapRef  = useRef(null);
  const instRef = useRef(null);
  const [locating,  setLocating]  = useState(false);
  const [located,   setLocated]   = useState(false);
  const [error,     setError]     = useState(null);
  const [userPos,   setUserPos]   = useState(null);
  const [nearby,    setNearby]    = useState([]);
  const [filter,    setFilter]    = useState('all'); // 'all' | 'train' | 'bus'
  const [radius,    setRadius]    = useState(30);    // km

  const locate = () => {
    if (!navigator.geolocation) { setError('Géolocalisation non supportée par ce navigateur.'); return; }
    setLocating(true); setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos([lat, lng]);
        const found = MOROCCO_STATIONS
          .map(s => ({ ...s, dist: haversine(lat, lng, s.lat, s.lng) }))
          .filter(s => s.dist <= radius)
          .sort((a, b) => a.dist - b.dist);
        setNearby(found);
        setLocating(false);
        setLocated(true);
        await initMap(lat, lng, found);
      },
      () => { setError('Accès à la position refusé. Autorisez la géolocalisation dans votre navigateur.'); setLocating(false); }
    );
  };

  const initMap = async (lat, lng, stations) => {
    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');

    if (instRef.current) { instRef.current.remove(); instRef.current = null; }
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
    instRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

    // Marker utilisateur
    const userIcon = L.divIcon({
      html: `<div style="position:relative;width:24px;height:24px">
        <div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;opacity:0.2;animation:pulse 1.5s infinite"></div>
        <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>
      </div>`,
      className: '', iconSize: [24,24], iconAnchor: [12,12],
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map)
      .bindPopup('<b>📍 Vous êtes ici</b>').openPopup();

    // Cercle de rayon
    L.circle([lat, lng], { radius: radius * 1000, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.04, weight: 1.5, dashArray: '6,4' }).addTo(map);

    // Markers stations
    stations.forEach(s => {
      const color   = s.type === 'train' ? '#2196F3' : '#FF9800';
      const emoji   = s.type === 'train' ? '🚆' : '🚌';
      const icon = L.divIcon({
        html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px">${emoji}</div>`,
        className: '', iconSize: [30,30], iconAnchor: [15,15],
      });
      L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${s.name}</b><br>${s.line}<br><span style="color:#666">${s.dist.toFixed(1)} km de vous</span>`);
    });

    const allPoints = [[lat, lng], ...stations.map(s => [s.lat, s.lng])];
    if (allPoints.length > 1) map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    else map.setView([lat, lng], 12);
  };

  useEffect(() => () => { instRef.current?.remove(); }, []);

  const displayed = nearby.filter(s => filter === 'all' || s.type === filter);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--card-bg)', borderRadius: 20, width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Locate size={18} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B82F6' }}>✦ Géolocalisation</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Stations près de moi</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

          {/* Sidebar résultats */}
          <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
              {/* Rayon */}
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Rayon : <span style={{ color: '#3B82F6', fontWeight: 900 }}>{radius} km</span>
              </label>
              <input type="range" min="5" max="100" step="5" value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3B82F6', marginBottom: 12 }} />

              {/* Filtres */}
              <div style={{ display: 'flex', gap: 5 }}>
                {[{ id: 'all', label: 'Tous', emoji: '🗺️' }, { id: 'train', label: 'Train', emoji: '🚆' }, { id: 'bus', label: 'Bus', emoji: '🚌' }].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} style={{
                    flex: 1, padding: '5px 4px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                    cursor: 'pointer', border: '1px solid',
                    borderColor: filter === f.id ? '#3B82F6' : 'var(--border-color)',
                    background: filter === f.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-700)',
                    color: filter === f.id ? '#3B82F6' : 'var(--text-muted)',
                  }}>{f.emoji} {f.label}</button>
                ))}
              </div>
            </div>

            {!located ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Navigation size={28} style={{ color: '#3B82F6' }} />
                </div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Activez votre position</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                  Trouvez toutes les gares et stations dans un rayon de {radius} km autour de vous
                </p>
                {error && <p style={{ fontSize: 11, color: '#F87171', marginBottom: 12, background: 'rgba(248,113,113,0.08)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>{error}</p>}
                <button onClick={locate} disabled={locating} style={{
                  width: '100%', padding: '11px', borderRadius: 12, border: 'none',
                  background: locating ? 'var(--bg-700)' : 'linear-gradient(135deg, #3B82F6, #1d4ed8)',
                  color: locating ? 'var(--text-muted)' : '#fff', fontWeight: 700, fontSize: 13,
                  cursor: locating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  boxShadow: locating ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
                }}>
                  {locating ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 14 }}>⟳</span> Localisation…</> : <><Locate size={15} /> Me localiser</>}
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', background: 'rgba(59,130,246,0.04)' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#3B82F6' }}>
                    {displayed.length} station{displayed.length !== 1 ? 's' : ''} trouvée{displayed.length !== 1 ? 's' : ''}
                    {nearby.length !== displayed.length && <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}> (filtrées)</span>}
                  </p>
                  <button onClick={locate} style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Locate size={10} /> Actualiser ma position
                  </button>
                </div>
                {displayed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                    Aucune station dans ce rayon.<br />Augmentez le rayon de recherche.
                  </div>
                ) : displayed.map((s, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'default' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: s.type === 'train' ? 'rgba(33,150,243,0.1)' : 'rgba(255,152,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {s.type === 'train' ? '🚆' : '🚌'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{s.line} · {s.city}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: s.dist < 5 ? '#22C55E' : s.dist < 15 ? '#F59E0B' : 'var(--text-muted)' }}>{s.dist.toFixed(1)}</p>
                      <p style={{ margin: 0, fontSize: 9, color: 'var(--text-muted)' }}>km</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carte */}
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />
            {!located && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-800)', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 40 }}>🗺️</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>La carte apparaîtra ici</p>
                <button onClick={locate} disabled={locating} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#3B82F6', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Locate size={15} /> {locating ? 'Localisation…' : 'Me localiser'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.6);opacity:.06}}`}</style>
    </div>
  );
}

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
  const [view,  setView]  = useState('list'); // 'list' | 'map'
  const [searched, setSearched] = useState(false);
  const [showNearby, setShowNearby] = useState(false);

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

      {/* ── MODAL STATIONS PRÈS DE MOI ── */}
      {showNearby && <NearbyStationsMap onClose={() => setShowNearby(false)} />}

      {/* ── HEADER SEARCH ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          {/* Zellige stripe */}
          <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} style={{ flex: 1, background: i % 3 === 0 ? '#C1272D' : i % 3 === 1 ? '#D4890A' : '#006233', opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg, rgba(193,39,45,0.04) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Map size={20} style={{ color: '#C1272D' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Comparateur de transport</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                {searched && from && to && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{from}</span>
                    <div style={{ width: 40, height: 2, background: 'linear-gradient(to right, #C1272D, #D4890A, #006233)', borderRadius: 1 }} />
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{to}</span>
                  </div>
                )}
                <button type="button" onClick={() => setShowNearby(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #3B82F6, #1d4ed8)', color: '#fff',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.35)', flexShrink: 0,
                }}>
                  <Locate size={14} /> Stations près de moi
                </button>
              </div>
            </div>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#006233' }} />
                  <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ville de départ"
                    className="input" style={{ paddingLeft: 28, fontSize: 14, height: 44 }} list="cmp-from" />
                  <datalist id="cmp-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div style={{ position: 'relative' }}>
                  <button type="button" onClick={swap} style={{ position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 28, height: 28, borderRadius: '50%', background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C1272D', padding: 0 }}>
                    <ArrowLeftRight size={12} />
                  </button>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#C1272D' }} />
                  <input value={to} onChange={e => setTo(e.target.value)} placeholder="Ville d'arrivée"
                    className="input" style={{ paddingLeft: 28, fontSize: 14, height: 44 }} list="cmp-to" />
                  <datalist id="cmp-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="input" style={{ fontSize: 14, height: 44 }} min={new Date().toISOString().split('T')[0]} />
                <button type="submit" className="btn-primary" style={{ height: 44, paddingInline: 20, display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  Comparer <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 48px' }}>

        {!searched ? (
          /* Landing state */
          <div style={{ paddingTop: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
              {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{
                  padding: '18px 16px', borderRadius: 16, textAlign: 'center',
                  background: 'var(--card-bg)', border: `1px solid ${cfg.border}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = cfg.bg; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${cfg.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <cfg.Icon size={22} style={{ color: cfg.color }} />
                  </div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{cfg.label}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16 }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🗺️</p>
              <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>Entrez votre trajet ci-dessus</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Comparez prix, durée et CO₂ pour chaque moyen de transport</p>
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

            {/* Sort bar + view toggle */}
            <div className="flex items-center gap-2 mb-5" style={{ flexWrap: 'wrap' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Trier :</span>
              {SORT_OPTIONS.map(s => (
                <button key={s.id} onClick={() => setSort(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: sort === s.id ? 'rgba(193,39,45,0.12)' : 'var(--bg-700)', color: sort === s.id ? '#C1272D' : 'var(--text-muted)', border: sort === s.id ? '1px solid rgba(193,39,45,0.3)' : '1px solid var(--border-color)' }}>
                  <s.icon size={12} /> {s.label}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--bg-700)', borderRadius: 10, padding: 3 }}>
                {[{ id: 'list', Icon: List, label: 'Liste' }, { id: 'map', Icon: Map, label: 'Carte' }].map(({ id, Icon, label }) => (
                  <button key={id} onClick={() => setView(id)} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: view === id ? 'var(--card-bg)' : 'transparent',
                    color: view === id ? '#C1272D' : 'var(--text-muted)',
                    boxShadow: view === id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAP VIEW */}
            {view === 'map' && (
              <div style={{ marginBottom: 16 }}>
                <Suspense fallback={<div style={{ height: 340, borderRadius: 14, background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Chargement de la carte…</div>}>
                  <RouteMap from={from} to={to} height={340} />
                </Suspense>
                {filtered.length > 0 && (
                  <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{from} → {to}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} option{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}</p>
                    </div>
                    {cheapest && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>À partir de</p>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#22C55E' }}>{cheapest.price} DH</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cards — masquées en vue carte */}
            {view === 'list' && (
              loadingRides && rides.length === 0 ? (
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
              )
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
