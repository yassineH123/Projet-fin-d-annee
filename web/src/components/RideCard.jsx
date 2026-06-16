import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Zap } from 'lucide-react';

export default function RideCard({ ride }) {
  const driver = ride.driver || {};
  const date   = new Date(ride.departureDate);

  return (
    <Link to={`/rides/${ride.id}`} className="card hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 block">
      <div className="flex items-start justify-between gap-4">
        {/* Route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary-500 ring-2 ring-primary-500/30" />
              <div className="w-0.5 h-8 bg-dark-500" />
              <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/30" />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-white">{ride.from}</p>
              </div>
              <div>
                <p className="font-semibold text-white">{ride.to}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}
              {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} /> {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''}
            </span>
            {ride.instantBooking && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Zap size={13} fill="currentColor" /> Instant
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="text-2xl font-black text-white">{Number(ride.price).toFixed(0)} <span className="text-lg text-slate-400">MAD</span></span>
          <div className="flex items-center gap-2">
            {driver.photo
              ? <img src={driver.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
              : <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-white">{driver.firstName?.[0]}</div>
            }
            <div className="text-right">
              <p className="text-sm text-slate-300 font-medium">{driver.firstName}</p>
              {driver.avgRating > 0 && (
                <p className="text-xs text-yellow-400 flex items-center gap-0.5">
                  <Star size={11} fill="currentColor" /> {driver.avgRating}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}