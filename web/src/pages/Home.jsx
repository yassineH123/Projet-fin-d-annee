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
  {
    city: 'Chefchaouen', tag: 'La Ville Bleue', emoji: '🔵',
    gradient: 'linear-gradient(135deg,#1e40af,#3b82f6)',
    photo: 'https://images.unsplash.com/photo-1548018560-c7196bd9d35a?w=800&q=80&fit=crop&crop=center',
    desc: "Chefchaouen, la perle bleue du Rif, est célèbre dans le monde entier pour ses ruelles et maisons peintes en nuances de bleu. Nichée dans les montagnes du Rif à 600 m d'altitude, elle dégage une atmosphère mystique et apaisante, parfaite pour se ressourcer.",
    highlights: ['Patrimoine culturel', 'Altitude 600 m', 'Artisanat berbère', 'Médina historique'],
    transport: [
      { name: 'Bus CTM', emoji: '🚌', from: 'Casablanca', price: 130, duration: '5h30' },
      { name: 'Grand Taxi', emoji: '🚕', from: 'Tétouan', price: 35, duration: '1h30' },
      { name: 'AtlasWay', emoji: '🚗', from: 'Casablanca', price: 90, duration: '~5h', best: true },
    ],
  },
  {
    city: 'Merzouga', tag: 'Dunes du Sahara', emoji: '🏜️',
    gradient: 'linear-gradient(135deg,#92400e,#d97706)',
    photo: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&q=80&fit=crop&crop=center',
    desc: "Merzouga est la porte du Sahara marocain et des célèbres dunes de l'Erg Chebbi, qui culminent à 150 m. Un lever de soleil sur ces dunes orangées, une nuit sous la tente berbère à la belle étoile : une expérience inoubliable au cœur du désert.",
    highlights: ['Dunes Erg Chebbi', 'Nuit sous les étoiles', 'Balade en chameau', 'Bivouac berbère'],
    transport: [
      { name: 'Bus CTM', emoji: '🚌', from: 'Marrakech', price: 150, duration: '8h' },
      { name: 'Grand Taxi', emoji: '🚕', from: 'Errachidia', price: 80, duration: '3h' },
      { name: 'AtlasWay', emoji: '🚗', from: 'Marrakech', price: 110, duration: '~7h', best: true },
    ],
  },
  {
    city: 'Essaouira', tag: 'Cité des Vents', emoji: '🌊',
    gradient: 'linear-gradient(135deg,#065f46,#10b981)',
    photo: 'https://images.unsplash.com/photo-1597634492529-bf95a4c2fc5e?w=800&q=80&fit=crop&crop=center',
    desc: "Essaouira, ancienne Mogador, est une ville côtière aux remparts ocre classée UNESCO. Ses ruelles bleues et blanches, son port de pêche animé et ses vents constants en font la capitale mondiale du windsurf. L'art et la musique gnaoua y règnent.",
    highlights: ['UNESCO depuis 2001', 'Festival Gnaoua', 'Windsurf & kitesurf', 'Remparts du XVIIIe'],
    transport: [
      { name: 'Bus CTM', emoji: '🚌', from: 'Casablanca', price: 110, duration: '5h' },
      { name: 'Bus Supratours', emoji: '🚌', from: 'Marrakech', price: 70, duration: '2h30' },
      { name: 'AtlasWay', emoji: '🚗', from: 'Marrakech', price: 45, duration: '~2h30', best: true },
    ],
  },
  {
    city: 'Marrakech', tag: 'La Ville Rouge', emoji: '🕌',
    gradient: 'linear-gradient(135deg,#7f1d1d,#C1272D)',
    photo: 'https://images.unsplash.com/photo-1539020140153-e479b8b2b8f5?w=800&q=80&fit=crop&crop=center',
    desc: "Marrakech, la ville ocre, est le joyau touristique du Maroc. La place Jemaa el-Fna, les souks labyrinthiques, les riads luxueux et les jardins secrets font de cette cité impériale une destination de rêve. Son ambiance unique mêle tradition et modernité.",
    highlights: ['Jemaa el-Fna UNESCO', 'Souks millénaires', 'Jardins Majorelle', 'Cité impériale'],
    transport: [
      { name: 'Train ONCF', emoji: '🚂', from: 'Casablanca', price: 90, duration: '3h' },
      { name: 'Bus CTM', emoji: '🚌', from: 'Casablanca', price: 100, duration: '3h30' },
      { name: 'AtlasWay', emoji: '🚗', from: 'Casablanca', price: 70, duration: '~3h30', best: true },
    ],
  },
  {
    city: 'Ifrane', tag: 'La Suisse du Maroc', emoji: '❄️',
    gradient: 'linear-gradient(135deg,#1e3a5f,#4a90d9)',
    photo: 'https://images.unsplash.com/photo-1578432014316-48b448d79d57?w=800&q=80&fit=crop&crop=center',
    desc: "Ifrane est une ville alpine unique au Maroc, construite par le Protectorat français à 1 650 m d'altitude. Ses chalets à toits rouges, ses parcs verdoyants et ses hivers enneigés lui valent le surnom de 'Suisse du Maroc'. Un havre de fraîcheur en été.",
    highlights: ['Altitude 1 650 m', 'Neige en hiver', 'Parc National Ifrane', 'Al Akhawayn University'],
    transport: [
      { name: 'Bus CTM', emoji: '🚌', from: 'Fès', price: 40, duration: '1h30' },
      { name: 'Grand Taxi', emoji: '🚕', from: 'Meknès', price: 30, duration: '1h' },
      { name: 'AtlasWay', emoji: '🚗', from: 'Fès', price: 25, duration: '~1h', best: true },
    ],
  },
  {
    city: 'Agadir', tag: 'Plage & Soleil', emoji: '🌴',
    gradient: 'linear-gradient(135deg,#D4890A,#f59e0b)',
    photo: 'https://images.unsplash.com/photo-1621250524720-3c1a0cfde60b?w=800&q=80&fit=crop&crop=center',
    desc: "Agadir est la station balnéaire phare du Maroc avec ses 300 jours de soleil par an et sa plage de sable doré de 9 km. Reconstruite après le séisme de 1960, la ville moderne offre hôtels de luxe, sports nautiques et marché d'artisanat. Un paradis pour se détendre.",
    highlights: ['300 jours de soleil', '9 km de plage', 'Souk El Had', 'Port de pêche'],
    transport: [
      { name: 'Avion', emoji: '✈️', from: 'Casablanca', price: 299, duration: '1h' },
      { name: 'Bus CTM', emoji: '🚌', from: 'Casablanca', price: 130, duration: '8h' },
      { name: 'AtlasWay', emoji: '🚗', from: 'Marrakech', price: 50, duration: '~3h', best: true },
    ],
  },
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

/* ─── HOOK useInView ────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── HOOK useCountUp ───────────────────────────── */
function useCountUp(target, duration = 1800, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * num));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(num);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  const suffix = String(target).replace(/[0-9.]/g, '');
  return val.toLocaleString('fr-FR') + suffix;
}

/* ─── SKELETON CARD ─────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="skeleton" style={{ height: 22, width: '35%' }} />
        <div className="skeleton" style={{ height: 22, width: '22%' }} />
      </div>
      <div className="skeleton" style={{ height: 13, width: '70%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 13, width: '55%', marginBottom: 20 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ height: 16, width: '28%' }} />
        <div className="skeleton" style={{ height: 28, width: '22%', borderRadius: 12 }} />
      </div>
    </div>
  );
}

/* ─── ANIMATED STAT ITEM ─────────────────────────── */
function AnimatedStat({ value, label, icon: Icon, active, delay = 0 }) {
  const display = useCountUp(value, 1600, active);
  return (
    <div className={`text-center py-7 px-4 counter-appear`}
      style={{ animationDelay: `${delay}s`, animationPlayState: active ? 'running' : 'paused' }}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Icon size={16} style={{ color: '#F5A623' }} aria-hidden="true" />
        <span className="text-2xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{display}</span>
      </div>
    </div>
  );
}

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

function CO2CounterAnimated() {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} className={inView ? 'section-visible' : 'section-hidden'}>
      <CO2Counter />
    </div>
  );
}

function MoroccoMap() {
  const { t } = useLanguage();
  const h = t.home;
  const navigate = useNavigate();
  const [hoveredCity, setHoveredCity] = useState(null);
  const [mapRef, mapInView] = useInView(0.2);

  return (
    <section ref={mapRef} className={mapInView ? 'section-visible' : 'section-hidden'}
      style={{ background: 'var(--bg-800)', padding: '4rem 1rem' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#F5A623', letterSpacing: '0.25em' }}>✦ {h.networkLabel}</p>
          <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.networkTitle}</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{h.networkSub}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '3rem', flexWrap: 'wrap' }}>
          {/* SVG Map */}
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 480 580" style={{ width: '100%', maxWidth: 340, filter: 'drop-shadow(0 0 60px rgba(232,25,44,0.12))' }}>
              <defs>
                <style>{`
                  @keyframes dashFlow { to { stroke-dashoffset: -200; } }
                  @keyframes cityPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
                  @keyframes outerRing { 0%,100%{r:14;opacity:0.3} 50%{r:18;opacity:0} }
                `}</style>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E8192C" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#E8192C" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E8192C" />
                  <stop offset="50%" stopColor="#F5A623" />
                  <stop offset="100%" stopColor="#00875A" />
                </linearGradient>
              </defs>

              {/* Routes animées */}
              {MAP_ROUTES.map(([a, b], i) => {
                const ca = MAP_CITIES[a], cb = MAP_CITIES[b];
                const isActive = hoveredCity === ca.name || hoveredCity === cb.name;
                return (
                  <g key={i}>
                    {/* Base line */}
                    <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                      stroke={isActive ? 'rgba(245,166,35,0.4)' : 'rgba(232,25,44,0.15)'}
                      strokeWidth="1.5" style={{ transition: 'stroke 0.3s' }} />
                    {/* Animated dash */}
                    <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                      stroke={isActive ? '#F5A623' : '#E8192C'}
                      strokeWidth={isActive ? 2 : 1.5}
                      strokeOpacity={isActive ? 0.9 : 0.45}
                      strokeDasharray="6 14"
                      style={{ animation: `dashFlow ${2.2 + i * 0.28}s linear infinite`, transition: 'stroke 0.3s, stroke-width 0.3s' }} />
                  </g>
                );
              })}

              {/* Villes */}
              {MAP_CITIES.map(({ name, x, y }, idx) => {
                const isHovered = hoveredCity === name;
                return (
                  <g key={name}
                    onClick={() => navigate(`/rides/search?to=${name}`)}
                    onMouseEnter={() => setHoveredCity(name)}
                    onMouseLeave={() => setHoveredCity(null)}
                    style={{ cursor: 'pointer' }}>
                    {/* Outer glow ring */}
                    <circle cx={x} cy={y} r={isHovered ? 20 : 14}
                      fill="rgba(232,25,44,0.06)"
                      style={{ transition: 'r 0.3s ease, fill 0.3s' }} />
                    {/* Pulsing ring */}
                    <circle cx={x} cy={y} r="10" fill="none"
                      stroke={isHovered ? '#F5A623' : '#E8192C'}
                      strokeWidth="1" strokeOpacity="0.35"
                      style={{ animation: `cityPulse ${1.8 + idx * 0.2}s ease-in-out infinite`, transformOrigin: `${x}px ${y}px`, transition: 'stroke 0.3s' }} />
                    {/* Main dot */}
                    <circle cx={x} cy={y} r={isHovered ? 7 : 5}
                      fill={isHovered ? '#F5A623' : '#E8192C'}
                      style={{
                        filter: isHovered ? 'drop-shadow(0 0 8px rgba(245,166,35,1))' : 'drop-shadow(0 0 4px rgba(232,25,44,0.8))',
                        transition: 'r 0.25s ease, fill 0.25s ease',
                      }} />
                    {/* City label */}
                    <text x={x + 10} y={y + 4}
                      fontSize={isHovered ? '9.5' : '8.5'}
                      fill={isHovered ? '#F5A623' : 'rgba(238,242,255,0.65)'}
                      fontWeight="700"
                      style={{ transition: 'fill 0.3s, font-size 0.3s' }}>
                      {name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hint */}
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(238,242,255,0.3)', marginTop: 8 }}>
              Cliquez sur une ville pour trouver un trajet
            </p>
          </div>

          {/* Liste des villes avec stats */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F5A623', marginBottom: 8 }}>
              Destinations populaires
            </p>
            {MAP_CITIES.slice(0, 8).map(({ name }) => (
              <button key={name}
                onClick={() => navigate(`/rides/search?to=${name}`)}
                onMouseEnter={() => setHoveredCity(name)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 12, textAlign: 'left',
                  background: hoveredCity === name ? 'rgba(232,25,44,0.1)' : 'rgba(238,242,255,0.03)',
                  border: `1px solid ${hoveredCity === name ? 'rgba(232,25,44,0.3)' : 'rgba(238,242,255,0.07)'}`,
                  transition: 'all 0.25s ease', cursor: 'pointer',
                }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: hoveredCity === name ? '#F5A623' : 'var(--text-base)', transition: 'color 0.25s' }}>
                  {CITY_EMOJI[name] || '📍'} {name}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(238,242,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Voir <ArrowRight size={10} style={{ color: '#E8192C' }} />
                </span>
              </button>
            ))}
          </div>
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

/* ─── CITY MODAL ─────────────────────────────────── */
function CityModal({ city, onClose, navigate }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setLoading(true);
    api.get(`/rides/search?to=${city.city}&limit=3`)
      .then(({ data }) => {
        const list = (data.rides || data || []).slice(0, 3).map(adaptRide);
        setRides(list);
      })
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, [city.city]);

  const SAMPLE = [
    { id: 1, from: 'Casablanca', to: city.city, depTime: '07:30', arrTime: '—', date: 'Demain', driver: 'Ahmed B.', rating: 4.9, seats: 2, price: city.transport.find(t => t.best)?.price || 80, avatar: 'AB' },
    { id: 2, from: 'Rabat',      to: city.city, depTime: '09:00', arrTime: '—', date: 'Demain', driver: 'Sara M.',  rating: 5.0, seats: 3, price: (city.transport.find(t => t.best)?.price || 80) - 10, avatar: 'SM' },
  ];
  const displayRides = rides.length ? rides : SAMPLE;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(5,7,13,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}>
      <div style={{
        width: '100%', maxWidth: 680, maxHeight: '90vh',
        background: 'var(--bg-800)',
        border: '1px solid rgba(232,25,44,0.2)',
        borderRadius: 24,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Photo header */}
        <div style={{ position: 'relative', height: 220, flexShrink: 0, overflow: 'hidden', background: city.gradient }}>
          <img
            src={city.photo}
            alt={city.city}
            onError={e => { e.target.style.display = 'none'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,7,13,0.92) 0%, rgba(5,7,13,0.3) 50%, transparent 100%)' }} />

          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', lineHeight: 1, backdropFilter: 'blur(4px)',
          }}>✕</button>

          {/* City name overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>{city.emoji}</span>
              <div>
                <h2 style={{ color: '#fff', fontFamily: "'Amiri', serif", fontWeight: 700, fontSize: '1.8rem', lineHeight: 1, margin: 0 }}>{city.city}</h2>
                <p style={{ color: '#F5A623', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{city.tag}</p>
              </div>
            </div>
          </div>

          {/* Accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #E8192C, #F5A623, #00875A)' }} />
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>

          {/* Description */}
          <p style={{ color: 'rgba(238,242,255,0.7)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
            {city.desc}
          </p>

          {/* Highlights */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {city.highlights.map(h => (
              <span key={h} style={{
                fontSize: '0.72rem', padding: '4px 10px', borderRadius: 99,
                background: 'rgba(245,166,35,0.1)', color: '#F5A623',
                border: '1px solid rgba(245,166,35,0.25)', fontWeight: 600,
              }}>✦ {h}</span>
            ))}
          </div>

          {/* Transports */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E8192C', marginBottom: '0.75rem' }}>
              Moyens de transport disponibles
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '0.6rem' }}>
              {city.transport.map(t => (
                <div key={t.name} style={{
                  padding: '0.9rem', borderRadius: 14,
                  background: t.best ? 'rgba(232,25,44,0.08)' : 'rgba(238,242,255,0.04)',
                  border: `1px solid ${t.best ? 'rgba(232,25,44,0.3)' : 'rgba(238,242,255,0.08)'}`,
                  position: 'relative',
                }}>
                  {t.best && (
                    <span style={{
                      position: 'absolute', top: -9, right: 10,
                      fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: '#E8192C', color: '#fff', letterSpacing: '0.08em',
                    }}>LE MOINS CHER</span>
                  )}
                  <p style={{ fontSize: '1.3rem', marginBottom: 4 }}>{t.emoji}</p>
                  <p style={{ fontWeight: 700, color: t.best ? '#F5A623' : 'var(--text-base)', fontSize: '0.9rem' }}>{t.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Depuis {t.from}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 800, color: t.best ? '#E8192C' : 'var(--text-secondary)', fontSize: '1.05rem' }}>{t.price} DH</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⏱ {t.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trajets disponibles */}
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E8192C', marginBottom: '0.75rem' }}>
              Trajets AtlasWay vers {city.city}
            </p>
            {loading
              ? <div style={{ display: 'grid', gap: '0.6rem' }}>{[0,1].map(i => <SkeletonCard key={i} />)}</div>
              : (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {displayRides.slice(0, 3).map((trip, i) => (
                    <div key={i} onClick={() => { onClose(); navigate(`/rides/search?from=${trip.from}&to=${trip.to}`); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.9rem 1rem', borderRadius: 14, cursor: 'pointer',
                        background: 'rgba(238,242,255,0.04)',
                        border: '1px solid rgba(238,242,255,0.08)',
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,25,44,0.06)'; e.currentTarget.style.borderColor = 'rgba(232,25,44,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(238,242,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(238,242,255,0.08)'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#E8192C,#F5A623)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                          {trip.avatar}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-base)', fontSize: '0.88rem' }}>{trip.from} → {trip.to}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {trip.driver} · {trip.date} à {trip.depTime} · {trip.seats} place{trip.seats > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, color: '#E8192C', fontSize: '1.1rem' }}>{trip.price} DH</p>
                        <p style={{ fontSize: '0.68rem', color: '#F5A623' }}>⭐ {trip.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* CTA */}
          <button onClick={() => { onClose(); navigate(`/rides/search?to=${city.city}`); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', marginTop: '1.25rem', padding: '13px',
              borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #E8192C, #C4152A)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: '0 6px 24px rgba(232,25,44,0.3)',
            }}>
            Voir tous les trajets vers {city.city} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DestinationsSection({ navigate }) {
  const { t } = useLanguage();
  const h = t.home;
  const [selectedCity, setSelectedCity] = useState(null);
  const [secRef, secInView] = useInView(0.15);

  return (
    <>
      <section ref={secRef} className={secInView ? 'section-visible' : 'section-hidden'}
        style={{ background: 'var(--bg-800)', padding: '4rem 1rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#F5A623', letterSpacing: '0.25em' }}>✦ {h.inspLabel}</p>
            <h2 className="text-3xl font-black font-heading" style={{ color: 'var(--text-base)' }}>{h.inspTitle}</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Cliquez sur une ville pour explorer</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="dest-grid">
            {DESTINATIONS.map(({ city, tag, gradient, emoji, photo }, i) => (
              <button key={city}
                onClick={() => setSelectedCity(DESTINATIONS[i])}
                aria-label={`Explorer ${city}`}
                style={{
                  position: 'relative', borderRadius: 20, overflow: 'hidden',
                  height: 180, background: gradient,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}>

                {/* Photo */}
                <img src={photo} alt={city}
                  onError={e => { e.target.style.display = 'none'; }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => { e.target.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
                />

                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,7,13,0.88) 0%, rgba(5,7,13,0.2) 55%, transparent 100%)' }} />

                {/* Hover overlay */}
                <div className="dest-hover-overlay" style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(232,25,44,0.15)',
                  opacity: 0, transition: 'opacity 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, padding: '6px 16px', borderRadius: 99, background: 'rgba(232,25,44,0.6)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    Explorer →
                  </span>
                </div>

                {/* Content */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{city}</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: 2 }}>{tag}</p>
                    </div>
                    <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedCity && (
        <CityModal
          city={selectedCity}
          onClose={() => setSelectedCity(null)}
          navigate={navigate}
        />
      )}
    </>
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
           HERO — Neo-Moroccan Midnight
          ══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(145deg, #05070D 0%, #08101E 40%, #0E0814 80%, #05070D 100%)',
        position: 'relative', overflow: 'hidden',
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Barre drapeau marocain en haut */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(to right, #E8192C 0%, #E8192C 33%, #F5A623 50%, #00875A 67%, #00875A 100%)',
        }} />

        {/* Spotlight rouge — coin supérieur droit */}
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: '65%', height: '75%',
          background: 'radial-gradient(ellipse at center, rgba(232,25,44,0.13) 0%, rgba(232,25,44,0.04) 45%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Spotlight or — coin inférieur gauche */}
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-8%',
          width: '55%', height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(245,166,35,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Spotlight vert — centre bas */}
        <div style={{
          position: 'absolute', bottom: '0%', left: '30%',
          width: '40%', height: '40%',
          background: 'radial-gradient(ellipse at center, rgba(0,135,90,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Grille géométrique */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(232,25,44,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,25,44,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
        }} />

        {/* Texte fantôme arabesque */}
        <div style={{
          position: 'absolute', bottom: '-1%', right: '-2%',
          fontSize: 'clamp(60px, 10vw, 130px)',
          fontFamily: 'Amiri, serif', fontWeight: 700,
          color: 'transparent', WebkitTextStroke: '1px rgba(245,166,35,0.05)',
          userSelect: 'none', pointerEvents: 'none',
          letterSpacing: '0.08em', lineHeight: 1,
        }}>المغرب</div>

        <div className="max-w-6xl mx-auto px-6 py-20 pt-28 w-full relative z-10">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)',
            gap: '4rem',
            alignItems: 'center',
          }} className="hero-grid">

            {/* ── GAUCHE : Texte ── */}
            <div>
              {/* Badge */}
              <div className="animate-fade-up stagger-1" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 18px', borderRadius: 99, marginBottom: 32,
                background: 'rgba(232,25,44,0.1)', color: '#E8192C',
                border: '1px solid rgba(232,25,44,0.28)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                ✦ {h.badge}
              </div>

              {/* Titre principal */}
              <h1 className="font-heading animate-fade-up stagger-2" style={{
                fontSize: 'clamp(2.6rem, 4.5vw, 5rem)',
                lineHeight: 1.05, fontWeight: 700,
                marginBottom: '1.5rem', color: '#FFFFFF',
              }}>
                {h.title1}<br />
                <span style={{
                  background: 'linear-gradient(135deg, #E8192C 20%, #F5A623 80%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', display: 'inline-block',
                }}>{h.title2}</span>
              </h1>

              {/* Ligne décorative */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
              }}>
                <div style={{ width: 36, height: 2, background: 'linear-gradient(to right, #E8192C, #F5A623)' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(238,242,255,0.35)' }}>ATLASWAY</span>
                <div style={{ width: 36, height: 2, background: 'linear-gradient(to left, #00875A, transparent)' }} />
              </div>

              {/* Description */}
              <p className="animate-fade-up stagger-3" style={{
                color: 'rgba(238,242,255,0.65)', fontSize: '1.05rem',
                lineHeight: 1.8, marginBottom: '2rem', maxWidth: 480,
              }}>
                {h.desc} <strong style={{ color: '#F5A623' }}>{h.desc60}</strong> {h.descEnd}
              </p>

              {/* Stats pills */}
              <div className="animate-fade-up stagger-4" style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem',
              }}>
                {STATS.map(({ value, label, icon: Icon }, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 18px', borderRadius: 14,
                    background: 'rgba(238,242,255,0.04)',
                    border: '1px solid rgba(238,242,255,0.08)',
                    backdropFilter: 'blur(10px)',
                  }}>
                    <Icon size={15} style={{ color: '#F5A623', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1 }}>{value}</p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(238,242,255,0.4)', lineHeight: 1.3, marginTop: 2 }}>{h.statLabels[i]}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="animate-fade-up stagger-5" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/rides/search" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 26px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #E8192C, #C4152A)',
                  color: '#fff', fontWeight: 700, fontSize: '0.92rem',
                  boxShadow: '0 8px 32px rgba(232,25,44,0.3)',
                  textDecoration: 'none', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,25,44,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,25,44,0.3)'; }}>
                  {h.seeAllRides || 'Voir les trajets'} <ArrowRight size={16} />
                </Link>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 26px', borderRadius: 14,
                  background: 'rgba(238,242,255,0.06)',
                  border: '1px solid rgba(238,242,255,0.15)',
                  color: '#EEF2FF', fontWeight: 600, fontSize: '0.92rem',
                  textDecoration: 'none', transition: 'background 0.2s ease, border-color 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(238,242,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(238,242,255,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(238,242,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(238,242,255,0.15)'; }}>
                  S'inscrire gratuitement
                </Link>
              </div>

              {/* Chips de confiance */}
              <div className="animate-fade-up stagger-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1.5rem' }}>
                {h.chips.map(chip => (
                  <span key={chip} style={{
                    fontSize: '0.68rem', padding: '0.25rem 0.65rem', borderRadius: 99,
                    background: 'rgba(238,242,255,0.04)', border: '1px solid rgba(238,242,255,0.09)',
                    color: 'rgba(238,242,255,0.42)',
                  }}>{chip}</span>
                ))}
              </div>
            </div>

            {/* ── DROITE : Carte de recherche glass ── */}
            <div className="animate-slide-left stagger-3">
              <div style={{
                background: 'rgba(10, 13, 24, 0.88)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(232,25,44,0.22)',
                borderRadius: 24, padding: '2rem',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Accent gradient en haut */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(to right, #E8192C, #F5A623, #00875A)',
                  borderRadius: '24px 24px 0 0',
                }} />

                {/* Header */}
                <div style={{ marginBottom: '1.25rem', marginTop: '0.5rem' }}>
                  <p style={{
                    fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.25em',
                    textTransform: 'uppercase', color: '#E8192C', marginBottom: 4,
                  }}>✦ {h.findRide}</p>
                  <p style={{ color: 'rgba(238,242,255,0.38)', fontSize: '0.78rem' }}>
                    Voyagez partout au Maroc
                  </p>
                </div>

                {/* Boutons vocal + carte */}
                <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                  <button type="button" onClick={handleVoiceSearch} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', borderRadius: 10, fontSize: '0.73rem', fontWeight: 600,
                    background: 'rgba(0,135,90,0.1)', color: '#00875A',
                    border: '1px solid rgba(0,135,90,0.22)', cursor: 'pointer',
                  }}>
                    <Mic size={13} /> {h.voiceBtn}
                  </button>
                  <button type="button" onClick={() => setShowMap(true)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px', borderRadius: 10, fontSize: '0.73rem', fontWeight: 600,
                    background: 'rgba(245,166,35,0.1)', color: '#F5A623',
                    border: '1px solid rgba(245,166,35,0.22)', cursor: 'pointer',
                  }}>
                    <Map size={13} /> {h.mapBtn}
                  </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {/* Départ */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#00875A', boxShadow: '0 0 6px rgba(0,135,90,0.6)' }} />
                    <input value={from} onChange={e => setFrom(e.target.value)}
                      placeholder={h.fromPh} className="input" style={{ paddingLeft: 30, paddingRight: 38, fontSize: '0.875rem' }} list="from-list" />
                    <datalist id="from-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                    <button type="button" onClick={handleGeolocate} disabled={locating}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: locating ? '#F5A623' : '#00875A', padding: 4, display: 'flex', alignItems: 'center' }}>
                      {locating
                        ? <div style={{ width: 13, height: 13, border: '2px solid #F5A623', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        : <Navigation size={13} />}
                    </button>
                  </div>

                  {/* Swap */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="button" onClick={swap} style={{
                      background: 'rgba(238,242,255,0.05)', border: '1px solid rgba(238,242,255,0.1)',
                      borderRadius: 8, padding: '3px 14px', cursor: 'pointer',
                      color: 'rgba(238,242,255,0.38)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <ArrowLeftRight size={11} /> inverser
                    </button>
                  </div>

                  {/* Arrivée */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#E8192C', boxShadow: '0 0 6px rgba(232,25,44,0.6)' }} />
                    <input value={to} onChange={e => setTo(e.target.value)}
                      placeholder={h.toPh} className="input" style={{ paddingLeft: 30, fontSize: '0.875rem' }} list="to-list" />
                    <datalist id="to-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                  </div>

                  {/* Date + places */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} className="input" style={{ fontSize: '0.84rem' }} />
                    <div style={{ position: 'relative' }}>
                      <Users style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={13} />
                      <select value={pax} onChange={e => setPax(Number(e.target.value))} className="input" style={{ paddingLeft: 30, fontSize: '0.84rem', appearance: 'none' }}>
                        {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n > 1 ? h.paxN : h.pax1}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Bouton recherche */}
                  <div style={{ position: 'relative', marginTop: 4 }}>
                    <button type="submit" style={{
                      width: '100%', height: 50, borderRadius: 14,
                      background: 'linear-gradient(135deg, #E8192C 0%, #C4152A 100%)',
                      color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 8px 28px rgba(232,25,44,0.35)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      letterSpacing: '0.01em',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(232,25,44,0.45)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,25,44,0.35)'; }}>
                      {h.searchBtn} <ArrowRight size={16} />
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
                    <Suspense fallback={
                      <div style={{ height: 130, borderRadius: 10, background: 'rgba(238,242,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(238,242,255,0.3)', fontSize: 13 }}>
                        {h.mapLoading}
                      </div>
                    }>
                      <RouteMap from={from} to={to} height={130} />
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

      {/* ── STATS BAR — compteurs animés ── */}
      {(() => {
        const [statsRef, statsInView] = useInView(0.3);
        return (
          <div ref={statsRef} style={{ background: 'var(--bg-800)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="gold-section-rule" />
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
              {STATS.map(({ value, label, icon: Icon }, i) => (
                <div key={i} style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none', textAlign: 'center', padding: '28px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={16} style={{ color: '#F5A623' }} aria-hidden="true" />
                    <AnimatedStat value={value} label={label} icon={Icon} active={statsInView} delay={i * 0.12} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.statLabels[i]}</p>
                </div>
              ))}
            </div>
            <div className="gold-section-rule" />
          </div>
        );
      })()}

      <CO2CounterAnimated />

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
            {realTrips.length === 0 && !SAMPLE_TRIPS.length
              ? [0,1,2].map(i => <SkeletonCard key={i} />)
              : (realTrips.length ? realTrips : SAMPLE_TRIPS).map((trip, i) => <TripCard key={i} trip={trip} />)
            }
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
