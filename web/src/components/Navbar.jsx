import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car, Search, MessageSquare, User, LogOut, Shield, Plus,
  Menu, X, BookOpen, Sun, Moon, ArrowRight, Bell, CheckCircle, Clock, Rss, Star, BarChart2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

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
  const { user, logout }  = useAuth();
  const { theme, toggle } = useTheme();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [unreadMsg,    setUnreadMsg]    = useState(0);
  const [pendingBooks, setPendingBooks] = useState(0);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchQ,      setSearchQ]      = useState('');
  const [notifs,       setNotifs]       = useState([]);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const intervalRef = useRef(null);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMobileOpen(false); setNotifOpen(false); setProfileOpen(false);
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
    };
    poll();
    intervalRef.current = setInterval(poll, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/rides/search?from=${encodeURIComponent(searchQ.trim())}`);
    else navigate('/rides/search');
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

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-black/10' : ''
    }`} style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>

      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center gap-3">

        {/* ── LOGO (gauche) ── */}
        <Link
          to="/"
          onClick={() => { if (location.pathname === '/') window.location.reload(); }}
          className="flex items-center gap-2 flex-shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'linear-gradient(135deg, #C1272D, #9e1f24)', boxShadow: '0 4px 12px rgba(193,39,45,0.3)' }}>
            <Car size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight font-heading hidden sm:block">
            <span style={{ color: 'var(--text-base)' }}>Atlas</span><span className="logo-gradient">Way</span>
          </span>
        </Link>

        {/* ── BARRE DE RECHERCHE (centre) ── */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden md:flex">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Rechercher une ville, un trajet…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'var(--bg-700)',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-base)',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#C1272D'; e.target.style.boxShadow = '0 0 0 3px rgba(193,39,45,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </form>

        {/* ── ACTIONS DROITE ── */}
        <div className="flex items-center gap-1 ml-auto">

          {user ? (
            <>
              {/* Feed */}
              <NavLink to="/feed"
                className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.08)' : 'transparent' })}
                title="Fil d'actualité"
              >
                {({ isActive }) => (
                  <>
                    <Rss size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    <span className="text-[10px] font-semibold" style={{ color: isActive ? '#C1272D' : 'var(--text-muted)' }}>Feed</span>
                  </>
                )}
              </NavLink>

              {/* Mes Trajets */}
              <NavLink to="/rides/mine"
                className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all group"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.08)' : 'transparent' })}
                title="Mes trajets"
              >
                {({ isActive }) => (
                  <>
                    <Car size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    <span className="text-[10px] font-semibold" style={{ color: isActive ? '#C1272D' : 'var(--text-muted)' }}>Trajets</span>
                  </>
                )}
              </NavLink>

              {/* Réservations */}
              <NavLink to="/bookings"
                className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.08)' : 'transparent' })}
                title="Réservations"
              >
                {({ isActive }) => (
                  <>
                    <BookOpen size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    <span className="text-[10px] font-semibold" style={{ color: isActive ? '#C1272D' : 'var(--text-muted)' }}>Réservations</span>
                    {pendingBooks > 0 && (
                      <span className="absolute top-1 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#D4890A' }}>
                        {pendingBooks > 9 ? '9+' : pendingBooks}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* Messages */}
              <NavLink to="/messages"
                className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative"
                style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.08)' : 'transparent' })}
                title="Messages"
              >
                {({ isActive }) => (
                  <>
                    <MessageSquare size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                    <span className="text-[10px] font-semibold" style={{ color: isActive ? '#C1272D' : 'var(--text-muted)' }}>Messages</span>
                    {unreadMsg > 0 && (
                      <span className="absolute top-1 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#C1272D' }}>
                        {unreadMsg > 9 ? '9+' : unreadMsg}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* ── Notifications ── */}
              <div ref={notifRef} className="relative hidden md:block">
                <button
                  onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative"
                  style={{ background: notifOpen ? 'rgba(193,39,45,0.08)' : 'transparent' }}
                  title="Notifications"
                >
                  <Bell size={20} style={{ color: notifOpen ? '#C1272D' : 'var(--text-secondary)' }} />
                  <span className="text-[10px] font-semibold" style={{ color: notifOpen ? '#C1272D' : 'var(--text-muted)' }}>Notifs</span>
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1 right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: '#C1272D' }}>
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {/* Dropdown notifs */}
                {notifOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <h3 className="font-black text-base" style={{ color: 'var(--text-base)' }}>Notifications</h3>
                      {unreadNotifs > 0 && (
                        <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: '#C1272D' }}>
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">Aucune notification</div>
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
                      <button className="w-full text-sm font-semibold py-1.5 rounded-xl transition-all" style={{ color: '#C1272D' }}
                        onClick={() => setNotifOpen(false)}>
                        Voir toutes les notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin */}
              {['admin', 'superadmin'].includes(user?.role) && (
                <NavLink to="/admin"
                  className="hidden md:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
                  style={({ isActive }) => ({ background: isActive ? 'rgba(193,39,45,0.08)' : 'transparent' })}
                >
                  {({ isActive }) => (
                    <>
                      <Shield size={20} style={{ color: isActive ? '#C1272D' : 'var(--text-secondary)' }} />
                      <span className="text-[10px] font-semibold" style={{ color: isActive ? '#C1272D' : 'var(--text-muted)' }}>Admin</span>
                    </>
                  )}
                </NavLink>
              )}

              {/* ── Profil dropdown ── */}
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
                  style={{ background: profileOpen ? 'rgba(193,39,45,0.08)' : 'transparent' }}
                >
                  {user.photo
                    ? <img src={user.photo} alt="" className="w-8 h-8 rounded-full object-cover" style={{ ring: '2px solid #C1272D' }} />
                    : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black"
                        style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
                        {user.firstName?.[0]}
                      </div>
                  }
                  <span className="text-sm font-bold" style={{ color: 'var(--text-base)' }}>{user.firstName}</span>
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
                    {[
                      { to: '/profile',        icon: User,         label: 'Mon profil' },
                      { to: '/driver-dashboard', icon: BarChart2,  label: 'Dashboard conducteur' },
                      { to: '/rides/publish',  icon: Plus,         label: 'Publier un trajet' },
                      { to: '/rides/mine',     icon: Car,          label: 'Mes trajets' },
                      { to: '/bookings',       icon: BookOpen,     label: 'Réservations' },
                      { to: '/messages',       icon: MessageSquare,label: 'Messages' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-700)'; e.currentTarget.style.color = 'var(--text-base)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Icon size={16} /> {label}
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
                        <LogOut size={16} /> Déconnexion
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
                Connexion
              </Link>
              <Link to="/register"
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#C1272D,#9e1f24)', color: '#fff', boxShadow: '0 4px 14px rgba(193,39,45,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(193,39,45,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(193,39,45,0.35)'; }}
              >
                S'inscrire <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Theme toggle */}
          <button onClick={toggle} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
            style={{ color: 'var(--text-secondary)' }}>
            {theme === 'dark'
              ? <Sun size={20} style={{ color: '#D4890A' }} />
              : <Moon size={20} style={{ color: '#C1272D' }} />
            }
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Thème</span>
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
          <MobileLink to="/rides/search"  icon={<Search size={16} />}       label="Rechercher" />
          <MobileLink to="/feed"          icon={<Rss size={16} />}           label="Fil d'actualité" />
          {user ? (
            <>
              <MobileLink to="/rides/publish" icon={<Plus size={16} />}         label="Publier un trajet" />
              <MobileLink to="/rides/mine"    icon={<Car size={16} />}           label="Mes trajets" />
              <MobileLink to="/bookings"      icon={<BookOpen size={16} />}      label="Réservations" badge={pendingBooks} badgeColor="bg-yellow-500 text-black" />
              <MobileLink to="/messages"      icon={<MessageSquare size={16} />} label="Messages"     badge={unreadMsg}    badgeColor="bg-red-500 text-white" />
              <MobileLink to="/profile"       icon={<User size={16} />}          label="Mon profil" />
              {['admin','superadmin'].includes(user?.role) && (
                <MobileLink to="/admin" icon={<Shield size={16} />} label="Administration" />
              )}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8 }}>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold px-3 py-2.5 rounded-xl w-full transition-all"
                  style={{ color: '#C1272D' }}>
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login"    className="btn-secondary text-sm text-center py-3">Connexion</Link>
              <Link to="/register" className="btn-primary  text-sm text-center py-3">S'inscrire gratuitement</Link>
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
