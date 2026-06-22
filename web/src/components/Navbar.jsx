import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car, Search, MessageSquare, User, LogOut, Shield, Plus,
  Menu, X, BookOpen, Sun, Moon, ArrowRight, Bell, CheckCircle, Clock, Rss, Star, BarChart2, Users, Globe, Mic, MicOff,
  Map, MapPin, Wallet, Trophy, Crown, Camera, CalendarDays, LifeBuoy, History, Headphones, Navigation,
  Heart, Building2, LayoutGrid
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGS } from '../context/LanguageContext';
import { pushSupported, pushPermission, enablePush } from '../utils/push';

const NOTIF_TYPE_META = {
  booking: { icon: CheckCircle,   color: '#006233' },
  message: { icon: MessageSquare, color: '#C1272D' },
  review:  { icon: Star,          color: '#D4890A' },
  ride:    { icon: Car,           color: '#C1272D' },
  system:  { icon: Bell,          color: '#3B82F6' },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return 'Hier';
}

export default function Navbar() {
  const { user, logout }    = useAuth();
  const { theme, toggle }   = useTheme();
  const { lang, setLang, t } = useLanguage();
  const navigate             = useNavigate();
  const location             = useLocation();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [unreadMsg,     setUnreadMsg]     = useState(0);
  const [pendingBooks,  setPendingBooks]  = useState(0);
  const [friendReqs,    setFriendReqs]    = useState(0);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [langOpen,     setLangOpen]     = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [searchQ,      setSearchQ]      = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], cities: [] });
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [listening,    setListening]    = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);
  const [notifs,       setNotifs]       = useState([]);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const langRef    = useRef(null);
  const explorerRef = useRef(null);
  const intervalRef = useRef(null);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMobileOpen(false); setNotifOpen(false); setProfileOpen(false); setLangOpen(false);
  }, [location.pathname]);

  /* Reset badges */
  useEffect(() => {
    if (location.pathname === '/messages') setUnreadMsg(0);
    if (location.pathname === '/bookings') setPendingBooks(0);
  }, [location.pathname]);

  /* Poll counts + notifications */
  useEffect(() => {
    if (!user) return;
    const poll = () => {
      api.get('/messages/unread-count').then(({ data }) => setUnreadMsg(data.count)).catch(() => {});
      api.get('/bookings/pending-count').then(({ data }) => setPendingBooks(data.count)).catch(() => {});
      api.get('/notifications').then(({ data }) => setNotifs(data.notifications || [])).catch(() => {});
      api.get('/friends/pending-count').then(({ data }) => setFriendReqs(data.count)).catch(() => {});
    };
    poll();
    intervalRef.current = setInterval(poll, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
      if (profileRef.current  && !profileRef.current.contains(e.target))  setProfileOpen(false);
      if (langRef.current     && !langRef.current.contains(e.target))     setLangOpen(false);
      if (searchRef.current   && !searchRef.current.contains(e.target))   setSearchOpen(false);
      if (explorerRef.current && !explorerRef.current.contains(e.target)) setExplorerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const MOROCCAN_CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Chefchaouen','Essaouira','Ifrane','Merzouga','Laâyoune'];

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQ(q);
    if (!q.trim()) { setSearchResults({ users: [], cities: [] }); setSearchOpen(false); return; }
    setSearchOpen(true);
    const matchedCities = MOROCCAN_CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
    setSearchResults(prev => ({ ...prev, cities: matchedCities }));
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (q.trim().length < 2) return;
      setSearchLoading(true);
      api.get(`/users/search?q=${encodeURIComponent(q.trim())}`)
        .then(({ data }) => setSearchResults(prev => ({ ...prev, users: data.users || [] })))
        .catch(() => {})
        .finally(() => setSearchLoading(false));
    }, 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    if (searchQ.trim()) navigate(`/rides/search?from=${encodeURIComponent(searchQ.trim())}`);
    else navigate('/rides/search');
  };

  const handleVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Votre navigateur ne supporte pas la recherche vocale.'); return; }
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSearchQ(text);
      setSearchOpen(true);
      navigate(`/rides/search?from=${encodeURIComponent(text.trim())}`);
    };
    rec.start();
  };

  const handleSelectCity = (city) => {
    setSearchQ(city); setSearchOpen(false);
    navigate(`/rides/search?to=${encodeURIComponent(city)}`);
  };

  const handleSelectUser = (userId) => {
    setSearchQ(''); setSearchOpen(false);
    navigate(`/profile/${userId}`);
  };

  const unreadNotifs = notifs.filter(n => !n.read).length;
  const markAllRead  = () => {
    api.put('/notifications/read-all').catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };
  const markOneRead = (id) => {
    api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ── Notifications push ──
  const [pushReady, setPushReady] = useState(false);
  useEffect(() => { setPushReady(pushSupported() && pushPermission() !== 'granted'); }, []);
  const handleEnablePush = async () => {
    try {
      await enablePush();
      setPushReady(false);
      toast.success('Notifications push activées !');
    } catch (e) {
      toast.error(e.message || "Impossible d'activer les notifications.");
    }
  };

  const profileMenuItems = [
    { to: '/profile',             icon: User,          label: t.profileMenu.profile },
    { to: '/friends',             icon: Users,         label: t.profileMenu.friends, badge: friendReqs },
    { to: '/driver-dashboard',    icon: BarChart2,     label: t.profileMenu.dashboard },
    { to: '/analytics/driver',    icon: BarChart2,     label: 'Mes statistiques' },
    { to: '/wallet',              icon: Wallet,        label: 'Portefeuille' },
    { to: '/leaderboard',         icon: Trophy,        label: 'Classement' },
    { to: '/premium',             icon: Crown,         label: 'Premium' },
    { to: '/stories',             icon: Camera,        label: 'Stories' },
    { to: '/groups',              icon: Users,         label: 'Groupes' },
    { to: '/events',              icon: CalendarDays,  label: 'Événements' },
    { to: '/favorites',           icon: Heart,         label: 'Mes favoris' },
    { to: '/notifications',       icon: Bell,          label: 'Notifications' },
    { to: '/ride-alerts',         icon: Bell,          label: 'Alertes trajets' },
    { to: '/emergency-contacts',  icon: LifeBuoy,      label: 'Contacts SOS' },
    { to: '/enterprise',          icon: Building2,     label: 'Tableau entreprise' },
    { to: '/support',             icon: Headphones,    label: 'Support & Aide' },
    { to: '/rides/publish',       icon: Plus,          label: t.profileMenu.publish },
    { to: '/rides/mine',          icon: Car,           label: t.profileMenu.rides },
    { to: '/bookings',            icon: BookOpen,      label: t.profileMenu.bookings },
    { to: '/messages',            icon: MessageSquare, label: t.profileMenu.messages },
    { to: '/login-history',       icon: History,       label: 'Historique connexions' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-black/30' : ''
    }`} style={{
      background: scrolled ? 'rgba(15,8,4,0.85)' : 'rgba(15,8,4,0.65)',
      backdropFilter: 'blur(20px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
      borderBottom: scrolled ? '1px solid rgba(193,39,45,0.15)' : '1px solid rgba(255,255,255,0.04)',
    }}>

      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center gap-3">

        {/* ── LOGO (gauche) ── */}
        <Link
          to={['admin', 'superadmin'].includes(user?.role) ? '/admin' : '/'}
          onClick={() => { if (location.pathname === '/' || location.pathname === '/admin') window.location.reload(); }}
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <img src="/logo.svg" alt="AtlasWay" className="w-9 h-9 rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{ boxShadow: '0 4px 16px rgba(193,39,45,0.45), 0 0 0 1px rgba(193,39,45,0.2)' }} />
          <span className="font-black text-xl tracking-tight hidden sm:block" style={{ fontFamily: "'Fraunces', serif", letterSpacing: '-0.03em', fontVariationSettings: "'opsz' 72" }}>
            <span style={{ color: 'var(--text-base)' }}>Atlas</span><span className="logo-gradient">Way</span>
          </span>
        </Link>

        {/* ── BARRE DE RECHERCHE (centre) ── */}
        <div ref={searchRef} className="flex-1 max-w-md mx-auto hidden md:flex relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                value={searchQ}
                onChange={handleSearchChange}
                placeholder={t.nav.searchPlaceholder}
                className="w-full pl-9 pr-10 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'var(--bg-700)',
                  border: '1.5px solid var(--border-color)',
                  color: 'var(--text-base)',
                  outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#C1272D'; e.target.style.boxShadow = '0 0 0 3px rgba(193,39,45,0.1)'; if (searchQ.trim()) setSearchOpen(true); }}
                onBlur={e  => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                autoComplete="off"
              />
              <button type="button" onClick={handleVoiceSearch} title="Recherche vocale"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-lg transition-all"
                style={{ color: listening ? '#C1272D' : 'var(--text-muted)' }}>
                {listening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
          </form>

          {/* ── Dropdown résultats ── */}
          {searchOpen && (searchResults.cities.length > 0 || searchResults.users.length > 0 || searchLoading) && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full rounded-2xl shadow-2xl overflow-hidden z-50"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 40px rgba(0,0,0,0.22)' }}>

              {/* Villes */}
              {searchResults.cities.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Villes</p>
                  {searchResults.cities.map(city => (
                    <button key={city} onMouseDown={() => handleSelectCity(city)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-left transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-700)'; e.currentTarget.style.color = 'var(--text-base)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <MapPin size={16} style={{ color: '#C1272D', flexShrink: 0 }} />
                      <span>{city}</span>
                      <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D' }}>Trajet</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Conducteurs / Profils */}
              {(searchResults.users.length > 0 || searchLoading) && (
                <div style={{ borderTop: searchResults.cities.length > 0 ? '1px solid var(--border-color)' : 'none' }}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Conducteurs</p>
                  {searchLoading ? (
                    <div className="flex items-center gap-2 px-4 py-3">
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C1272D', borderTopColor: 'transparent' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Recherche…</span>
                    </div>
                  ) : searchResults.users.map(u => (
                    <button key={u.id} onMouseDown={() => handleSelectUser(u.id)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-700)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {u.photo
                        ? <img src={u.photo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
                            {u.firstName?.[0]}
                          </div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm leading-tight flex items-center gap-1" style={{ color: 'var(--text-base)' }}>
                          {u.firstName} {u.lastName}
                          {u.driverVerified && <CheckCircle size={12} style={{ color: '#00875A', flexShrink: 0 }} />}
                        </p>
                        <p className="text-[11px] flex items-center gap-1 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                          {u.isDriver
                            ? <span className="inline-flex items-center gap-1"><Car size={11} /> Conducteur</span>
                            : <span className="inline-flex items-center gap-1"><User size={11} /> Passager</span>}
                          {u.avgRating > 0 && <span className="inline-flex items-center gap-0.5">· <Star size={11} className="fill-current" style={{ color: '#D4890A' }} /> {Number(u.avgRating).toFixed(1)}</span>}
                          {u.totalTrips > 0 && <span>· {u.totalTrips} trajets</span>}
                        </p>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── ACTIONS DROITE ── */}
        <div className="flex items-center gap-0.5 ml-auto">

          {user ? (
            <>
              {/* Feed */}
              <NavLink to="/feed" title="Feed"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' })}>
                {({ isActive }) => <Rss size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />}
              </NavLink>

              {/* Mes Trajets */}
              <NavLink to="/rides/mine" title="Mes trajets"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' })}>
                {({ isActive }) => <Car size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />}
              </NavLink>

              {/* Réservations */}
              <NavLink to="/bookings" title="Réservations"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all relative"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' })}>
                {({ isActive }) => (
                  <>
                    <BookOpen size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    {pendingBooks > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#D4890A' }}>
                        {pendingBooks > 9 ? '9+' : pendingBooks}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* Messages */}
              <NavLink to="/messages" title="Messages"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all relative"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' })}>
                {({ isActive }) => (
                  <>
                    <MessageSquare size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    {unreadMsg > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#C1272D' }}>
                        {unreadMsg > 9 ? '9+' : unreadMsg}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* Amis */}
              <NavLink to="/friends" title="Amis"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all relative"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' })}>
                {({ isActive }) => (
                  <>
                    <Users size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    {friendReqs > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#C1272D' }}>
                        {friendReqs > 9 ? '9+' : friendReqs}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* ── Explorer dropdown ── */}
              <div ref={explorerRef} className="relative hidden md:block">
                <button
                  onClick={() => { setExplorerOpen(o => !o); setNotifOpen(false); setProfileOpen(false); setLangOpen(false); }}
                  title="Explorer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                  style={{ background: explorerOpen ? 'rgba(212,137,10,0.1)' : 'transparent', color: explorerOpen ? '#D4890A' : 'var(--text-secondary)' }}>
                  <LayoutGrid size={20} />
                </button>
                {explorerOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl overflow-hidden shadow-2xl z-50 p-3"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest px-1 mb-2.5" style={{ color: 'var(--text-muted)' }}>Explorer</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { to: '/compare',    icon: Map,          label: 'Comparer',   color: '#00BCD4' },
                        { to: '/mobility',   icon: Globe,        label: 'Mobilité',   color: '#006233' },
                        { to: '/city-ride',  icon: Navigation,   label: 'City',       color: '#D4890A' },
                        { to: '/leaderboard',icon: Trophy,       label: 'Classement', color: '#D4890A' },
                        { to: '/events',     icon: CalendarDays, label: 'Événements', color: '#8B5CF6' },
                        { to: '/groups',     icon: Users,        label: 'Groupes',    color: '#3B82F6' },
                      ].map(({ to, icon: Icon, label, color }) => (
                        <Link key={to} to={to} onClick={() => setExplorerOpen(false)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                          style={{ textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                            <Icon size={17} style={{ color }} />
                          </div>
                          <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Notifications ── */}
              <div ref={notifRef} className="relative hidden md:block">
                <button
                  onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); setLangOpen(false); setExplorerOpen(false); }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-all relative"
                  style={{ background: notifOpen ? 'rgba(193,39,45,0.1)' : 'transparent' }}
                  title={t.nav.notifications}
                >
                  <Bell size={20} style={{ color: notifOpen ? '#C1272D' : 'var(--text-secondary)' }} />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#C1272D' }}>
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {/* Dropdown notifs */}
                {notifOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <h3 className="font-black text-base" style={{ color: 'var(--text-base)' }}>{t.nav.notifications}</h3>
                      {unreadNotifs > 0 && (
                        <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: '#C1272D' }}>
                          {t.nav.markAllRead}
                        </button>
                      )}
                    </div>
                    {pushReady && (
                      <button onClick={handleEnablePush}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold transition-all"
                        style={{ color: '#C1272D', background: 'rgba(193,39,45,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                        <Bell size={15} /> Activer les notifications push
                      </button>
                    )}
                    <div className="max-h-80 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">{t.nav.noNotifs}</div>
                      ) : notifs.map((n) => {
                        const meta = NOTIF_TYPE_META[n.type] || NOTIF_TYPE_META.system;
                        const Icon = meta.icon;
                        return (
                          <div key={n.id}
                            onClick={() => markOneRead(n.id)}
                            className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                            style={{ background: n.read ? 'transparent' : 'rgba(193,39,45,0.04)', borderBottom: '1px solid var(--border-color)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                            onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(193,39,45,0.04)'}
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${meta.color}18` }}>
                              <Icon size={18} style={{ color: meta.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-base)' }}>{n.title}</p>
                              <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#C1272D' }}>
                                <Clock size={10} /> {timeAgo(n.createdAt)}
                              </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: '#C1272D' }} />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <Link to="/notifications" onClick={() => setNotifOpen(false)}
                        className="block w-full text-sm font-semibold py-1.5 rounded-xl transition-all text-center"
                        style={{ color: '#C1272D' }}>
                        {t.nav.viewAll}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin */}
              {['admin', 'superadmin'].includes(user?.role) && (
                <NavLink to="/admin" title="Admin"
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all"
                  style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.1)' : 'transparent' })}
                >
                  {({ isActive }) => (
                    <>
                      <Shield size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    </>
                  )}
                </NavLink>
              )}

              {/* ── Profil dropdown ── */}
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setLangOpen(false); setExplorerOpen(false); }}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-xl transition-all"
                  style={{ background: profileOpen ? 'rgba(193,39,45,0.08)' : 'transparent' }}
                >
                  {user.photo
                    ? <img src={user.photo} alt="" className="w-8 h-8 rounded-full object-cover" style={{ outline: '2px solid #C1272D', outlineOffset: 1 }} />
                    : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black"
                        style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
                        {user.firstName?.[0]}
                      </div>
                  }
                  <span className="text-sm font-bold hidden lg:block" style={{ color: 'var(--text-base)' }}>{user.firstName}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl overflow-hidden shadow-2xl z-50"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                    {/* User info */}
                    <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {user.photo
                        ? <img src={user.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                            style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
                            {user.firstName?.[0]}
                          </div>
                      }
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>{user.firstName} {user.lastName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                    {profileMenuItems.map(({ to, icon: Icon, label, badge }) => (
                      <Link key={to} to={to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-700)'; e.currentTarget.style.color = 'var(--text-base)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Icon size={16} />
                        <span className="flex-1">{label}</span>
                        {badge > 0 && (
                          <span className="min-w-[18px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#C1272D' }}>
                            {badge > 9 ? '9+' : badge}
                          </span>
                        )}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full transition-all"
                        style={{ color: '#C1272D' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(193,39,45,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={16} /> {t.nav.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Non connecté */
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login"
                className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 border"
                style={{ color: 'var(--text-base)', borderColor: 'var(--border-muted)', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-muted)'; e.currentTarget.style.color = 'var(--text-base)'; }}
              >
                {t.nav.login}
              </Link>
              <Link to="/register"
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#C1272D,#9e1f24)', color: '#fff', boxShadow: '0 4px 14px rgba(193,39,45,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(193,39,45,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(193,39,45,0.35)'; }}
              >
                {t.nav.register} <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* ── Language selector ── */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setLangOpen(o => !o); setNotifOpen(false); setProfileOpen(false); setExplorerOpen(false); }}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
              style={{ background: langOpen ? 'rgba(212,137,10,0.08)' : 'transparent' }}
              title="Langue"
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{t.flag}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] rounded-2xl overflow-hidden shadow-2xl z-50"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', minWidth: 148, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                {Object.entries(LANGS).map(([key, l]) => (
                  <button key={key}
                    onClick={() => { setLang(key); setLangOpen(false); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 w-full text-sm font-medium transition-all text-left"
                    style={{
                      color: lang === key ? '#D4890A' : 'var(--text-secondary)',
                      background: lang === key ? 'rgba(212,137,10,0.08)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (lang !== key) e.currentTarget.style.background = 'var(--bg-700)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = lang === key ? 'rgba(212,137,10,0.08)' : 'transparent'; }}
                  >
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    <span>{l.name}</span>
                    {lang === key && <span style={{ marginLeft: 'auto', color: '#D4890A', fontSize: 10 }}>✦</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggle} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{ color: 'var(--text-secondary)' }}>
            {theme === 'dark'
              ? <Sun size={20} style={{ color: '#D4890A' }} />
              : <Moon size={20} style={{ color: '#C1272D' }} />
            }
          </button>

          {/* Mobile burger */}
          <button className="md:hidden p-2 rounded-xl transition-all" style={{ color: 'var(--text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MENU MOBILE ── */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
          <MobileLink to="/rides/search"  icon={<Search size={16} />}       label={t.mobile.search} />
          <MobileLink to="/compare"       icon={<Map size={16} />}           label={t.mobile.compare} />
          <MobileLink to="/mobility"      icon={<Globe size={16} />}         label="Mobilité" />
          <MobileLink to="/city-ride"     icon={<Navigation size={16} />}    label="City" />
          <MobileLink to="/feed"          icon={<Rss size={16} />}           label={t.mobile.feed} />
          {user ? (
            <>
              <MobileLink to="/rides/publish" icon={<Plus size={16} />}         label={t.mobile.publish} />
              <MobileLink to="/rides/mine"    icon={<Car size={16} />}           label={t.mobile.rides} />
              <MobileLink to="/bookings"      icon={<BookOpen size={16} />}      label={t.mobile.bookings}  badge={pendingBooks} badgeColor="bg-yellow-500 text-black" />
              <MobileLink to="/messages"      icon={<MessageSquare size={16} />} label={t.mobile.messages}  badge={unreadMsg}    badgeColor="bg-red-500 text-white" />
              <MobileLink to="/friends"       icon={<Users size={16} />}         label={t.mobile.friends}   badge={friendReqs}   badgeColor="bg-red-500 text-white" />
              <MobileLink to="/profile"       icon={<User size={16} />}          label={t.mobile.profile} />
              {['admin','superadmin'].includes(user?.role) && (
                <MobileLink to="/admin" icon={<Shield size={16} />} label={t.mobile.admin} />
              )}
              {/* Mobile language selector */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(LANGS).map(([key, l]) => (
                  <button key={key}
                    onClick={() => setLang(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: lang === key ? 'rgba(212,137,10,0.12)' : 'var(--bg-700)',
                      border: `1px solid ${lang === key ? 'rgba(212,137,10,0.5)' : 'var(--border-color)'}`,
                      color: lang === key ? '#D4890A' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{l.flag}</span> {l.name}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8 }}>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold px-3 py-2.5 rounded-xl w-full transition-all"
                  style={{ color: '#C1272D' }}>
                  <LogOut size={16} /> {t.mobile.logout}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login"    className="btn-secondary text-sm text-center py-3">{t.mobile.login}</Link>
              <Link to="/register" className="btn-primary  text-sm text-center py-3">{t.mobile.registerFull}</Link>
              {/* Mobile language selector */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {Object.entries(LANGS).map(([key, l]) => (
                  <button key={key}
                    onClick={() => setLang(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: lang === key ? 'rgba(212,137,10,0.12)' : 'var(--bg-700)',
                      border: `1px solid ${lang === key ? 'rgba(212,137,10,0.5)' : 'var(--border-color)'}`,
                      color: lang === key ? '#D4890A' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{l.flag}</span> {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function MobileLink({ to, icon, label, badge = 0, badgeColor = '' }) {
  return (
    <NavLink to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-700'
        }`
      }
      style={({ isActive }) => ({ color: isActive ? '#C1272D' : 'var(--text-secondary)' })}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
}
