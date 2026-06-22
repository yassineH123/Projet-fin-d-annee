/* Coordonnées des principales villes marocaines (lat, lng) + utilitaires
   de distance, pour le matching de trajets « à proximité ». */

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
  'Mohammedia':  [33.6861, -7.3829],
  'Khouribga':   [32.8811, -6.9063],
};

// Recherche insensible à la casse / accents approximative
function normalize(s) {
  return (s || '').toString().trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const NORM_INDEX = Object.keys(CITY_COORDS).reduce((acc, name) => {
  acc[normalize(name)] = CITY_COORDS[name];
  return acc;
}, {});

function getCityCoords(city) {
  if (!city) return null;
  return NORM_INDEX[normalize(city)] || null;
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/* Distance (km) entre une ville de trajet et une ville recherchée.
   0 si même ville, distance si les deux ont des coords, null sinon. */
function cityDistance(rideCity, searchedCity, searchedCoord) {
  if (normalize(rideCity) === normalize(searchedCity)) return 0;
  const c = getCityCoords(rideCity);
  if (!c || !searchedCoord) return null;
  return haversineKm(c, searchedCoord);
}

module.exports = { CITY_COORDS, getCityCoords, haversineKm, cityDistance, normalize };
