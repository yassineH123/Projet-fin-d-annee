import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const FOOTER_BG = '#0C0503';
const FOOTER_FG = 'rgba(255,255,255,0.75)';

const FOOTER_LINKS = [
  {
    title: 'Voyager',
    links: [
      { label: 'Rechercher un trajet', to: '/rides/search' },
      { label: 'Publier un trajet',    to: '/rides/publish' },
      { label: 'Trajets populaires',   to: '/rides/search' },
    ],
  },
  {
    title: 'Compte',
    links: [
      { label: "S'inscrire",   to: '/register' },
      { label: 'Se connecter', to: '/login' },
      { label: 'Mon profil',   to: '/profile' },
    ],
  },
  {
    title: 'AtlasWay',
    links: [
      { label: 'À propos',       to: '/' },
      { label: 'Confiance & Sécurité', to: '/' },
      { label: 'Contact',        to: '/' },
    ],
  },
];

const CITIES_FOOTER = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès',
  'Tanger', 'Agadir', 'Meknès', 'Oujda',
];

/* Zellige border — geometric SVG stripe */
function ZelligeBorder() {
  return (
    <div style={{ height: 6, overflow: 'hidden', display: 'flex' }}>
      <svg width="100%" height="6" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flagGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#B8232A" />
            <stop offset="30%"  stopColor="#D4890A" />
            <stop offset="50%"  stopColor="#005A2E" />
            <stop offset="70%"  stopColor="#D4890A" />
            <stop offset="100%" stopColor="#B8232A" />
          </linearGradient>
        </defs>
        <rect width="100%" height="6" fill="url(#flagGrad)" />
      </svg>
    </div>
  );
}

/* Moroccan 5-pointed star */
function StarIcon({ size = 14, color = 'currentColor', opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ opacity }}>
      <path
        d="M10,1 L12.94,8.29 L19.51,8.62 L14.78,13.06 L16.18,19.51 L10,15.88 L3.82,19.51 L5.22,13.06 L0.49,8.62 L7.06,8.29Z"
        fill={color}
      />
    </svg>
  );
}

export default function Footer() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('background', FOOTER_BG, 'important');
    el.style.setProperty('background-color', FOOTER_BG, 'important');
    el.style.setProperty('color', FOOTER_FG, 'important');
  });
  return (
    <footer ref={ref} className="footer-moroccan">

      {/* Top flag-gradient border */}
      <ZelligeBorder />

      {/* Ornamental header band */}
      <div
        style={{
          borderBottom: '1px solid rgba(212,137,10,0.18)',
          padding: '32px 16px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg,rgba(184,35,42,0.08) 0%,transparent 100%)',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
          {/* Stylised compass-star emblem */}
          <div
            style={{
              width: 44, height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#B8232A,#8A1520)',
              border: '1px solid rgba(212,137,10,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(184,35,42,0.4)',
            }}
          >
            <StarIcon size={22} color="#D4890A" />
          </div>
          <span style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: '1.75rem', letterSpacing: '0.04em', color: '#fff' }}>
            Atlas<span style={{ color: '#D4890A' }}>Way</span>
          </span>
        </Link>

        {/* Arabic tagline */}
        <p
          style={{
            fontFamily: "'Amiri', Georgia, serif",
            fontSize: '1.05rem',
            letterSpacing: '0.08em',
            color: 'rgba(212,137,10,0.7)',
            marginTop: 4,
          }}
        >
          رفيق الطريق في المغرب
        </p>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
          Le compagnon de route au Maroc
        </p>
      </div>

      {/* Main content grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 40,
          justifyContent: 'space-between',
        }}
      >

        {/* Brand column */}
        <div style={{ flex: '1 1 220px', minWidth: 0, maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <StarIcon size={11} color="#D4890A" opacity={0.6} />
            <span
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#D4890A',
              }}
            >
              À propos
            </span>
            <StarIcon size={11} color="#D4890A" opacity={0.6} />
          </div>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)' }}>
            AtlasWay connecte voyageurs et conducteurs à travers tout le Maroc.
            Économique, sûr et respectueux de l'environnement.
          </p>

          {/* Contact */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="mailto:atlaswaymaroc@gmail.com"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
              <Mail size={13} style={{ color: '#D4890A', flexShrink: 0 }} />
              atlaswaymaroc@gmail.com
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
              <MapPin size={13} style={{ color: '#D4890A', flexShrink: 0 }} />
              Casablanca, Maroc 🇲🇦
            </div>
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            {[
              { Icon: Facebook,  label: 'Facebook' },
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Twitter,   label: 'Twitter / X' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                style={{
                  width: 44, height: 44,
                  borderRadius: 10,
                  border: '1px solid rgba(212,137,10,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#D4890A';
                  e.currentTarget.style.color = '#D4890A';
                  e.currentTarget.style.background = 'rgba(212,137,10,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,137,10,0.25)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map(col => (
          <div key={col.title} style={{ flex: '1 1 140px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <StarIcon size={9} color="#D4890A" opacity={0.5} />
              <span
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#D4890A',
                }}
              >
                {col.title}
              </span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s', display: 'inline-block', padding: '3px 0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FAF0DC'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Cities column */}
        <div style={{ flex: '1 1 180px', minWidth: 0, maxWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <StarIcon size={9} color="#D4890A" opacity={0.5} />
            <span
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#D4890A',
              }}
            >
              Villes desservies
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CITIES_FOOTER.map(city => (
              <Link
                key={city}
                to={`/rides/search?to=${city}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 13px',
                  borderRadius: 20,
                  border: '1px solid rgba(212,137,10,0.2)',
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,137,10,0.55)';
                  e.currentTarget.style.color = '#D4890A';
                  e.currentTarget.style.background = 'rgba(212,137,10,0.07)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,137,10,0.2)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Zellige ornament divider */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto 0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: 0.35,
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,#D4890A)' }} />
        <StarIcon size={13} color="#D4890A" />
        <div style={{ width: 6, height: 6, background: '#B8232A', transform: 'rotate(45deg)' }} />
        <StarIcon size={18} color="#D4890A" />
        <div style={{ width: 6, height: 6, background: '#B8232A', transform: 'rotate(45deg)' }} />
        <StarIcon size={13} color="#D4890A" />
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,#D4890A)' }} />
      </div>

      {/* Copyright bar */}
      <div
        style={{
          borderTop: '1px solid rgba(212,137,10,0.1)',
          marginTop: 20,
          padding: '16px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          maxWidth: 1100,
          margin: '20px auto 0',
        }}
      >
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} AtlasWay · Tous droits réservés
        </p>
        <p
          style={{
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Fait avec
          <span style={{ color: '#B8232A' }}>♥</span>
          au Maroc
          <span style={{ fontSize: '1rem' }}>🇲🇦</span>
        </p>
        <p
          style={{
            fontFamily: "'Amiri', Georgia, serif",
            fontSize: '0.8rem',
            color: 'rgba(212,137,10,0.4)',
            letterSpacing: '0.06em',
          }}
        >
          المغرب · أطلس ويي
        </p>
      </div>

      {/* Bottom flag stripe */}
      <ZelligeBorder />
    </footer>
  );
}