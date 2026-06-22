// ── Normalize city name for matching (removes accents, lowercases) ──────────
export function normalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// Bidirectional route finder
export function findRoutes(dataset, from, to) {
  const f = normalize(from);
  const t = normalize(to);
  if (!f || !t) return [];
  return dataset.filter(r => {
    const rf = normalize(r.from);
    const rt = normalize(r.to);
    const fwd = (rf.includes(f) || f.includes(rf)) && (rt.includes(t) || t.includes(rt));
    const bwd = (rf.includes(t) || t.includes(rf)) && (rt.includes(f) || f.includes(rt));
    return fwd || bwd;
  });
}

// ── ONCF Train routes ────────────────────────────────────────────────────────
// comfort: 1-5, co2: kg/pax for the full trip
export const ONCF = [
  {
    from: 'Casablanca', to: 'Rabat',
    price: 45, duration: 60, co2: 0.4, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['06:00','07:00','08:00','09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00','21:30'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Casablanca', to: 'Tanger',
    price: 155, duration: 135, co2: 1.3, comfort: 5,
    operator: 'Al Boraq LGV', class: 'TGV ⚡',
    departures: ['06:00','08:30','11:00','13:30','16:00','18:30','21:00'],
    bookingUrl: 'https://www.alboraq.ma',
    premium: true,
  },
  {
    from: 'Casablanca', to: 'Fès',
    price: 110, duration: 210, co2: 1.2, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['06:00','09:00','13:00','17:00','20:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Casablanca', to: 'Meknès',
    price: 100, duration: 190, co2: 1.1, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['06:00','09:00','13:00','17:00','20:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Casablanca', to: 'Marrakech',
    price: 100, duration: 195, co2: 1.1, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['07:30','11:00','15:00','18:30'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Casablanca', to: 'Oujda',
    price: 160, duration: 330, co2: 2.0, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['07:00','19:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Casablanca', to: 'Kénitra',
    price: 60, duration: 90, co2: 0.7, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['06:30','08:00','10:00','12:00','14:00','16:00','18:00','20:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Rabat', to: 'Tanger',
    price: 110, duration: 90, co2: 0.9, comfort: 5,
    operator: 'Al Boraq LGV', class: 'TGV ⚡',
    departures: ['07:00','09:30','12:00','14:30','17:00','19:30'],
    bookingUrl: 'https://www.alboraq.ma',
    premium: true,
  },
  {
    from: 'Rabat', to: 'Fès',
    price: 75, duration: 150, co2: 1.0, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['07:00','09:00','11:00','14:00','17:00','20:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Fès', to: 'Tanger',
    price: 90, duration: 150, co2: 1.1, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['07:00','10:00','14:00','18:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Fès', to: 'Oujda',
    price: 95, duration: 195, co2: 1.1, comfort: 4,
    operator: 'ONCF', class: 'Rapide',
    departures: ['08:00','13:00','18:00'],
    bookingUrl: 'https://www.oncf.ma',
  },
  {
    from: 'Fès', to: 'Meknès',
    price: 20, duration: 45, co2: 0.3, comfort: 4,
    operator: 'ONCF', class: 'Omnibus',
    departures: ['06:00','07:30','09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30'],
    bookingUrl: 'https://www.oncf.ma',
  },
];

// ── CTM / Supratours Bus routes ──────────────────────────────────────────────
export const CTM_ROUTES = [
  {
    from: 'Casablanca', to: 'Marrakech', price: 110, duration: 240, co2: 2.1, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','09:00','11:00','14:00','16:00','18:00','20:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Casablanca', to: 'Agadir', price: 180, duration: 360, co2: 3.2, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','09:30','13:00','17:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Casablanca', to: 'Fès', price: 100, duration: 240, co2: 2.0, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','09:00','12:00','15:00','18:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Casablanca', to: 'Rabat', price: 50, duration: 90, co2: 0.9, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['06:00','07:00','08:00','09:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Casablanca', to: 'Tanger', price: 130, duration: 300, co2: 2.8, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','10:00','14:00','18:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Casablanca', to: 'Oujda', price: 200, duration: 480, co2: 4.2, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','14:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Casablanca', to: 'Chefchaouen', price: 130, duration: 300, co2: 2.7, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['08:00','14:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Marrakech', to: 'Agadir', price: 90, duration: 180, co2: 1.8, comfort: 4,
    operator: 'Supratours', class: 'Premium',
    departures: ['07:00','09:00','11:00','13:00','15:00','17:00','19:00','21:00'],
    bookingUrl: 'https://www.supratours.ma',
  },
  {
    from: 'Marrakech', to: 'Essaouira', price: 60, duration: 150, co2: 1.3, comfort: 4,
    operator: 'Supratours', class: 'Premium',
    departures: ['08:00','11:00','14:00','17:00'],
    bookingUrl: 'https://www.supratours.ma',
  },
  {
    from: 'Rabat', to: 'Fès', price: 80, duration: 180, co2: 1.8, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','09:00','11:00','14:00','17:00','20:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Rabat', to: 'Tanger', price: 100, duration: 240, co2: 2.2, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','10:00','14:00','18:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Fès', to: 'Tanger', price: 100, duration: 240, co2: 2.1, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','10:00','14:00','18:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Agadir', to: 'Laâyoune', price: 130, duration: 300, co2: 2.8, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['08:00','14:00','22:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
  {
    from: 'Tanger', to: 'Tétouan', price: 25, duration: 60, co2: 0.5, comfort: 3,
    operator: 'CTM', class: 'Confort',
    departures: ['07:00','08:30','10:00','12:00','14:00','16:00','18:00','20:00'],
    bookingUrl: 'https://www.ctm.ma',
  },
];

// ── Grand Taxi (taxi inter-urbain partagé) ───────────────────────────────────
// Typiquement 5 passagers, départ quand plein (~30 min attente)
// Prix par personne, CO2 partagé entre 5 passagers
export const GRAND_TAXI = [
  { from: 'Casablanca', to: 'Rabat',      pricePerPerson: 40,  duration: 90,  co2: 1.8, comfort: 2 },
  { from: 'Casablanca', to: 'Marrakech',  pricePerPerson: 80,  duration: 220, co2: 4.5, comfort: 2 },
  { from: 'Casablanca', to: 'Fès',        pricePerPerson: 120, duration: 270, co2: 6.0, comfort: 2 },
  { from: 'Casablanca', to: 'Tanger',     pricePerPerson: 140, duration: 330, co2: 7.5, comfort: 2 },
  { from: 'Casablanca', to: 'Agadir',     pricePerPerson: 170, duration: 390, co2: 9.0, comfort: 2 },
  { from: 'Casablanca', to: 'Meknès',     pricePerPerson: 110, duration: 250, co2: 5.5, comfort: 2 },
  { from: 'Casablanca', to: 'Oujda',      pricePerPerson: 200, duration: 480, co2: 11.0, comfort: 2 },
  { from: 'Rabat',      to: 'Fès',        pricePerPerson: 90,  duration: 210, co2: 4.8, comfort: 2 },
  { from: 'Rabat',      to: 'Tanger',     pricePerPerson: 110, duration: 270, co2: 6.0, comfort: 2 },
  { from: 'Rabat',      to: 'Meknès',     pricePerPerson: 80,  duration: 210, co2: 4.5, comfort: 2 },
  { from: 'Fès',        to: 'Meknès',     pricePerPerson: 25,  duration: 60,  co2: 1.3, comfort: 2 },
  { from: 'Fès',        to: 'Tanger',     pricePerPerson: 100, duration: 240, co2: 5.4, comfort: 2 },
  { from: 'Fès',        to: 'Oujda',      pricePerPerson: 110, duration: 270, co2: 6.0, comfort: 2 },
  { from: 'Marrakech',  to: 'Agadir',     pricePerPerson: 90,  duration: 210, co2: 4.8, comfort: 2 },
  { from: 'Marrakech',  to: 'Essaouira',  pricePerPerson: 60,  duration: 150, co2: 3.3, comfort: 2 },
  { from: 'Tanger',     to: 'Tétouan',    pricePerPerson: 20,  duration: 50,  co2: 1.0, comfort: 2 },
  { from: 'Tanger',     to: 'Chefchaouen',pricePerPerson: 45,  duration: 90,  co2: 2.2, comfort: 2 },
  { from: 'Agadir',     to: 'Essaouira',  pricePerPerson: 55,  duration: 120, co2: 3.0, comfort: 2 },
];

// ── Vols domestiques ─────────────────────────────────────────────────────────
// Royal Air Maroc + Air Arabia Maroc (prix à partir de)
export const FLIGHTS = [
  {
    from: 'Casablanca', to: 'Marrakech',   priceFrom: 299, duration: 45,  co2: 28, comfort: 5,
    operators: ['Royal Air Maroc', 'Air Arabia Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Agadir',      priceFrom: 249, duration: 55,  co2: 32, comfort: 5,
    operators: ['Royal Air Maroc', 'Air Arabia Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Fès',         priceFrom: 199, duration: 50,  co2: 28, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Tanger',      priceFrom: 199, duration: 55,  co2: 30, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Oujda',       priceFrom: 299, duration: 70,  co2: 40, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Al Hoceima',  priceFrom: 349, duration: 65,  co2: 36, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Nador',       priceFrom: 349, duration: 70,  co2: 38, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Laâyoune',    priceFrom: 399, duration: 90,  co2: 50, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Casablanca', to: 'Dakhla',      priceFrom: 499, duration: 120, co2: 70, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Rabat',      to: 'Marrakech',   priceFrom: 349, duration: 50,  co2: 28, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Rabat',      to: 'Agadir',      priceFrom: 299, duration: 60,  co2: 34, comfort: 5,
    operators: ['Royal Air Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
  {
    from: 'Marrakech',  to: 'Agadir',      priceFrom: 249, duration: 40,  co2: 22, comfort: 5,
    operators: ['Royal Air Maroc', 'Air Arabia Maroc'],
    bookingUrl: 'https://www.royalairmaroc.com',
  },
];

// ── Deep Link Builder ─────────────────────────────────────────────────────────
// City codes for ONCF booking portal
const ONCF_CODES = {
  casablanca: 'CASAV', rabat: 'RAGDL', fes: 'FES', tanger: 'TANV',
  marrakech: 'MRAK', meknes: 'MKN', oujda: 'OUD', kenitra: 'KEN',
  settat: 'SET', benmellal: 'BML',
};

// IATA airport codes
const IATA_CODES = {
  casablanca: 'CMN', marrakech: 'RAK', tanger: 'TNG', fes: 'FEZ',
  agadir: 'AGA', oujda: 'OUD', rabat: 'RBA', 'al hoceima': 'AHU',
  nador: 'NDR', laayoune: 'EUN', dakhla: 'VIL',
};

function normKey(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

export function buildDeepLink(operator, from, to, date) {
  const f = normKey(from);
  const t = normKey(to);
  const d = date || new Date().toISOString().split('T')[0];   // YYYY-MM-DD
  const dCompact = d.replace(/-/g, '');                        // YYYYMMDD (RAM format)

  const op = normKey(operator);

  if (op === 'oncf' || op === 'al boraq lgv' || op === 'al boraq') {
    const orig = ONCF_CODES[f] || encodeURIComponent(from);
    const dest = ONCF_CODES[t] || encodeURIComponent(to);
    return `https://www.oncf-voyages.ma/fr/trains?departure=${orig}&destination=${dest}&outward=${d}&count=1&class=2`;
  }
  if (op === 'ctm') {
    return `https://www.ctm.ma/fr/reservation?depart=${encodeURIComponent(from)}&arrivee=${encodeURIComponent(to)}&date=${d}&passagers=1`;
  }
  if (op === 'supratours') {
    return `https://www.supratours.ma/fr/billet?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${d}`;
  }
  if (op === 'royal air maroc') {
    const org = IATA_CODES[f] || 'CMN';
    const dst = IATA_CODES[t] || 'RAK';
    return `https://www.royalairmaroc.com/ma-fr/booking/search?tripType=OW&org0=${org}&dst0=${dst}&dep0=${dCompact}&adt=1&inf=0&chd=0`;
  }
  if (op === 'air arabia maroc') {
    const org = IATA_CODES[f] || 'CMN';
    const dst = IATA_CODES[t] || 'RAK';
    return `https://www.airarabia.com/fr/book/select-flight?type=O&origin=${org}&destination=${dst}&departuredate=${d}&adult=1&child=0&infant=0`;
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}mn`;
}

export function co2Color(kg) {
  if (kg <= 1.5) return '#22c55e';
  if (kg <= 5)   return '#D4890A';
  return '#ef4444';
}

export function co2Label(kg) {
  if (kg <= 1.5) return 'Très écolo';
  if (kg <= 5)   return 'Modéré';
  return 'Polluant';
}

// ── Temps réel simulé ─────────────────────────────────────────────────────────
// Retourne le prochain départ à partir de maintenant (ou null si aucun aujourd'hui)
export function nextDeparture(departures = []) {
  if (!departures.length) return null;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const d of departures) {
    const [h, m] = d.split(':').map(Number);
    const depMin = h * 60 + m;
    if (depMin > nowMin) {
      const diff = depMin - nowMin;
      const hLeft = Math.floor(diff / 60);
      const mLeft = diff % 60;
      return { time: d, diffMin: diff, label: hLeft > 0 ? `Dans ${hLeft}h${String(mLeft).padStart(2,'0')}` : `Dans ${mLeft} min` };
    }
  }
  // Premier départ demain
  const first = departures[0];
  const [h, m] = first.split(':').map(Number);
  const tomorrowMin = 24 * 60 - nowMin + h * 60 + m;
  return { time: first, diffMin: tomorrowMin, label: `Demain ${first}`, tomorrow: true };
}

// Places disponibles simulées (stable par route + heure pour éviter le flickering)
export function simulatedSeats(routeKey, departureTime) {
  const seed = [...(routeKey + departureTime)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = (seed % 40) + 5;
  return Math.max(1, base);
}
