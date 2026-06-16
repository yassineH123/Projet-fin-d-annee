import { useEffect, useRef } from 'react';
import { geocodeCity } from '../utils/geocode';

/* Fix Leaflet default marker icons broken by bundlers */
function fixLeafletIcons(L) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function dotIcon(L, color) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:20px;height:20px">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.25;animation:pulse 1.8s infinite"></div>
        <div style="position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>
      </div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

export default function RouteMap({ from, to, height = 260, className = '' }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    let map;
    let cancelled = false;

    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      fixLeafletIcons(L);

      if (cancelled) return;
      if (instanceRef.current) { instanceRef.current.remove(); }

      const [fromCoords, toCoords] = await Promise.all([geocodeCity(from), geocodeCity(to)]);
      if (cancelled || !fromCoords || !toCoords) return;

      map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
      instanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      L.marker(fromCoords, { icon: dotIcon(L, '#006233') }).addTo(map).bindPopup(`<b>${from}</b><br>Point de départ`);
      L.marker(toCoords,   { icon: dotIcon(L, '#C1272D') }).addTo(map).bindPopup(`<b>${to}</b><br>Point d'arrivée`);

      /* Route polyline avec style marocain */
      L.polyline([fromCoords, toCoords], {
        color: '#C1272D',
        weight: 3,
        opacity: 0.75,
        dashArray: '8, 6',
      }).addTo(map);

      const bounds = L.latLngBounds(fromCoords, toCoords);
      map.fitBounds(bounds, { padding: [40, 40] });

      /* Attribution discrète */
      L.control.attribution({ prefix: '© OSM' }).addTo(map);
    };

    init();
    return () => { cancelled = true; map?.remove(); };
  }, [from, to]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}
    >
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:.25} 50%{transform:scale(1.5);opacity:.08} }`}</style>
    </div>
  );
}