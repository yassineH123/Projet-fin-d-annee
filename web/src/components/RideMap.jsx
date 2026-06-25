import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const fromIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});
const toIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const CITY_COORDS = {
  'Casablanca': [33.5731, -7.5898], 'Rabat': [34.0209, -6.8416],
  'Marrakech':  [31.6295, -7.9811], 'Fès':   [34.0181, -5.0078],
  'Tanger':     [35.7595, -5.8340], 'Agadir':[30.4278, -9.5981],
  'Meknès':     [33.8935, -5.5473], 'Oujda': [34.6814, -1.9086],
  'Tétouan':    [35.5785, -5.3684], 'Laâyoune':[27.1536,-13.2033],
  'Settat':     [33.0010, -7.6164], 'Kénitra':[34.2610,-6.5802],
};

function getCoords(city) {
  if (!city) return null;
  const key = Object.keys(CITY_COORDS).find(k => city.toLowerCase().includes(k.toLowerCase()));
  return key ? CITY_COORDS[key] : null;
}

export default function RideMap({ from, to, stops = [] }) {
  const fromCoords = getCoords(from);
  const toCoords   = getCoords(to);

  if (!fromCoords || !toCoords) return null;

  const center = [(fromCoords[0] + toCoords[0]) / 2, (fromCoords[1] + toCoords[1]) / 2];
  const polyline = [fromCoords, ...stops.map(s => getCoords(s)).filter(Boolean), toCoords];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: 220, border: '1px solid var(--border-color)' }}>
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        <Marker position={fromCoords} icon={fromIcon}>
          <Popup>{from} (Départ)</Popup>
        </Marker>
        <Marker position={toCoords} icon={toIcon}>
          <Popup>{to} (Arrivée)</Popup>
        </Marker>
        {polyline.length >= 2 && (
          <Polyline positions={polyline} color="#C1272D" weight={3} opacity={0.7} dashArray="8,4" />
        )}
      </MapContainer>
    </div>
  );
}
