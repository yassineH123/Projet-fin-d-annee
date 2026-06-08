import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowRight, Shield, Star, Users, Car,
  CheckCircle, ChevronRight,
  TrendingDown, Lock, ThumbsUp, MessageCircle, Mic
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


const SAMPLE_TRIPS = [
  { from: 'Casablanca', to: 'Marrakech', depTime: '07:30', arrTime: '11:00', date: 'Demain', driver: 'Ahmed B.', rating: 4.9, seats: 2, price: 80, avatar: 'AB' },
  { from: 'Rabat',      to: 'Fès',       depTime: '09:00', arrTime: '11:30', date: 'Demain', driver: 'Sara M.',  rating: 5.0, seats: 3, price: 60, avatar: 'SM' },
  { from: 'Tanger',     to: 'Rabat',     depTime: '06:00', arrTime: '10:00', date: 'Lundi',  driver: 'Youssef K.', rating: 4.8, seats: 1, price: 90, avatar: 'YK' },
];


const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Laâyoune'];





const CONFETTI_COLS = ['#B8232A','#D4890A','#005A2E','#F5EDD8','#B8232A','#D4890A','#005A2E','#F5EDD8','#B8232A','#D4890A','#005A2E','#F5EDD8'];
const CONFETTI_X    = [-26,-16,-6,4,14,24,-21,-11,1,11,21,28];


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






function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} className="text-gold-400 fill-gold-400" />
      ))}
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


/* ─── ZELLIGE DIVIDER ───────────────────────────── */
function ZelligeDivider() {
  return (
    <div style={{ height: 28, background: 'var(--bg-900)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, #C1272D 0%, #C1272D 40%, #D4890A 50%, #00875A 60%, #00875A 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M14 2 L16.8 10.2 L25.5 10.2 L18.4 15.4 L21.1 23.6 L14 18.4 L6.9 23.6 L9.6 15.4 L2.5 10.2 L11.2 10.2Z' fill='none' stroke='rgba(212%2C137%2C10%2C0.15)' stroke-width='0.6'/%3E%3C/svg%3E\")", backgroundSize: '28px 28px', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--border-color)' }} />
    </div>
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
  const [showDarija,  setShowDarija]  = useState(false);
  const [burst,       setBurst]       = useState(false);
  const [liveStats,   setLiveStats]   = useState(null);

  // Stats dynamiques : vraies données de la BDD si dispo, sinon fallback hardcodé
  const dynamicStats = [
    { value: liveStats?.totalUsers > 0 ? `${liveStats.totalUsers.toLocaleString('fr-FR')}+` : '12 000+', label: STATS[0].label, icon: STATS[0].icon },
    { value: liveStats?.totalCities > 0 ? `${liveStats.totalCities}+`                        : '45+',     label: STATS[1].label, icon: STATS[1].icon },
    { value: liveStats?.avgRating   > 0 ? `${liveStats.avgRating}/5`                         : '4.8/5',   label: STATS[2].label, icon: STATS[2].icon },
    STATS[3], // "60% Économies vs taxi" — marketing, reste fixe
  ];

  // Scroll reveals — sections principales
  const revealSteps = useScrollReveal({ staggerMs: 120 });
  const revealStats = useScrollReveal({ staggerMs: 80 });
  const revealCta   = useScrollReveal({ threshold: 0.2 });
  const [statsRef, statsInView] = useInView(0.3);

  useEffect(() => {
    api.get('/rides/home').then(({ data }) => {
      if (data.upcoming?.length)   setRealTrips(data.upcoming.map(adaptRide));
      if (data.stats)              setLiveStats(data.stats);
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
    <SEO path="/" />
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

        {/* ── Animated mesh gradient ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            width: '140%', height: '140%',
            top: '-20%', left: '-20%',
            background: [
              'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(232,25,44,0.18) 0%, transparent 60%)',
              'radial-gradient(ellipse 55% 45% at 80% 70%, rgba(212,137,10,0.12) 0%, transparent 60%)',
              'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(0,90,46,0.10) 0%, transparent 60%)',
            ].join(', '),
            animation: 'meshDrift 10s ease-in-out infinite alternate',
          }} />
        </div>

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
                {dynamicStats.map(({ value, icon: Icon }, i) => (
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
                    <MapPin size={13} /> {h.mapBtn}
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
                        : <MapPin size={13} />}
                    </button>
                  </div>

                  {/* Swap */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button type="button" onClick={swap} style={{
                      background: 'rgba(238,242,255,0.05)', border: '1px solid rgba(238,242,255,0.1)',
                      borderRadius: 8, padding: '3px 14px', cursor: 'pointer',
                      color: 'rgba(238,242,255,0.38)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <ArrowRight size={11} /> inverser
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

      {/* ── STATS BAR ── */}
      <div ref={statsRef} style={{ background: 'var(--bg-800)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D 0%, #C1272D 40%, #D4890A 50%, #00875A 60%, #00875A 100%)' }} />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {dynamicStats.map(({ value, label, icon: Icon }, i) => (
            <div key={i} className={`text-center counter-appear`} style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none', padding: '24px 16px', animationDelay: `${i * 0.12}s`, animationPlayState: statsInView ? 'running' : 'paused' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                <Icon size={14} style={{ color: '#D4890A' }} />
                <span className="font-black font-heading" style={{ fontSize: '1.5rem', color: 'var(--text-base)' }}>{value}</span>
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ZELLIGE DIVIDER ── */}
      <ZelligeDivider />

      {/* ── TRAJETS EN DIRECT ── */}
      <section className="py-14 px-4" style={{ background: 'var(--bg-900)' }}>
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

          {/* Conducteur inline CTA */}
          <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1a0c00,#2e1600)', border: '1px solid rgba(212,137,10,0.2)', boxShadow: '0 8px 32px rgba(212,137,10,0.06)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: '100%', background: 'radial-gradient(ellipse at right center, rgba(212,137,10,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div className="relative">
              <p className="font-black text-white text-xl mb-1">{h.driverTitle}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {h.driverSub} — <strong className="text-white">{h.driverSavings}</strong>
              </p>
            </div>
            <Link to="/rides/publish" className="flex-shrink-0 flex items-center gap-2 font-black px-6 py-3 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg,#D4890A,#a86508)', color: '#fff', boxShadow: '0 4px 16px rgba(212,137,10,0.3)' }}>
              <Car size={18} /> {h.publishRide}
            </Link>
          </div>
        </div>
      </section>

      {/* ── ZELLIGE DIVIDER ── */}
      <ZelligeDivider />

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 px-4" style={{ background: 'var(--bg-800)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4890A' }}>{h.howLabel}</p>
            <h2 className="text-3xl font-black font-heading mb-2" style={{ color: 'var(--text-base)' }}>{h.howTitle}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{h.howSub}</p>
          </div>
          <div ref={revealSteps} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ num, icon: Icon }, i) => (
              <div key={num} data-reveal className={`relative animate-fade-up stagger-${i + 1}`}>
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

      {/* ── ZELLIGE DIVIDER ── */}
      <ZelligeDivider />

      {/* ── TÉMOIGNAGES — avec toggle Darija ── */}
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
                style={{ fontSize: '0.7rem', fontWeight: 700, padding: '5px 12px', borderRadius: 99, border: '1px solid rgba(212,137,10,0.35)', color: showDarija ? '#D4890A' : 'var(--text-muted)', background: showDarija ? 'rgba(212,137,10,0.08)' : 'transparent', transition: 'all 0.2s', cursor: 'pointer' }}>
                {showDarija ? h.frToggle : h.darijaToggle}
              </button>
            </div>
          </div>
          <div ref={revealStats} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, city, avatar, color, rating, text, darija, detail }, i) => (
              <div key={name} data-reveal className={`card p-5 flex flex-col gap-4 animate-fade-up stagger-${i + 1}`}>
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

      {/* ── TRUST — barre compacte horizontale ── */}
      <div style={{ background: 'var(--bg-800)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {[Shield, Lock, ThumbsUp, MessageCircle].map((Icon, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-5" style={{ borderRight: i < 3 ? '1px solid var(--border-color)' : 'none' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(193,39,45,0.1)' }}>
                <Icon size={16} style={{ color: '#C1272D' }} />
              </div>
              <div>
                <p className="font-bold text-xs leading-none mb-0.5" style={{ color: 'var(--text-base)' }}>{h.trustFeatures[i].title}</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{h.trustFeatures[i].desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL DUAL CTA — Passager | Conducteur ── */}
      {!user ? (
        <section className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <div className="flex flex-col md:flex-row" style={{ minHeight: 340 }}>
            {/* Passager */}
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg,#0d0509,#200c12)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(193,39,45,0.14) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div ref={revealCta} className="relative max-w-xs">
                <div data-reveal>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                    style={{ background: 'rgba(193,39,45,0.15)', color: '#ff8a80', border: '1px solid rgba(193,39,45,0.3)' }}>
                    🎒 Passager
                  </div>
                  <h2 className="font-black text-white mb-3 font-heading" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', lineHeight: 1.25 }}>
                    {h.finalTitle1}<br />
                    <span style={{ color: '#ff8a80' }}>{h.finalTitle2}</span>
                  </h2>
                  <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{h.finalSub}</p>
                  <Link to="/register" className="inline-flex items-center gap-2 py-3 px-7 rounded-xl font-bold transition-all"
                    style={{ background: '#C1272D', color: '#fff', boxShadow: '0 4px 20px rgba(193,39,45,0.4)' }}>
                    {h.createAccount} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Séparateur losange central */}
            <div className="hidden md:flex items-center justify-center relative" style={{ width: 1, background: 'var(--border-color)' }}>
              <div style={{ position: 'absolute', width: 34, height: 34, background: 'var(--bg-900)', border: '1px solid var(--border-color)', borderRadius: 4, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ transform: 'rotate(-45deg)', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>OU</span>
              </div>
            </div>

            {/* Conducteur */}
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg,#0d0900,#1e1200)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(212,137,10,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div className="relative max-w-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                  style={{ background: 'rgba(212,137,10,0.15)', color: '#ffd166', border: '1px solid rgba(212,137,10,0.3)' }}>
                  🚗 Conducteur
                </div>
                <h2 className="font-black text-white mb-3 font-heading" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', lineHeight: 1.25 }}>
                  Publiez votre trajet<br />
                  <span style={{ color: '#ffd166' }}>& remboursez l'essence</span>
                </h2>
                <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Proposez vos sièges libres. Partagez les frais, voyagez autrement.
                </p>
                <Link to="/rides/publish" className="inline-flex items-center gap-2 py-3 px-7 rounded-xl font-bold transition-all"
                  style={{ background: '#D4890A', color: '#fff', boxShadow: '0 4px 20px rgba(212,137,10,0.4)' }}>
                  <Car size={15} /> {h.publishRide}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-14 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg,#0d0900,#1a1000)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(212,137,10,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#D4890A' }}>Conducteur</p>
            <h2 className="font-black text-white mb-2 font-heading text-2xl">Publiez votre prochain trajet</h2>
            <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Partagez vos frais, rencontrez des gens.</p>
            <Link to="/rides/publish" className="inline-flex items-center gap-2 py-3 px-8 rounded-xl font-bold"
              style={{ background: '#D4890A', color: '#fff', boxShadow: '0 4px 20px rgba(212,137,10,0.4)' }}>
              <Car size={16} /> {h.publishRide}
            </Link>
          </div>
        </section>
      )}

    </div>
    </>
  );
}
