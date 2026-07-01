import { Link } from 'react-router-dom';
import { Clock, Users, Star, Zap, RefreshCw, Shield, Package,
         ChevronRight, Wifi, Wind, BatteryCharging, Luggage, Flame, Sparkles } from 'lucide-react';

const LEVEL_META = {
  bronze:  { color: '#CD7F32', bg: 'rgba(205,127,50,0.15)',  label: 'Bronze',  emoji: '🥉' },
  argent:  { color: '#A0A0A0', bg: 'rgba(160,160,160,0.15)', label: 'Argent',  emoji: '🥈' },
  or:      { color: '#D4890A', bg: 'rgba(212,137,10,0.15)',  label: 'Or',      emoji: '🥇' },
  platine: { color: '#B0C4DE', bg: 'rgba(176,196,222,0.15)', label: 'Platine', emoji: '💎' },
  diamant: { color: '#89CFF0', bg: 'rgba(137,207,240,0.15)', label: 'Diamant', emoji: '🔷' },
};

function ZelligeStripe() {
  return (
    <div style={{ height: 4, display: 'flex', overflow: 'hidden', flexShrink: 0 }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StarRating({ n = 5, size = 11 }) {
  const full = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span style={{ color: '#F59E0B', fontSize: size, letterSpacing: '-1px' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

function getDepartureLabel(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - Date.now();
  const mins = Math.floor(diff / 60000);
  if (mins < 0) return null;
  if (mins < 60) return { label: `Départ dans ${mins} min`, urgent: true };
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs < 24) return { label: `Départ dans ${hrs}h${rem > 0 ? rem : ''}`, urgent: hrs < 3 };
  return null;
}

export default function RideCard({ ride }) {
  const driver   = ride.driver || {};
  const date     = new Date(ride.departureDate);
  const depTime  = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const depDate  = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  const taxiEst  = ride.km ? Math.round(ride.km * 3.5) : null;
  const saving   = taxiEst && ride.price < taxiEst ? Math.round(((taxiEst - ride.price) / taxiEst) * 100) : null;

  const departure = getDepartureLabel(ride.departureDate);
  const lm        = LEVEL_META[driver.level] || null;
  const isNew     = driver.totalTrips != null && driver.totalTrips < 5;
  const isPopular = driver.avgRating >= 4.8 && driver.totalTrips >= 20;
  const isLowSeat = ride.seatsAvailable === 1;

  const equipment = [
    ride.hasWifi      && { icon: Wifi,            label: 'Wi-Fi',    color: '#3B82F6' },
    ride.hasAC        && { icon: Wind,             label: 'Clim',     color: '#06B6D4' },
    ride.hasCharger   && { icon: BatteryCharging,  label: 'Chargeur', color: '#22C55E' },
    ride.acceptsPackages && { icon: Luggage,        label: 'Bagages',  color: '#D4890A' },
  ].filter(Boolean);

  return (
    <Link
      to={`/rides/${ride.id}`}
      className="ride-card-link"
      style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}
    >
      <div
        className="ride-card"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 18, overflow: 'hidden', transition: 'all 0.2s' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(193,39,45,0.4)';
          e.currentTarget.style.boxShadow   = '0 8px 32px rgba(193,39,45,0.12)';
          e.currentTarget.style.transform   = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow   = 'none';
          e.currentTarget.style.transform   = 'none';
        }}
      >
        <ZelligeStripe />

        <div style={{ padding: '14px 16px 12px' }}>

          {/* ── Top badges row ── */}
          {(departure || isLowSeat || isPopular || isNew) && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {departure && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99,
                  background: departure.urgent ? 'rgba(239,68,68,0.12)' : 'rgba(212,137,10,0.10)',
                  color: departure.urgent ? '#EF4444' : '#D4890A',
                  border: `1px solid ${departure.urgent ? 'rgba(239,68,68,0.25)' : 'rgba(212,137,10,0.25)'}`,
                  display: 'flex', alignItems: 'center', gap: 4,
                  animation: departure.urgent ? 'orbPulse 2s ease-in-out infinite' : 'none',
                }}>
                  <Clock size={9} /> {departure.label}
                </span>
              )}
              {isLowSeat && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Flame size={9} fill="currentColor" /> Dernière place !
                </span>
              )}
              {isPopular && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.10)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={9} /> Très populaire
                </span>
              )}
              {isNew && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.10)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>
                  Nouveau conducteur
                </span>
              )}
            </div>
          )}

          {/* ── Driver + Price row ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>

            {/* Driver info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {driver.photo
                  ? <img src={driver.photo} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--border-color)' }} />
                  : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff' }}>
                      {driver.firstName?.[0] || '?'}
                    </div>
                }
                {driver.verified && (
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#22C55E', border: '2px solid var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={9} color="#fff" fill="#fff" />
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {driver.firstName} {driver.lastName?.[0]}.
                  </p>
                  {lm && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: lm.bg, color: lm.color }}>
                      {lm.emoji} {lm.label}
                    </span>
                  )}
                </div>
                {driver.avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <StarRating n={driver.avgRating} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>{driver.avgRating?.toFixed(1)}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {driver.totalTrips || 0} trajets</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {Number(ride.price).toFixed(0)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>DH</span>
              </div>
              {saving && (
                <div style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: 99, marginTop: 2, border: '1px solid rgba(34,197,94,0.2)' }}>
                  -{saving}% vs taxi
                </div>
              )}
            </div>
          </div>

          {/* ── Route timeline ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ride.from}</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#C1272D' }}>{depTime}</p>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C1272D', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, #C1272D, #D4890A, #006233)', borderRadius: 1 }} />
              {ride.km && (
                <span style={{ fontSize: 9, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 700, background: 'var(--card-bg)', padding: '1px 5px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  {ride.km} km
                </span>
              )}
              <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right, #D4890A, #006233)', borderRadius: 1 }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#006233', flexShrink: 0 }} />
            </div>

            <div style={{ minWidth: 0, textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ride.to}</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{depDate}</p>
            </div>
          </div>

          {/* ── Bottom row: seats + equipment + CTA ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>

            {/* Seats */}
            <span style={{
              fontSize: 11, color: isLowSeat ? '#EF4444' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4, fontWeight: isLowSeat ? 800 : 500,
            }}>
              <Users size={11} /> {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''}
            </span>

            {/* Equipment */}
            {equipment.map(({ icon: Icon, label, color }) => (
              <span key={label} title={label} style={{
                width: 26, height: 26, borderRadius: 8, background: `${color}12`,
                border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={12} style={{ color }} />
              </span>
            ))}

            {/* Feature badges */}
            {ride.instantBooking && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 99, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Zap size={9} fill="currentColor" /> INSTANT
              </span>
            )}
            {ride.womenOnly && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#EC4899', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 99, padding: '2px 7px' }}>
                ♀ Femmes
              </span>
            )}
            {ride.isRecurring && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#3B82F6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 99, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <RefreshCw size={9} /> RÉCURRENT
              </span>
            )}

            {/* CTA */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #C1272D, #9e1f24)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 12px', borderRadius: 10, boxShadow: '0 2px 10px rgba(193,39,45,0.3)' }}>
              Réserver <ChevronRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
