import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowRight, Shield, Star, Users, Car,
  CheckCircle, ChevronRight, ChevronDown,
  TrendingDown, Lock, ThumbsUp, MessageCircle, Award, ArrowLeftRight,
  Navigation, Map, Leaf, Train, Bus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reverseGeocode } from '../utils/geocode';

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
  { name: 'Yasmine El Amrani', city: 'Casablanca', avatar: 'YE', color: '#e91e63', rating: 5, text: "J'utilise AtlasWay chaque semaine pour aller à Rabat. J'économise presque 80 DH par trajet. Les conducteurs sont super sympas et ponctuels.", detail: 'Utilise AtlasWay depuis 6 mois' },
  { name: 'Karim Benali',      city: 'Marrakech',  avatar: 'KB', color: '#2196f3', rating: 5, text: "En tant que conducteur, j'ai remboursé mon carburant depuis le premier mois. La plateforme est simple et le paiement est clair.",             detail: 'Conducteur — 43 trajets' },
  { name: 'Nadia Cherkaoui',   city: 'Fès',        avatar: 'NC', color: '#4caf50', rating: 5, text: "J'ai fait Fès–Casablanca pour 80 DH au lieu de 150 DH en train. Profils vérifiés, inscription rapide. Incroyable !",                       detail: 'Membre depuis 3 mois' },
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

/* ─── COMPONENTS ────────────────────────────────── */

function CO2Counter() {
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
          <Leaf size={12} /> Impact environnemental en temps réel
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
          <span style={{ color: '#34d399', fontSize: 'clamp(2.5rem,6vw,4rem)', display: 'block', fontVariantNumeric: 'tabular-nums' }}>
            {count.toLocaleString('fr-FR')} kg
          </span>
          de CO₂ évités grâce à AtlasWay
        </h2>
        <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Chaque trajet partagé = moins de voitures sur la route. Ce compteur augmente en temps réel.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#34d399' }}>{Math.round(count / 22)} arbres</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>équivalent arbres plantés</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#34d399' }}>{Math.round(count / 0.21).toLocaleString('fr-FR')} km</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>de trajets partagés</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: '#34d399' }}>{Math.round(count * 0.12).toLocaleString('fr-FR')} DH</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>économisés en carburant</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoroccoMap() {
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>Réseau AtlasWay</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Connecté à tout le Maroc</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Des trajets disponibles chaque jour entre toutes les grandes villes</p>
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
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>Calculateur</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Combien allez-vous économiser ?</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Exemple sur le trajet Casablanca → Marrakech</p>
        </div>
        <div className="card p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-base)' }}>Trajets par mois</label>
              <span className="text-2xl font-black" style={{ color: '#C1272D' }}>{trips}</span>
            </div>
            <input type="range" min="1" max="20" value={trips} onChange={e => setTrips(Number(e.target.value))}
              className="w-full cursor-pointer accent-red-600" />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>1</span><span>20 trajets/mois</span>
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
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Avec AtlasWay</p>
            <p className="text-4xl font-black" style={{ color: '#C1272D' }}>{atlaswayTotal} DH</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{atlaswayPrice} DH / trajet · économisez jusqu'à <strong style={{ color: '#D4890A' }}>{(350 - atlaswayPrice) * trips} DH/mois</strong> vs taxi</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DestinationsSection({ navigate }) {
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#D4890A' }}>Inspirations</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Découvrez le Maroc</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Cliquez sur une destination pour trouver un trajet</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DESTINATIONS.map(({ city, tag, gradient, emoji }) => (
            <button key={city} onClick={() => navigate(`/rides/search?to=${city}`)}
              className="relative rounded-2xl overflow-hidden group text-left hover:scale-[1.03] transition-transform duration-300"
              style={{ height: 140, background: gradient }}>
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className="text-white font-black text-lg leading-none">{city}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{tag}</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.25)' }}>
                <span className="text-white text-sm font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  Voir les trajets →
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
  const item = LIVE_FEED[idx];
  return (
    <div className="py-2.5 px-4" style={{ background: '#C1272D' }}>
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <span className="text-xs font-black text-white shrink-0 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" /> EN DIRECT
        </span>
        <p className="text-white text-xs font-medium flex-1 overflow-hidden whitespace-nowrap"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>
          🚗 <strong>{item.driver}</strong> vient de publier <strong>{item.from} → {item.to}</strong> — <strong>{item.price} DH</strong> · {item.seats} place{item.seats > 1 ? 's' : ''} · il y a {item.ago}
        </p>
        <Link to="/rides/search" className="text-xs font-bold text-white underline shrink-0">Voir →</Link>
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
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: '#C1272D' }}>
            {trip.avatar}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{trip.driver}</span>
          <span className="text-xs flex items-center gap-0.5" style={{ color: '#D4890A' }}>
            <Star size={10} className="fill-current" /> {trip.rating}
          </span>
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
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Départ</p>
            </div>
            <span className="font-mono font-bold text-sm" style={{ color: '#006233' }}>{trip.depTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-base leading-none" style={{ color: 'var(--text-base)' }}>{trip.to}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Arrivée</p>
            </div>
            <span className="font-mono font-bold text-sm" style={{ color: '#C1272D' }}>{trip.arrTime}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Users size={13} /> {trip.seats} place{trip.seats > 1 ? 's' : ''} dispo
        </div>
        <div className="text-right">
          <span className="font-black text-lg" style={{ color: '#C1272D' }}>{trip.price} DH</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>/pers</span>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ──────────────────────────────────────── */
export default function Home() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');
  const [date,    setDate]    = useState('');
  const [pax,     setPax]     = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to)   p.set('to', to);
    if (date) p.set('date', date);
    navigate(`/rides/search?${p.toString()}`);
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
    <div className="overflow-x-hidden">

      {/* ── HERO (rouge marocain) ── */}
      <section style={{ background: 'linear-gradient(160deg, #C1272D 0%, #9e1f24 60%, #7e181d 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Zellige pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Cpath d='M30 10 L50 30 L30 50 L10 30Z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E\")",
          pointerEvents: 'none'
        }} />

        <div className="max-w-5xl mx-auto px-4 pt-16 pb-10 relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
              <span>🇲🇦</span> +12 000 voyageurs au Maroc nous font confiance <Stars n={5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center font-black text-white leading-tight mb-3 font-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Voyagez partout au Maroc<br />
            <span style={{ color: '#fde68a' }}>pour moins cher.</span>
          </h1>
          <p className="text-center mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem' }}>
            Covoiturage simple, économique et sécurisé entre particuliers.
            Économisez jusqu'à <strong style={{ color: '#fde68a' }}>60%</strong> sur vos trajets.
          </p>

          {/* Search card */}
          <div className="rounded-2xl p-5 max-w-3xl mx-auto shadow-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C1272D' }}>
                Trouver un trajet maintenant
              </p>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)' }}
              >
                <Map size={13} /> Choisir sur la carte
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* From */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ background: '#006233' }} />
                  <input
                    value={from} onChange={e => setFrom(e.target.value)}
                    placeholder="Ville de départ"
                    className="input pl-8 pr-10 text-sm"
                    list="from-list"
                  />
                  <datalist id="from-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                  {/* GPS button */}
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={locating}
                    title="Détecter ma position"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all"
                    style={{ color: locating ? '#D4890A' : '#006233' }}
                  >
                    {locating
                      ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <Navigation size={14} />
                    }
                  </button>
                </div>
                {/* To */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ background: '#C1272D' }} />
                  <input
                    value={to} onChange={e => setTo(e.target.value)}
                    placeholder="Ville d'arrivée"
                    className="input pl-8 text-sm"
                    list="to-list"
                  />
                  <datalist id="to-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                  {/* Swap button */}
                  <button
                    type="button"
                    onClick={swap}
                    className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hidden md:flex"
                    style={{ background: 'var(--card-bg)', border: '2px solid var(--border-muted)', color: '#C1272D' }}
                    title="Inverser départ / arrivée"
                  >
                    <ArrowLeftRight size={13} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input text-sm"
                />
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-muted)' }} />
                  <select value={pax} onChange={e => setPax(Number(e.target.value))} className="input pl-9 text-sm appearance-none">
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 col-span-2 md:col-span-1" style={{ height: 48, borderRadius: 12 }}>
                  Rechercher <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* Mini RouteMap — apparaît quand départ ET arrivée sont renseignés */}
            {from && to && (
              <div className="mt-4">
                <Suspense fallback={<div style={{ height: 160, borderRadius: 12, background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Chargement de la carte…</div>}>
                  <RouteMap from={from} to={to} height={160} />
                </Suspense>
              </div>
            )}
          </div>

          {/* MapPicker modal */}
          {showMap && (
            <Suspense fallback={null}>
              <MapPicker
                initialFrom={from}
                initialTo={to}
                onConfirm={(f, t) => { setFrom(f); setTo(t); setShowMap(false); }}
                onClose={() => setShowMap(false)}
              />
            </Suspense>
          )}

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {['✅ Inscription gratuite', '✅ Sans engagement', '✅ Profils vérifiés', '✅ Avis authentiques'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <LiveFeedTicker />

      {/* ── STATS BAR ── */}
      <div style={{ background: 'var(--bg-800)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="h-1" style={{ background: 'linear-gradient(to right, #C1272D, #D4890A, #006233)' }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={label} className="text-center py-7 px-4" style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none' }}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon size={16} style={{ color: '#D4890A' }} />
                <span className="text-2xl font-black" style={{ color: 'var(--text-base)' }}>{value}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <CO2Counter />

      {/* ── QUICK ROUTES (scroll horizontal) ── */}
      <section className="py-10 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4890A' }}>Populaires</p>
              <h2 className="text-xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Trajets fréquents</h2>
            </div>
            <Link to="/rides/search" className="text-xs font-semibold flex items-center gap-1" style={{ color: '#C1272D' }}>
              Voir tout <ChevronRight size={14} />
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

      {/* ── PROMO BANNER ── */}
      <section className="px-4 py-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C1272D, #9e1f24)' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")" }} />
            <div className="relative">
              <p className="font-black text-white text-lg">🎉 Inscrivez-vous gratuitement</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Profitez de trajets moins chers dès aujourd'hui</p>
            </div>
            {!user && (
              <Link to="/register" className="flex-shrink-0 flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all" style={{ background: '#fff', color: '#C1272D', fontSize: '0.9rem' }}>
                S'inscrire gratuitement <ArrowRight size={15} />
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
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4890A' }}>Bientôt</p>
              <h2 className="text-2xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Prochains trajets</h2>
            </div>
            <Link to="/rides/search" className="btn-primary text-sm py-2 px-4 rounded-xl flex items-center gap-1.5">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SAMPLE_TRIPS.map((trip, i) => <TripCard key={i} trip={trip} />)}
          </div>
        </div>
      </section>

      {/* ── PUBLISH CTA (gold) ── */}
      <section className="px-4 py-4 pb-12" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4890A, #a86508)', boxShadow: '0 8px 32px rgba(212,137,10,0.25)' }}>
            <div>
              <p className="font-black text-white text-xl mb-1">🚗 Vous conduisez ?</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Publiez votre trajet en 2 minutes et partagez les frais.<br />
                Certains conducteurs économisent <strong className="text-white">500 DH/mois</strong>.
              </p>
            </div>
            <Link to="/rides/publish" className="flex-shrink-0 flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all" style={{ background: '#fff', color: '#D4890A', fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <Car size={18} /> Publier mon trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-800)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>Simple & rapide</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>Comment ça marche ?</h2>
            <p style={{ color: 'var(--text-muted)' }}>Réservez votre prochain trajet en moins de 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num} className="relative">
                <div className="card p-6 hover:border-primary-500/30 transition-all h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl font-black leading-none" style={{ color: 'var(--border-muted)' }}>{num}</span>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(193,39,45,0.1)', border: '1px solid rgba(193,39,45,0.2)' }}>
                      <Icon size={20} style={{ color: '#C1272D' }} />
                    </div>
                  </div>
                  <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-base)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10" size={20} style={{ color: 'var(--border-muted)' }} />}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/rides/search" className="btn-primary inline-flex items-center gap-2 py-3 px-8 rounded-xl">
              Voir les trajets disponibles <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <DestinationsSection navigate={navigate} />
      <SavingsCalculator />

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>Ils nous font confiance</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>Ce que disent nos voyageurs</h2>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Stars n={5} /> <span className="font-semibold ml-1" style={{ color: 'var(--text-base)' }}>4.8/5</span> basé sur des avis réels
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, city, avatar, color, rating, text, detail }) => (
              <div key={name} className="card p-5 flex flex-col gap-4">
                <Stars n={rating} />
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>"{text}"</p>
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

      {/* ── TRUST & SAFETY ── */}
      <section className="py-16 px-4" style={{ background: 'var(--bg-800)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>Sécurité & confiance</p>
            <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>Votre sécurité, notre priorité</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield,        title: 'Profils vérifiés',   desc: 'Email confirmé pour chaque compte.' },
              { icon: Lock,          title: 'Données sécurisées',  desc: 'Vos informations sont protégées.' },
              { icon: ThumbsUp,      title: 'Avis authentiques',   desc: 'Notations réelles après chaque trajet.' },
              { icon: MessageCircle, title: 'Support réactif',     desc: 'Équipe disponible 7j/7.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(193,39,45,0.1)', border: '1px solid rgba(193,39,45,0.2)' }}>
                  <Icon size={20} style={{ color: '#C1272D' }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-base)' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-900)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>Questions fréquentes</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>Vous avez des questions ?</h2>
            <p style={{ color: 'var(--text-muted)' }}>Tout ce que vous devez savoir avant de commencer</p>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      {!user && (
        <section className="py-20 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #C1272D 0%, #9e1f24 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E\")" }} />
          <div className="relative max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-5" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Award size={12} /> Rejoignez la communauté
            </div>
            <h2 className="font-black text-white mb-3 font-heading" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Prêt à voyager<br />
              <span style={{ color: '#fde68a' }}>autrement ?</span>
            </h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Inscription gratuite · Sans engagement · 12 000+ voyageurs satisfaits
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold transition-all" style={{ background: '#fff', color: '#C1272D' }}>
                Créer mon compte — C'est gratuit <ArrowRight size={16} />
              </Link>
              <Link to="/rides/search" className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-semibold transition-all" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                Voir les trajets
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
