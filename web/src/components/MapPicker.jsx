import { useEffect, useRef, useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { reverseGeocode } from '../utils/geocode';

/* Fix Leaflet default marker icons broken by bundlers */
function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function makeMarker(L, color) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapPicker({ onConfirm, onClose, initialFrom = '', initialTo = '' }) {
  const mapRef    = useRef(null);
  const leafRef   = useRef(null);
  const markerFrom = useRef(null);
  const markerTo   = useRef(null);

  const [selecting, setSelecting] = useState('from'); // 'from' | 'to'
  const [fromCity,  setFromCity]  = useState(initialFrom);
  const [toCity,    setToCity]    = useState(initialTo);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    let map;
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');
      fixLeafletIcons(L);
      leafRef.current = L;

      map = L.map(mapRef.current, { center: [31.7917, -7.0926], zoom: 6 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setLoading(true);
        const city = await reverseGeocode(lat, lng);
        setLoading(false);

        if (selecting === 'from') {
          setFromCity(city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          if (markerFrom.current) markerFrom.current.setLatLng([lat, lng]);
          else markerFrom.current = L.marker([lat, lng], { icon: makeMarker(L, '#006233') }).addTo(map).bindPopup(`Départ : ${city}`).openPopup();
          setSelecting('to');
        } else {
          setToCity(city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          if (markerTo.current) markerTo.current.setLatLng([lat, lng]);
          else markerTo.current = L.marker([lat, lng], { icon: makeMarker(L, '#C1272D') }).addTo(map).bindPopup(`Arrivée : ${city}`).openPopup();
        }

        if (markerFrom.current && markerTo.current) {
          const bounds = L.latLngBounds(markerFrom.current.getLatLng(), markerTo.current.getLatLng());
          map.fitBounds(bounds, { padding: [60, 60] });
        }
      });
    });

    return () => { map?.remove(); };
  }, []);  // eslint-disable-line

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const city = await reverseGeocode(coords.latitude, coords.longitude);
        setFromCity(city);
        setLoading(false);
        if (leafRef.current) {
          const L = leafRef.current;
          const pos = [coords.latitude, coords.longitude];
          if (markerFrom.current) markerFrom.current.setLatLng(pos);
          else {
            const map = leafRef.current._map;
            markerFrom.current = L.marker(pos, { icon: makeMarker(L, '#006233') });
            // Add to existing map instance – handled differently; just update city
          }
        }
      },
      () => setLoading(false)
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ background: 'var(--card-bg)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)', background: '#C1272D' }}>
          <div>
            <h2 className="font-black text-white text-lg">Choisir sur la carte</h2>
            <p className="text-white/75 text-xs">
              {selecting === 'from' ? '📍 Cliquez pour sélectionner le départ' : '📍 Cliquez pour sélectionner l\'arrivée'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <X size={20} />
          </button>
        </div>

        {/* Chips */}
        <div className="flex gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setSelecting('from')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: selecting === 'from' ? 'rgba(0,98,51,0.15)' : 'var(--bg-700)', color: selecting === 'from' ? '#006233' : 'var(--text-secondary)', border: `1px solid ${selecting === 'from' ? '#006233' : 'var(--border-color)'}` }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#006233' }} />
            Départ : {fromCity || '—'}
          </button>
          <button
            onClick={() => setSelecting('to')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: selecting === 'to' ? 'rgba(193,39,45,0.12)' : 'var(--bg-700)', color: selecting === 'to' ? '#C1272D' : 'var(--text-secondary)', border: `1px solid ${selecting === 'to' ? '#C1272D' : 'var(--border-color)'}` }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#C1272D' }} />
            Arrivée : {toCity || '—'}
          </button>
          <button
            onClick={handleGeolocate}
            disabled={loading}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(212,137,10,0.12)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.3)' }}
          >
            <Navigation size={13} /> Ma position
          </button>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ flex: 1, minHeight: 380, position: 'relative' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-[1000]" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {fromCity && toCity ? '✅ Les deux points sont sélectionnés' : 'Cliquez sur la carte pour placer vos points'}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Annuler</button>
            <button
              onClick={() => onConfirm(fromCity, toCity)}
              disabled={!fromCity || !toCity}
              className="btn-primary text-sm py-2 px-4"
              style={{ opacity: (!fromCity || !toCity) ? 0.5 : 1 }}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}