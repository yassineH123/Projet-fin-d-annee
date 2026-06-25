import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Navigation, Car, Star, Phone, MessageSquare,
  X, CheckCircle, ChevronDown, Shield, Users, LocateFixed, Loader,
} from 'lucide-react';

/* ─── Data ─── */
const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Tétouan', 'Kénitra',
];

const POPULAR_ADDRESSES = {
  Casablanca: [
    'Gare Casa Voyageurs', 'Morocco Mall, Ain Diab', 'Boulevard Mohammed V',
    'Aéroport CMN', 'Maarif', 'Casa Port', 'Twin Center', 'Ain Sebaa',
    'Hay Hassani', 'Sidi Moumen', 'Anfa', 'Derb Sultan',
  ],
  Rabat: [
    'Gare Rabat Ville', 'Tour Hassan', 'Agdal', 'Hay Riad',
    'Université Mohammed V', 'Médina Rabat', 'Salé Centre', 'Technopolis',
  ],
  Marrakech: [
    'Place Jemaa el-Fna', 'Gueliz', 'Palmeraie', 'Aéroport RAK',
    'Médina Marrakech', 'Hivernage', 'Targa', 'Daoudiate',
  ],
  Fès: [
    'Gare de Fès', 'Médina Fès el Bali', 'Atlas Fès', 'Saïss',
    'Ben Souda', 'Route d\'Imouzzer',
  ],
  Tanger: [
    'Port de Tanger', 'Ibn Battouta', 'Médina Tanger', 'Malabata',
    'Gare Tanger Ville', 'Marchane',
  ],
  Agadir: [
    'Aéroport AGA', 'Agadir Beach', 'Talborjt', 'Hay Mohammadi',
    'Secteur Bensergao', 'Founty',
  ],
  default: ['Centre-ville', 'Gare principale', 'Aéroport', 'Médina', 'Quartier industriel'],
};

const VEHICLE_TYPES = [
  {
    id: 'eco',
    label: 'Économique',
    desc: 'Petit taxi · 1-3 pers.',
    icon: '🚖',
    basePrice: 8,
    perKm: 2.5,
    eta: '3-5 min',
    color: '#D4890A',
    bg: 'rgba(212,137,10,0.10)',
  },
  {
    id: 'confort',
    label: 'Confort',
    desc: 'VTC · 1-4 pers.',
    icon: '🚗',
    basePrice: 14,
    perKm: 4.0,
    eta: '5-8 min',
    color: '#2196F3',
    bg: 'rgba(33,150,243,0.10)',
  },
  {
    id: 'partage',
    label: 'Partagé',
    desc: 'Covoiturage · économique',
    icon: '👥',
    basePrice: 5,
    perKm: 1.5,
    eta: '8-12 min',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.10)',
  },
  {
    id: 'moto',
    label: 'Moto',
    desc: 'Rapide · 1 pers.',
    icon: '🏍️',
    basePrice: 5,
    perKm: 1.8,
    eta: '2-4 min',
    color: '#C1272D',
    bg: 'rgba(193,39,45,0.10)',
  },
];

const MOCK_DRIVERS = [
  { name: 'Youssef B.', rating: 4.9, trips: 1240, car: 'Dacia Logan · Blanc', plate: 'CAS 22-341', phone: '06••••••78', avatar: 'YB', color: '#2196F3', eta: 3 },
  { name: 'Hassan M.',  rating: 4.7, trips:  870, car: 'Hyundai i10 · Rouge', plate: 'RBA 10-112', phone: '07••••••21', avatar: 'HM', color: '#C1272D', eta: 5 },
  { name: 'Amine K.',   rating: 4.8, trips:  530, car: 'Renault Clio · Gris', plate: 'MAR 33-509', phone: '06••••••44', avatar: 'AK', color: '#006233', eta: 4 },
  { name: 'Omar S.',    rating: 4.6, trips: 2100, car: 'Peugeot 301 · Noir',  plate: 'FES 07-888', phone: '07••••••63', avatar: 'OS', color: '#9C27B0', eta: 6 },
];

/* ─── Nominatim city name → our CITIES array ─── */
const CITY_MAP = {
  casablanca: 'Casablanca', 'dar-el-beida': 'Casablanca',
  rabat: 'Rabat', sale: 'Rabat', salé: 'Rabat',
  marrakech: 'Marrakech', marrakesh: 'Marrakech',
  fes: 'Fès', fès: 'Fès', fez: 'Fès',
  tanger: 'Tanger', tangier: 'Tanger', tanja: 'Tanger',
  agadir: 'Agadir',
  meknes: 'Meknès', meknès: 'Meknès',
  oujda: 'Oujda',
  tetouan: 'Tétouan', tétouan: 'Tétouan',
  kenitra: 'Kénitra', kénitra: 'Kénitra',
};

function nominatimCityToOurs(addr) {
  const keys = ['city', 'town', 'village', 'county', 'state_district'];
  for (const k of keys) {
    const val = (addr[k] || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    if (CITY_MAP[val]) return CITY_MAP[val];
  }
  return null;
}

function buildAddressLabel(addr) {
  const parts = [
    addr.road || addr.pedestrian || addr.footway,
    addr.suburb || addr.neighbourhood || addr.quarter,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : addr.display_name?.split(',')[0] || 'Position actuelle';
}

/* ─── Helpers ─── */
function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.9 }} />
      ))}
    </div>
  );
}

// Haversine distance between two addresses using known Moroccan city district coords.
// Falls back to a text-hash estimate if addresses are unrecognized.
const DISTRICT_COORDS = {
  'centre': [0, 0], // placeholder, overridden by city-specific below
  // Casablanca
  'maarif': [33.5900, -7.6322], 'anfa': [33.5956, -7.6589],
  'ain diab': [33.5867, -7.6903], 'sidi belyout': [33.5963, -7.6197],
  'hay hassani': [33.5453, -7.6575], 'bernoussi': [33.6189, -7.5467],
  'derb sultan': [33.5849, -7.6089], 'bourgogne': [33.5972, -7.6364],
  'racine': [33.5919, -7.6458], 'californie': [33.5869, -7.6589],
  // Rabat
  'agdal': [33.9869, -6.8508], 'hay riad': [33.9617, -6.8756],
  'ocean': [34.0131, -6.8392], 'souissi': [33.9789, -6.8222],
  // Marrakech
  'guéliz': [31.6340, -8.0100], 'hivernage': [31.6228, -8.0072],
  'médina': [31.6295, -7.9811], 'mellah': [31.6228, -7.9781],
  // Default city centers
  'casablanca': [33.5731, -7.5898], 'rabat': [34.0209, -6.8416],
  'marrakech': [31.6295, -7.9811], 'fès': [34.0181, -5.0078],
  'tanger': [35.7595, -5.8340], 'agadir': [30.4278, -9.5981],
};

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mockDistance(pickup, dropoff) {
  if (!pickup || !dropoff || pickup === dropoff) return 2.5;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const lookupCoords = (addr) => {
    const n = norm(addr);
    for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
      if (n.includes(key) || key.includes(n)) return coords;
    }
    return null;
  };
  const c1 = lookupCoords(pickup);
  const c2 = lookupCoords(dropoff);
  if (c1 && c2) return Math.round(haversineKm(c1, c2) * 10) / 10 || 2.5;
  // Fallback: deterministic hash
  const seed = [...(pickup + dropoff)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return Math.round((((seed % 18) + 2) * 10)) / 10;
}

function estimatePrice(vehicleType, distanceKm) {
  const v = VEHICLE_TYPES.find(v => v.id === vehicleType);
  if (!v) return 0;
  return Math.round(v.basePrice + v.perKm * distanceKm);
}

/* ─── Address input with autocomplete ─── */
function AddressInput({ label, value, onChange, icon: Icon, iconColor, city, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const suggestions = (POPULAR_ADDRESSES[city] || POPULAR_ADDRESSES.default).filter(a =>
    !value || a.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: iconColor, pointerEvents: 'none' }} />
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '11px 12px 11px 32px', borderRadius: 10, fontSize: 13,
            background: 'var(--bg-700)', border: '1.5px solid var(--border-color)',
            color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
          }}
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(false); }}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <X size={12} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'var(--card-bg)', border: '1px solid var(--border-color)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', marginTop: 4, overflow: 'hidden',
        }}>
          {suggestions.slice(0, 6).map(s => (
            <button key={s}
              onMouseDown={() => { onChange(s); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: '1px solid var(--border-color)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <MapPin size={11} style={{ color: iconColor, flexShrink: 0 }} />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Matching animation ─── */
function MatchingScreen({ onCancel, vehicleType, pickup, dropoff, price }) {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 500);
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { clearInterval(d); clearInterval(t); };
  }, []);

  const v = VEHICLE_TYPES.find(v => v.id === vehicleType);

  return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      {/* Pulsing radar */}
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${v?.color || '#C1272D'}`,
            animation: `ping 1.5s ${i * 0.5}s infinite`,
            opacity: 0,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          background: v?.bg || 'rgba(193,39,45,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>
          {v?.icon || '🚗'}
        </div>
      </div>

      <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
        Recherche d'un conducteur{dots}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
        {pickup} → {dropoff}
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: v?.color || '#C1272D', marginBottom: 24 }}>
        Estimation : {price} DH · {v?.label}
      </p>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
        Temps d'attente : {elapsed}s
      </div>

      <button onClick={onCancel}
        style={{
          padding: '10px 24px', borderRadius: 10, border: '1px solid var(--border-color)',
          background: 'var(--bg-700)', color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: 13, fontWeight: 700,
        }}>
        Annuler la demande
      </button>

      <style>{`
        @keyframes ping {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Driver found card ─── */
function DriverFoundCard({ driver, vehicleType, price, pickup, dropoff, onAccept, onDecline }) {
  const v = VEHICLE_TYPES.find(v => v.id === vehicleType);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const t = setInterval(() => setCountdown(p => {
      if (p <= 1) { clearInterval(t); onDecline(); }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 4 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 28 }}>🎉</span>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#22C55E', marginTop: 6 }}>Conducteur trouvé !</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acceptez dans {countdown}s</p>
        <div style={{ width: `${(countdown / 15) * 100}%`, height: 3, background: '#22C55E', borderRadius: 2, marginTop: 6, transition: 'width 1s linear' }} />
      </div>

      {/* Driver card */}
      <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-700)', border: '1px solid var(--border-color)', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: driver.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {driver.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{driver.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Star size={11} style={{ color: '#D4890A', fill: '#D4890A' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#D4890A' }}>{driver.rating}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {driver.trips} courses</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Phone size={14} style={{ color: '#22C55E' }} />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MessageSquare size={14} style={{ color: '#2196F3' }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>VÉHICULE</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{driver.car}</p>
          </div>
          <div style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>PLAQUE</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: 2 }}>{driver.plate}</p>
          </div>
          <div style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>ARRIVÉE</p>
            <p style={{ fontSize: 13, fontWeight: 900, color: '#22C55E', marginTop: 2 }}>~{driver.eta} min</p>
          </div>
        </div>
      </div>

      {/* Ride summary */}
      <div style={{ padding: '10px 14px', borderRadius: 10, background: v?.bg, border: `1px solid ${v?.color}30`, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {v?.icon} {v?.label} · {pickup} → {dropoff}
        </div>
        <span style={{ fontSize: 16, fontWeight: 900, color: v?.color }}>{price} DH</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onDecline}
          style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-700)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
          Refuser
        </button>
        <button onClick={onAccept}
          style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 900, boxShadow: '0 4px 14px rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <CheckCircle size={16} /> Accepter la course
        </button>
      </div>
    </div>
  );
}

/* ─── Active ride screen ─── */
function ActiveRideScreen({ driver, vehicleType, pickup, dropoff, price, onComplete }) {
  const v = VEHICLE_TYPES.find(v => v.id === vehicleType);
  const [phase, setPhase] = useState('arriving'); // arriving → onboard → arrived
  const [seconds, setSeconds] = useState(driver.eta * 60);

  useEffect(() => {
    const t = setInterval(() => setSeconds(p => {
      if (p <= 1) {
        clearInterval(t);
        setPhase(ph => ph === 'arriving' ? 'onboard' : 'arrived');
        return 120; // reset for ride duration
      }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const formatTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const phases = {
    arriving: { label: `Conducteur en route (${formatTime(seconds)})`, color: '#D4890A', icon: '🚗', desc: `${driver.name} arrive dans environ ${Math.ceil(seconds/60)} min` },
    onboard:  { label: 'En course', color: '#2196F3', icon: '🛣️', desc: `Direction ${dropoff} · ${formatTime(seconds)} estimé` },
    arrived:  { label: 'Arrivée !', color: '#22C55E', icon: '✅', desc: `Vous êtes arrivé à ${dropoff}` },
  };

  const current = phases[phase];

  return (
    <div>
      {/* Status */}
      <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{current.icon}</div>
        <p style={{ fontSize: 17, fontWeight: 900, color: current.color }}>{current.label}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{current.desc}</p>
      </div>

      {/* Animated road */}
      <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-700)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          height: '100%', borderRadius: 4,
          background: `linear-gradient(90deg, ${current.color}, ${current.color}88)`,
          width: phase === 'arriving' ? `${100 - (seconds / (driver.eta * 60)) * 100}%` : phase === 'onboard' ? `${100 - (seconds / 120) * 100}%` : '100%',
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Driver mini-card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-700)', border: '1px solid var(--border-color)', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: driver.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
          {driver.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{driver.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.car} · {driver.plate}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Phone size={13} style={{ color: '#22C55E' }} />
          </button>
          <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MessageSquare size={13} style={{ color: '#2196F3' }} />
          </button>
        </div>
      </div>

      {/* Route */}
      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C1272D', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{pickup}</span>
        </div>
        <div style={{ width: 1, height: 16, background: 'var(--border-color)', marginLeft: 3.5, marginBottom: 8 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#006233', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{dropoff}</span>
        </div>
      </div>

      {/* Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: v?.bg, border: `1px solid ${v?.color}30`, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v?.icon} {v?.label} · {price} DH</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Paiement à l'arrivée</span>
      </div>

      {/* Safety link */}
      <Link to={`/track/city-${Date.now()}`}
        style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 12, color: '#C1272D', textDecoration: 'none', marginBottom: 16, fontWeight: 700 }}>
        <Shield size={13} /> Partager ma position avec un proche
      </Link>

      {phase === 'arrived' && (
        <button onClick={onComplete}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C1272D, #a01f24)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 900, boxShadow: '0 4px 14px rgba(193,39,45,0.3)' }}>
          Terminer et noter le conducteur
        </button>
      )}
    </div>
  );
}

/* ─── Rating screen ─── */
function RatingScreen({ driver, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState([]);
  const TAGS = ['Ponctuel', 'Conduite douce', 'Véhicule propre', 'Sympa', 'Route directe'];

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: driver.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 auto 12px' }}>
        {driver.avatar}
      </div>
      <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>Comment était {driver.name} ?</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Votre avis aide la communauté AtlasWay</p>

      {/* Stars */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, filter: s <= (hovered || rating) ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'all .1s', transform: s <= (hovered || rating) ? 'scale(1.15)' : 'scale(1)' }}>
            ⭐
          </button>
        ))}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {TAGS.map(t => (
          <button key={t} onClick={() => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
            style={{
              padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1.5px solid ${tags.includes(t) ? '#C1272D' : 'var(--border-color)'}`,
              background: tags.includes(t) ? 'rgba(193,39,45,0.10)' : 'var(--bg-700)',
              color: tags.includes(t) ? '#C1272D' : 'var(--text-muted)',
            }}>
            {t}
          </button>
        ))}
      </div>

      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Un commentaire ? (optionnel)"
        rows={2}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, resize: 'none', background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

      <button onClick={onDone} disabled={rating === 0}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: rating > 0 ? 'pointer' : 'not-allowed',
          background: rating > 0 ? 'linear-gradient(135deg, #C1272D, #a01f24)' : 'var(--bg-700)',
          color: rating > 0 ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 900,
        }}>
        Envoyer l'avis
      </button>
    </div>
  );
}

/* ─── Main page ─── */
export default function CityRide() {
  const [city,        setCity]        = useState('Casablanca');
  const [pickup,      setPickup]      = useState('');
  const [dropoff,     setDropoff]     = useState('');
  const [vehicleType, setVehicleType] = useState('eco');
  const [screen,      setScreen]      = useState('form');
  const [driver,      setDriver]      = useState(null);
  const [cityOpen,    setCityOpen]    = useState(false);
  const [geoState,    setGeoState]    = useState('idle'); // idle | loading | success | error | denied
  const [geoCoords,   setGeoCoords]   = useState(null);  // { lat, lon }

  const dist  = mockDistance(pickup, dropoff);
  const price = estimatePrice(vehicleType, dist);
  const v     = VEHICLE_TYPES.find(v => v.id === vehicleType);

  async function handleGeoLocate() {
    if (!navigator.geolocation) {
      setGeoState('error');
      return;
    }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setGeoCoords({ lat, lon });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
            { headers: { 'Accept-Language': 'fr' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const label = buildAddressLabel({ ...addr, display_name: data.display_name });
          const detectedCity = nominatimCityToOurs(addr);
          setPickup(label);
          if (detectedCity) setCity(detectedCity);
          setGeoState('success');
        } catch {
          // Geocoding failed — use coordinates as fallback label
          setPickup(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          setGeoState('success');
        }
      },
      (err) => {
        setGeoState(err.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSearch() {
    if (!pickup.trim() || !dropoff.trim()) return;
    setScreen('matching');
    setTimeout(() => {
      const d = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
      setDriver(d);
      setScreen('found');
    }, 3000 + Math.random() * 2000);
  }

  function reset() {
    setScreen('form');
    setDriver(null);
    setPickup('');
    setDropoff('');
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 16 }}>
        <ZelligeStripe />
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🏙️</span>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>AtlasWay City</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Course en ville · Économique · Confort · Partagé · Moto
          </p>
        </div>
      </div>

      {/* ── Content card ── */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px 16px' }}>

        {/* ── Form ── */}
        {screen === 'form' && (
          <>
            {/* City selector */}
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Ville</label>
              <button onClick={() => setCityOpen(!cityOpen)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)',
                  fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                <span>📍 {city}</span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: cityOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {cityOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginTop: 4, overflow: 'hidden' }}>
                  {CITIES.map(c => (
                    <button key={c} onClick={() => { setCity(c); setCityOpen(false); setPickup(''); setDropoff(''); }}
                      style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: c === city ? 'rgba(193,39,45,0.08)' : 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13, fontWeight: c === city ? 800 : 400, color: c === city ? '#C1272D' : 'var(--text-primary)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS button */}
            <button
              onClick={handleGeoLocate}
              disabled={geoState === 'loading'}
              style={{
                width: '100%', marginBottom: 12, padding: '10px 14px', borderRadius: 10, cursor: geoState === 'loading' ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                border: `1.5px solid ${geoState === 'success' ? 'rgba(34,197,94,0.4)' : geoState === 'denied' || geoState === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(33,150,243,0.35)'}`,
                background: geoState === 'success' ? 'rgba(34,197,94,0.07)' : geoState === 'denied' || geoState === 'error' ? 'rgba(239,68,68,0.07)' : 'rgba(33,150,243,0.07)',
                transition: 'all .2s',
              }}>
              {geoState === 'loading'
                ? <Loader size={14} style={{ color: '#2196F3', animation: 'spin 1s linear infinite' }} />
                : geoState === 'success'
                ? <LocateFixed size={14} style={{ color: '#22C55E' }} />
                : geoState === 'denied'
                ? <LocateFixed size={14} style={{ color: '#EF4444' }} />
                : <LocateFixed size={14} style={{ color: '#2196F3' }} />
              }
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: geoState === 'success' ? '#22C55E' : geoState === 'denied' || geoState === 'error' ? '#EF4444' : '#2196F3',
              }}>
                {geoState === 'loading' ? 'Localisation en cours...'
                  : geoState === 'success' ? 'Position détectée ✓'
                  : geoState === 'denied' ? 'Accès refusé — vérifiez vos permissions'
                  : geoState === 'error'  ? 'Erreur GPS — réessayer'
                  : '📍 Utiliser ma position actuelle'}
              </span>
              {geoCoords && geoState === 'success' && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'monospace' }}>
                  {geoCoords.lat.toFixed(4)}, {geoCoords.lon.toFixed(4)}
                </span>
              )}
            </button>

            {/* Denied hint */}
            {geoState === 'denied' && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 10, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                Activez la géolocalisation dans les paramètres de votre navigateur pour utiliser cette fonctionnalité.
              </div>
            )}

            {/* Pickup + Dropoff */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <AddressInput label="Point de départ" value={pickup} onChange={setPickup} icon={Navigation} iconColor="#C1272D" city={city} placeholder="Votre position actuelle" />
              <div style={{ position: 'relative', paddingLeft: 16 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  {[...Array(4)].map((_, i) => <div key={i} style={{ width: 1.5, height: 4, background: 'var(--border-color)', borderRadius: 2 }} />)}
                </div>
                <AddressInput label="Destination" value={dropoff} onChange={setDropoff} icon={MapPin} iconColor="#006233" city={city} placeholder="Où allez-vous ?" />
              </div>
            </div>

            {/* Distance estimate */}
            {pickup && dropoff && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(33,150,243,0.06)', border: '1px solid rgba(33,150,243,0.15)', marginBottom: 14, display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>📏 ~{dist} km</span>
                <span>⏱ ~{Math.ceil(dist * 3)} min</span>
                <span>🌿 {(dist * 0.12).toFixed(1)} kg CO₂</span>
              </div>
            )}

            {/* Vehicle type */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Type de course</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {VEHICLE_TYPES.map(vt => (
                  <button key={vt.id} onClick={() => setVehicleType(vt.id)}
                    style={{
                      padding: '10px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      border: `2px solid ${vehicleType === vt.id ? vt.color : 'var(--border-color)'}`,
                      background: vehicleType === vt.id ? vt.bg : 'var(--bg-700)',
                      transition: 'all .15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 18 }}>{vt.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: vehicleType === vt.id ? vt.color : 'var(--text-muted)' }}>
                        {pickup && dropoff ? `${estimatePrice(vt.id, dist)} DH` : '– DH'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: vehicleType === vt.id ? vt.color : 'var(--text-primary)' }}>{vt.label}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{vt.desc} · {vt.eta}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleSearch} disabled={!pickup || !dropoff}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                cursor: pickup && dropoff ? 'pointer' : 'not-allowed',
                background: pickup && dropoff ? 'linear-gradient(135deg, #C1272D, #a01f24)' : 'var(--bg-700)',
                color: pickup && dropoff ? '#fff' : 'var(--text-muted)',
                fontSize: 15, fontWeight: 900, boxShadow: pickup && dropoff ? '0 4px 16px rgba(193,39,45,0.35)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {v?.icon} Commander une course
              {pickup && dropoff && <span style={{ fontSize: 13, opacity: 0.85 }}>· {price} DH</span>}
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
              {[
                { icon: <Shield size={11} />, label: 'Conducteurs vérifiés' },
                { icon: <Star size={11} style={{ fill: '#D4890A', color: '#D4890A' }} />, label: 'Notés par la communauté' },
                { icon: <Users size={11} />, label: 'Paiement à l\'arrivée' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Matching ── */}
        {screen === 'matching' && (
          <MatchingScreen onCancel={reset} vehicleType={vehicleType} pickup={pickup} dropoff={dropoff} price={price} />
        )}

        {/* ── Driver found ── */}
        {screen === 'found' && driver && (
          <DriverFoundCard
            driver={driver} vehicleType={vehicleType} price={price} pickup={pickup} dropoff={dropoff}
            onAccept={() => setScreen('active')}
            onDecline={() => setScreen('matching')}
          />
        )}

        {/* ── Active ride ── */}
        {screen === 'active' && driver && (
          <ActiveRideScreen
            driver={driver} vehicleType={vehicleType} pickup={pickup} dropoff={dropoff} price={price}
            onComplete={() => setScreen('rating')}
          />
        )}

        {/* ── Rating ── */}
        {screen === 'rating' && driver && (
          <RatingScreen driver={driver} onDone={() => setScreen('done')} />
        )}

        {/* ── Done ── */}
        {screen === 'done' && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎊</div>
            <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>Merci d'avoir utilisé AtlasWay City !</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Votre avis a été envoyé.</p>
            <button onClick={reset}
              style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C1272D, #a01f24)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 900, boxShadow: '0 4px 14px rgba(193,39,45,0.3)' }}>
              Nouvelle course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
