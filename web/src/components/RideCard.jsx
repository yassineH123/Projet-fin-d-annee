import { Link } from 'react-router-dom';
import { Clock, Users, Star, Zap, RefreshCw, Navigation, Shield, Package, Banknote, ChevronRight } from 'lucide-react';

function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 4, display: 'flex', overflow: 'hidden', flexShrink: 0 }}>
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3] }} />
      ))}
    </div>
  );
}

function Stars({ n = 5 }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: 11, letterSpacing: '-1px' }}>
      {'★'.repeat(Math.max(0, Math.min(5, Math.round(n))))}{'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.round(n))))}
    </span>
  );
}

export default function RideCard({ ride }) {
  const driver = ride.driver || {};
  const date   = new Date(ride.departureDate);

  const depTime  = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const depDate  = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  const taxiEst = ride.km ? Math.round(ride.km * 3.5) : null;
  const saving  = taxiEst && ride.price < taxiEst ? Math.round(((taxiEst - ride.price) / taxiEst) * 100) : null;

  return (
    <Link to={`/rides/${ride.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: 16, overflow: 'hidden',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(193,39,45,0.12)';
          e.currentTarget.style.borderColor = 'rgba(193,39,45,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}>
        <ZelligeStripe />

        <div style={{ padding: '14px 16px' }}>
          {/* Header row: price + driver */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            {/* Price */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {Number(ride.price).toFixed(0)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>DH</span>
              </div>
              {saving && (
                <div style={{ fontSize: 10, fontWeight: 800, color: '#00875A', background: 'rgba(0,135,90,0.1)', padding: '2px 7px', borderRadius: 99, marginTop: 3, display: 'inline-block', border: '1px solid rgba(0,135,90,0.2)' }}>
                  -{saving}% vs taxi
                </div>
              )}
            </div>

            {/* Driver */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-base)' }}>
                  {driver.firstName} {driver.lastName?.[0]}.
                </p>
                {driver.avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2 }}>
                    <Stars n={driver.avgRating} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({driver.totalTrips || 0})</span>
                  </div>
                )}
              </div>
              {driver.photo
                ? <img src={driver.photo} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                    {driver.firstName?.[0] || '?'}
                  </div>
              }
            </div>
          </div>

          {/* Route */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ textAlign: 'center', minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ride.from}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{depTime}</p>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C1272D', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to right, #C1272D, #D4890A, #006233)', borderRadius: 1 }} />
              {ride.km && <span style={{ fontSize: 9, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>{ride.km}km</span>}
              <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(to right, #D4890A, #006233)', borderRadius: 1 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#006233', flexShrink: 0 }} />
            </div>

            <div style={{ textAlign: 'center', minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ride.to}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{depDate}</p>
            </div>
          </div>

          {/* Badges row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} /> {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''}
            </span>
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
            {ride.acceptsPackages && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#D4890A', background: 'rgba(212,137,10,0.08)', border: '1px solid rgba(212,137,10,0.2)', borderRadius: 99, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Package size={9} /> COLIS
              </span>
            )}
            {driver.verified && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Shield size={9} /> VÉRIFIÉ
              </span>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#C1272D', fontSize: 12, fontWeight: 700 }}>
              Réserver <ChevronRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
