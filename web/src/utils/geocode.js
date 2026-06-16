/* Coordonnées des principales villes marocaines (lat, lng) */
const CITY_COORDS = {
  'Casablanca':  [33.5731, -7.5898],
  'Rabat':       [34.0209, -6.8416],
  'Marrakech':   [31.6295, -7.9811],
  'Fès':         [34.0181, -5.0078],
  'Tanger':      [35.7673, -5.7998],
  'Agadir':      [30.4202, -9.5981],
  'Meknès':      [33.8931, -5.5473],
  'Oujda':       [34.6867, -1.9114],
  'Tétouan':     [35.5785, -5.3684],
  'Laâyoune':    [27.1253, -13.1625],
  'Safi':        [32.2994, -9.2372],
  'El Jadida':   [33.2549, -8.5074],
  'Béni Mellal': [32.3373, -6.3498],
  'Nador':       [35.1740, -2.9287],
  'Kénitra':     [34.2610, -6.5802],
  'Settat':      [33.0013, -7.6194],
  'Berrechid':   [33.2655, -7.5881],
  'Khémisset':   [33.8235, -6.0658],
  'Essaouira':   [31.5085, -9.7595],
  'Ouarzazate':  [30.9189, -6.8936],
  'Dakhla':      [23.6848, -15.9574],
  'Ifrane':      [33.5332, -5.1108],
  'Chefchaouen': [35.1686, -5.2699],
};

export function getCityCoords(city) {
  return CITY_COORDS[city] ?? null;
}

export function getAllCities() {
  return Object.keys(CITY_COORDS);
}

/* Reverse geocoding via Nominatim (coords → ville) */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'AtlasWay/1.0 (atlasway.ma)' } }
    );
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town  ||
      data.address?.village ||
      data.address?.county ||
      ''
    );
  } catch {
    return '';
  }
}

/* Forward geocoding via Nominatim (ville → coords) */
export async function geocodeCity(city) {
  const cached = CITY_COORDS[city];
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', Maroc')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'AtlasWay/1.0 (atlasway.ma)' } }
    );
    const data = await res.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch {
    return null;
  }
}