import { Link } from 'react-router-dom';
import { Clock, Users, Star, Zap, ArrowRight } from 'lucide-react';

export default function RideCard({ ride }) {
  const driver = ride.driver || {};
  const date   = new Date(ride.departureDate);

  return (
    <Link
      to={`/rides/${ride.id}`}
      className="card block group"
      style={{ textDecoration: 'none' }}
    >
      <div className="flex items-start justify-between gap-4">

        {/* Route avec ligne animée */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-primary-500/30 group-hover:ring-primary-500/60 transition-all" />
              <div className="w-px h-7 bg-gradient-to-b from-primary-500/40 to-green-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-500/30 group-hover:ring-green-500/60 transition-all" />
            </div>
            <div className="flex flex-col gap-2.5 min-w-0">
              <p className="font-bold text-white leading-tight truncate group-hover:text-primary-300 transition-colors">{ride.from}</p>
              <p className="font-bold text-white leading-tight truncate group-hover:text-green-300 transition-colors">{ride.to}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}
              {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''}
            </span>
            {ride.instantBooking && (
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Zap size={11} fill="currentColor" /> Instant
              </span>
            )}
          </div>
        </div>

        {/* Côté droit */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <div className="text-right">
            <p className="text-2xl font-black text-white leading-none">
              {Number(ride.price).toFixed(0)}
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>MAD/pers</p>
          </div>

          <div className="flex items-center gap-2">
            {driver.photo
              ? <img src={driver.photo} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-primary-500/40 transition-all" />
              : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#C1272D,#a8181e)' }}>
                  {driver.firstName?.[0]}
                </div>
            }
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{driver.firstName}</p>
              {driver.avgRating > 0 && (
                <p className="text-xs text-yellow-400 flex items-center gap-0.5 font-semibold">
                  <Star size={10} fill="currentColor" /> {Number(driver.avgRating).toFixed(1)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
            style={{ color: '#C1272D' }}>
            Voir <ArrowRight size={11} />
          </div>
        </div>
      </div>
    </Link>
  );
}
