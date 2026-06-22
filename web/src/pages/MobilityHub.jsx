import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin, Clock, Leaf, Zap, Train, Bus, Car, Plane, ArrowRight,
  ArrowLeftRight, ExternalLink, CheckCircle, Search, Globe,
} from 'lucide-react';
import {
  ONCF, CTM_ROUTES, GRAND_TAXI, FLIGHTS, findRoutes, formatDuration, co2Color, buildDeepLink,
  nextDeparture, simulatedSeats,
} from '../data/transportData';

/* ─── Config modes ─── */
const MODE = {
  covoiturage: { label: 'Covoiturage', Icon: Car,   color: '#C1272D', bg: 'rgba(193,39,45,0.12)'  },
  train:       { label: 'Train ONCF',  Icon: Train, color: '#2196F3', bg: 'rgba(33,150,243,0.10)' },
  bus:         { label: 'Bus CTM',     Icon: Bus,   color: '#FF9800', bg: 'rgba(255,152,0,0.10)'  },
  grandtaxi:   { label: 'Grand Taxi',  Icon: Car,   color: '#9C27B0', bg: 'rgba(156,39,176,0.10)' },
  avion:       { label: 'Avion',       Icon: Plane, color: '#00BCD4', bg: 'rgba(0,188,212,0.10)'  },
};

/* ─── Hub cities used as connection points ─── */
const HUBS = ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Oujda', 'Meknès'];

const CITIES = [
  'Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda',
  'Tétouan','Laâyoune','Essaouira','El Jadida','Kénitra','Chefchaouen',
  'Al Hoceima','Nador','Dakhla','Béni Mellal',
];

/* ─── Normalize ─── */
function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/* ─── Find a direct option for a given mode ─── */
function directOption(from, to, mode) {
  const datasets = { train: ONCF, bus: CTM_ROUTES, grandtaxi: GRAND_TAXI, avion: FLIGHTS };
  if (mode === 'covoiturage') return null;
  const results = findRoutes(datasets[mode] || [], from, to);
  if (!results.length) return null;
  const r = results[0];
  return {
    mode,
    operator: r.operator || (r.operators ? r.operators.join(' / ') : ''),
    class: r.class,
    price: r.price ?? r.pricePerPerson ?? r.priceFrom,
    duration: r.duration,
    co2: r.co2,
    comfort: r.comfort,
    departures: r.departures || [],
    bookingUrl: r.bookingUrl,
  };
}

/* ─── Build all single-mode direct itineraries ─── */
function buildDirectItineraries(from, to) {
  const results = [];
  const modes = ['train', 'bus', 'grandtaxi', 'avion'];
  for (const mode of modes) {
    const opt = directOption(from, to, mode);
    if (opt) {
      results.push({
        id: `direct-${mode}`,
        legs: [{ from, to, ...opt }],
        totalPrice:    opt.price,
        totalDuration: opt.duration,
        totalCo2:      opt.co2,
        type: 'direct',
      });
    }
  }
  return results;
}

/* ─── Build multi-modal itineraries via hub cities ─── */
function buildConnectionItineraries(from, to) {
  const results = [];
  const modePairs = [
    ['train', 'train'],
    ['train', 'bus'],
    ['bus',   'train'],
    ['bus',   'bus'],
    ['train', 'grandtaxi'],
    ['grandtaxi', 'train'],
  ];

  for (const hub of HUBS) {
    if (norm(hub) === norm(from) || norm(hub) === norm(to)) continue;

    for (const [m1, m2] of modePairs) {
      const leg1 = directOption(from, hub, m1);
      const leg2 = directOption(hub, to, m2);
      if (!leg1 || !leg2) continue;

      const layover = 30; // min de correspondance estimée
      results.push({
        id: `conn-${from}-${hub}-${to}-${m1}-${m2}`,
        legs: [
          { from, to: hub, ...leg1 },
          { from: hub, to, ...leg2 },
        ],
        hub,
        totalPrice:    leg1.price + leg2.price,
        totalDuration: leg1.duration + layover + leg2.duration,
        totalCo2:      (leg1.co2 || 0) + (leg2.co2 || 0),
        type: 'connection',
      });
    }
  }

  // Deduplicate by hub+mode combo, keep cheapest
  const seen = new Map();
  for (const r of results) {
    const key = `${r.hub}-${r.legs[0].mode}-${r.legs[1].mode}`;
    if (!seen.has(key) || seen.get(key).totalPrice > r.totalPrice) {
      seen.set(key, r);
    }
  }
  return [...seen.values()];
}

/* ─── Last-mile suggestion: after train, suggest carpooling ─── */
function lastMileSuggestion(to) {
  return {
    id: `lastmile-${to}`,
    type: 'lastmile',
    city: to,
    message: `Des conducteurs AtlasWay partent régulièrement depuis la gare de ${to}`,
    searchLink: `/rides/search?from=${encodeURIComponent(to)}`,
  };
}

/* ─── Helpers ─── */
function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.88 }} />
      ))}
    </div>
  );
}

function ModeBadge({ mode, size = 12 }) {
  const cfg = MODE[mode];
  if (!cfg) return null;
  const Icon = cfg.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 99,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
    }}>
      <Icon size={size} /> {cfg.label}
    </span>
  );
}

/* ─── Itinerary card ─── */
function ItineraryCard({ itin, badges = [], date }) {
  const [expanded, setExpanded] = useState(false);

  const hasBadge = (b) => badges.includes(b);

  return (
    <div style={{
      borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)',
      overflow: 'hidden', transition: 'transform .15s, box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

      {/* Top accent */}
      <div style={{ height: 3, background: itin.type === 'connection' ? 'linear-gradient(90deg, #2196F3, #C1272D)' : MODE[itin.legs[0].mode]?.color || '#C1272D' }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {hasBadge('cheapest') && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>💰 Le moins cher</span>}
            {hasBadge('fastest')  && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(33,150,243,0.12)', color: '#2196F3', border: '1px solid rgba(33,150,243,0.25)' }}>⚡ Le plus rapide</span>}
            {hasBadge('greenest') && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>🌿 Le plus écolo</span>}
          </div>
        )}

        {/* Journey timeline */}
        <div style={{ marginBottom: 14 }}>
          {itin.legs.map((leg, i) => {
            const cfg = MODE[leg.mode] || MODE.train;
            const Icon = cfg.Icon;
            return (
              <div key={i}>
                {/* Leg row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#C1272D' : '#006233', boxShadow: `0 0 0 3px ${i === 0 ? 'rgba(193,39,45,0.18)' : 'rgba(0,98,51,0.18)'}` }} />
                    {i < itin.legs.length - 1 && (
                      <div style={{ width: 2, height: 28, background: 'var(--border-color)', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{leg.from}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{leg.to}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <ModeBadge mode={leg.mode} />
                      {leg.operator && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{leg.operator} {leg.class ? `· ${leg.class}` : ''}</span>}
                      {leg.duration && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {formatDuration(leg.duration)}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: cfg.color }}>{leg.price} DH</span>
                  </div>
                </div>

                {/* Correspondance indicator */}
                {i < itin.legs.length - 1 && (
                  <div style={{ marginLeft: 18, marginTop: 0 }}>
                    <div style={{ width: 2, height: 18, background: 'var(--border-color)', marginLeft: 4 }} />
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 12, marginBottom: 2,
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: 'rgba(212,137,10,0.10)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.25)',
                    }}>
                      🔄 Correspondance à {itin.hub} · ~30 min
                    </div>
                  </div>
                )}

                {/* Last leg dot */}
                {i === itin.legs.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#006233', boxShadow: '0 0 0 3px rgba(0,98,51,0.18)', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{leg.to}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prochain départ + places dispo (temps réel simulé) */}
        {itin.legs.some(l => l.departures?.length > 0) && (() => {
          const firstLeg = itin.legs.find(l => l.departures?.length > 0);
          const next = nextDeparture(firstLeg?.departures || []);
          const seats = simulatedSeats(`${firstLeg?.from}-${firstLeg?.to}`, next?.time || '');
          if (!next) return null;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800,
                padding: '4px 10px', borderRadius: 99,
                background: next.tomorrow ? 'rgba(100,100,100,0.1)' : 'rgba(34,197,94,0.12)',
                color: next.tomorrow ? 'var(--text-muted)' : '#22C55E',
                border: `1px solid ${next.tomorrow ? 'rgba(100,100,100,0.2)' : 'rgba(34,197,94,0.25)'}`,
              }}>
                🕐 Prochain : {next.time} · <strong>{next.label}</strong>
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                padding: '4px 10px', borderRadius: 99,
                background: seats <= 5 ? 'rgba(239,68,68,0.10)' : 'rgba(33,150,243,0.10)',
                color: seats <= 5 ? '#EF4444' : '#2196F3',
                border: `1px solid ${seats <= 5 ? 'rgba(239,68,68,0.25)' : 'rgba(33,150,243,0.20)'}`,
              }}>
                🪑 {seats} place{seats > 1 ? 's' : ''} {seats <= 5 ? '— Presque complet' : 'disponibles'}
              </span>
            </div>
          );
        })()}

        {/* Summary row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-color)', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{itin.totalPrice} DH</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>par personne</p>
            </div>
            {itin.totalDuration && (
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{formatDuration(itin.totalDuration)}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>durée totale</p>
              </div>
            )}
            {itin.totalCo2 > 0 && (
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, color: co2Color(itin.totalCo2) }}>{itin.totalCo2.toFixed(1)} kg</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>CO₂</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {itin.legs.map((leg, li) => {
              if (leg.mode === 'covoiturage') return (
                <Link key={li} to={`/rides/search?from=${encodeURIComponent(leg.from)}&to=${encodeURIComponent(leg.to)}&date=${date}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10,
                    background: 'rgba(193,39,45,0.10)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.25)',
                    textDecoration: 'none', fontSize: 12, fontWeight: 800,
                  }}>
                  <Car size={13} /> Covoiturage
                </Link>
              );
              const deepLink = buildDeepLink(leg.operator, leg.from, leg.to, date);
              const cfg = MODE[leg.mode] || {};
              if (!deepLink) return null;
              return (
                <a key={li} href={deepLink} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10,
                    background: cfg.bg || 'rgba(33,150,243,0.1)', color: cfg.color || '#2196F3',
                    border: `1px solid ${(cfg.color || '#2196F3')}35`, textDecoration: 'none',
                    fontSize: 12, fontWeight: 800,
                  }}>
                  {leg.operator} <ExternalLink size={11} />
                </a>
              );
            })}
            {/* Bouton réservation interne AtlasWay (train/bus uniquement) */}
            {itin.legs.some(l => ['train','bus'].includes(l.mode)) && (
              <Link
                to={`/book-transport?mode=${itin.legs.find(l=>['train','bus'].includes(l.mode))?.mode}&from=${encodeURIComponent(itin.legs[0].from)}&to=${encodeURIComponent(itin.legs[itin.legs.length-1].to)}&date=${date}&operator=${encodeURIComponent(itin.legs.find(l=>['train','bus'].includes(l.mode))?.operator||'')}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #C1272D, #a01f24)', color: '#fff',
                  textDecoration: 'none', fontSize: 12, fontWeight: 800,
                  boxShadow: '0 3px 10px rgba(193,39,45,0.3)',
                }}>
                🎟 Réserver sur AtlasWay
              </Link>
            )}
            {/* Pre-filled badge */}
            <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
              ✓ Paramètres pré-remplis
            </span>
          </div>
        </div>

        {/* Departures expandable */}
        {itin.legs.some(l => l.departures?.length > 0) && (
          <button onClick={() => setExpanded(!expanded)}
            style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            {expanded ? '▲ Masquer les horaires' : '▼ Voir les horaires'}
          </button>
        )}
        {expanded && itin.legs.map((leg, i) => leg.departures?.length > 0 && (
          <div key={i} style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-700)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              {leg.from} → {leg.to} · {leg.operator}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {leg.departures.map(d => (
                <span key={d} style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, fontFamily: 'monospace', background: `${MODE[leg.mode]?.bg}`, color: MODE[leg.mode]?.color }}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function MobilityHub() {
  const [sp] = useSearchParams();
  const [from, setFrom] = useState(sp.get('from') || '');
  const [to,   setTo]   = useState(sp.get('to')   || '');
  const [date, setDate] = useState(sp.get('date')  || new Date().toISOString().split('T')[0]);
  const [searched, setSearched] = useState(!!(sp.get('from') && sp.get('to')));

  const itineraries = useMemo(() => {
    if (!from.trim() || !to.trim()) return [];
    const direct  = buildDirectItineraries(from, to);
    const connect = buildConnectionItineraries(from, to);
    return [...direct, ...connect].sort((a, b) => a.totalPrice - b.totalPrice);
  }, [from, to, searched]);

  const badges = useMemo(() => {
    if (!itineraries.length) return {};
    const byCost     = [...itineraries].sort((a, b) => a.totalPrice - b.totalPrice);
    const bySpeed    = [...itineraries].filter(i => i.totalDuration).sort((a, b) => a.totalDuration - b.totalDuration);
    const byEco      = [...itineraries].filter(i => i.totalCo2).sort((a, b) => a.totalCo2 - b.totalCo2);
    const result = {};
    if (byCost[0])  result[byCost[0].id]  = [...(result[byCost[0].id]  || []), 'cheapest'];
    if (bySpeed[0]) result[bySpeed[0].id] = [...(result[bySpeed[0].id] || []), 'fastest'];
    if (byEco[0])   result[byEco[0].id]   = [...(result[byEco[0].id]   || []), 'greenest'];
    return result;
  }, [itineraries]);

  const hasConnections = itineraries.some(i => i.type === 'connection');
  const carpoolingLink = from && to ? `/rides/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : '/rides/search';

  const handleSearch = (e) => { e.preventDefault(); setSearched(true); };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 18 }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Globe size={20} style={{ color: '#C1272D' }} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Planificateur de trajet</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Covoiturage · Train ONCF · Bus CTM · Grand Taxi · Avion — toutes les options en un clic, avec correspondances automatiques
          </p>
        </div>
      </div>

      {/* ── Search form ── */}
      <form onSubmit={handleSearch} style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: 16, marginBottom: 20,
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end',
      }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Départ</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#C1272D', pointerEvents: 'none' }} />
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ville de départ" list="hub-from"
              style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: 10, fontSize: 13, background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
            <datalist id="hub-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
        </div>

        <button type="button" onClick={() => { setFrom(to); setTo(from); }}
          style={{ padding: '10px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-700)', cursor: 'pointer', alignSelf: 'flex-end' }}>
          <ArrowLeftRight size={14} style={{ color: 'var(--text-muted)' }} />
        </button>

        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Arrivée</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#006233', pointerEvents: 'none' }} />
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Ville d'arrivée" list="hub-to"
              style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: 10, fontSize: 13, background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
            <datalist id="hub-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>
        </div>

        <div style={{ minWidth: 140 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date</label>
          <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13, background: 'var(--bg-700)', border: '1.5px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{
          padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #C1272D, #a01f24)',
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-end',
          boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
        }}>
          <Search size={14} /> Chercher
        </button>
      </form>

      {/* ── Results ── */}
      {searched && from && to && (
        <>
          {/* Carpooling banner */}
          <Link to={carpoolingLink} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '14px 18px', borderRadius: 14, marginBottom: 14, textDecoration: 'none',
            background: 'linear-gradient(135deg, rgba(193,39,45,0.10), rgba(212,137,10,0.08))',
            border: '1.5px solid rgba(193,39,45,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(193,39,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={18} style={{ color: '#C1272D' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#C1272D' }}>Voir les covoiturages disponibles</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {from} → {to} · Conducteurs vérifiés · Prix jusqu'à 60% moins cher
                </p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#C1272D', flexShrink: 0 }} />
          </Link>

          {/* Connection notice */}
          {hasConnections && (
            <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: 'rgba(212,137,10,0.07)', border: '1px solid rgba(212,137,10,0.22)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔄</span>
              <p style={{ fontSize: 12, color: '#D4890A', fontWeight: 600 }}>
                Pas de direct complet — des itinéraires avec correspondance ont été trouvés automatiquement.
              </p>
            </div>
          )}

          {/* Itinerary count */}
          {itineraries.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
              {itineraries.length} itinéraire{itineraries.length > 1 ? 's' : ''} trouvé{itineraries.length > 1 ? 's' : ''}
              {' '}pour <strong style={{ color: 'var(--text-primary)' }}>{from} → {to}</strong>
            </p>
          )}

          {itineraries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Aucun transport répertorié</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Essayez des villes principales ou cherchez un covoiturage directement.
              </p>
              <Link to={carpoolingLink} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10,
                background: 'rgba(193,39,45,0.10)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.25)',
                textDecoration: 'none', fontSize: 13, fontWeight: 800,
              }}>
                <Car size={14} /> Chercher un covoiturage
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itineraries.map(itin => (
                <ItineraryCard key={itin.id} itin={itin} badges={badges[itin.id] || []} date={date} />
              ))}

              {/* Last mile suggestion */}
              {itineraries.some(i => ['train', 'bus'].includes(i.legs?.at(-1)?.mode)) && (
                <div style={{
                  padding: '14px 18px', borderRadius: 14, background: 'rgba(0,98,51,0.06)',
                  border: '1px solid rgba(0,98,51,0.20)', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <CheckCircle size={18} style={{ color: '#006233', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#006233' }}>Dernier kilomètre</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Vous arrivez en gare de <strong>{to}</strong> ? Des conducteurs AtlasWay
                      proposent régulièrement des trajets depuis les gares.
                    </p>
                  </div>
                  <Link to={`/rides/search?from=${encodeURIComponent(to)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8,
                      background: 'rgba(0,98,51,0.12)', color: '#006233',
                      border: '1px solid rgba(0,98,51,0.25)', textDecoration: 'none',
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>
                    <Car size={11} /> Covoiturages
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Empty state (before search) ── */}
      {!searched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 4 }}>
            Itinéraires populaires
          </p>
          {[
            { from: 'Casablanca', to: 'Marrakech' },
            { from: 'Rabat',      to: 'Fès'       },
            { from: 'Tanger',     to: 'Casablanca' },
            { from: 'Casablanca', to: 'Agadir'    },
          ].map(({ from: f, to: t }) => (
            <button key={`${f}-${t}`}
              onClick={() => { setFrom(f); setTo(t); setSearched(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C1272D'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
              <MapPin size={14} style={{ color: '#C1272D', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>
                {f} <span style={{ color: '#C1272D' }}>→</span> {t}
              </span>
              <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
