import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Navigation, Wifi, WifiOff, CheckCircle, Share2 } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../services/api';
import toast from 'react-hot-toast';

const ARABIC_NAMES = {
  'Casablanca': 'الدار البيضاء', 'Rabat': 'الرباط', 'Marrakech': 'مراكش',
  'Fès': 'فاس', 'Tanger': 'طنجة', 'Agadir': 'أكادير',
  'Meknès': 'مكناس', 'Oujda': 'وجدة', 'Tétouan': 'تطوان', 'Laâyoune': 'العيون',
};

function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 6, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.9 }} />
      ))}
    </div>
  );
}

function PulsingDot({ color = '#22C55E' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4,
        animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <style>{`@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
    </span>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 10)  return 'à l\'instant';
  if (diff < 60)  return `il y a ${diff}s`;
  return `il y a ${Math.floor(diff / 60)}min`;
}

export default function TrackRide() {
  const { rideId } = useParams();
  const [ride,      setRide]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [location,  setLocation]  = useState(null);
  const [rideStatus,setRideStatus]= useState('pending'); // pending | active | ended
  const [connected, setConnected] = useState(false);
  const [lastUpdate,setLastUpdate]= useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/rides/${rideId}`)
      .then(({ data }) => { setRide(data.ride); setRideStatus(data.ride?.status || 'pending'); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rideId]);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000',
      { query: { public: true } }
    );
    socketRef.current = socket;
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('passenger_track_ride', { rideId });
    socket.on('location_update', (data) => {
      setLocation(data);
      setLastUpdate(Date.now());
      setRideStatus('active');
    });
    socket.on('ride_status_change', ({ status: s }) => setRideStatus(s));
    return () => socket.disconnect();
  }, [rideId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Lien copié !'));
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #C1272D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!ride) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: 'var(--bg-base)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Trajet introuvable</p>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Ce lien de suivi est invalide ou expiré.</p>
    </div>
  );

  const driver    = ride.driver || {};
  const stops     = ride.stops || [];
  const allCities = [ride.from, ...stops, ride.to];
  const date      = new Date(ride.departureDate);
  const timeStr   = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr   = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const statusInfo = {
    pending: { label: 'Trajet planifié',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)'  },
    active:  { label: 'Trajet en cours',  color: '#22C55E', bg: 'rgba(34,197,94,0.10)'   },
    ended:   { label: 'Trajet terminé',   color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
    completed:{ label: 'Trajet terminé',  color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
  };
  const si = statusInfo[rideStatus] || statusInfo.pending;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>

      {/* Header AtlasWay */}
      <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>🚗</span>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>AtlasWay</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Suivi de trajet partagé</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Connexion socket */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: connected ? '#22C55E' : 'var(--text-muted)' }}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? 'En direct' : 'Hors ligne'}
            </div>
            <button onClick={copyLink} style={{
              padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-color)',
              background: 'var(--bg-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            }}>
              <Share2 size={11} /> Copier
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {rideStatus === 'active' && <PulsingDot color={si.color} />}
          {rideStatus === 'ended' || rideStatus === 'completed' ? <CheckCircle size={14} style={{ color: si.color }} /> : null}
          <span style={{ fontSize: 14, fontWeight: 800, color: si.color }}>{si.label}</span>
        </div>

        {/* Carte route */}
        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, #C1272D, #D4890A, #006233)` }} />
          <div style={{ padding: '20px 22px' }}>

            {/* Date + heure */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              <Clock size={13} style={{ color: '#C1272D' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {dateStr} · départ <strong style={{ color: 'var(--text-primary)' }}>{timeStr}</strong>
              </span>
            </div>

            {/* Route timeline */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
                {allCities.map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? '#C1272D' : i === allCities.length - 1 ? '#006233' : '#D4890A',
                      boxShadow: `0 0 0 3px ${i === 0 ? 'rgba(193,39,45,0.18)' : i === allCities.length - 1 ? 'rgba(0,98,51,0.18)' : 'rgba(212,137,10,0.18)'}`,
                    }} />
                    {i < allCities.length - 1 && (
                      <div style={{ width: 2, minHeight: 28, background: 'var(--border-color)', margin: '5px 0' }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ flex: 1 }}>
                {allCities.map((city, i) => (
                  <div key={i} style={{ marginBottom: i < allCities.length - 1 ? (i === 0 ? 18 : 16) : 0 }}>
                    <p style={{ fontSize: i === 0 || i === allCities.length - 1 ? 20 : 15, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                      {city}
                    </p>
                    {ARABIC_NAMES[city] && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Amiri, serif', marginTop: 2 }}>{ARABIC_NAMES[city]}</p>
                    )}
                    {i > 0 && i < allCities.length - 1 && (
                      <p style={{ fontSize: 10, color: '#D4890A', fontWeight: 600, marginTop: 2 }}>Escale</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Carte conducteur */}
        <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '16px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Conducteur</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {driver.photo
              ? <img src={driver.photo} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(193,39,45,0.3)' }} />
              : <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                  {driver.firstName?.[0]}
                </div>
            }
            <div>
              {/* Prénom seulement, pas de nom de famille (confidentialité) */}
              <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{driver.firstName}</p>
              {driver.avgRating > 0 && (
                <p style={{ fontSize: 13, color: '#FBBF24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  ★ {Number(driver.avgRating).toFixed(1)}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/ 5 · {driver.totalRatings} avis</span>
                </p>
              )}
              {driver.avgPunctuality > 0 && (
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⏱ Ponctualité {Number(driver.avgPunctuality).toFixed(1)}/5
                </p>
              )}
            </div>
          </div>
        </div>

        {/* GPS live */}
        {rideStatus === 'active' && (
          <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid rgba(34,197,94,0.25)', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <PulsingDot color="#22C55E" />
              <p style={{ fontSize: 13, fontWeight: 800, color: '#22C55E' }}>Position en direct</p>
              {lastUpdate && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  màj {timeAgo(lastUpdate)}
                </span>
              )}
            </div>

            {location ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Navigation size={16} style={{ color: '#22C55E', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {Number(location.lat).toFixed(5)}°N, {Number(location.lng).toFixed(5)}°E
                    </p>
                    {location.speed > 0 && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {Math.round(location.speed * 3.6)} km/h
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '10px', borderRadius: 10, textDecoration: 'none',
                    background: 'rgba(34,197,94,0.10)', color: '#22C55E',
                    border: '1px solid rgba(34,197,94,0.25)', fontSize: 13, fontWeight: 700,
                  }}>
                  <MapPin size={13} /> Voir sur Google Maps
                </a>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                En attente de la position du conducteur…
              </p>
            )}
          </div>
        )}

        {rideStatus === 'ended' || rideStatus === 'completed' ? (
          <div style={{ borderRadius: 16, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} style={{ color: '#10B981', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>Trajet terminé</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Le passager est arrivé à destination.</p>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Suivi partagé via{' '}
            <span style={{ color: '#C1272D', fontWeight: 800 }}>AtlasWay</span>
            {' '}· Covoiturage au Maroc
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            <div style={{ height: 3, width: 20, background: '#C1272D', borderRadius: 2 }} />
            <div style={{ height: 3, width: 20, background: '#D4890A', borderRadius: 2 }} />
            <div style={{ height: 3, width: 20, background: '#006233', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
