import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SEO from '../components/SEO';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MapPin, ArrowRight, Shield, Star, Users, Car,
  CheckCircle, ChevronRight, Backpack,
  TrendingDown, Lock, ThumbsUp, MessageCircle, Mic,
  Heart, Bookmark, Bell, Home as HomeIcon,
  CreditCard, Calendar, Compass,
  Clock, Zap, Trophy, RefreshCw, GitCompare, Wifi,
  Megaphone, X, ExternalLink, TrendingUp, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { reverseGeocode } from '../utils/geocode';
import api from '../services/api';
import toast from 'react-hot-toast';

const MapPicker = lazy(() => import('../components/MapPicker'));
const RouteMap  = lazy(() => import('../components/RouteMap'));

/* ─── DATA ─────────────────────────────────────── */
const STEPS = [
  { num: '01', icon: MapPin,       title: 'Recherchez',     desc: 'Entrez votre destination et la date. Des centaines de trajets disponibles partout au Maroc.' },
  { num: '02', icon: Users,        title: 'Choisissez',     desc: 'Comparez les conducteurs, leurs notes et leurs tarifs avant de réserver.' },
  { num: '03', icon: CheckCircle,  title: 'Voyagez serein', desc: 'Réservation confirmée en quelques secondes. Rencontrez votre conducteur et partez !' },
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
  { from: 'Casablanca', to: 'Marrakech', depTime: '07:30', date: 'Demain',    driver: 'Ahmed B.',    rating: 4.9, seats: 2, price: 80,  avatar: 'AB', ago: 'il y a 2h' },
  { from: 'Rabat',      to: 'Fès',       depTime: '09:00', date: 'Demain',    driver: 'Sara M.',     rating: 5.0, seats: 3, price: 60,  avatar: 'SM', ago: 'il y a 4h' },
  { from: 'Tanger',     to: 'Rabat',     depTime: '06:00', date: 'Lundi',     driver: 'Youssef K.',  rating: 4.8, seats: 1, price: 90,  avatar: 'YK', ago: 'il y a 6h' },
  { from: 'Agadir',     to: 'Marrakech', depTime: '08:00', date: "Aujourd'hui", driver: 'Fatima Z.', rating: 4.7, seats: 2, price: 70,  avatar: 'FZ', ago: 'il y a 1h' },
  { from: 'Fès',        to: 'Casablanca',depTime: '10:30', date: 'Demain',    driver: 'Omar T.',     rating: 4.6, seats: 4, price: 75,  avatar: 'OT', ago: 'il y a 3h' },
];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Laâyoune'];

const CITY_STORIES = [
  { city: 'Casablanca', arabic: 'الدار البيضاء', emoji: '🌆', color: '#C1272D' },
  { city: 'Marrakech',  arabic: 'مراكش',         emoji: '🕌', color: '#D4890A' },
  { city: 'Rabat',      arabic: 'الرباط',         emoji: '🏛️', color: '#006233' },
  { city: 'Fès',        arabic: 'فاس',            emoji: '🏺', color: '#8B5A2B' },
  { city: 'Tanger',     arabic: 'طنجة',           emoji: '🌊', color: '#0077B6' },
  { city: 'Agadir',     arabic: 'أكادير',         emoji: '🌴', color: '#2D6A4F' },
  { city: 'Meknès',     arabic: 'مكناس',          emoji: '🌿', color: '#6B4E3D' },
  { city: 'Oujda',      arabic: 'وجدة',           emoji: '⭐', color: '#7B2D8B' },
];

const TRENDING_ROUTES = [
  { from: 'Casablanca', to: 'Marrakech', price: 80,  emoji: '🏔️' },
  { from: 'Rabat',      to: 'Fès',       price: 60,  emoji: '🕌' },
  { from: 'Tanger',     to: 'Casablanca',price: 100, emoji: '🌊' },
  { from: 'Agadir',     to: 'Marrakech', price: 70,  emoji: '🌴' },
];

const SPONSORED_ADS = [
  {
    id: 1,
    logo: '🏨',
    color: '#0077B6',
    brand: 'Hôtel Atlas Marrakech',
    tagline: 'Nuits à partir de 180 DH — réservez maintenant !',
    url: 'hotelatlas.ma',
    cta: 'Réserver',
  },
  {
    id: 2,
    logo: '🍕',
    color: '#E63946',
    brand: 'Pizza Express Casablanca',
    tagline: '-20% sur votre première commande avec AtlasWay',
    url: 'pizzaexpress.ma',
    cta: 'Commander',
  },
  {
    id: 3,
    logo: '🚗',
    color: '#2A9D8F',
    brand: 'AutoÉcole Riad',
    tagline: 'Permis B en 30 jours — formations intensives',
    url: 'autoecole-riad.ma',
    cta: 'Découvrir',
  },
];

const NAV_GROUPS = [
  {
    label: 'TRAJETS',
    items: [
      { icon: HomeIcon,      label: 'Accueil',         to: '/' },
      { icon: Compass,       label: 'Explorer',         to: '/rides/search' },
      { icon: GitCompare,    label: 'Comparer',         to: '/compare' },
    ],
  },
  {
    label: 'COMPTE',
    items: [
      { icon: Calendar,      label: 'Réservations',     to: '/bookings' },
      { icon: Heart,         label: 'Favoris',          to: '/favorites' },
      { icon: MessageCircle, label: 'Messages',         to: '/messages' },
      { icon: Bell,          label: 'Alertes prix',     to: '/ride-alerts' },
      { icon: CreditCard,    label: 'Portefeuille',     to: '/wallet' },
    ],
  },
  {
    label: 'COMMUNAUTÉ',
    items: [
      { icon: Trophy,        label: 'Classement',       to: '/leaderboard' },
    ],
  },
];

const ARABIC_CITIES = {
  'Casablanca': 'الدار البيضاء', 'Rabat': 'الرباط',
  'Marrakech': 'مراكش', 'Fès': 'فاس', 'Tanger': 'طنجة',
  'Agadir': 'أكادير', 'Meknès': 'مكناس', 'Oujda': 'وجدة', 'Tétouan': 'تطوان',
};

const ROUTE_DISTANCES = {
  'Casablanca|Rabat':      { km: 87,  min: 75  },
  'Casablanca|Marrakech':  { km: 240, min: 195 },
  'Casablanca|Fès':        { km: 300, min: 225 },
  'Casablanca|Tanger':     { km: 339, min: 255 },
  'Casablanca|Agadir':     { km: 461, min: 345 },
  'Casablanca|Meknès':     { km: 264, min: 210 },
  'Casablanca|Oujda':      { km: 615, min: 450 },
  'Casablanca|Tétouan':    { km: 381, min: 285 },
  'Rabat|Fès':             { km: 190, min: 150 },
  'Rabat|Marrakech':       { km: 328, min: 255 },
  'Rabat|Tanger':          { km: 254, min: 195 },
  'Rabat|Meknès':          { km: 140, min: 105 },
  'Rabat|Agadir':          { km: 550, min: 420 },
  'Rabat|Oujda':           { km: 530, min: 390 },
  'Marrakech|Agadir':      { km: 249, min: 195 },
  'Marrakech|Fès':         { km: 481, min: 375 },
  'Marrakech|Tanger':      { km: 564, min: 435 },
  'Marrakech|Oujda':       { km: 755, min: 570 },
  'Fès|Meknès':            { km: 58,  min: 45  },
  'Fès|Oujda':             { km: 367, min: 285 },
  'Fès|Tanger':            { km: 320, min: 240 },
  'Tanger|Tétouan':        { km: 58,  min: 45  },
  'Tanger|Meknès':         { km: 271, min: 210 },
  'Meknès|Oujda':          { km: 434, min: 330 },
  'Agadir|Oujda':          { km: 1059,min: 780 },
};

function getRoute(from, to) {
  return ROUTE_DISTANCES[`${from}|${to}`] || ROUTE_DISTANCES[`${to}|${from}`] || null;
}

function addMinutes(timeStr, minutes) {
  if (!timeStr || !minutes) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const CONFETTI_COLS = ['#C1272D','#D4890A','#006233','#F5EDD8','#C1272D','#D4890A','#006233','#F5EDD8','#C1272D','#D4890A','#006233','#F5EDD8'];
const CONFETTI_X    = [-26,-16,-6,4,14,24,-21,-11,1,11,21,28];

const FILTERS = [
  { key: 'all',      label: 'Tous' },
  { key: 'today',    label: "Aujourd'hui" },
  { key: 'tomorrow', label: 'Demain' },
  { key: 'cheap',    label: '< 50 DH' },
  { key: 'mid',      label: '< 100 DH' },
  { key: 'seats',    label: 'Places dispo' },
];

/* ─── UTILS ─────────────────────────────────────── */
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
  const now = new Date();
  const diffH = Math.floor((now - new Date(ride.createdAt || now)) / 3600000);
  return {
    id: ride.id,
    from: ride.from,
    to: ride.to,
    depTime: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    date: formatRideDate(ride.departureDate),
    driver: `${ride.driver?.firstName || ''} ${ride.driver?.lastName?.[0] || ''}.`,
    rating: ride.driver?.avgRating || 0,
    seats: ride.seatsAvailable,
    price: ride.price,
    avatar: `${ride.driver?.firstName?.[0] || '?'}${ride.driver?.lastName?.[0] || ''}`,
    ago: diffH < 1 ? 'à l\'instant' : diffH < 24 ? `il y a ${diffH}h` : `il y a ${Math.floor(diffH/24)}j`,
    rawDate: ride.departureDate,
    driverVerified: ride.driver?.driverVerified || false,
    totalTrips: ride.driver?.totalTrips || 0,
    driverGender: ride.driver?.gender || null,
    driverPhoto: ride.driver?.photo || null,
    vehicle: ride.vehicleModel || ride.vehicle || null,
    isQuick: ride.isQuick || false,
  };
}

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

/* ─── ZELLIGE STRIPE ────────────────────────────── */
function ZelligeStripe() {
  return <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D 0%, #C1272D 33%, #D4890A 50%, #006233 67%, #006233 100%)' }} />;
}

/* ─── SKELETON ──────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1rem', marginBottom: 10, overflow: 'hidden' }}>
      <ZelligeStripe />
      <div style={{ padding: '12px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 13, width: '40%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: '60%' }} />
        </div>
        <div className="skeleton" style={{ height: 30, width: 70, borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ height: 70, borderRadius: 10, margin: '12px 0' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />)}
      </div>
    </div>
  );
}

function Stars({ n = 5 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} style={{ color: i < n ? '#D4890A' : 'var(--border-muted)', fill: i < n ? '#D4890A' : 'none' }} />
      ))}
    </span>
  );
}

/* ─── CITY STORIES ──────────────────────────────── */
function CityStories() {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {/* "Tous les trajets" story */}
        <button onClick={() => navigate('/rides/search')} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C1272D, #D4890A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 3px var(--bg-900), 0 0 0 5px #C1272D',
            fontSize: 22,
          }}>🚗</div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>Tous</span>
        </button>

        {CITY_STORIES.map(({ city, arabic, emoji, color }) => (
          <button key={city} onClick={() => navigate(`/rides/search?to=${city}`)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(135deg, ${color}22, ${color}44)`,
              border: `2.5px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 2px var(--bg-900), 0 0 0 4.5px ${color}55`,
              fontSize: 22,
              transition: 'transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
              {emoji}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{city}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── QUICK FILTERS ─────────────────────────────── */
function QuickFilters({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
      {FILTERS.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)} style={{
          flexShrink: 0, padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', border: 'none', transition: 'all 0.15s',
          background: active === key ? 'linear-gradient(135deg, #C1272D, #9e1f24)' : 'var(--bg-800)',
          color: active === key ? '#fff' : 'var(--text-secondary)',
          boxShadow: active === key ? '0 3px 12px rgba(193,39,45,0.3)' : 'none',
          border: active === key ? 'none' : '1px solid var(--border-color)',
        }}>
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── REPUTATION HELPER ─────────────────────────── */
function userLevel(trips) {
  if (trips >= 100) return { label: 'PLATINE',  color: '#E5E4E2', icon: '💎', xpColor: '#a0d8ef' };
  if (trips >= 50)  return { label: 'OR',        color: '#D4890A', icon: '🥇', xpColor: '#D4890A' };
  if (trips >= 20)  return { label: 'ARGENT',    color: '#A8A8A8', icon: '🥈', xpColor: '#A8A8A8' };
  return               { label: 'BRONZE',    color: '#CD7F32', icon: '🥉', xpColor: '#CD7F32' };
}

/* ─── LEFT SIDEBAR ──────────────────────────────── */
function LeftSidebar({ user }) {
  const location = useLocation();
  const trips = user?.totalTrips || 0;
  const lvl   = userLevel(trips);
  const nextThreshold = trips >= 100 ? 100 : trips >= 50 ? 100 : trips >= 20 ? 50 : 20;
  const xpPct = Math.min(100, Math.round((trips / nextThreshold) * 100));

  return (
    <aside style={{
      position: 'sticky', top: 72, height: 'calc(100vh - 80px)',
      overflowY: 'auto', paddingBottom: 24, scrollbarWidth: 'none',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* User profile card */}
      {user && (
        <Link to="/profile" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 12, marginBottom: 4,
          textDecoration: 'none',
          background: 'var(--bg-800)',
          border: '1px solid var(--border-color)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(193,39,45,0.3)'; e.currentTarget.style.background = 'rgba(193,39,45,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-800)'; }}>
          {user.photo
            ? <img src={user.photo} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C1272D', flexShrink: 0 }} />
            : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
          }
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-base)', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#D4890A', fontFamily: "'Amiri', serif", marginTop: 1 }}>رفيق الطريق</p>
          </div>
        </Link>
      )}

      {/* Grouped nav */}
      {/* Reputation block */}
      {user && (
        <div style={{ padding: '8px 12px 10px', borderRadius: 10, marginBottom: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NIVEAU</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: lvl.color, display: 'flex', alignItems: 'center', gap: 3 }}>
              {lvl.icon} {lvl.label}
            </span>
          </div>
          {/* XP bar */}
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${xpPct}%`, borderRadius: 99, background: lvl.xpColor, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{trips} trajet{trips !== 1 ? 's' : ''}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>→ {nextThreshold} pour le palier suivant</span>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label}>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 10px', marginBottom: 4 }}>
              {label}
            </p>
            {items.map(({ icon: Icon, label: itemLabel, to }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '7px 10px 7px 12px',
                  borderRadius: 8, marginBottom: 1,
                  textDecoration: 'none',
                  position: 'relative',
                  color: active ? '#C1272D' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  background: active ? 'rgba(193,39,45,0.07)' : 'transparent',
                  transition: 'all 0.15s',
                  borderLeft: active ? '3px solid #C1272D' : '3px solid transparent',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-800)'; e.currentTarget.style.color = 'var(--text-base)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}>
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  {itemLabel}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ flexGrow: 1, minHeight: 16 }} />

      {/* CTA Proposer */}
      <Link to="/rides/publish" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: '10px 14px', borderRadius: 10,
        background: 'linear-gradient(135deg,#C1272D,#9e1f24)',
        color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 13,
        boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 7px 20px rgba(193,39,45,0.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(193,39,45,0.3)'; }}>
        <Car size={14} /> Proposer un trajet
      </Link>
    </aside>
  );
}

/* ─── SPONSORED SECTION ─────────────────────────── */
function SponsoredSection() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState({});
  const [form, setForm] = useState({ brand: '', tagline: '', url: '', budget: '100' });
  const [sent, setSent] = useState(false);

  const visible = SPONSORED_ADS.filter(a => !dismissed[a.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setShowModal(false); setSent(false); setForm({ brand: '', tagline: '', url: '', budget: '100' }); }, 2000);
  };

  return (
    <>
      {/* Modal publicité */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Megaphone size={18} style={{ color: '#C1272D' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: 'var(--text-primary)' }}>Créer une publicité</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Touchez des milliers de voyageurs</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Demande envoyée !</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Notre équipe vous contactera sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Nom de votre marque / entreprise</label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required
                    placeholder="ex: Mon Restaurant Casablanca" className="input" style={{ fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Slogan / message publicitaire</label>
                  <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} required
                    placeholder="ex: -20% pour les voyageurs AtlasWay" className="input" style={{ fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Votre site web ou numéro</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required
                    placeholder="ex: monsite.ma ou 06XXXXXXXX" className="input" style={{ fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                    Budget mensuel : <span style={{ color: '#C1272D', fontWeight: 900 }}>{Number(form.budget).toLocaleString()} DH</span>
                  </label>
                  <input type="range" min="100" max="5000" step="100" value={form.budget}
                    onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    style={{ width: '100%', accentColor: '#C1272D', cursor: 'pointer' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                    <span>100 DH</span><span>5 000 DH</span>
                  </div>
                </div>

                {/* Estimation */}
                <div style={{ background: 'rgba(193,39,45,0.06)', border: '1px solid rgba(193,39,45,0.15)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-around' }}>
                  {[
                    { label: 'Impressions/mois', val: `~${(Number(form.budget) * 120).toLocaleString()}` },
                    { label: 'Clics estimés', val: `~${(Number(form.budget) * 8).toLocaleString()}` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#C1272D' }}>{val}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{label}</p>
                    </div>
                  ))}
                </div>

                <button type="submit" style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(193,39,45,0.35)' }}>
                  Lancer ma campagne →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sponsored widget */}
      <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>Sponsorisé</p>
          <button onClick={() => setShowModal(true)} style={{ fontSize: 10, fontWeight: 700, color: '#C1272D', background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.2)', borderRadius: 99, padding: '3px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Megaphone size={10} /> Créer une pub
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map(ad => (
            <div key={ad.id} style={{ position: 'relative', display: 'flex', gap: 10, padding: '10px', borderRadius: 10, border: '1px solid var(--border-color)', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-700)'; e.currentTarget.style.borderColor = `${ad.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>

              {/* Dismiss */}
              <button onClick={() => setDismissed(d => ({ ...d, [ad.id]: true }))}
                style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, opacity: 0.5 }}>
                <X size={11} />
              </button>

              {/* Logo */}
              <div style={{ width: 48, height: 48, borderRadius: 10, background: `${ad.color}18`, border: `1px solid ${ad.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {ad.logo}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: 'var(--text-base)', lineHeight: 1.2 }}>{ad.brand}</p>
                <p style={{ margin: '3px 0 6px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{ad.tagline}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <ExternalLink size={8} /> {ad.url}
                  </span>
                  <button style={{ fontSize: 10, fontWeight: 700, color: ad.color, background: `${ad.color}12`, border: `1px solid ${ad.color}25`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
                    {ad.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {visible.length === 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>Aucune publicité active</p>
          )}
        </div>

        {/* CTA promouvoir */}
        <button onClick={() => setShowModal(true)} style={{
          width: '100%', marginTop: 12, padding: '9px', borderRadius: 10, cursor: 'pointer',
          background: 'transparent', border: '1px dashed rgba(193,39,45,0.3)',
          color: '#C1272D', fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.05)'; e.currentTarget.style.borderStyle = 'solid'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderStyle = 'dashed'; }}>
          <TrendingUp size={13} /> Promouvoir votre entreprise
        </button>
      </div>
    </>
  );
}

/* ─── RIGHT SIDEBAR ─────────────────────────────── */
function RightSidebar({ form, setForm, handleSearch, swap, handleVoiceSearch, handleGeolocate, locating, stats, burst, liveUsers }) {
  return (
    <aside style={{
      position: 'sticky', top: 72, height: 'calc(100vh - 80px)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
      scrollbarWidth: 'none', paddingBottom: 24,
    }}>
      {/* Search widget */}
      <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border-color)', borderRadius: 14, flexShrink: 0 }}>
        <div style={{ borderRadius: '14px 14px 0 0', overflow: 'hidden' }}><ZelligeStripe /></div>
        <div style={{ padding: '14px 14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D', margin: 0 }}>✦ Trouver un trajet</p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#00875A', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C851', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
              {liveUsers || '—'} en ligne
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button type="button" onClick={handleVoiceSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'rgba(0,135,90,0.1)', color: '#00875A', border: '1px solid rgba(0,135,90,0.22)', cursor: 'pointer' }}>
              <Mic size={12} /> Voix
            </button>
            <Link to="/compare" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'rgba(245,166,35,0.1)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.22)', cursor: 'pointer', textDecoration: 'none' }}>
              <MapPin size={12} /> Carte
            </Link>
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#006233', boxShadow: '0 0 5px rgba(0,135,90,0.6)' }} />
              <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                placeholder="Ville de départ" className="input" style={{ paddingLeft: 26, paddingRight: 32, fontSize: 13 }} list="sb-from" />
              <datalist id="sb-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              <button type="button" onClick={handleGeolocate} disabled={locating} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: locating ? '#F5A623' : '#006233', display: 'flex', alignItems: 'center' }}>
                {locating ? <div style={{ width: 11, height: 11, border: '2px solid #F5A623', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <MapPin size={11} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={swap} style={{ background: 'rgba(238,242,255,0.04)', border: '1px solid rgba(238,242,255,0.09)', borderRadius: 6, padding: '2px 12px', cursor: 'pointer', color: 'rgba(238,242,255,0.35)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                <ArrowRight size={9} /> inverser
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#C1272D', boxShadow: '0 0 5px rgba(193,39,45,0.6)' }} />
              <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                placeholder="Ville d'arrivée" className="input" style={{ paddingLeft: 26, fontSize: 13 }} list="sb-to" />
              <datalist id="sb-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]} className="input" style={{ fontSize: 12 }} />

            {/* Passagers */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={11} /> Passagers
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, passengers: Math.max(1, f.passengers - 1) }))}
                  style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>−</button>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-base)', minWidth: 16, textAlign: 'center' }}>{form.passengers}</span>
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, passengers: Math.min(8, f.passengers + 1) }))}
                  style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>+</button>
              </div>
            </div>

            {/* Prix maximum */}
            <div style={{ padding: '0 2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CreditCard size={11} /> Prix max
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: form.priceMax > 0 ? '#C1272D' : 'var(--text-muted)' }}>
                  {form.priceMax > 0 ? `${form.priceMax} DH` : 'Illimité'}
                </span>
              </div>
              <input type="range" min="0" max="500" step="25"
                value={form.priceMax}
                onChange={e => setForm(f => ({ ...f, priceMax: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#C1272D', cursor: 'pointer' }} />
            </div>

            <button type="submit" style={{
              width: '100%', height: 42, borderRadius: 10,
              background: 'linear-gradient(135deg, #C1272D, #9e1f24)',
              color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 6px 20px rgba(193,39,45,0.3)', transition: 'transform 0.15s', position: 'relative',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              Rechercher <ArrowRight size={14} />
              {burst && (
                <div className="confetti-container">
                  {CONFETTI_X.map((x, i) => (
                    <div key={i} className="confetti-piece" style={{ left: x, background: CONFETTI_COLS[i], animationDelay: `${i * 0.055}s` }} />
                  ))}
                </div>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Trending routes */}
      <div style={{ background: 'var(--bg-800)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '14px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#006233', marginBottom: 12 }}>🔥 Trajets populaires</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TRENDING_ROUTES.map(({ from, to, price, emoji }, i) => (
            <Link key={i} to={`/rides/search?from=${from}&to=${to}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
              border: '1px solid var(--border-color)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.05)'; e.currentTarget.style.borderColor = 'rgba(193,39,45,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{emoji}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-base)' }}>{from} → {to}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>dès {price} DH</p>
                </div>
              </div>
              <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Sponsored section */}
      <SponsoredSection />

      {/* Footer links */}
      <div style={{ padding: '4px 2px' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 2 }}>
          {['Confidentialité', 'Conditions', 'Publicités', 'À propos'].map((t, i) => (
            <span key={t}>
              <span style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                {t}
              </span>
              {i < 3 && <span style={{ margin: '0 4px' }}>·</span>}
            </span>
          ))}
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>AtlasWay © 2025</p>
      </div>
    </aside>
  );
}

/* ─── RIDE FEED CARD ────────────────────────────── */
function RideFeedCard({ trip, initialFav = false, index = 0 }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked,   setLiked]   = useState(initialFav);
  const [saved,   setSaved]   = useState(false);
  const [liking,  setLiking]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const arabicFrom = ARABIC_CITIES[trip.from] || '';
  const arabicTo   = ARABIC_CITIES[trip.to]   || '';
  const route      = getRoute(trip.from, trip.to);
  const arrival    = route ? addMinutes(trip.depTime, route.min) : null;

  /* Economy vs grand taxi (≈ 3.5 DH/km) */
  const taxiEst  = route?.km ? Math.round(route.km * 3.5) : null;
  const saving   = taxiEst && trip.price < taxiEst ? Math.round(((taxiEst - trip.price) / taxiEst) * 100) : null;
  const bestPrice = saving && saving >= 60;

  const isPremium = trip.totalTrips > 50;
  const isNew     = trip.totalTrips > 0 && trip.totalTrips < 5;

  const handleLike = async () => {
    if (!user) { toast.error('Connectez-vous pour sauvegarder un trajet'); return; }
    if (liking || !trip.id) return;
    setLiking(true);
    try {
      const { data } = await api.post(`/favorites/${trip.id}`);
      setLiked(data.favorited);
      toast.success(data.favorited ? '❤️ Ajouté aux favoris' : 'Retiré des favoris');
    } catch { toast.error('Erreur'); }
    finally { setLiking(false); }
  };

  return (
    <article
      className="feed-card-appear"
      style={{
        background: 'var(--card-bg)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
        border: `1px solid ${hovered ? 'rgba(193,39,45,0.3)' : 'var(--border-color)'}`,
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(193,39,45,0.08)' : '0 2px 8px rgba(0,0,0,0.1)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tricolor top strip — Moroccan identity */}
      <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D 33%, #D4890A 50%, #006233 67%)' }} />

      {/* ── HEADER: driver + price ── */}
      <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

        {/* Driver block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {trip.driverPhoto
              ? <img src={trip.driverPhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(193,39,45,0.35)' }} />
              : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14, border: '2px solid rgba(193,39,45,0.35)' }}>
                  {trip.avatar}
                </div>
            }
            <div style={{ position: 'absolute', bottom: 0, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#00C851', border: '2px solid var(--card-bg)', boxShadow: '0 0 4px rgba(0,200,81,0.5)' }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-base)', lineHeight: 1.2 }}>{trip.driver}</span>
              {trip.driverVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '1px 6px', borderRadius: 99, background: 'rgba(0,98,51,0.12)', color: '#00875A', border: '1px solid rgba(0,135,90,0.2)', flexShrink: 0 }}>
                  <CheckCircle size={8} /> VÉRIFIÉ
                </span>
              )}
              {isPremium && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(212,137,10,0.12)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.2)', flexShrink: 0 }}>⭐ PREMIUM</span>
              )}
              {trip.driverGender === 'female' && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(233,30,150,0.1)', color: '#E91E96', border: '1px solid rgba(233,30,150,0.2)', flexShrink: 0 }}>♀ FEMME</span>
              )}
              {isNew && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.2)', flexShrink: 0 }}>NOUVEAU</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <Stars n={Math.round(trip.rating || 5)} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{trip.rating ? Number(trip.rating).toFixed(1) : '5.0'}</span>
              {trip.totalTrips > 0 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {trip.totalTrips} trajet{trip.totalTrips > 1 ? 's' : ''}</span>}
              <span style={{ fontSize: 10, color: 'var(--border-muted)', marginLeft: 2 }}>· {trip.ago}</span>
            </div>
          </div>
        </div>

        {/* Price block — clean, no colored box */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-end' }}>
            <span style={{ fontWeight: 900, fontSize: 26, color: 'var(--text-base)', letterSpacing: '-0.03em', lineHeight: 1 }}>{trip.price}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#C1272D', lineHeight: 1 }}>DH</span>
          </div>
          {saving && saving > 0 && (
            <div style={{ fontSize: 10, color: '#00875A', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
              -{saving}% vs taxi
            </div>
          )}
          {bestPrice && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(0,135,90,0.12)', color: '#00875A', border: '1px solid rgba(0,135,90,0.2)', display: 'inline-block', marginTop: 3 }}>
              🏷️ MEILLEUR PRIX
            </span>
          )}
        </div>
      </div>

      {/* ── ROUTE HERO — boarding pass style ── */}
      <div style={{ padding: '4px 14px 10px' }}>
        <div style={{
          background: 'var(--bg-800)',
          borderRadius: 12,
          padding: '14px 16px',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Arabic watermark رحلة */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Amiri', serif", fontSize: 60, color: 'rgba(212,137,10,0.04)', userSelect: 'none', pointerEvents: 'none', fontWeight: 700 }}>رحلة</div>

          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1, gap: 8 }}>
            {/* Departure */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>{trip.depTime}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-base)', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.from}</div>
              {arabicFrom && <div style={{ fontSize: 11, color: 'rgba(212,137,10,0.65)', fontWeight: 500, marginTop: 4, fontFamily: "'Amiri', serif" }}>{arabicFrom}</div>}
            </div>

            {/* Route line */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 90 }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#006233', flexShrink: 0, boxShadow: '0 0 6px rgba(0,98,51,0.6)' }} />
                <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to right, #006233, #D4890A 50%, #C1272D)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '45%', transform: 'translate(-50%,-50%)', width: 5, height: 5, borderRadius: '50%', background: '#D4890A', boxShadow: '0 0 6px rgba(212,137,10,0.7)', animation: 'pulse 2s ease infinite' }} />
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C1272D', flexShrink: 0, boxShadow: '0 0 6px rgba(193,39,45,0.6)' }} />
              </div>
              {route && (
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', letterSpacing: '0.02em' }}>
                  {route.km} km · {Math.floor(route.min / 60)}h{route.min % 60 ? `${String(route.min % 60).padStart(2,'0')}` : ''}
                </div>
              )}
            </div>

            {/* Arrival */}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em' }}>{arrival || trip.date}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-base)', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.to}</div>
              {arabicTo && <div style={{ fontSize: 11, color: 'rgba(212,137,10,0.65)', fontWeight: 500, marginTop: 4, fontFamily: "'Amiri', serif", direction: 'rtl' }}>{arabicTo}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── INFO STRIP ── */}
      <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
          <Users size={11} /> {trip.seats} place{trip.seats !== 1 ? 's' : ''}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-muted)', flexShrink: 0 }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
          <Calendar size={11} /> {trip.date}
        </span>
        {trip.vehicle && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-muted)', flexShrink: 0 }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              <Car size={11} /> {trip.vehicle}
            </span>
          </>
        )}
        {trip.isQuick && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#D4890A', padding: '2px 8px', borderRadius: 99, background: 'rgba(212,137,10,0.08)', border: '1px solid rgba(212,137,10,0.18)' }}>
            <Zap size={9} /> Rapide
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-color)', margin: '0 14px' }} />

      {/* ── ACTIONS ── */}
      <div style={{ display: 'flex', padding: '8px 10px 11px', gap: 6, alignItems: 'center' }}>
        {/* Like */}
        <button
          onClick={handleLike} disabled={liking}
          title={liked ? 'Retiré des favoris' : 'Ajouter aux favoris'}
          style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${liked ? 'rgba(193,39,45,0.3)' : 'var(--border-color)'}`, background: liked ? 'rgba(193,39,45,0.08)' : 'transparent', color: liked ? '#C1272D' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { if (!liked) { e.currentTarget.style.background = 'rgba(193,39,45,0.06)'; e.currentTarget.style.borderColor = 'rgba(193,39,45,0.2)'; } }}
          onMouseLeave={e => { if (!liked) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; } }}>
          <Heart size={15} style={{ fill: liked ? '#C1272D' : 'none', transition: 'fill 0.15s' }} />
        </button>

        {/* Save */}
        <button
          onClick={() => { setSaved(s => !s); if (!saved) toast.success('🔖 Sauvegardé'); }}
          title={saved ? 'Retirer' : 'Sauvegarder'}
          style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${saved ? 'rgba(212,137,10,0.3)' : 'var(--border-color)'}`, background: saved ? 'rgba(212,137,10,0.08)' : 'transparent', color: saved ? '#D4890A' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { if (!saved) { e.currentTarget.style.background = 'rgba(212,137,10,0.06)'; e.currentTarget.style.borderColor = 'rgba(212,137,10,0.2)'; } }}
          onMouseLeave={e => { if (!saved) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; } }}>
          <Bookmark size={15} style={{ fill: saved ? '#D4890A' : 'none', transition: 'fill 0.15s' }} />
        </button>

        {/* Réserver */}
        <button
          onClick={() => navigate(trip.id ? `/rides/${trip.id}` : `/rides/search?from=${trip.from}&to=${trip.to}`)}
          style={{ flex: 1, height: 36, borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#C1272D,#9e1f24)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: hovered ? '0 6px 20px rgba(193,39,45,0.4)' : '0 3px 10px rgba(193,39,45,0.2)', transition: 'box-shadow 0.2s' }}>
          Réserver <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

/* ─── COMPACT SEARCH BAR ────────────────────────── */
function CompactSearchBar({ user }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      {user ? (
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #C1272D, #D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
      ) : (
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <button onClick={() => navigate('/rides/search')} style={{
        flex: 1, textAlign: 'left', padding: '9px 14px', borderRadius: 99,
        background: 'var(--bg-800)', border: '1px solid var(--border-color)',
        color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(193,39,45,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
        Où voulez-vous aller ? من فين لفين؟
      </button>
    </div>
  );
}

/* ─── HERO BANNER (non-auth) ─────────────────────── */
const HERO_STATS = [
  { end: 50000, suffix: '+', label: 'utilisateurs', color: '#fff' },
  { end: 200,   suffix: '+', label: 'trajets / jour', color: '#D4890A' },
  { end: 87,    suffix: '%', label: 'économisé vs taxi', color: '#00C851' },
  { end: 49,    suffix: '★', label: 'note moyenne', color: '#D4890A', display: '4.9★' },
];

const HERO_CITIES = [
  { name: 'Casa', emoji: '🏙️' }, { name: 'Rabat', emoji: '🏛️' },
  { name: 'Marrakech', emoji: '🌴' }, { name: 'Fès', emoji: '🕌' },
  { name: 'Tanger', emoji: '⚓' }, { name: 'Agadir', emoji: '🏖️' },
];

function AnimatedCount({ end, suffix, display }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const dur = 1200, steps = 40, step = dur / steps;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setCount(Math.round((end / steps) * i));
      if (i >= steps) { setCount(end); clearInterval(iv); }
    }, step);
    return () => clearInterval(iv);
  }, [end]);
  if (display) return <>{display}</>;
  return <>{count >= 1000 ? `${Math.floor(count / 1000)} ${Math.round((count % 1000) / 100) > 0 ? Math.round((count % 1000) / 100) * 100 : '000'}` : count}{suffix}</>;
}

function HeroBanner() {
  const navigate = useNavigate();
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', marginBottom: 10, position: 'relative',
      background: 'linear-gradient(150deg, #0d0400 0%, #180800 35%, #0a1005 70%, #050d02 100%)',
      border: '1px solid rgba(212,137,10,0.2)',
      boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
    }}>
      {/* Zellige SVG pattern overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.035, pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="zel" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#D4890A" strokeWidth="1"/>
            <polygon points="20,8 32,14 32,26 20,32 8,26 8,14" fill="none" stroke="#C1272D" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zel)"/>
      </svg>

      {/* Glow spots */}
      <div style={{ position: 'absolute', top: '-30px', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(193,39,45,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '5%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,98,51,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '30%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,137,10,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Arabic watermark */}
      <div style={{ position: 'absolute', bottom: 8, right: 14, fontFamily: "'Amiri', serif", fontSize: 64, color: 'rgba(212,137,10,0.055)', userSelect: 'none', pointerEvents: 'none', fontWeight: 700, lineHeight: 1 }}>رحلة آمنة</div>

      {/* Tricolor top bar */}
      <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D 33%, #D4890A 50%, #006233 67%)' }} />

      <div style={{ padding: '20px 22px 22px', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: '#D4890A', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 99, background: 'rgba(212,137,10,0.1)', border: '1px solid rgba(212,137,10,0.22)' }}>
            ✦ PLATEFORME #1 AU MAROC
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'rgba(0,200,81,0.1)', border: '1px solid rgba(0,200,81,0.2)', color: '#00C851' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C851', display: 'inline-block', animation: 'pulse 1.5s ease infinite' }} />
            DISPONIBLE MAINTENANT
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', lineHeight: 1.1, color: '#fff', letterSpacing: '-0.02em' }}>
          Voyagez partout au Maroc
        </h1>
        <h2 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', lineHeight: 1.1, letterSpacing: '-0.02em', background: 'linear-gradient(130deg, #C1272D 0%, #D4890A 55%, #e8a820 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          jusqu'à 87% moins cher.
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.6, fontFamily: "'Amiri', serif", letterSpacing: '0.02em' }}>
          ارحل معنا — سفر آمن وبأسعار معقولة في جميع أنحاء المغرب
        </p>

        {/* Animated stats */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 18, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {HERO_STATS.map(({ end, suffix, label, color, display }, i) => (
            <div key={label} style={{
              flex: 1, padding: '10px 6px', textAlign: 'center',
              borderRight: i < HERO_STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                <AnimatedCount end={end} suffix={suffix} display={display} />
              </p>
              <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/rides/search" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
            borderRadius: 10, background: 'linear-gradient(135deg,#C1272D,#9e1f24)',
            color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(193,39,45,0.4)', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 9px 28px rgba(193,39,45,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(193,39,45,0.4)'; }}>
            <Compass size={14} /> Voir les trajets
          </Link>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
            borderRadius: 10, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)',
            fontWeight: 600, fontSize: 13, textDecoration: 'none', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}>
            S'inscrire — c'est gratuit
          </Link>
        </div>

        {/* Quick city chips */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {HERO_CITIES.map(({ name, emoji }) => (
            <button key={name} onClick={() => navigate(`/rides/search?to=${name}`)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.1)'; e.currentTarget.style.borderColor = 'rgba(193,39,45,0.25)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
              {emoji} {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── FILTER LOGIC ──────────────────────────────── */
function applyFilter(trips, filter) {
  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 86400000).toDateString();
  switch (filter) {
    case 'today':    return trips.filter(t => t.date === "Aujourd'hui" || (t.rawDate && new Date(t.rawDate).toDateString() === today));
    case 'tomorrow': return trips.filter(t => t.date === 'Demain' || (t.rawDate && new Date(t.rawDate).toDateString() === tomorrow));
    case 'cheap':    return trips.filter(t => t.price < 50);
    case 'mid':      return trips.filter(t => t.price < 100);
    case 'seats':    return trips.filter(t => t.seats >= 2);
    default:         return trips;
  }
}

/* ─── PAGE ──────────────────────────────────────── */
export default function Home() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const { t }       = useLanguage();
  const h           = t.home;

  const [form,      setForm]      = useState({ from: '', to: '', date: '', passengers: 1, priceMax: 0 });
  const [showMap,   setShowMap]   = useState(false);
  const [locating,  setLocating]  = useState(false);
  const [realTrips, setRealTrips] = useState([]);
  const [favIds,    setFavIds]    = useState(new Set());
  const [liveStats, setLiveStats] = useState(null);
  const [liveUsers, setLiveUsers] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showDarija,setShowDarija]= useState(false);
  const [burst,     setBurst]     = useState(false);
  const [page,      setPage]      = useState(1);
  const [filter,    setFilter]    = useState('all');

  const revealSteps = useScrollReveal({ staggerMs: 120 });

  useEffect(() => {
    api.get('/rides/home').then(({ data }) => {
      if (data.upcoming?.length) setRealTrips(data.upcoming.map(adaptRide));
      if (data.stats)            setLiveStats(data.stats);
    }).catch(() => {}).finally(() => setLoading(false));

    // Fetch favorites to pre-mark liked cards
    if (user) {
      api.get('/favorites').then(({ data }) => {
        setFavIds(new Set((data.favorites || []).map(r => r.id)));
      }).catch(() => {});
    }

    // Simulate live user count (would connect to socket in production)
    const base = Math.floor(Math.random() * 40) + 15;
    setLiveUsers(base);
    const iv = setInterval(() => setLiveUsers(n => n + (Math.random() > 0.5 ? 1 : -1)), 8000);
    return () => clearInterval(iv);
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setBurst(true);
    setTimeout(() => setBurst(false), 1100);
    const p = new URLSearchParams();
    if (form.from)            p.set('from', form.from);
    if (form.to)              p.set('to', form.to);
    if (form.date)            p.set('date', form.date);
    if (form.passengers > 1)  p.set('seats', form.passengers);
    if (form.priceMax > 0)    p.set('maxPrice', form.priceMax);
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
        setForm(f => ({ ...f, from: cap(m[1]), to: cap(m[2]) }));
      }
    };
    rec.start();
  };

  const swap = () => setForm(f => ({ ...f, from: f.to, to: f.from }));

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const city = await reverseGeocode(coords.latitude, coords.longitude);
        if (city) setForm(f => ({ ...f, from: city }));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const allTrips  = realTrips.length ? realTrips : SAMPLE_TRIPS;
  const filtered  = applyFilter(allTrips, filter);
  const visible   = filtered.slice(0, page * 5);

  return (
    <>
      <SEO path="/" />
      <SplashScreen />

      <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D 0%, #C1272D 33%, #D4890A 50%, #006233 67%, #006233 100%)', position: 'sticky', top: 0, zIndex: 100 }} />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '16px 20px 0' }}>
        <div style={{ display: 'grid', gap: 18, alignItems: 'start' }} className="home-grid">

          {/* LEFT */}
          <LeftSidebar user={user} />

          {/* CENTER FEED */}
          <main>
            {!user && <HeroBanner />}
            <QuickFilters active={filter} onChange={k => { setFilter(k); setPage(1); }} />

            {/* Feed header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, background: 'rgba(0,200,81,0.08)', border: '1px solid rgba(0,200,81,0.18)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C851', display: 'inline-block', animation: 'pulse 1.5s ease infinite' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#00875A', textTransform: 'uppercase' }}>DIRECT</span>
                </div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#D4890A' }}>
                  رحلات متاحة · Trajets
                </p>
              </div>
              <Link to="/rides/search" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#C1272D', textDecoration: 'none', fontWeight: 600 }}>
                Voir tout <ChevronRight size={13} />
              </Link>
            </div>

            {/* Cards */}
            {loading
              ? [0,1,2].map(i => <SkeletonCard key={i} />)
              : filtered.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, marginBottom: 10 }}>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
                    <p style={{ fontWeight: 700, color: 'var(--text-base)', margin: '0 0 4px' }}>Aucun trajet pour ce filtre</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Essayez un autre filtre ou revenez plus tard</p>
                  </div>
                )
                : visible.map((trip, i) => (
                  <div key={trip.id || i}>
                    <RideFeedCard trip={trip} initialFav={favIds.has(trip.id)} index={i} />
                    {/* IA suggestions after 2nd card */}
                    {i === 1 && user && (
                      <div style={{ marginBottom: 12, borderRadius: 14, padding: '12px 14px', background: 'linear-gradient(135deg, rgba(0,98,51,0.06), rgba(0,98,51,0.03))', border: '1px solid rgba(0,98,51,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: '#00875A', textTransform: 'uppercase' }}>✨ POUR VOUS</span>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>— Basé sur votre historique</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {[
                            { from: 'Casablanca', to: 'Rabat',      emoji: '🏛️', price: 40, label: 'Rapide' },
                            { from: 'Rabat',      to: 'Marrakech',  emoji: '🌴', price: 90, label: 'Populaire' },
                            { from: 'Casa',       to: 'Agadir',     emoji: '🏖️', price: 110, label: 'Week-end' },
                          ].map(({ from, to, emoji, price, label }) => (
                            <Link key={to} to={`/rides/search?from=${from}&to=${to}`} style={{
                              flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2,
                              padding: '8px 10px', borderRadius: 10, textDecoration: 'none',
                              background: 'var(--bg-800)', border: '1px solid var(--border-color)',
                              transition: 'all 0.15s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,135,90,0.3)'; e.currentTarget.style.background = 'rgba(0,135,90,0.05)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-800)'; }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14 }}>{emoji}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: 'rgba(0,135,90,0.1)', color: '#00875A', border: '1px solid rgba(0,135,90,0.2)' }}>{label}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-base)' }}>{from} → {to}</p>
                              <p style={{ margin: 0, fontSize: 11, color: '#C1272D', fontWeight: 700 }}>dès {price} DH</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
            }

            {/* Load more */}
            {!loading && visible.length < filtered.length && (
              <button onClick={() => setPage(p => p + 1)} style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: 'var(--bg-800)', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginBottom: 10, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,39,45,0.05)'; e.currentTarget.style.color = '#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-800)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <RefreshCw size={14} /> Voir plus de trajets
              </button>
            )}

            {realTrips.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                Exemples — connectez-vous pour voir les vrais trajets en direct
              </p>
            )}

            {/* Publish inline CTA */}
            <div style={{ marginBottom: 14, borderRadius: 14, padding: '18px 20px', background: 'linear-gradient(135deg, #1a0c00, #2e1600)', border: '1px solid rgba(212,137,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 180, height: '100%', background: 'radial-gradient(ellipse at right center, rgba(212,137,10,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: 4, right: 20, fontFamily: "'Amiri', serif", fontSize: 40, color: 'rgba(212,137,10,0.07)', userSelect: 'none' }}>سائق</div>
              <div style={{ position: 'relative' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 900, color: '#fff', fontSize: 15 }}>Vous conduisez vers une ville ?</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Proposez vos sièges & remboursez votre carburant.</p>
              </div>
              <Link to="/rides/publish" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #D4890A, #a86508)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(212,137,10,0.35)', position: 'relative' }}>
                <Car size={15} /> Publier
              </Link>
            </div>

            {/* How it works */}
            <section style={{ marginBottom: 14 }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
                <ZelligeStripe />
                <div style={{ padding: '18px 20px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#D4890A' }}>✦ Comment ça marche</p>
                  <h2 style={{ margin: '0 0 16px', fontWeight: 900, fontSize: 18, color: 'var(--text-base)' }}>En 3 étapes simples</h2>
                  <div ref={revealSteps} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {STEPS.map(({ num, icon: Icon }, i) => (
                      <div key={num} data-reveal style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: i === 0 ? 'rgba(193,39,45,0.1)' : i === 1 ? 'rgba(0,98,51,0.1)' : 'rgba(212,137,10,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={17} style={{ color: i === 0 ? '#C1272D' : i === 1 ? '#006233' : '#D4890A' }} />
                        </div>
                        <div>
                          <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 14, color: 'var(--text-base)' }}>
                            <span style={{ color: 'var(--text-muted)', marginRight: 6, fontSize: 11 }}>{num}</span>{h.steps[i].title}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{h.steps[i].desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section style={{ marginBottom: 14 }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
                <ZelligeStripe />
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#006233' }}>✦ Ce qu'ils disent</p>
                    <button onClick={() => setShowDarija(v => !v)} style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(212,137,10,0.35)', color: showDarija ? '#D4890A' : 'var(--text-muted)', background: showDarija ? 'rgba(212,137,10,0.08)' : 'transparent', cursor: 'pointer' }}>
                      {showDarija ? 'Français' : 'بالدارجة'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {TESTIMONIALS.map(({ name, city, avatar, color, rating, text, darija, detail }) => (
                      <div key={name} style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{avatar}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--text-base)' }}>{name}</p>
                            <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{city} · {detail}</p>
                          </div>
                          <Stars n={rating} />
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontFamily: showDarija ? "'Amiri', serif" : 'inherit', direction: showDarija ? 'rtl' : 'ltr', fontSize: showDarija ? 14 : 12, transition: 'all 0.2s' }}>
                          "{showDarija ? darija : text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Trust */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {[
                  { icon: Shield,       title: 'Profils vérifiés',  desc: 'Chaque conducteur est vérifié' },
                  { icon: Lock,         title: 'Paiement sécurisé', desc: 'Transaction 100% sécurisée' },
                  { icon: ThumbsUp,     title: 'Avis authentiques', desc: 'Avis vérifiés après trajet' },
                  { icon: MessageCircle,title: 'Support 24/7',      desc: 'Équipe disponible toujours' },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRight: i % 2 === 0 ? '1px solid var(--border-color)' : 'none', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'rgba(193,39,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} style={{ color: '#C1272D' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: 'var(--text-base)' }}>{title}</p>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA non-auth */}
            {!user && (
              <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '20px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #0d0509, #200c12)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(193,39,45,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(193,39,45,0.15)', color: '#ff8a80', border: '1px solid rgba(193,39,45,0.3)', marginBottom: 10 }}><Backpack size={11} /> Passager</span>
                    <h3 style={{ margin: '0 0 6px', fontWeight: 900, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>Trouvez votre trajet<br /><span style={{ color: '#ff8a80' }}>idéal</span></h3>
                    <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, marginTop: 8, background: '#C1272D', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                      S'inscrire <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
                <div style={{ padding: '20px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #0d0900, #1e1200)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(212,137,10,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(212,137,10,0.15)', color: '#ffd166', border: '1px solid rgba(212,137,10,0.3)', marginBottom: 10 }}><Car size={11} /> Conducteur</span>
                    <h3 style={{ margin: '0 0 6px', fontWeight: 900, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>Remboursez<br /><span style={{ color: '#ffd166' }}>votre carburant</span></h3>
                    <Link to="/rides/publish" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, marginTop: 8, background: '#D4890A', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                      <Car size={12} /> Publier
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* RIGHT */}
          <RightSidebar
            form={form} setForm={setForm}
            handleSearch={handleSearch} swap={swap}
            handleVoiceSearch={handleVoiceSearch}
            handleGeolocate={handleGeolocate}
            locating={locating} stats={liveStats}
            burst={burst} liveUsers={liveUsers}
          />
        </div>
      </div>

      {showMap && (
        <Suspense fallback={null}>
          <MapPicker initialFrom={form.from} initialTo={form.to}
            onConfirm={(f, t) => { setForm(prev => ({ ...prev, from: f, to: t })); setShowMap(false); }}
            onClose={() => setShowMap(false)} />
        </Suspense>
      )}

      <style>{`
        @keyframes feedCardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .feed-card-appear {
          animation: feedCardIn 0.35s ease both;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
        @media (max-width: 1024px) {
          .home-grid { grid-template-columns: 180px 1fr !important; }
          .home-grid > aside:last-child { display: none !important; }
        }
        @media (max-width: 680px) {
          .home-grid { grid-template-columns: 1fr !important; }
          .home-grid > aside:first-child { display: none !important; }
        }
      `}</style>
    </>
  );
}
