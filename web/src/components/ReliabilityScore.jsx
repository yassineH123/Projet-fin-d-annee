import { Shield, Star, TrendingUp, Award } from 'lucide-react';

function bar(value, max, color) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-700)' }}>
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function ReliabilityScore({ user }) {
  if (!user) return null;

  const rating     = Number(user.avgRating)   || 0;
  const trips      = Number(user.totalTrips)  || 0;
  const verified   = user.driverVerified      || false;
  const hasKyc     = user.kycStatus === 'approved';

  // Score /100
  const ratingScore  = Math.round((rating / 5) * 40);           // 0-40
  const tripsScore   = Math.min(30, Math.round(trips * 1.5));   // 0-30
  const verifiedScore= verified || hasKyc ? 20 : 0;            // 0-20
  const ratingCount  = Math.min(10, (user.totalRatings || 0));
  const reviewScore  = Math.round((ratingCount / 10) * 10);     // 0-10

  const total = ratingScore + tripsScore + verifiedScore + reviewScore;

  const level = total >= 85 ? { label: 'Excellent', color: '#10B981', bg: 'rgba(16,185,129,0.1)' }
              : total >= 65 ? { label: 'Fiable',    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' }
              : total >= 40 ? { label: 'Correct',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
              :               { label: 'Débutant',  color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Shield size={16} className="text-blue-400" /> Score de fiabilité
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black"
          style={{ background: level.bg, color: level.color }}>
          <Award size={12} /> {level.label}
        </div>
      </div>

      {/* Score circle */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="var(--bg-700)" strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke={level.color} strokeWidth="6"
              strokeDasharray={`${Math.round((total / 100) * 188.5)} 188.5`}
              strokeLinecap="round" transform="rotate(-90 36 36)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black" style={{ color: level.color }}>{total}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-slate-400"><Star size={10} /> Note</span>
              <span className="font-semibold text-white">{ratingScore}/40</span>
            </div>
            {bar(ratingScore, 40, '#F59E0B')}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-slate-400"><TrendingUp size={10} /> Trajets</span>
              <span className="font-semibold text-white">{tripsScore}/30</span>
            </div>
            {bar(tripsScore, 30, '#3B82F6')}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-slate-400"><Shield size={10} /> Vérification</span>
              <span className="font-semibold text-white">{verifiedScore}/20</span>
            </div>
            {bar(verifiedScore, 20, '#10B981')}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-slate-400"><Award size={10} /> Avis</span>
              <span className="font-semibold text-white">{reviewScore}/10</span>
            </div>
            {bar(reviewScore, 10, '#8B5CF6')}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Basé sur {trips} trajet{trips > 1 ? 's' : ''} · {user.totalRatings || 0} avis · {verified ? 'Identité vérifiée' : 'Non vérifié'}
      </p>
    </div>
  );
}
