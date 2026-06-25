import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, Search, ArrowLeft, MapPin, Navigation } from 'lucide-react';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès'];

function FloatingCity({ city, style }) {
  return (
    <div style={{
      position: 'absolute', ...style,
      fontSize: 11, fontWeight: 700, color: 'rgba(193,39,45,0.35)',
      letterSpacing: '0.1em', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 4,
      animation: 'float 6s ease-in-out infinite',
      animationDelay: style.animationDelay || '0s',
    }}>
      <MapPin size={9} style={{ color: 'rgba(193,39,45,0.4)' }} />
      {city}
    </div>
  );
}

export default function NotFound() {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(dotInterval);
  }, []);

  const suggestions = [
    { icon: Home, label: 'Accueil', to: '/', color: '#C1272D' },
    { icon: Search, label: 'Rechercher un trajet', to: '/rides/search', color: '#006233' },
    { icon: Navigation, label: 'Comparer les transports', to: '/compare', color: '#D4890A' },
  ];

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating city names background */}
      <FloatingCity city="Casablanca" style={{ top: '12%', left: '8%',  animationDelay: '0s' }} />
      <FloatingCity city="Rabat"      style={{ top: '20%', right: '10%', animationDelay: '1s' }} />
      <FloatingCity city="Marrakech"  style={{ top: '65%', left: '6%',  animationDelay: '2s' }} />
      <FloatingCity city="Fès"        style={{ top: '78%', right: '12%', animationDelay: '0.5s' }} />
      <FloatingCity city="Tanger"     style={{ top: '42%', left: '4%',  animationDelay: '1.5s' }} />
      <FloatingCity city="Agadir"     style={{ top: '55%', right: '7%', animationDelay: '2.5s' }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(193,39,45,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Zellige compass decorative */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 96, height: 96, borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(193,39,45,0.12), rgba(212,137,10,0.08))',
            border: '1px solid rgba(193,39,45,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'spin-slow 20s linear infinite',
            boxShadow: '0 0 0 8px rgba(193,39,45,0.04), 0 0 0 16px rgba(193,39,45,0.02)',
          }}>
            <span style={{ fontSize: 44 }}>🧭</span>
          </div>
        </div>

        {/* 404 */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <p style={{
            fontSize: 120, fontWeight: 900, lineHeight: 1,
            background: 'linear-gradient(135deg, #C1272D 0%, #9e1f24 40%, #D4890A 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', letterSpacing: '-6px',
            fontVariantNumeric: 'tabular-nums',
          }}>404</p>
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            width: 180, height: 3,
            background: 'linear-gradient(to right, transparent, #C1272D, #D4890A, transparent)',
            borderRadius: 2,
          }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
          Destination introuvable
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
          Cette page n'est pas sur notre carte du Maroc.<br />
          <span style={{ fontFamily: 'Amiri, serif', fontSize: 16, color: 'rgba(193,39,45,0.6)' }} lang="ar">
            هذه الصفحة غير موجودة
          </span>
        </p>

        {/* Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {suggestions.map(({ icon: Icon, label, to, color }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px', borderRadius: 14, textDecoration: 'none',
              background: 'var(--card-bg)', border: '1px solid var(--border-color)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} style={{ color }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-base)' }}>{label}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 18 }}>→</span>
            </Link>
          ))}
        </div>

        <button onClick={() => navigate(-1)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
          borderRadius: 8, transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#C1272D'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={14} /> Retour à la page précédente
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
