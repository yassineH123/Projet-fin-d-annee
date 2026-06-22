import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, Users, Car, ArrowRight, Trash2, Clock, Zap, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ARABIC_CITIES = {
  'Casablanca': 'الدار البيضاء', 'Rabat': 'الرباط',
  'Marrakech': 'مراكش', 'Fès': 'فاس', 'Tanger': 'طنجة',
  'Agadir': 'أكادير', 'Meknès': 'مكناس', 'Oujda': 'وجدة', 'Tétouan': 'تطوان',
};

function ZelligeStripe() {
  return <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D 0%, #C1272D 33%, #D4890A 50%, #006233 67%, #006233 100%)' }} />;
}

function Stars({ n = 5 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} style={{ color: i < n ? '#D4890A' : 'var(--border-muted)', fill: i < n ? '#D4890A' : 'none' }} />
      ))}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
      <ZelligeStripe />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 13, width: '40%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 11, width: '60%' }} />
          </div>
          <div className="skeleton" style={{ height: 32, width: 72, borderRadius: 99 }} />
        </div>
        <div className="skeleton" style={{ height: 72, borderRadius: 10, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
          <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

function FavoriteCard({ ride, onRemove }) {
  const navigate  = useNavigate();
  const [removing, setRemoving] = useState(false);

  const arabicFrom = ARABIC_CITIES[ride.from] || '';
  const arabicTo   = ARABIC_CITIES[ride.to]   || '';

  const formatDate = (iso) => {
    const d = new Date(iso);
    const today    = new Date();
    const tomorrow = new Date(Date.now() + 86400000);
    if (d.toDateString() === today.toDateString())    return "Aujourd'hui";
    if (d.toDateString() === tomorrow.toDateString()) return 'Demain';
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.post(`/favorites/${ride.id}`);
      toast.success('Retiré des favoris');
      onRemove(ride.id);
    } catch {
      toast.error('Erreur');
      setRemoving(false);
    }
  };

  const depTime = ride.departureDate
    ? new Date(ride.departureDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '—';
  const dateLabel = ride.departureDate ? formatDate(ride.departureDate) : '';

  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border-color)',
      borderRadius: 14, overflow: 'hidden',
      animation: 'fadeIn 0.3s ease both',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>

      <ZelligeStripe />

      {/* Header */}
      <div style={{ padding: '12px 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #C1272D, #D4890A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 900, fontSize: 15,
          border: '2px solid rgba(212,137,10,0.3)',
        }}>
          {ride.driver?.firstName?.[0]}{ride.driver?.lastName?.[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-base)', lineHeight: 1.2 }}>
              {ride.driver?.firstName} {ride.driver?.lastName?.[0]}.
            </p>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'rgba(0,98,51,0.1)', color: '#006233', border: '1px solid rgba(0,98,51,0.2)' }}>✓ VÉRIFIÉ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Stars n={Math.round(ride.driver?.avgRating || 0)} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ride.driver?.avgRating || '—'}</span>
          </div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 99, background: 'linear-gradient(135deg, rgba(193,39,45,0.12), rgba(193,39,45,0.06))', border: '1px solid rgba(193,39,45,0.25)' }}>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#C1272D' }}>{ride.price}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>DH</span>
        </div>
      </div>

      {/* Route */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ background: 'var(--bg-800)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Amiri', serif", fontSize: 28, color: 'rgba(212,137,10,0.07)', userSelect: 'none', pointerEvents: 'none', fontWeight: 700 }}>رحلة</div>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#006233', boxShadow: '0 0 5px rgba(0,135,90,0.5)', flexShrink: 0 }} />
                <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-base)' }}>{ride.from}</span>
              </div>
              {arabicFrom && <p style={{ margin: 0, fontSize: 10, color: 'rgba(212,137,10,0.55)', fontFamily: "'Amiri', serif", marginLeft: 15 }}>{arabicFrom}</p>}
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', marginLeft: 15 }}>{depTime}</p>
            </div>
            <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <div style={{ width: 36, height: 1, background: 'linear-gradient(to right, #006233, #D4890A, #C1272D)' }} />
              <ArrowRight size={13} style={{ color: '#D4890A' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-base)' }}>{ride.to}</span>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#C1272D', boxShadow: '0 0 5px rgba(193,39,45,0.5)', flexShrink: 0 }} />
              </div>
              {arabicTo && <p style={{ margin: 0, fontSize: 10, color: 'rgba(212,137,10,0.55)', fontFamily: "'Amiri', serif", marginRight: 15 }}>{arabicTo}</p>}
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', marginRight: 15 }}>{dateLabel}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <Users size={11} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''} disponible{ride.seatsAvailable > 1 ? 's' : ''}
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#D4890A' }}>
            <Zap size={10} /> Réservation rapide
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-color)', margin: '0 14px' }} />

      {/* Actions */}
      <div style={{ display: 'flex', padding: '4px 6px' }}>
        <button onClick={() => navigate(`/rides/${ride.id}`)} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, background: 'transparent', color: '#006233', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,98,51,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Car size={15} /> Réserver
        </button>
        <button onClick={handleRemove} disabled={removing} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 8, border: 'none', cursor: removing ? 'default' : 'pointer',
          fontSize: 12, fontWeight: 600, background: 'transparent', color: removing ? 'var(--text-muted)' : '#C1272D', transition: 'background 0.15s',
        }}
          onMouseEnter={e => { if (!removing) e.currentTarget.style.background = 'rgba(193,39,45,0.06)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {removing
            ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <><Heart size={15} style={{ fill: '#C1272D' }} /> Retirer</>
          }
        </button>
      </div>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const [rides,   setRides]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites')
      .then(({ data }) => setRides(data.favorites || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id) => setRides(r => r.filter(x => x.id !== id));

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, rgba(193,39,45,0.15), rgba(193,39,45,0.05))', border: '1px solid rgba(193,39,45,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} style={{ color: '#C1272D', fill: '#C1272D' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 22, color: 'var(--text-base)', lineHeight: 1.1 }}>Mes Favoris</h1>
            <p style={{ margin: 0, fontSize: 11, color: '#D4890A', fontFamily: "'Amiri', serif" }}>رحلاتي المفضلة</p>
          </div>
        </div>
        <div style={{ height: 3, background: 'linear-gradient(to right, #C1272D, #D4890A, #006233)', borderRadius: 99 }} />
      </div>

      {/* Count badge */}
      {!loading && rides.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-base)' }}>{rides.length}</strong> trajet{rides.length > 1 ? 's' : ''} sauvegardé{rides.length > 1 ? 's' : ''}
          </span>
          <Link to="/rides/search" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#C1272D', textDecoration: 'none', fontWeight: 600 }}>
            Voir tous les trajets <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : rides.length === 0 ? (
        /* Empty state */
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--card-bg)', border: '1px solid var(--border-color)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <ZelligeStripe />
          <div style={{ padding: '40px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>❤️</div>
            <p style={{ fontFamily: "'Amiri', serif", fontSize: 20, color: '#D4890A', margin: '0 0 8px' }}>لا توجد رحلات مفضلة</p>
            <h2 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 18, color: 'var(--text-base)' }}>Aucun favori pour l'instant</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
              Cliquez sur ❤️ J'aime sur un trajet pour le sauvegarder ici.
            </p>
            <button onClick={() => navigate('/rides/search')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #C1272D, #9e1f24)',
              color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(193,39,45,0.3)',
            }}>
              <MapPin size={16} /> Explorer les trajets
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rides.map(ride => (
            <FavoriteCard key={ride.id} ride={ride} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
