import { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function GPSTracker({ rideId, isDriver }) {
  const [location,   setLocation]   = useState(null);
  const [status,     setStatus]     = useState('idle'); // idle | tracking | ended
  const [connected,  setConnected]  = useState(false);
  const socketRef = useRef(null);
  const watchRef  = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000', {
      query: { userId: localStorage.getItem('userId') || '' },
    });
    socketRef.current = socket;
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    if (isDriver) {
      socket.emit('driver_join_ride', { rideId });
    } else {
      socket.emit('passenger_track_ride', { rideId });
      socket.on('location_update', (data) => setLocation(data));
      socket.on('ride_status_change', ({ status: s }) => setStatus(s));
    }

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      socket.disconnect();
    };
  }, [rideId, isDriver]);

  const startTracking = () => {
    if (!navigator.geolocation) return;
    setStatus('tracking');
    socketRef.current?.emit('ride_started', { rideId });
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed, heading } = pos.coords;
        setLocation({ lat, lng, speed, heading });
        socketRef.current?.emit('driver_location', { rideId, lat, lng, speed: speed || 0, heading: heading || 0 });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    socketRef.current?.emit('ride_ended', { rideId });
    setStatus('ended');
  };

  if (!isDriver && status === 'idle') return null;

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={15} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">
            {isDriver ? 'Partager ma position' : 'Suivi en direct'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {connected
            ? <Wifi size={13} className="text-green-400" />
            : <WifiOff size={13} className="text-slate-500" />}
          <span className="text-xs" style={{ color: connected ? '#10B981' : 'var(--text-muted)' }}>
            {connected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Driver controls */}
      {isDriver && (
        <div className="flex gap-2">
          {status !== 'tracking' && status !== 'ended' && (
            <button onClick={startTracking}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: '#10B981', color: 'white' }}>
              <Navigation size={14} /> Démarrer le trajet
            </button>
          )}
          {status === 'tracking' && (
            <button onClick={stopTracking}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: '#EF4444', color: 'white' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              En cours · Terminer
            </button>
          )}
          {status === 'ended' && (
            <p className="flex items-center gap-1 text-xs text-green-400 font-semibold"><CheckCircle size={13} /> Trajet terminé</p>
          )}
        </div>
      )}

      {/* Passenger view */}
      {!isDriver && location && (
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <MapPin size={16} className="text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">
              {location.lat?.toFixed(4)}°N, {location.lng?.toFixed(4)}°E
            </p>
            {location.speed > 0 && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {Math.round(location.speed * 3.6)} km/h
              </p>
            )}
          </div>
        </div>
      )}

      {!isDriver && status === 'ended' && (
        <p className="flex items-center justify-center gap-1 text-xs text-center font-semibold" style={{ color: '#10B981' }}>
          <CheckCircle size={13} /> Le conducteur a terminé le trajet
        </p>
      )}
    </div>
  );
}
