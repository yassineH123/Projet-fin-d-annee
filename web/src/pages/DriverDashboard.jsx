import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Star, TrendingUp, Users, Leaf, Plus, Calendar, MapPin,
  Copy, Check, Award, BarChart2, CheckCircle, Trophy, Accessibility,
  Medal, ArrowRight, Flame, Banknote, ChevronRight, Sparkles,
} from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const BADGE_META = {
  first_trip:   { label: 'Premier trajet',  Icon: Car,           color: '#C1272D' },
  five_star:    { label: 'Note parfaite',   Icon: Star,          color: '#D4890A' },
  verified:     { label: 'Vérifié',         Icon: CheckCircle,   color: '#006233' },
  top_driver:   { label: 'Top Conducteur',  Icon: Trophy,        color: '#D4890A' },
  pmr_friendly: { label: 'Accessible PMR',  Icon: Accessibility, color: '#3B82F6' },
  referral_5:   { label: '5 Parrainages',   Icon: Users,         color: '#8B5CF6' },
};

/* ── Animated counter hook ── */
function useCountUp(target, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(target, Math.round(increment * step));
      setValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return value;
}

/* ── Zellige stripe ── */
function ZelligeStripe() {
  return (
    <div style={{ height: 4, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D', '#D4890A', '#006233'][i % 3] }} />
      ))}
    </div>
  );
}

/* ── Rating ring (SVG donut) ── */
function RatingRing({ rating, size = 72 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = rating / 5;
  const dash = circ * pct;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-600)" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#D4890A" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
        <span style={{ fontSize: 9, color: '#D4890A', fontWeight: 700 }}>/ 5</span>
      </div>
    </div>
  );
}

/* ── Mini bar chart for weekly earnings ── */
function EarningsChart({ rides = [], monthlyEarnings = 0 }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const now = new Date();

  // Aggregate earnings by weekday for the last 7 days
  const buckets = Array(7).fill(0);
  rides.forEach(ride => {
    const d = new Date(ride.departureDate);
    const diff = Math.floor((now - d) / 86400000);
    if (diff >= 0 && diff < 7) {
      const seats = (ride.bookings || []).reduce((s, b) => s + (b.seats || 0), 0);
      buckets[6 - diff] += seats * Number(ride.price || 0);
    }
  });

  const max = Math.max(...buckets, 1);
  const today = (now.getDay() + 6) % 7; // 0=Mon

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={14} style={{ color: '#22C55E' }} /> Revenus (7 derniers jours)
        <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 900, color: '#22C55E' }}>{monthlyEarnings} DH</span>
      </p>
      <div style={{ display: 'flex', align: 'end', gap: 6, height: 72, alignItems: 'flex-end' }}>
        {buckets.map((val, i) => {
          const h = max > 0 ? Math.max(4, Math.round((val / max) * 64)) : 4;
          const isToday = i === today;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: '100%', height: h,
                  background: isToday
                    ? 'linear-gradient(to top, #C1272D, #D4890A)'
                    : 'var(--bg-600)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 1s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: isToday ? '0 2px 8px rgba(193,39,45,0.4)' : 'none',
                }}
              />
              <span style={{ fontSize: 9, fontWeight: isToday ? 800 : 600, color: isToday ? '#C1272D' : 'var(--text-muted)' }}>{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stat card with animated counter ── */
function StatCard({ icon: Icon, label, value, sub, color, prefix = '', suffix = '', animStart }) {
  const isNum = typeof value === 'number';
  const counted = useCountUp(isNum ? value : 0, 1100, animStart && isNum);
  const display = isNum ? counted : value;

  return (
    <div
      style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '18px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 14,
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`;
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}25`,
      }}>
        <Icon size={21} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
        <p style={{ margin: '5px 0 0', fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
          {prefix}{display}{suffix}
        </p>
        {sub && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function DriverDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);
  const [animStart, setAnimStart] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    api.get('/users/driver-stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Trigger counter animation when stats are visible
  useEffect(() => {
    if (!stats) return;
    const timer = setTimeout(() => setAnimStart(true), 200);
    return () => clearTimeout(timer);
  }, [stats]);

  const copyCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <Spinner />
    </div>
  );
  if (!stats) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
      Erreur de chargement
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* ── Hero header ── */}
      <div ref={headerRef} style={{
        borderRadius: 20, overflow: 'hidden', marginBottom: 20,
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <ZelligeStripe />
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(193,39,45,0.06) 0%, rgba(212,137,10,0.04) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(193,39,45,0.15), rgba(212,137,10,0.1))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              border: '1px solid rgba(193,39,45,0.2)',
            }}>
              <BarChart2 size={24} style={{ color: '#C1272D' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C1272D' }}>✦ Espace Conducteur</p>
              <h1 style={{ margin: '3px 0 0', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Tableau de bord</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Statistiques en temps réel</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/analytics/driver" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12,
              background: 'var(--bg-700)', color: 'var(--text-secondary)',
              fontWeight: 700, fontSize: 12, textDecoration: 'none',
              border: '1px solid var(--border-color)',
            }}>
              <TrendingUp size={14} /> Analyses
            </Link>
            <Link to="/rides/publish" style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12,
              background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff',
              fontWeight: 800, fontSize: 13, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(193,39,45,0.35)',
            }}>
              <Plus size={15} /> Nouveau trajet
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats grid (animated) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard animStart={animStart} icon={Car}        label="Trajets publiés"  value={stats.totalRides}           sub={`${stats.completedRides} terminés`}          color="#C1272D" />
        <StatCard animStart={animStart} icon={Banknote}   label="Revenus ce mois"  value={stats.monthlyEarnings}     suffix=" DH"  sub={`Total : ${stats.totalEarnings} DH`} color="#22C55E" />
        <StatCard animStart={animStart} icon={Users}      label="Passagers"        value={stats.totalPassengers}      sub={`${stats.totalRatings} avis`}                color="#3B82F6" />
        <StatCard animStart={animStart} icon={Leaf}       label="CO₂ économisé"    value={stats.co2Saved}            suffix=" kg" sub="par rapport à la voiture solo"     color="#10B981" />
      </div>

      {/* ── Main 2-col layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Earnings chart */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
            borderRadius: 16, padding: '18px 20px',
          }}>
            <EarningsChart rides={stats.upcomingRides || []} monthlyEarnings={stats.monthlyEarnings} />
          </div>

          {/* Prochains trajets */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px 20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} style={{ color: '#C1272D' }} /> Prochains trajets
              {stats.upcomingRides.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {stats.upcomingRides.length} trajet{stats.upcomingRides.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
            {stats.upcomingRides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 16px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(193,39,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Car size={24} style={{ color: 'rgba(193,39,45,0.4)' }} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Aucun trajet à venir</p>
                <Link to="/rides/publish" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff',
                  fontWeight: 700, fontSize: 12, textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(193,39,45,0.3)',
                }}>
                  <Plus size={13} /> Publier un trajet
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.upcomingRides.map((ride, idx) => (
                  <Link key={ride.id} to={`/rides/${ride.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
                      border: '1px solid var(--border-color)', textDecoration: 'none',
                      transition: 'all 0.18s', animationDelay: `${idx * 60}ms`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(193,39,45,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(193,39,45,0.25)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                    }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(193,39,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(193,39,45,0.15)' }}>
                      <Car size={16} style={{ color: '#C1272D' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>{ride.from}</span>
                        <ArrowRight size={11} style={{ color: '#C1272D', flexShrink: 0 }} />
                        <span>{ride.to}</span>
                      </p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(ride.departureDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>{ride.price} DH</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{ride.seatsAvailable} pl.</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Rating card */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '18px' }}>
            <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Star size={14} style={{ color: '#D4890A' }} /> Réputation
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <RatingRing rating={stats.avgRating || 0} />
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {'★'.repeat(Math.round(stats.avgRating || 0))}{'☆'.repeat(5 - Math.round(stats.avgRating || 0))}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  {stats.totalRatings} avis · {stats.completedRides} trajets
                </p>
                {stats.avgRating >= 4.5 && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#D4890A', background: 'rgba(212,137,10,0.1)', padding: '3px 8px', borderRadius: 99, border: '1px solid rgba(212,137,10,0.2)', width: 'fit-content' }}>
                    <Flame size={11} fill="currentColor" /> Top conducteur
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          {stats.badges?.length > 0 && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Award size={14} style={{ color: '#D4890A' }} /> Badges
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#D4890A', fontWeight: 700 }}>{stats.badges.length}</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {stats.badges.map(b => {
                  const m = BADGE_META[b] || { label: b, Icon: Medal, color: '#888' };
                  return (
                    <div key={b} title={m.label} style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99,
                      fontSize: 11, fontWeight: 700, background: `${m.color}15`, color: m.color,
                      border: `1px solid ${m.color}30`, cursor: 'default',
                      transition: 'transform 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <m.Icon size={11} /> {m.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Code parrainage */}
          {stats.referralCode && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 18px' }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Sparkles size={14} style={{ color: '#8B5CF6' }} /> Parrainage
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                {stats.referredCount} personne{stats.referredCount !== 1 ? 's' : ''} parrainée{stats.referredCount !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                <span style={{ flex: 1, fontFamily: 'monospace', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.15em', fontSize: 14 }}>
                  {stats.referralCode}
                </span>
                <button onClick={copyCode} style={{
                  padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(193,39,45,0.1)',
                  color: copied ? '#22C55E' : '#C1272D', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                }}>
                  {copied ? <><Check size={13} /> Copié</> : <><Copy size={13} /> Copier</>}
                </button>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 18px' }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Actions rapides</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/rides/publish" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px', borderRadius: 10, fontWeight: 800, fontSize: 13,
                background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff',
                textDecoration: 'none', boxShadow: '0 4px 12px rgba(193,39,45,0.3)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              >
                <Plus size={14} /> Publier un trajet
              </Link>
              {[
                { to: '/bookings',    label: 'Réservations reçues', icon: Users },
                { to: '/rides/mine',  label: 'Mes trajets',         icon: Car },
                { to: '/analytics/driver', label: 'Analytiques',   icon: TrendingUp },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12,
                  background: 'var(--bg-700)', color: 'var(--text-secondary)',
                  textDecoration: 'none', border: '1px solid var(--border-color)', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; e.currentTarget.style.background = 'rgba(193,39,45,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-700)'; }}>
                  <Icon size={13} /> {label}
                  <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .driver-cols { grid-template-columns: 1fr !important; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
