import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowRight, Shield, Star, Users, Car,
  CheckCircle, ChevronRight, ChevronDown,
  TrendingDown, Lock, ThumbsUp, MessageCircle, Award, ArrowLeftRight,
  Navigation, Map, Leaf, Train, Bus,
  Gift, Copy, Check, TrendingUp, Trophy, Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { reverseGeocode } from '../utils/geocode';
import api from '../services/api';

const MapPicker = lazy(() => import('../components/MapPicker'));
const RouteMap  = lazy(() => import('../components/RouteMap'));

/* ─── DATA ─────────────────────────────────────── */
const STATS = [
  { value: '12 000+', label: 'Voyageurs actifs',  icon: Users },
  { value: '45+',     label: 'Villes connectées', icon: MapPin },
  { value: '4.8/5',   label: 'Note moyenne',       icon: Star },
  { value: '60%',     label: 'Économies vs taxi',  icon: TrendingDown },
];

const STEPS = [
  { num: '01', icon: MapPin,      title: 'Recherchez',     desc: 'Entrez votre destination et la date. Des centaines de trajets disponibles partout au Maroc.' },
  { num: '02', icon: Users,       title: 'Choisissez',     desc: 'Comparez les conducteurs, leurs notes et leurs tarifs avant de réserver.' },
  { num: '03', icon: CheckCircle, title: 'Voyagez serein', desc: 'Réservation confirmée en quelques secondes. Rencontrez votre conducteur et partez !' },
];

const TESTIMONIALS = [
  { name: 'Yasmine El Amrani', city: 'Casablanca', avatar: 'YE', color: '#e91e63', rating: 5,
    text:   "J'utilise AtlasWay chaque semaine pour aller à Rabat. J'économise presque 80 DH par trajet. Les conducteurs sont super sympas et ponctuels.",
    darija: "كنستعمل AtlasWay كل أسبوع باش نمشي لرباط. كنوفر قريب 80 درهم فكل رحلة. السواقة زوينين وفي الوقت.",
    detail: 'Utilise AtlasWay depuis 6 mois' },
  { name: 'Karim Benali',      city: 'Marrakech',  avatar: 'KB', color: '#2196f3', rating: 5,
    text:   "En tant que conducteur, j'ai remboursé mon carburant depuis le premier mois. La plateforme est simple et le paiement est clair.",
    darija: "بحال سائق، رجعت فلوس الكازوال من أول شهر. البلاتفورم سهلة وحساب الفلوس واضح.",
    detail: 'Conducteur — 43 trajets' },
  { name: 'Nadia Cherkaoui',   city: 'Fès',        avatar: 'NC', color: '#4caf50', rating: 5,
    text:   "J'ai fait Fès–Casablanca pour 80 DH au lieu de 150 DH en train. Profils vérifiés, inscription rapide. Incroyable !",
    darija: "درت فاس–الدار البيضاء ب80 درهم عوض 150 درهم بالطر. الپروفيلات محققة، التسجيل سريع. واو !",
    detail: 'Membre depuis 3 mois' },
];

const QUICK_ROUTES = [
  { from: 'Casablanca', to: 'Marrakech', price: '70 DH', duration: '~3h30', emoji: '🏙️' },
  { from: 'Rabat',      to: 'Casablanca', price: '30 DH', duration: '~1h',  emoji: '🕌' },
  { from: 'Fès',        to: 'Rabat',      price: '60 DH', duration: '~2h30', emoji: '🏔️' },
  { from: 'Tanger',     to: 'Casablanca', price: '80 DH', duration: '~4h',  emoji: '🌊' },
  { from: 'Agadir',     to: 'Marrakech',  price: '50 DH', duration: '~3h',  emoji: '🌴' },
  { from: 'Meknès',     to: 'Fès',        price: '20 DH', duration: '~45mn', emoji: '⛩️' },
];

const SAMPLE_TRIPS = [
  { from: 'Casablanca', to: 'Marrakech', depTime: '07:30', arrTime: '11:00', date: 'Demain', driver: 'Ahmed B.', rating: 4.9, seats: 2, price: 80, avatar: 'AB' },
  { from: 'Rabat',      to: 'Fès',       depTime: '09:00', arrTime: '11:30', date: 'Demain', driver: 'Sara M.',  rating: 5.0, seats: 3, price: 60, avatar: 'SM' },
  { from: 'Tanger',     to: 'Rabat',     depTime: '06:00', arrTime: '10:00', date: 'Lundi',  driver: 'Youssef K.', rating: 4.8, seats: 1, price: 90, avatar: 'YK' },
];

const FAQS = [
  { q: "C'est gratuit de s'inscrire ?",                   a: "Oui, l'inscription et la recherche de trajets sont totalement gratuites. Vous payez uniquement la participation aux frais directement au conducteur." },
  { q: 'Comment sont vérifiés les conducteurs ?',          a: 'Chaque conducteur doit confirmer son adresse email. Les passagers peuvent ensuite laisser des avis après chaque trajet.' },
  { q: 'Que se passe-t-il si le conducteur annule ?',      a: "Vous recevez une notification immédiate et pouvez rechercher un autre trajet. Nous recommandons de réserver quelques jours à l'avance." },
  { q: 'Comment contacter mon conducteur / passager ?',    a: 'Une messagerie intégrée est disponible directement sur la plateforme dès que votre réservation est confirmée.' },
  { q: 'Puis-je proposer mon propre trajet ?',             a: 'Absolument ! Tout utilisateur peut publier un trajet. Indiquez votre itinéraire, le prix par place et le nombre de places disponibles.' },
];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Laâyoune'];

const DESTINATIONS = [
  { city: 'Chefchaouen',  tag: 'La Ville Bleue',   gradient: 'linear-gradient(135deg,#1e40af,#3b82f6)', emoji: '🔵' },
  { city: 'Merzouga',     tag: 'Dunes du Sahara',   gradient: 'linear-gradient(135deg,#92400e,#d97706)', emoji: '🏜️' },
  { city: 'Essaouira',    tag: 'Cité des Vents',    gradient: 'linear-gradient(135deg,#065f46,#10b981)', emoji: '🌊' },
  { city: 'Marrakech',    tag: 'La Ville Rouge',    gradient: 'linear-gradient(135deg,#7f1d1d,#C1272D)',  emoji: '🕌' },
  { city: 'Ifrane',       tag: 'La Suisse du Maroc',gradient: 'linear-gradient(135deg,#1e3a5f,#4a90d9)', emoji: '❄️' },
  { city: 'Agadir',       tag: 'Plage & Soleil',    gradient: 'linear-gradient(135deg,#D4890A,#f59e0b)', emoji: '🌴' },
];

const LIVE_FEED = [
  { driver: 'Youssef K.', from: 'Casablanca', to: 'Marrakech', price: 80,  seats: 2, ago: '2 min' },
  { driver: 'Sara M.',    from: 'Rabat',       to: 'Fès',       price: 60,  seats: 3, ago: '5 min' },
  { driver: 'Ahmed B.',   from: 'Tanger',      to: 'Rabat',     price: 90,  seats: 1, ago: '8 min' },
  { driver: 'Fatima Z.',  from: 'Agadir',      to: 'Marrakech', price: 50,  seats: 2, ago: '11 min' },
  { driver: 'Omar L.',    from: 'Meknès',      to: 'Casablanca',price: 70,  seats: 4, ago: '14 min' },
  { driver: 'Nadia C.',   from: 'Oujda',       to: 'Fès',       price: 100, seats: 2, ago: '17 min' },
];

const MAP_CITIES = [
  { name: 'Tanger',     x: 180, y: 68  },
  { name: 'Tétouan',   x: 215, y: 80  },
  { name: 'Oujda',     x: 370, y: 130 },
  { name: 'Fès',       x: 295, y: 145 },
  { name: 'Meknès',    x: 255, y: 158 },
  { name: 'Rabat',     x: 175, y: 190 },
  { name: 'Casablanca',x: 170, y: 230 },
  { name: 'Marrakech', x: 215, y: 320 },
  { name: 'Agadir',    x: 140, y: 380 },
  { name: 'Laâyoune',  x: 100, y: 490 },
];

const MAP_ROUTES = [
  [0,5],[5,6],[6,4],[4,3],[3,1],[6,7],[7,8],[1,2],[2,3],
];

const CO2_BASE = 38420;

const PRICE_BARS = [
  { label: 'AtlasWay', emoji: '🚗', price: 80,  pct: 27,  color: '#B8232A', bold: true },
  { label: 'Bus CTM',  emoji: '🚌', price: 110, pct: 37,  color: '#D4890A' },
  { label: 'Train ONCF', emoji: '🚂', price: 155, pct: 52, color: '#6b7280' },
  { label: 'Grand Taxi', emoji: '🚕', price: 250, pct: 84, color: '#4b5563' },
  { label: 'Avion',    emoji: '✈️', price: 299, pct: 100, color: '#374151' },
];

const WEEKLY_PODIUM = [
  { rank: 2, from: 'Rabat',      to: 'Casablanca', count: 634, growth: '+8%',  emoji: '🥈', color: '#94a3b8' },
  { rank: 1, from: 'Casablanca', to: 'Marrakech',  count: 847, growth: '+12%', emoji: '🥇', color: '#D4890A' },
  { rank: 3, from: 'Fès',        to: 'Casablanca', count: 521, growth: '+15%', emoji: '🥉', color: '#b45309' },
];

const PRESS_MEDIA = [
  { name: 'Le360',    quote: '"La révolution du covoiturage au Maroc"' },
  { name: 'TelQuel',  quote: '"La startup marocaine qui change la mobilité"' },
  { name: 'Hespress', quote: '"12 000 voyageurs en moins d\'un an"' },
  { name: 'Yabiladi', quote: '"Sécurité et économies : AtlasWay décolle"' },
  { name: 'Medias24', quote: '"L\'appli qui bat les prix des taxis"' },
];

const CONFETTI_COLS = ['#B8232A','#D4890A','#005A2E','#F5EDD8','#B8232A','#D4890A','#005A2E','#F5EDD8','#B8232A','#D4890A','#005A2E','#F5EDD8'];
const CONFETTI_X    = [-26,-16,-6,4,14,24,-21,-11,1,11,21,28];

const CITY_EMOJI = {
  Casablanca: '🏙️', Marrakech: '🕌', Rabat: '🏛️', Fès: '⛩️',
  Tanger: '🌊', Agadir: '🌴', Meknès: '🏰', Oujda: '🌿',
  Tétouan: '🔵', 'Laâyoune': '🏜️', Chefchaouen: '💙',
  Essaouira: '🌬️', Merzouga: '🐪', Ifrane: '❄️',
};

function formatRideDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === tomorrow.toDateString()) return 'Demain';
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function adaptRide(ride) {
  const d = new Date(ride.departureDate);
  return {
    id: ride.id,
    from: ride.from,
    to: ride.to,
    depTime: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    arrTime: '—',
    date: formatRideDate(ride.departureDate),
    driver: `${ride.driver?.firstName || ''} ${ride.driver?.lastName?.[0] || ''}.`,
    rating: ride.driver?.avgRating || 0,
    seats: ride.seatsAvailable,
    price: ride.price,
    avatar: `${ride.driver?.firstName?.[0] || '?'}${ride.driver?.lastName?.[0] || ''}`,
  };
}

/* ─── COMPONENTS ────────────────────────────────── */

function CO2Counter() {
  const { t } = useLanguage();
  const h = t.home;
  const [count, setCount] = useState(CO2_BASE);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3 + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg,#052e16,#064e3b)' }}>
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
          style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Leaf size={12} /> {h.ecoLabel}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
          <span style={{ color: '#34d399', fontSize: 'clamp(2.5rem,6vw,4rem)', display: 'block', fontVariantNumeric: 'tabular-nums' }}>
            {count.toLocaleString('fr-FR')} kg
          </span>
          {h.ecoTitle}
        </h2>
        <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{h.ecoSub}</p>
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#34d399' }}>{Math.round(count / 22)} {h.ecoTrees}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{h.ecoTreesSub}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#34d399' }}>{Math.round(count / 0.21).toLocaleString('fr-FR')} km</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{h.ecoKmSub}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#34d399' }}>{Math.round(count * 0.12).toLocaleString('fr-FR')} DH</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{h.ecoFuelSub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoroccoMap() {
  const { t } = useLanguage();
  const h = t.home;
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>{h.networkLabel}</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.networkTitle}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{h.networkSub}</p>
        </div>
        <div className="flex justify-center">
          <svg viewBox="0 0 480 580" className="w-full max-w-xs">
            <style>{`
              @keyframes dashMove { to { stroke-dashoffset: -200; } }
              @keyframes pulse { 0%,100%{r:5} 50%{r:7} }
            `}</style>
            {MAP_ROUTES.map(([a, b], i) => {
              const ca = MAP_CITIES[a], cb = MAP_CITIES[b];
              return (
                <line key={i} x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                  stroke="#C1272D" strokeWidth="1.5" strokeOpacity="0.5"
                  strokeDasharray="8 12"
                  style={{ animation: `dashMove ${2.5 + i * 0.3}s linear infinite` }}
                />
              );
            })}
            {MAP_CITIES.map(({ name, x, y }) => (
              <g key={name}>
                <circle cx={x} cy={y} r="12" fill="rgba(193,39,45,0.08)" stroke="#C1272D" strokeWidth="1" strokeOpacity="0.25" />
                <circle cx={x} cy={y} r="5" fill="#C1272D" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                <text x={x + 9} y={y + 4} fontSize="8.5" fill="var(--text-secondary)" fontWeight="700">{name}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

function SavingsCalculator() {
  const { t } = useLanguage();
  const h = t.home;
  const [trips, setTrips] = useState(4);
  const atlaswayPrice = 80;
  const atlaswayTotal = atlaswayPrice * trips;
  const comparisons = [
    { label: 'Taxi',  icon: Car,   price: 350 },
    { label: 'CTM',   icon: Bus,   price: 110 },
    { label: 'Train', icon: Train, price: 145 },
  ];
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-900)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>{h.calcLabel}</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.calcTitle}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{h.calcSub}</p>
        </div>
        <div className="card p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>{h.tripsMonth}</label>
              <span className="text-2xl font-black" style={{ color: '#C1272D' }}>{trips}</span>
            </div>
            <input type="range" min="1" max="20" value={trips} onChange={e => setTrips(Number(e.target.value))}
              className="w-full cursor-pointer accent-red-600" aria-label={h.tripsMonth} />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>1</span><span>20 {h.tripsMonth}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {comparisons.map(({ label, icon: Icon, price }) => (
              <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                <Icon size={18} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-black line-through text-base" style={{ color: '#ef4444' }}>{price * trips} DH</p>
                <p className="text-xs mt-1" style={{ color: '#10b981' }}>-{(price - atlaswayPrice) * trips} DH</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.25)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{h.withAtlas}</p>
            <p className="text-4xl font-black" style={{ color: '#C1272D' }}>{atlaswayTotal} DH</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{atlaswayPrice} DH {h.perTrip} · {h.econSave} <strong style={{ color: '#D4890A' }}>{(350 - atlaswayPrice) * trips} DH/mois</strong> {h.vsTaxi}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DestinationsSection({ navigate }) {
  const { t } = useLanguage();
  const h = t.home;
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>{h.inspLabel}</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.inspTitle}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{h.inspSub}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DESTINATIONS.map(({ city, tag, gradient, emoji }) => (
            <button key={city} onClick={() => navigate(`/rides/search?to=${city}`)}
              className="relative rounded-2xl overflow-hidden group text-left hover:scale-[1.03] transition-transform duration-300"
              style={{ height: 140, background: gradient }}
              aria-label={`Trouver un trajet vers ${city}`}>
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <span className="text-3xl" aria-hidden="true">{emoji}</span>
                <div>
                  <p className="text-white font-black text-lg leading-none">{city}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{tag}</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.25)' }}>
                <span className="text-white text-sm font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  {h.seeRidesHover}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveFeedTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_FEED.length); setVisible(true); }, 350);
    }, 3500);
    return () => clearInterval(t);
  }, []);
  const { t } = useLanguage();
  const h = t.home;
  const item = LIVE_FEED[idx];
  return (
    <div className="ticker-terracotta py-2.5 px-4">
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <span className="text-xs font-black text-white shrink-0 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" /> {h.live}
        </span>
        <p className="text-white text-xs font-medium flex-1 overflow-hidden whitespace-nowrap"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
          🚗 <strong>{item.driver}</strong> vient de publier <strong>{item.from} → {item.to}</strong> — <strong>{item.price} DH</strong> · {item.seats} place{item.seats > 1 ? 's' : ''} · il y a {item.ago}
        </p>
        <Link to="/rides/search" className="text-xs font-bold text-white underline shrink-0">{h.seeArrow}</Link>
      </div>
    </div>
  );
}

function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} className="text-gold-400 fill-gold-400" />
      ))}
    </div>
  );
}

/* ── Diviseur étoile marocaine ── */
function MoroccanDivider({ label }) {
  return (
    <div className="moroccan-divider my-1">
      <svg width="16" height="16" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
        <path d="M10,1 L12.94,8.29 L19.51,8.62 L14.78,13.06 L16.18,19.51 L10,15.88 L3.82,19.51 L5.22,13.06 L0.49,8.62 L7.06,8.29Z" fill="currentColor"/>
      </svg>
      {label && <span>{label}</span>}
      <svg width="16" height="16" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
        <path d="M10,1 L12.94,8.29 L19.51,8.62 L14.78,13.06 L16.18,19.51 L10,15.88 L3.82,19.51 L5.22,13.06 L0.49,8.62 L7.06,8.29Z" fill="currentColor"/>
      </svg>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: 'transparent' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>{q}</span>
        <ChevronDown size={18} className={`transition-transform flex-shrink-0 ml-3 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
          {a}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const h = t.home;
  return (
    <div
      className="card cursor-pointer group hover:scale-[1.01] transition-all duration-200"
      onClick={() => navigate(`/rides/search?from=${trip.from}&to=${trip.to}`)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(193,39,45,0.12)', color: '#C1272D' }}>
          {trip.date}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: '#C1272D' }}>
            {trip.avatar}
          </div>
          <div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{trip.driver}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs flex items-center gap-0.5" style={{ color: '#D4890A' }}>
                <Star size={10} className="fill-current" /> {trip.rating}
              </span>
              <span className="badge-verified">{h.verified}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-stretch gap-3 mb-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#006233', background: '#006233' }} />
          <div className="flex-1 w-0.5" style={{ background: 'var(--border-muted)', minHeight: 32 }} />
          <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#C1272D', background: '#C1272D' }} />
        </div>
        <div className="flex flex-col justify-between flex-1 gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-base leading-none" style={{ color: 'var(--text-base)' }}>{trip.from}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{h.departure}</p>
            </div>
            <span className="font-mono font-bold text-sm" style={{ color: '#006233' }}>{trip.depTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-base leading-none" style={{ color: 'var(--text-base)' }}>{trip.to}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{h.arrival}</p>
            </div>
            <span className="font-mono font-bold text-sm" style={{ color: '#C1272D' }}>{trip.arrTime}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Users size={13} /> {trip.seats} {trip.seats > 1 ? h.seats : h.seat}
        </div>
        <div className="text-right">
          <span className="font-black text-lg" style={{ color: '#C1272D' }}>{trip.price} DH</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{h.perPerson}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── NEW SECTIONS ─────────────────────────────── */

function TopDriversSection({ drivers }) {
  const { t } = useLanguage();
  const h = t.home;
  if (!drivers || drivers.length === 0) return null;
  return (
    <section className="py-14 px-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4890A' }}>{h.communityLabel}</p>
            <h2 className="text-2xl font-black font-heading flex items-center gap-2" style={{ color: 'var(--text-base)' }}>
              <Trophy size={22} style={{ color: '#D4890A' }} /> {h.topDriversTitle}
            </h2>
          </div>
          <Link to="/rides/search" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C1272D' }}>
            {h.seeAllRides} <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {drivers.map((d, i) => (
            <Link key={d.id} to={`/profile/${d.id}`}
              className="flex-shrink-0 rounded-2xl p-5 text-center hover:scale-[1.02] transition-transform"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', minWidth: 155, borderTop: `3px solid ${i === 0 ? '#D4890A' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#C1272D'}` }}>
              {i < 3 && (
                <div className="text-lg mb-1">{['🥇', '🥈', '🥉'][i]}</div>
              )}
              {d.photo
                ? <img src={d.photo} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-3" />
                : <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-3"
                    style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
                    {d.firstName?.[0]}{d.lastName?.[0]}
                  </div>
              }
              <p className="font-bold text-sm leading-tight mb-1" style={{ color: 'var(--text-base)' }}>{d.firstName} {d.lastName}</p>
              <p className="text-xs flex items-center justify-center gap-1 mb-1" style={{ color: '#D4890A' }}>
                <Star size={11} className="fill-current" /> {d.avgRating?.toFixed(1) || '—'}
                <span style={{ color: 'var(--text-muted)' }}>({d.totalRatings || 0})</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.totalTrips || 0} trajet{d.totalTrips !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingSection({ trending }) {
  const { t } = useLanguage();
  const h = t.home;
  if (!trending || trending.length === 0) return null;
  return (
    <section className="py-14 px-4" style={{ background: 'var(--bg-900)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>{h.trendLabel}</p>
          <h2 className="text-2xl font-black font-heading flex items-center justify-center gap-2" style={{ color: 'var(--text-base)' }}>
            <TrendingUp size={22} style={{ color: '#C1272D' }} /> {h.trendTitle}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {trending.map((item, i) => (
            <Link key={item.city} to={`/rides/search?to=${item.city}`}
              className="rounded-2xl p-4 text-center hover:scale-[1.03] transition-all group"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <div className="relative inline-block mb-2">
                <span className="text-3xl">{CITY_EMOJI[item.city] || '📍'}</span>
                <span className="absolute -top-1 -right-2 w-5 h-5 rounded-full text-white font-black text-[10px] flex items-center justify-center"
                  style={{ background: i < 3 ? '#C1272D' : 'var(--bg-700)', color: i < 3 ? '#fff' : 'var(--text-muted)', fontSize: 9 }}>
                  #{i + 1}
                </span>
              </div>
              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-base)' }}>{item.city}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.cnt} trajet{item.cnt > 1 ? 's' : ''}</p>
              <p className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold" style={{ color: '#C1272D' }}>Voir →</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferralSection({ user }) {
  const { t } = useLanguage();
  const h = t.home;
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section className="px-4 py-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(193,39,45,0.3)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")" }} />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
                style={{ background: 'rgba(212,137,10,0.15)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.3)' }}>
                <Gift size={12} /> {h.refBadge}
              </div>
              <h3 className="text-xl font-black text-white mb-1">{h.refTitle}</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{h.refSub}</p>
            </div>
            {user ? (
              <div className="flex-shrink-0 text-center">
                <p className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{h.yourCode}</p>
                <div className="flex items-center gap-2">
                  <div className="px-5 py-3 rounded-xl font-mono font-black text-xl tracking-widest"
                    style={{ background: 'rgba(193,39,45,0.2)', color: '#fff', border: '1px solid rgba(193,39,45,0.4)', letterSpacing: '0.15em' }}>
                    {user.referralCode || '—'}
                  </div>
                  <button onClick={copy}
                    className="w-11 h-11 flex items-center justify-center rounded-xl transition-all"
                    style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: copied ? '#22c55e' : '#fff', border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.2)'}` }}
                    aria-label="Copier le code de parrainage">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{h.shareCodeNote}</p>
              </div>
            ) : (
              <Link to="/register"
                className="flex-shrink-0 flex items-center gap-2 font-bold px-5 py-3 rounded-xl transition-all"
                style={{ background: '#C1272D', color: '#fff' }}>
                <Gift size={16} /> {h.joinRef}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SPLASH SCREEN ─────────────────────────────── */
function SplashScreen() {
  const [gone,    setGone]    = useState(() => sessionStorage.getItem('atlas_splash') === '1');
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    if (gone) return;
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => { setGone(true); sessionStorage.setItem('atlas_splash', '1'); }, 560);
    }, 2100);
    return () => clearTimeout(t);
  }, [gone]);
  if (gone) return null;
  return (
    <div className={`splash-overlay${exiting ? ' exiting' : ''}`}>
      <svg width="90" height="90" viewBox="0 0 20 20">
        <path className="splash-star-path"
          d="M10,1 L12.94,8.29 L19.51,8.62 L14.78,13.06 L16.18,19.51 L10,15.88 L3.82,19.51 L5.22,13.06 L0.49,8.62 L7.06,8.29Z"
          fill="none" stroke="#D4890A" strokeWidth="0.7" />
      </svg>
      <p className="splash-title" style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: '2rem', color: '#F5EDD8', letterSpacing: '0.06em' }}>
        Atlas<span style={{ color: '#D4890A' }}>Way</span>
      </p>
      <p className="splash-sub" style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: '0.9rem', color: 'rgba(212,137,10,0.6)', letterSpacing: '0.2em' }}>
        رفيق الطريق في المغرب
      </p>
    </div>
  );
}

/* ─── CURSEUR ÉTOILE MAROCAINE ───────────────────── */
function MoroccanCursor() {
  const starRef = useRef(null);
  const dotRef  = useRef(null);
  const rafRef  = useRef(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.body.classList.add('custom-cursor');
    const move = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX, y = e.clientY;
        if (starRef.current) {
          starRef.current.style.left = x + 'px';
          starRef.current.style.top  = y + 'px';
        }
        if (dotRef.current) {
          dotRef.current.style.left = x + 'px';
          dotRef.current.style.top  = y + 'px';
        }
        const el = document.elementFromPoint(x, y);
        const hot = !!el?.closest('a,button,[role="button"],input,select,textarea');
        if (starRef.current)
          starRef.current.style.transform = `translate(-50%,-50%) scale(${hot ? 1.7 : 1})`;
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  return (
    <>
      <div ref={starRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 999999, left: -200, top: -200, transform: 'translate(-50%,-50%) scale(1)', transition: 'transform 0.15s ease', willChange: 'left,top' }}>
        <svg width="24" height="24" viewBox="0 0 20 20" style={{ display: 'block' }}>
          <path d="M10,1 L12.94,8.29 L19.51,8.62 L14.78,13.06 L16.18,19.51 L10,15.88 L3.82,19.51 L5.22,13.06 L0.49,8.62 L7.06,8.29Z" fill="#D4890A" />
        </svg>
      </div>
      <div ref={dotRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 999999, left: -200, top: -200, width: 5, height: 5, background: '#B8232A', borderRadius: '50%', transform: 'translate(-50%,-50%)', willChange: 'left,top' }} />
    </>
  );
}

/* ─── BANDEAU AÏD AL-ADHA ────────────────────────── */
function SeasonalBanner() {
  const { t: globalT } = useLanguage();
  const h = globalT.home;
  const [timer, setTimer] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const eid = new Date('2026-06-06T00:00:00');
    const tick = () => {
      const diff = eid - new Date();
      if (diff <= 0) return;
      setTimer({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000) });
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  if (timer.d > 30 || timer.d < 0) return null;
  return (
    <div className="seasonal-banner py-3 px-4">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">☪️</span>
          <div>
            <p className="font-black text-white text-sm">{h.eidTitle}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{h.eidSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[{ v: timer.d, l: h.days }, { v: timer.h, l: 'h' }, { v: timer.m, l: 'min' }].map(({ v, l }) => (
            <div key={l} className="text-center px-3 py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', minWidth: 44 }}>
              <p className="font-black text-white leading-none" style={{ fontSize: '1.05rem' }}>{String(v).padStart(2, '0')}</p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.55)' }}>{l}</p>
            </div>
          ))}
          <Link to="/rides/search" className="ml-2 hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background: 'rgba(212,137,10,0.2)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.35)' }}>
            {h.seeArrow}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── COMPARATEUR PRIX — BARRES VISUELLES ────────── */
function PriceSnapshotSection() {
  const { t } = useLanguage();
  const h = t.home;
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true); }, { threshold: 0.25 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section ref={ref} className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>{h.priceLabel}</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Casablanca → Marrakech</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>{h.priceSub}</p>
        </div>
        <div className="card p-6 flex flex-col gap-5">
          {PRICE_BARS.map(({ label, emoji, price, pct, color, bold }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ fontWeight: bold ? 800 : 500, color: bold ? '#F5EDD8' : 'var(--text-secondary)' }}>
                  <span aria-hidden="true">{emoji}</span> {label}
                  {bold && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,35,42,0.15)', color: '#B8232A' }}>{h.cheapest}</span>}
                </span>
                <span className="font-black text-sm" style={{ color: bold ? '#B8232A' : 'var(--text-muted)' }}>{price} DH</span>
              </div>
              <div style={{ background: 'var(--bg-700)', borderRadius: 99, overflow: 'hidden', height: 10 }}>
                <div className="price-bar-animated" style={{ width: animate ? `${pct}%` : '0%', background: color, opacity: bold ? 1 : 0.45, transitionDelay: bold ? '0s' : '0.1s' }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-center mt-2" style={{ color: 'rgba(184,35,42,0.75)' }}>{h.priceSavingsNote}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── PODIUM TRAJETS ─────────────────────────────── */
function WeeklyPodiumSection() {
  const { t } = useLanguage();
  const h = t.home;
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-900)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>{h.podiumLabel}</p>
          <h2 className="text-2xl font-black font-heading flex items-center justify-center gap-2" style={{ color: 'var(--text-base)' }}>
            <Trophy size={22} style={{ color: '#D4890A' }} /> {h.podiumTitle}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {WEEKLY_PODIUM.map(({ rank, from, to, count, growth, emoji, color }) => (
            <Link key={rank} to={`/rides/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}
              className="podium-card"
              style={{
                flex: '1 1 140px', maxWidth: 210,
                minHeight: rank === 1 ? 190 : rank === 2 ? 162 : 138,
                background: 'var(--card-bg)',
                border: `1px solid ${rank === 1 ? 'rgba(212,137,10,0.35)' : 'var(--border-color)'}`,
                borderTop: `4px solid ${color}`,
                borderRadius: 14, padding: '1.25rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
                textDecoration: 'none',
                boxShadow: rank === 1 ? '0 8px 30px rgba(212,137,10,0.1)' : 'none',
              }}>
              <p style={{ fontSize: '2rem' }} aria-hidden="true">{emoji}</p>
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-base)', textAlign: 'center', lineHeight: 1.35 }}>
                {from}<br /><span style={{ color: '#B8232A' }}>→</span> {to}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{count} {h.reservations}</p>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,90,46,0.1)', color: '#00a854' }}>{growth} {h.growth}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION PRESSE MAROCAINE ───────────────────── */
function PressSection() {
  const { t } = useLanguage();
  const h = t.home;
  return (
    <section className="py-14 px-4" style={{ background: 'var(--bg-800)', borderTop: '1px solid var(--border-color)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4890A' }}>{h.pressLabel}</p>
          <h2 className="text-2xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.pressTitle}</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {PRESS_MEDIA.map(p => <div key={p.name} className="press-logo">{p.name}</div>)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRESS_MEDIA.slice(0, 3).map(p => (
            <div key={p.name} className="card p-4">
              <p className="font-black text-xs mb-2" style={{ color: '#D4890A' }}>{p.name}</p>
              <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ──────────────────────────────────────── */
export default function Home() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { t }       = useLanguage();
  const h           = t.home;
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');
  const [date,    setDate]    = useState('');
  const [pax,     setPax]     = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [realTrips,   setRealTrips]   = useState([]);
  const [topDrivers,  setTopDrivers]  = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [showDarija,  setShowDarija]  = useState(false);
  const [burst,       setBurst]       = useState(false);

  useEffect(() => {
    api.get('/rides/home').then(({ data }) => {
      if (data.upcoming?.length)   setRealTrips(data.upcoming.map(adaptRide));
      if (data.topDrivers?.length) setTopDrivers(data.topDrivers);
      if (data.trending?.length)   setTrending(data.trending);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setBurst(true);
    setTimeout(() => setBurst(false), 1100);
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to)   p.set('to', to);
    if (date) p.set('date', date);
    navigate(`/rides/search?${p.toString()}`);
  };

  const handleVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      const m = txt.match(/(?:de\s+)?(.+?)\s+(?:vers|à|pour|jusqu'?à)\s+(.+)/i);
      if (m) {
        const cap = s => s.trim().replace(/\b\w/g, c => c.toUpperCase());
        setFrom(cap(m[1]));
        setTo(cap(m[2]));
      }
    };
    rec.start();
  };

  const swap = () => { setFrom(to); setTo(from); };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const city = await reverseGeocode(coords.latitude, coords.longitude);
        if (city) setFrom(city);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  return (
    <>
    <div className="overflow-x-hidden">
      <SplashScreen />

      {/* ══════════════════════════════════════
           HERO — Riad de Luxe / Nuit de Médina
          ══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(150deg, #0F0704 0%, #1E0D07 45%, #2A1008 70%, #160905 100%)',
        position: 'relative', overflow: 'hidden',
        minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Barre drapeau marocain — rouge/vert exact */}
        <div className="flag-bar-full" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

        {/* Lueur safran — effet lanterne de riad */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '55%', height: '70%',
          background: 'radial-gradient(ellipse, rgba(212,137,10,0.09) 0%, rgba(184,35,42,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Villes du Maroc en arabe — texte fantôme */}
        <div style={{
          position: 'absolute', bottom: '-2%', left: 0, right: 0,
          fontSize: 'clamp(48px, 8vw, 110px)',
          fontFamily: 'Amiri, serif', fontWeight: 700, lineHeight: 1,
          color: 'transparent', WebkitTextStroke: '1px rgba(212,137,10,0.06)',
          userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap',
          letterSpacing: '0.05em', textAlign: 'center',
        }}>مراكش · الدار البيضاء · فاس · طنجة · أكادير</div>

        {/* Grain overlay — sections sombres uniquement */}
        <div className="grain-overlay" style={{ position: 'absolute', inset: 0 }} />

        <div className="max-w-6xl mx-auto px-6 py-16 pt-24 w-full relative z-10">

          {/* Badge trust */}
          <div className="mb-8 animate-fade-up stagger-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(212,137,10,0.1)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.3)', fontSize: '0.75rem', fontWeight: 700 }}>
              {h.badge} <Stars n={5} />
            </div>
          </div>

          {/* Layout deux colonnes */}
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>

            {/* GAUCHE — Titre Amiri calligraphique */}
            <div style={{ flex: '1 1 340px', minWidth: 0 }}>

              <span className="arabesque-label animate-fade-up stagger-2">{h.label}</span>

              <h1 className="font-heading animate-fade-up stagger-3"
                style={{ fontSize: 'clamp(2.1rem, 3.8vw, 3.6rem)', lineHeight: 1.1, color: '#F5EDD8', fontWeight: 700, marginTop: '1rem', marginBottom: '1.25rem' }}>
                {h.title1}<br />
                <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(212,137,10,0.75)', fontStyle: 'italic' }}>{h.title2}</span>
              </h1>

              {/* Diviseur étoile + description */}
              <MoroccanDivider />
              <p className="animate-fade-up stagger-4"
                style={{ color: 'rgba(245,237,216,0.7)', fontSize: '1rem', lineHeight: 1.8, margin: '0.75rem 0 1.5rem' }}>
                {h.desc} <strong style={{ color: '#D4890A' }}>{h.desc60}</strong> {h.descEnd}
              </p>

              {/* Stats en ligne */}
              <div className="animate-fade-up stagger-5"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {STATS.map(({ value, icon: Icon }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Icon size={13} style={{ color: '#D4890A', flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#F5EDD8' }}>{value}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(245,237,216,0.45)' }}>{h.statLabels[i]}</span>
                  </div>
                ))}
              </div>

              {/* Chips trust */}
              <div className="animate-fade-up stagger-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {h.chips.map(chip => (
                  <span key={chip} style={{
                    fontSize: '0.7rem', padding: '0.3rem 0.7rem', borderRadius: 99,
                    background: 'rgba(245,237,216,0.05)', border: '1px solid rgba(245,237,216,0.1)',
                    color: 'rgba(245,237,216,0.5)',
                  }}>{chip}</span>
                ))}
              </div>
            </div>

            {/* DROITE — Carte de recherche avec arc mauresque */}
            <div className="animate-fade-up stagger-4" style={{ flex: '0 0 400px', width: '100%', maxWidth: '100%' }}>
              <div className="safran-glow" style={{
                background: 'linear-gradient(160deg, #1C0C07 0%, #200F08 100%)',
                border: '1px solid rgba(212,137,10,0.28)',
                borderRadius: 20, padding: '1.5rem',
                boxShadow: '0 24px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(212,137,10,0.1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Arc mauresque décoratif en tête */}
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 80, height: 38, borderRadius: '0 0 40px 40px',
                  background: 'linear-gradient(to bottom, rgba(212,137,10,0.15), transparent)',
                  borderLeft: '1px solid rgba(212,137,10,0.2)',
                  borderRight: '1px solid rgba(212,137,10,0.2)',
                  borderBottom: '1px solid rgba(212,137,10,0.15)',
                }} />
                {/* Ligne drapeau en tête */}
                <div className="flag-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4890A', margin: 0 }}>
                    {h.findRide}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={handleVoiceSearch}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 600, padding: '0.4rem 0.7rem', borderRadius: 8, background: 'rgba(0,90,46,0.1)', color: '#00a854', border: '1px solid rgba(0,90,46,0.22)', cursor: 'pointer', minHeight: 36 }}>
                      <Mic size={12} /> {h.voiceBtn}
                    </button>
                    <button type="button" onClick={() => setShowMap(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', fontWeight: 600, padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(212,137,10,0.1)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.22)', cursor: 'pointer', minHeight: 36 }}>
                      <Map size={12} /> {h.mapBtn}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSearch}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: '#005A2E' }} />
                      <input value={from} onChange={e => setFrom(e.target.value)}
                        placeholder={h.fromPh} className="input pl-8 pr-9 text-sm" list="from-list" />
                      <datalist id="from-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                      <button type="button" onClick={handleGeolocate} disabled={locating} title="Ma position"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all"
                        style={{ color: locating ? '#D4890A' : '#005A2E' }}>
                        {locating ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Navigation size={13} />}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: '#B8232A' }} />
                      <input value={to} onChange={e => setTo(e.target.value)}
                        placeholder={h.toPh} className="input pl-8 pr-9 text-sm" list="to-list" />
                      <datalist id="to-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                      <button type="button" onClick={swap} title="Inverser"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded transition-all"
                        style={{ color: 'rgba(245,237,216,0.38)' }}>
                        <ArrowLeftRight size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} className="input text-sm" />
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
                      <select value={pax} onChange={e => setPax(Number(e.target.value))} className="input pl-9 text-sm appearance-none">
                        {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n > 1 ? h.paxN : h.pax1}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
                      style={{ height: 46, borderRadius: 12 }}>
                      {h.searchBtn} <ArrowRight size={15} />
                    </button>
                    {burst && (
                      <div className="confetti-container">
                        {CONFETTI_X.map((x, i) => (
                          <div key={i} className="confetti-piece" style={{ left: x, background: CONFETTI_COLS[i], animationDelay: `${i * 0.055}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                </form>

                {from && to && (
                  <div style={{ marginTop: '1rem' }}>
                    <Suspense fallback={<div style={{ height: 150, borderRadius: 10, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,237,216,0.3)', fontSize: 13 }}>{h.mapLoading}</div>}>
                      <RouteMap from={from} to={to} height={150} />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMap && (
          <Suspense fallback={null}>
            <MapPicker initialFrom={from} initialTo={to}
              onConfirm={(f, t) => { setFrom(f); setTo(t); setShowMap(false); }}
              onClose={() => setShowMap(false)} />
          </Suspense>
        )}
      </section>

      <SeasonalBanner />
      <LiveFeedTicker />

      {/* ── STATS BAR ── */}
      <div style={{ background: 'var(--bg-800)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="gold-section-rule" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ value, icon: Icon }, i) => (
            <div key={i} className={`text-center py-7 px-4 animate-fade-up stagger-${i + 1}`}
              style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon size={15} style={{ color: '#D4890A' }} aria-hidden="true" />
                <span className="text-2xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{value}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.statLabels[i]}</p>
            </div>
          ))}
        </div>
        <div className="gold-section-rule" />
      </div>

      <CO2Counter />

      {/* ── QUICK ROUTES (scroll horizontal) ── */}
      <section className="py-10 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4890A' }}>{h.popularLabel}</p>
              <h2 className="text-xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.popularTitle}</h2>
            </div>
            <Link to="/rides/search" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C1272D' }}>
              {h.seeAll} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {QUICK_ROUTES.map(r => (
              <button
                key={`${r.from}-${r.to}`}
                onClick={() => navigate(`/rides/search?from=${r.from}&to=${r.to}`)}
                className="flex-shrink-0 rounded-xl p-4 text-left transition-all hover:scale-105"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', minWidth: 160, borderTop: '2px solid #C1272D' }}
              >
                <span className="text-2xl block mb-2">{r.emoji}</span>
                <p className="font-bold text-sm leading-none mb-1" style={{ color: 'var(--text-base)' }}>{r.from}</p>
                <div className="flex items-center gap-1 mb-2">
                  <ArrowRight size={10} style={{ color: '#C1272D' }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.to}</p>
                </div>
                <p className="font-black text-sm" style={{ color: '#C1272D' }}>{r.price}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.duration}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <MoroccoMap />

      <TrendingSection trending={trending} />
      <WeeklyPodiumSection />

      {/* ── PROMO BANNER ── */}
      <section className="px-4 py-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C1272D, #9e1f24)' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")" }} />
            <div className="relative">
              <p className="font-black text-white text-lg">{h.promoTitle}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{h.promoSub}</p>
            </div>
            {!user && (
              <Link to="/register" className="flex-shrink-0 flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all" style={{ background: '#fff', color: '#C1272D', fontSize: '0.9rem' }}>
                {h.signupFree} <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── TRAJETS DISPONIBLES ── */}
      <section className="py-12 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4890A' }}>{h.realtimeLabel}</p>
              <h2 className="text-2xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.availRides}</h2>
            </div>
            <Link to="/rides/search" className="btn-primary text-sm py-2 px-4 rounded-xl flex items-center gap-1.5">
              {h.seeAll} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(realTrips.length ? realTrips : SAMPLE_TRIPS).map((trip, i) => <TripCard key={i} trip={trip} />)}
          </div>
          {realTrips.length === 0 && (
            <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{h.sampleNote}</p>
          )}
        </div>
      </section>

      {/* ── PUBLISH CTA (gold) ── */}
      <section className="px-4 py-4 pb-12" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4890A, #a86508)', boxShadow: '0 8px 32px rgba(212,137,10,0.25)' }}>
            <div>
              <p className="font-black text-white text-xl mb-1">{h.driverTitle}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {h.driverSub}<br />
                <strong className="text-white">{h.driverSavings}</strong>.
              </p>
            </div>
            <Link to="/rides/publish" className="flex-shrink-0 flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all" style={{ background: '#fff', color: '#D4890A', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <Car size={18} /> {h.publishRide}
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-800)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>{h.howLabel}</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>{h.howTitle}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{h.howSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ num, icon: Icon }, i) => (
              <div key={num} className={`relative animate-fade-up stagger-${i + 1}`}>
                <div className="card p-6 h-full" style={{ borderTop: '2px solid rgba(196,136,42,0.4)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-heading font-black leading-none" style={{ fontSize: '3.5rem', color: 'rgba(196,136,42,0.18)' }}>{num}</span>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(196,136,42,0.1)', border: '1px solid rgba(196,136,42,0.2)' }}>
                      <Icon size={20} style={{ color: '#C4882A' }} />
                    </div>
                  </div>
                  <h3 className="font-heading font-black text-lg mb-2" style={{ color: 'var(--text-base)' }}>{h.steps[i].title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{h.steps[i].desc}</p>
                </div>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10" size={20} style={{ color: 'var(--border-muted)' }} />}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/rides/search" className="btn-primary inline-flex items-center gap-2 py-3 px-8 rounded-xl">
              {h.seeAvailRides} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <DestinationsSection navigate={navigate} />
      <TopDriversSection drivers={topDrivers} />
      <SavingsCalculator />
      <PriceSnapshotSection />
      <ReferralSection user={user} />

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>{h.trustLabel}</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>{h.testTitle}</h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Stars n={5} /> <span className="font-semibold ml-1" style={{ color: 'var(--text-base)' }}>4.8/5</span> {h.ratingNote}
              </div>
              <button onClick={() => setShowDarija(v => !v)}
                style={{ fontSize: '0.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: 99, border: '1px solid rgba(212,137,10,0.35)', color: showDarija ? '#D4890A' : 'var(--text-muted)', background: showDarija ? 'rgba(212,137,10,0.08)' : 'transparent', transition: 'all 0.2s' }}>
                {showDarija ? h.frToggle : h.darijaToggle}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, city, avatar, color, rating, text, darija, detail }, i) => (
              <div key={name} className={`card p-5 flex flex-col gap-4 animate-fade-up stagger-${i + 1}`}>
                <Stars n={rating} />
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)', fontFamily: showDarija ? "'Amiri', serif" : 'inherit', direction: showDarija ? 'rtl' : 'ltr', fontSize: showDarija ? '1rem' : undefined, transition: 'all 0.2s' }}>
                  "{showDarija ? darija : text}"
                </p>
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0" style={{ background: color }}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-base)' }}>{name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{city} · {detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PressSection />

      {/* ── TRUST & SAFETY ── */}
      <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>{h.safeLabel}</p>
            <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.safeTitle}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[Shield, Lock, ThumbsUp, MessageCircle].map((Icon, i) => (
              <div key={i} className="card p-5 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(193,39,45,0.1)', border: '1px solid rgba(193,39,45,0.2)' }}>
                  <Icon size={20} style={{ color: '#C1272D' }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-base)' }}>{h.trustFeatures[i].title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{h.trustFeatures[i].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARATEUR CTA ── */}
      <section className="px-4 py-4" style={{ background: 'var(--bg-800)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', border: '1px solid rgba(0,188,212,0.25)' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🗺️</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(0,188,212,0.15)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.3)' }}>
                  {h.compareBadge}
                </span>
              </div>
              <p className="font-black text-white text-xl mb-1">{h.compareTitle}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {h.compareSub}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {['🚗 80 DH · 3h30', '🚂 155 DH · 2h15', '🚌 110 DH · 4h', '✈️ 299 DH · 45min'].map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded-lg font-mono" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}>{t}</span>
                ))}
              </div>
            </div>
            <Link to="/compare"
              className="flex-shrink-0 flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all"
              style={{ background: '#00BCD4', color: '#fff', boxShadow: '0 4px 16px rgba(0,188,212,0.3)' }}>
              {h.compareNow} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>{h.faqLabel}</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>{h.faqTitle}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{h.faqSub}</p>
          </div>
          <div className="flex flex-col gap-3">
            {h.faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      {!user && (
        <section className="py-20 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #C1272D 0%, #9e1f24 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")" }} />
          <div className="relative max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-5" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Award size={12} /> {h.joinCommunity}
            </div>
            <h2 className="font-black text-white mb-3 font-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              {h.finalTitle1}<br />
              <span style={{ color: '#fde68a' }}>{h.finalTitle2}</span>
            </h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {h.finalSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold transition-all" style={{ background: '#fff', color: '#C1272D' }}>
                {h.createAccount} <ArrowRight size={16} />
              </Link>
              <Link to="/rides/search" className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                {h.seeRidesFinal}
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
    </>
  );
}
