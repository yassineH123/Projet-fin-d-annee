import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, MapPin, Route } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const LEVEL_META = {
  bronze:  { color: '#CD7F32', bg: 'rgba(205,127,50,0.12)',  label: 'Bronze'  },
  argent:  { color: '#C0C0C0', bg: 'rgba(192,192,192,0.12)', label: 'Argent'  },
  or:      { color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   label: 'Or'      },
  platine: { color: '#E5E4E2', bg: 'rgba(229,228,226,0.12)', label: 'Platine' },
  diamant: { color: '#B9F2FF', bg: 'rgba(185,242,255,0.12)', label: 'Diamant' },
};

const TABS = [
  { id: 'rating', label: 'Mieux notés',    icon: Star   },
  { id: 'trips',  label: 'Plus de trajets', icon: Trophy },
  { id: 'km',     label: 'Plus de km',      icon: Route  },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [tab,     setTab]     = useState('rating');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics/leaderboard?type=${tab}`)
      .then(({ data }) => setDrivers(data.drivers))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={24} className="text-yellow-400" />
        <h1 className="text-2xl font-black text-white">Classement</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-800)', border: '1px solid var(--border-color)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: tab === id ? '#C1272D' : 'transparent',
              color: tab === id ? 'white' : 'var(--text-secondary)',
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="flex flex-col gap-3">
          {drivers.map((d, i) => {
            const lm = LEVEL_META[d.level] || LEVEL_META.bronze;
            return (
              <Link key={d.id} to={`/profile/${d.id}`}
                className="card flex items-center gap-4 hover:border-primary-500/40 transition-all">
                {/* Rank */}
                <div className="w-10 text-center shrink-0">
                  {i < 3
                    ? <span className="text-2xl">{MEDALS[i]}</span>
                    : <span className="text-lg font-black" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                  }
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  {d.photo
                    ? <img src={d.photo} alt="" className="w-11 h-11 rounded-full object-cover" />
                    : <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black"
                        style={{ background: 'rgba(193,39,45,0.15)', color: '#C1272D' }}>
                        {d.firstName?.[0]}
                      </div>
                  }
                  <div className="absolute -bottom-1 -right-1 text-xs px-1 rounded-md font-bold"
                    style={{ background: lm.bg, color: lm.color, border: `1px solid ${lm.color}40` }}>
                    {lm.label}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{d.firstName} {d.lastName}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs flex items-center gap-1" style={{ color: '#FBBF24' }}>
                      <Star size={11} fill="currentColor" /> {d.avgRating?.toFixed(1)} ({d.totalRatings})
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {d.totalTrips} trajets
                    </span>
                    {d.totalKm > 0 && (
                      <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={10} /> {d.totalKm} km
                      </span>
                    )}
                  </div>
                  {/* Badges */}
                  {d.badges?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {d.badges.slice(0, 4).map(b => (
                        <span key={b.id} title={b.label} className="text-sm">{b.emoji}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Primary stat */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-black" style={{ color: '#C1272D' }}>
                    {tab === 'rating' ? d.avgRating?.toFixed(1)
                      : tab === 'trips' ? d.totalTrips
                      : `${d.totalKm} km`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
