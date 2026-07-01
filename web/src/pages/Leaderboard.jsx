import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, Route, Crown } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const LEVEL_META = {
  bronze:  { color: '#CD7F32', bg: 'rgba(205,127,50,0.15)',  label: 'Bronze',  emoji: '🥉' },
  argent:  { color: '#A0A0A0', bg: 'rgba(160,160,160,0.15)', label: 'Argent',  emoji: '🥈' },
  or:      { color: '#FFD700', bg: 'rgba(255,215,0,0.15)',   label: 'Or',      emoji: '🥇' },
  platine: { color: '#B0C4DE', bg: 'rgba(176,196,222,0.15)', label: 'Platine', emoji: '💎' },
  diamant: { color: '#89CFF0', bg: 'rgba(137,207,240,0.15)', label: 'Diamant', emoji: '🔷' },
};

const TABS = [
  { id: 'rating', label: 'Mieux notés',    icon: Star,    statLabel: (d) => `${d.avgRating?.toFixed(1)} ★`, color: '#F59E0B' },
  { id: 'trips',  label: 'Plus de trajets', icon: Trophy,  statLabel: (d) => `${d.totalTrips} trajets`,     color: '#C1272D' },
  { id: 'km',     label: 'Plus de km',      icon: Route,   statLabel: (d) => `${d.totalKm} km`,             color: '#006233' },
];

const PODIUM_HEIGHTS = [80, 110, 60];
const PODIUM_ORDER   = [1, 0, 2];

function Avatar({ user, size = 44 }) {
  if (user?.photo) return <img src={user.photo} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #C1272D, #D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: size * 0.38, flexShrink: 0 }}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  );
}

export default function Leaderboard() {
  const [tab,      setTab]      = useState('rating');
  const [drivers,  setDrivers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [podiumIn, setPodiumIn] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPodiumIn(false);
    api.get(`/analytics/leaderboard?type=${tab}`)
      .then(({ data }) => setDrivers(data.drivers || []))
      .catch(() => setDrivers([]))
      .finally(() => { setLoading(false); setTimeout(() => setPodiumIn(true), 80); });
  }, [tab]);

  const tabCfg = TABS.find(t => t.id === tab);
  const top3   = drivers.slice(0, 3);
  const rest   = drivers.slice(3);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div style={{ height: 5, display: 'flex' }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
          ))}
        </div>
        <div style={{ padding: '20px 22px', background: 'linear-gradient(135deg, rgba(212,137,10,0.06) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(212,137,10,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,137,10,0.2)' }}>
              <Trophy size={22} style={{ color: '#D4890A' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4890A' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Classement</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Les meilleurs conducteurs de la communauté 🇲🇦</p>
            </div>
            {drivers.length > 0 && (
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>{drivers.length}</p>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>classés</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 5 }}>
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 4px', borderRadius: 10, fontSize: 12, fontWeight: 800, border: 'none',
            cursor: 'pointer', transition: 'all 0.2s',
            background: tab === id ? color : 'transparent',
            color: tab === id ? '#fff' : 'var(--text-muted)',
            boxShadow: tab === id ? `0 4px 14px ${color}45` : 'none',
            transform: tab === id ? 'scale(1.03)' : 'scale(1)',
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={<Trophy size={28} style={{ color: '#D4890A' }} />}
          title="Aucun conducteur dans le classement"
          description="Effectuez des trajets pour apparaître ici"
          color="#D4890A"
        />
      ) : (
        <>
          {/* ── Podium top 3 ── */}
          {top3.length >= 2 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div style={{ background: 'linear-gradient(180deg, rgba(212,137,10,0.08) 0%, transparent 100%)', padding: '28px 20px 0', position: 'relative', overflow: 'hidden' }}>
                  {/* Glow central */}
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${tabCfg.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
                    {PODIUM_ORDER.map((rank, col) => {
                      const driver = top3[rank];
                      if (!driver) return <div key={col} style={{ flex: 1 }} />;
                      const lm = LEVEL_META[driver.level] || LEVEL_META.bronze;
                      const isFirst = rank === 0;
                      const medals = ['🥇','🥈','🥉'];
                      const podH = PODIUM_HEIGHTS[col];

                      return (
                        <Link key={col} to={`/profile/${driver.id}`} style={{
                          flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                          opacity: podiumIn ? 1 : 0,
                          transform: podiumIn ? 'translateY(0)' : 'translateY(16px)',
                          transition: `opacity 0.45s ease ${col * 0.1}s, transform 0.45s ease ${col * 0.1}s`,
                        }}>
                          {isFirst && <Crown size={20} style={{ color: '#D4890A', filter: 'drop-shadow(0 2px 6px rgba(212,137,10,0.6))' }} />}
                          <span style={{ fontSize: isFirst ? 28 : 22 }}>{medals[rank]}</span>

                          <div style={{
                            width: isFirst ? 74 : 58, height: isFirst ? 74 : 58,
                            borderRadius: '50%', padding: 3,
                            background: isFirst ? `linear-gradient(135deg, ${tabCfg.color}, #FFD700)` : 'var(--border-color)',
                            boxShadow: isFirst ? `0 0 22px ${tabCfg.color}45` : 'none',
                          }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-800)' }}>
                              <Avatar user={driver} size={isFirst ? 68 : 52} />
                            </div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: isFirst ? 13 : 11, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                              {driver.firstName} {driver.lastName?.[0]}.
                            </p>
                            <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 700, color: lm.color }}>{lm.emoji} {lm.label}</p>
                          </div>

                          <div style={{ fontSize: isFirst ? 15 : 13, fontWeight: 900, color: tabCfg.color }}>
                            {tabCfg.statLabel(driver)}
                          </div>

                          {/* Barre podium — monte avec spring */}
                          <div style={{
                            width: '100%', borderRadius: '10px 10px 0 0',
                            background: isFirst
                              ? `linear-gradient(180deg, ${tabCfg.color}38, ${tabCfg.color}15)`
                              : 'var(--bg-700)',
                            border: `1px solid ${isFirst ? tabCfg.color + '55' : 'var(--border-color)'}`,
                            borderBottom: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: podiumIn ? podH : 0,
                            transition: `height 0.65s cubic-bezier(0.34,1.56,0.64,1) ${0.25 + col * 0.1}s`,
                            overflow: 'hidden',
                          }}>
                            <span style={{ fontSize: isFirst ? 28 : 22, fontWeight: 900, color: isFirst ? tabCfg.color : 'var(--text-muted)', opacity: isFirst ? 1 : 0.5 }}>
                              #{rank + 1}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Liste 4+ ── */}
          {rest.length > 0 && (
            <div className="card-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rest.map((d, i) => {
                const rank = i + 4;
                const lm   = LEVEL_META[d.level] || LEVEL_META.bronze;
                return (
                  <Link key={d.id} to={`/profile/${d.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                    padding: '12px 16px', borderRadius: 14,
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = tabCfg.color + '55'; e.currentTarget.style.boxShadow = `0 4px 16px ${tabCfg.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-muted)' }}>#{rank}</span>
                    </div>

                    <Avatar user={d} size={42} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.firstName} {d.lastName}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: lm.bg, color: lm.color }}>
                          {lm.emoji} {lm.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          <Star size={10} style={{ display: 'inline', color: '#F59E0B', verticalAlign: 'middle' }} /> {d.avgRating?.toFixed(1)} · {d.totalTrips} trajets
                        </span>
                        {d.badges?.slice(0, 3).map(b => (
                          <span key={b.id} title={b.label} style={{ fontSize: 13 }}>{b.emoji}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: tabCfg.color }}>{tabCfg.statLabel(d)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
