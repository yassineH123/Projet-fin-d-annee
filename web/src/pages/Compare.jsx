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

    const userIcon = L.divIcon({
      html: `<div style="position:relative;width:24px;height:24px">
        <div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;opacity:0.2;animation:pulse 1.5s infinite"></div>
        <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>
      </div>`,
      className: '', iconSize: [24,24], iconAnchor: [12,12],
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map)
      .bindPopup('<b>📍 Vous êtes ici</b>').openPopup();

    L.circle([lat, lng], { radius: radius * 1000, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.04, weight: 1.5, dashArray: '6,4' }).addTo(map);

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
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Rayon : <span style={{ color: '#3B82F6', fontWeight: 900 }}>{radius} km</span>
              </label>
              <input type="range" min="5" max="100" step="5" value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3B82F6', marginBottom: 12 }} />

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
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < n ? '#D4890A' : 'var(--border-color)' }} />
      ))}
    </div>
  );
}

function BadgePill({ label, color, icon: Icon }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 99,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: `${color}20`, color, border: `1px solid ${color}40`,
    }}>
      {Icon && <Icon size={11} />} {label}
    </span>
  );
}

function TransportCard({ option, from, to, badges = [] }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = MODE_CONFIG[option.mode] || MODE_CONFIG.covoiturage;

  return (
    <div
      style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--card-bg)', borderTop: `3px solid ${cfg.color}`, transition: 'transform 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {/* Top: mode + badges + price */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <cfg.Icon size={22} style={{ color: cfg.color, flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 14, lineHeight: 1, color: cfg.color }}>{option.operator}</p>
              {option.class && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{option.class}</p>}
              {option.note && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{option.note}</p>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 24, lineHeight: 1, color: cfg.color }}>{option.price} DH</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>/personne</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {badges.includes('cheapest')  && <BadgePill icon={Wallet} label="Le + économique" color="#22c55e" />}
            {badges.includes('fastest')   && <BadgePill icon={Zap}    label="Le + rapide"      color="#2196F3" />}
            {badges.includes('eco')       && <BadgePill icon={Leaf}   label="Le + éco"         color="#10b981" />}
            {badges.includes('comfort')   && <BadgePill icon={Star}   label="Le + confortable" color="#D4890A" />}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {option.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              <Clock size={12} /> {formatDuration(option.duration)}
            </div>
          )}
          {option.co2 != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: co2Color(option.co2) }}>
              <Leaf size={12} /> {option.co2}kg CO₂ · {co2Label(option.co2)}
            </div>
          )}
          {option.comfort > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              Confort <ComfortDots n={option.comfort} />
            </div>
          )}
          {option.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#D4890A' }}>
              <Star size={11} style={{ fill: '#D4890A' }} /> {option.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Departures for trains/buses */}
        {option.departures && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(expanded ? option.departures : option.departures.slice(0, 5)).map(d => (
                <span key={d} style={{
                  fontSize: 12, padding: '2px 8px', borderRadius: 8, fontFamily: 'monospace',
                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                }}>
                  {d}
                </span>
              ))}
              {option.departures.length > 5 && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
                  style={{
                    fontSize: 12, padding: '2px 8px', borderRadius: 8, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
                    color: 'var(--text-muted)', background: 'var(--bg-700)', border: 'none',
                  }}>
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
      <div style={{ padding: '0 16px 16px' }}>
        {option.internal ? (
          <Link to={option.link}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: cfg.color, color: '#fff', textDecoration: 'none', boxSizing: 'border-box',
            }}>
            Voir le trajet <ArrowRight size={15} />
          </Link>
        ) : option.link ? (
          <a href={option.link} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, textDecoration: 'none', boxSizing: 'border-box',
            }}>
            Réserver sur {option.operator.split(' ')[0]} <ExternalLink size={13} />
          </a>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px', borderRadius: 12, fontSize: 14,
            background: 'var(--bg-700)', color: 'var(--text-muted)',
          }}>
            Disponible dans les gares / stations
          </div>
        )}
      </div>
    </div>
  );
}

function SmartRecommendation({ cheapest, fastest, eco }) {
  if (!cheapest && !fastest && !eco) return null;
  return (
    <div style={{ borderRadius: 16, padding: 20, marginBottom: 24, background: 'linear-gradient(135deg,rgba(193,39,45,0.08),rgba(212,137,10,0.08))', border: '1px solid rgba(193,39,45,0.2)' }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, color: '#D4890A' }}>
        <Sparkles size={13} /> Recommandation AtlasWay
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {cheapest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={22} style={{ color: '#22c55e', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Le + économique</p>
              <p style={{ margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <ModeIcon mode={cheapest.mode} size={13} /> {cheapest.operator} · <span style={{ color: '#22c55e' }}>{cheapest.price} DH</span>
              </p>
            </div>
          </div>
        )}
        {fastest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap size={22} style={{ color: '#2196F3', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Le + rapide</p>
              <p style={{ margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <ModeIcon mode={fastest.mode} size={13} /> {fastest.operator} · <span style={{ color: '#2196F3' }}>{formatDuration(fastest.duration)}</span>
              </p>
            </div>
          </div>
        )}
        {eco && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Leaf size={22} style={{ color: '#10b981', flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Le + écologique</p>
              <p style={{ margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
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
    <div style={{ minHeight: '100vh' }}>

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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, padding: 4, borderRadius: 16, background: 'var(--bg-700)' }}>
              <button onClick={() => setMode('all')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: mode === 'all' ? 'var(--card-bg)' : 'transparent',
                  color: mode === 'all' ? '#fff' : 'var(--text-muted)',
                }}>
                <Map size={15} /> Tous
                <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 99, background: '#C1272D', color: '#fff' }}>{allOptions.length}</span>
              </button>
              {Object.entries(MODE_CONFIG).map(([key, cfg]) => (
                modeCounts[key] > 0 && (
                  <button key={key} onClick={() => setMode(key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12,
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      background: mode === key ? cfg.bg : 'transparent',
                      color: mode === key ? cfg.color : 'var(--text-muted)',
                      border: mode === key ? `1px solid ${cfg.border}` : '1px solid transparent',
                    }}>
                    <cfg.Icon size={15} /> {cfg.label}
                    <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 99, background: mode === key ? cfg.color : 'var(--bg-800)', color: mode === key ? '#fff' : 'var(--text-muted)' }}>
                      {modeCounts[key]}
                    </span>
                  </button>
                )
              ))}
            </div>

            {/* Sort bar + view toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Trier :</span>
              {SORT_OPTIONS.map(s => (
                <button key={s.id} onClick={() => setSort(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 12,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: sort === s.id ? 'rgba(193,39,45,0.12)' : 'var(--bg-700)',
                    color: sort === s.id ? '#C1272D' : 'var(--text-muted)',
                    border: sort === s.id ? '1px solid rgba(193,39,45,0.3)' : '1px solid var(--border-color)',
                  }}>
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
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Ban size={40} style={{ color: 'var(--text-muted)' }} /></div>
                  <p style={{ fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Aucune option trouvée pour ce trajet</p>
                  <p style={{ fontSize: 14, marginTop: 4, color: 'var(--text-muted)' }}>Essayez d'autres villes ou un autre mode</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
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
              <div style={{ marginTop: 32, borderRadius: 14, border: '1px solid var(--border-color)', background: 'var(--card-bg)', padding: 20 }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, color: '#10b981' }}>
                  <Leaf size={13} /> Comparaison CO₂ par personne
                </p>
                {allOptions
                  .filter(o => o.co2)
                  .sort((a, b) => a.co2 - b.co2)
                  .map((o, i, arr) => {
                    const pct = (o.co2 / arr[arr.length - 1].co2) * 100;
                    const cfg = MODE_CONFIG[o.mode];
                    return (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ModeIcon mode={o.mode} size={12} /> {cfg?.label} · {o.operator}</span>
                          <span style={{ fontWeight: 700, color: co2Color(o.co2) }}>{o.co2}kg</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-700)' }}>
                          <div style={{ height: '100%', borderRadius: 4, transition: 'width 0.3s', width: `${pct}%`, background: co2Color(o.co2) }} />
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
