import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Search, MessageSquare, User, LogOut, Shield, Plus, Menu, X, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMsg,    setUnreadMsg]    = useState(0);
  const [pendingBooks, setPendingBooks] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Reset badge when visiting the page
  useEffect(() => {
    if (location.pathname === '/messages') setUnreadMsg(0);
    if (location.pathname === '/bookings') setPendingBooks(0);
  }, [location.pathname]);

  // Poll counts every 30s when logged in
  useEffect(() => {
    if (!user) return;

    const fetchCounts = () => {
      api.get('/messages/unread-count')
        .then(({ data }) => setUnreadMsg(data.count))
        .catch((err) => console.warn('unread-count error:', err?.response?.status));
      api.get('/bookings/pending-count')
        .then(({ data }) => setPendingBooks(data.count))
        .catch((err) => console.warn('pending-count error:', err?.response?.status));
    };

    fetchCounts();
    intervalRef.current = setInterval(fetchCounts, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLink = ({ isActive }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-primary-400' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-dark-900/95 backdrop-blur-md shadow-xl shadow-black/20 border-b border-dark-500'
        : 'bg-dark-800/90 backdrop-blur border-b border-dark-500'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
            <Car className="text-primary-400" size={18} />
          </div>
          <span className="font-black text-xl tracking-tight">
            <span className="text-white">Atlas</span><span className="text-primary-400">Way</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          <NavLink to="/rides/search" className={navLink}>
            <Search size={15} /> Rechercher
          </NavLink>
          {user && (
            <>
              <NavLink to="/rides/publish" className={navLink}>
                <Plus size={15} /> Publier
              </NavLink>
              <NavLink to="/rides/mine" className={navLink}>
                <Car size={15} /> Mes trajets
              </NavLink>
              <NavLink to="/bookings" className={navLink}>
                <BookOpen size={15} />
                Réservations
                {pendingBooks > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-yellow-500 rounded-full text-[10px] font-black text-dark-900 flex items-center justify-center">
                    {pendingBooks > 9 ? '9+' : pendingBooks}
                  </span>
                )}
              </NavLink>
              <NavLink to="/messages" className={navLink}>
                <MessageSquare size={15} />
                Messages
                {unreadMsg > 0 && (
                  <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-primary-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                    {unreadMsg > 9 ? '9+' : unreadMsg}
                  </span>
                )}
              </NavLink>
              {['admin', 'superadmin'].includes(user?.role) && (
                <NavLink to="/admin" className={navLink}>
                  <Shield size={15} /> Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Desktop user */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <NavLink to="/profile" className="flex items-center gap-2.5 group px-3 py-1.5 rounded-xl hover:bg-dark-700 transition-colors">
                {user.photo
                  ? <img src={user.photo} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-dark-500 group-hover:ring-primary-500 transition" />
                  : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-sm font-black">
                      {user.firstName?.[0]}
                    </div>
                  )
                }
                <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                  {user.firstName}
                </span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Déconnexion"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-dark-700">
                Connexion
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4 rounded-xl">
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-800 border-t border-dark-500 px-4 py-5 flex flex-col gap-1">
          <MobileLink to="/rides/search" icon={<Search size={16} />} label="Rechercher un trajet" />
          {user ? (
            <>
              <MobileLink to="/rides/publish" icon={<Plus size={16} />}        label="Publier un trajet" />
              <MobileLink to="/rides/mine"    icon={<Car size={16} />}          label="Mes trajets" />
              <MobileLink to="/bookings"      icon={<BookOpen size={16} />}     label="Mes réservations" badge={pendingBooks} badgeColor="bg-yellow-500 text-dark-900" />
              <MobileLink to="/messages"      icon={<MessageSquare size={16} />} label="Messages" badge={unreadMsg} badgeColor="bg-primary-500 text-white" />
              <MobileLink to="/profile"       icon={<User size={16} />}         label="Mon profil" />
              {['admin', 'superadmin'].includes(user?.role) && (
                <MobileLink to="/admin" icon={<Shield size={16} />} label="Administration" />
              )}
              <div className="border-t border-dark-500 mt-2 pt-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-400/10 transition-colors w-full"
                >
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
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-dark-700'
        }`
      }
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
