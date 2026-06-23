import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Zap, MessageSquare, Flag, Heart, Check, X, Share2, Gift, Bell, ChevronRight, ArrowRight, Package, Banknote, CreditCard, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/StarRating';
import Spinner from '../components/Spinner';
import ReportModal from '../components/ReportModal';
import GPSTracker from '../components/GPSTracker';
import RideMap from '../components/RideMap';
import PaymentModal from '../components/PaymentModal';

function getCancellationPolicy(departureDate) {
  const hoursLeft = (new Date(departureDate) - new Date()) / (1000 * 60 * 60);
  if (hoursLeft >= 48) return { pct: 100, tier: 'flex',   color: '#22C55E', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.25)',   label: 'Annulation gratuite',      sub: 'Remboursement intégral si annulé 48h avant' };
  if (hoursLeft >= 24) return { pct: 50,  tier: 'modere', color: '#D4890A', bg: 'rgba(212,137,10,0.07)', border: 'rgba(212,137,10,0.25)',  label: 'Remboursement partiel',    sub: 'Remboursement à 50% (entre 24h et 48h avant)' };
  return                        { pct: 0,   tier: 'strict', color: '#EF4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',   label: 'Non remboursable',         sub: 'Départ dans moins de 24h' };
}

const ARABIC_NAMES = {
  'Casablanca': 'الدار البيضاء', 'Rabat': 'الرباط', 'Marrakech': 'مراكش',
  'Fès': 'فاس', 'Tanger': 'طنجة', 'Agadir': 'أكادير',
  'Meknès': 'مكناس', 'Oujda': 'وجدة', 'Tétouan': 'تطوان', 'Laâyoune': 'العيون',
  'Essaouira': 'الصويرة', 'El Jadida': 'الجديدة', 'Kenitra': 'القنيطرة',
};

function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.88 }} />
      ))}
    </div>
  );
}

function PrefChip({ label, active }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
      padding: '4px 10px', borderRadius: 99,
      background: active ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.08)',
      color: active ? '#22C55E' : '#F87171',
      border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      {active ? <Check size={10} /> : <X size={10} />} {label}
    </span>
  );
}

export default function RideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride,       setRide]       = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [booking,    setBooking]    = useState(false);
  const [seats,      setSeats]      = useState(1);
  const [message,    setMessage]    = useState('');
  const [useCredits, setUseCredits] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [inWaitlist, setInWaitlist] = useState(false);
  const [joiningWait,setJoiningWait]= useState(false);
  const [isFav,      setIsFav]      = useState(false);
  const [showPayment,setShowPayment]= useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'cash' | 'online'
  const [cashConfirmed, setCashConfirmed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/rides/${id}`),
      api.get(`/reviews/user/${id}`).catch(() => ({ data: { reviews: [] } })),
    ]).then(([r, rv]) => {
      setRide(r.data.ride);
      setReviews(rv.data.reviews);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    try {
      await api.post('/bookings', { rideId: id, seats, message, useCredits });
      toast.success('Réservation envoyée !');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de réservation');
    } finally { setBooking(false); }
  };

  const handleToggleFav = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post(`/favorites/${id}/toggle`);
      setIsFav(f => !f);
      toast.success(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️');
    } catch { toast.error('Erreur'); }
  };

  const handleWaitlist = async () => {
    if (!user) { navigate('/login'); return; }
    setJoiningWait(true);
    try {
      if (inWaitlist) {
        await api.post(`/waitlist/${id}/leave`);
        toast.success('Retiré de la liste d\'attente.');
        setInWaitlist(false);
      } else {
        await api.post(`/waitlist/${id}/join`, { seats });
        toast.success('Ajouté à la liste d\'attente ! Vous serez notifié si une place se libère.');
        setInWaitlist(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setJoiningWait(false); }
  };

  const handleWhatsApp = () => {
    const dateStr = ride ? new Date(ride.departureDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    const text = encodeURIComponent(`🚗 Trajet AtlasWay\n${ride.from} → ${ride.to}\n📅 ${dateStr}\n💰 ${Number(ride.price).toFixed(0)} MAD/pers\n🔗 ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleMessage = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/messages', { receiverId: ride.driver.id, content: `Bonjour, je suis intéressé par votre trajet ${ride.from} → ${ride.to}`, rideId: id });
      navigate('/messages');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <Spinner size="lg" />;
  if (!ride)   return <div className="text-center py-20 text-slate-400">Trajet introuvable.</div>;

  const driver  = ride.driver || {};
  const date    = new Date(ride.departureDate);
  const prefs   = driver.preferences || {};
  const isOwn   = user?.id === driver.id;
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const discount = useCredits && user?.referralCredits > 0
    ? Math.min(user.referralCredits, ride.price * seats) : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 48px' }}>
      <SEO
        title={`${ride.from} → ${ride.to}`}
        description={`Covoiturage ${ride.from} → ${ride.to} le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${Number(ride.price).toFixed(0)} MAD/pers avec ${driver.firstName || 'un conducteur vérifié'}.`}
        path={`/rides/${id}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}
        className="ride-detail-grid">

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Route hero card */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <ZelligeStripe />
            <div style={{ padding: '20px 22px', position: 'relative' }}>
              {/* Arabic watermark */}
              <div style={{
                position: 'absolute', top: 12, right: 18, fontFamily: 'Amiri, serif',
                fontSize: 40, color: 'rgba(193,39,45,0.06)', fontWeight: 900, pointerEvents: 'none', userSelect: 'none',
              }}>رحلة</div>

              {/* AtlasWay badge */}
              <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay · Détail du trajet</p>

              {/* Top row: badges + fav */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {ride.instantBooking && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(212,137,10,0.12)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.3)' }}>
                    <Zap size={11} fill="currentColor" /> Instantané
                  </span>
                )}
                {ride.womenOnly && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'rgba(236,72,153,0.10)', color: '#EC4899', border: '1px solid rgba(236,72,153,0.25)' }}>
                    <Users size={11} /> Femmes uniquement
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Users size={11} /> {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''} dispo
                </span>
                {user && !isOwn && (
                  <button onClick={handleToggleFav} style={{
                    marginLeft: 'auto', padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, transition: 'all .2s',
                    background: isFav ? 'rgba(239,68,68,0.12)' : 'var(--bg-700)',
                    color: isFav ? '#F87171' : 'var(--text-muted)',
                  }}>
                    <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                    {isFav ? 'Favori' : 'Ajouter'}
                  </button>
                )}
              </div>

              {/* Route timeline — supports multi-stops */}
              {(() => {
                const stops = ride.stops || [];
                const allCities = [ride.from, ...stops, ride.to];
                return (
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, marginBottom: 20 }}>
                    {/* Timeline dots + lines */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, flexShrink: 0 }}>
                      {allCities.map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                            background: i === 0 ? '#C1272D' : i === allCities.length - 1 ? '#006233' : '#D4890A',
                            boxShadow: `0 0 0 4px ${i === 0 ? 'rgba(193,39,45,0.18)' : i === allCities.length - 1 ? 'rgba(0,98,51,0.18)' : 'rgba(212,137,10,0.18)'}`,
                          }} />
                          {i < allCities.length - 1 && (
                            <div style={{ width: 2, background: 'var(--border-color)', margin: '6px 0', minHeight: stops.length > 0 ? 28 : 40 }} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* City names */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {allCities.map((city, i) => (
                        <div key={i} style={{ marginBottom: i < allCities.length - 1 ? (stops.length > 0 ? 22 : 16) : 0 }}>
                          <p style={{
                            fontSize: (i === 0 || i === allCities.length - 1) ? 22 : 16,
                            fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1,
                          }}>{city}</p>
                          {ARABIC_NAMES[city] && (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Amiri, serif', marginTop: 1 }}>{ARABIC_NAMES[city]}</p>
                          )}
                          {i === 0 && <p style={{ fontSize: 13, fontWeight: 700, color: '#C1272D', marginTop: 3 }}>{timeStr}</p>}
                          {i > 0 && i < allCities.length - 1 && (
                            <p style={{ fontSize: 11, fontWeight: 600, color: '#D4890A', marginTop: 2 }}>Escale</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Price mobile */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }} className="ride-price-mobile">
                      <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{Number(ride.price).toFixed(0)}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DH/pers</p>
                    </div>
                  </div>
                );
              })()}

              {/* Date + meta */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Clock size={14} style={{ color: '#C1272D' }} /> {dateStr}
                </span>
              </div>

              {/* Bagages, colis, récurrent, paiement */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                {ride.isRecurring && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.10)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' }}>
                    <RefreshCw size={10} /> Récurrent
                  </span>
                )}
                {ride.baggageAllowed !== false && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(0,98,51,0.10)', color: '#22C55E', border: '1px solid rgba(0,98,51,0.2)' }}>
                    🧳 Bagages OK {ride.maxBaggageKg ? `≤${ride.maxBaggageKg}kg` : ''}
                  </span>
                )}
                {ride.acceptsPackages && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(212,137,10,0.10)', color: '#D4890A', border: '1px solid rgba(212,137,10,0.25)' }}>
                    <Package size={10} /> Colis acceptés {ride.packagePricePerKg ? `· ${ride.packagePricePerKg} DH/kg` : '· Gratuit'}
                  </span>
                )}
                {ride.acceptCash && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(0,98,51,0.08)', color: '#006233', border: '1px solid rgba(0,98,51,0.2)' }}>
                    <Banknote size={10} /> Espèces OK
                  </span>
                )}
                {ride.acceptOnline && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.08)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <CreditCard size={10} /> Paiement en ligne
                  </span>
                )}
              </div>

              {/* Préférences conducteur */}
              {[
                { key: 'prefMusic',     emoji: '🎵', label: 'Musique OK',       color: '#8B5CF6' },
                { key: 'prefSilence',   emoji: '🤫', label: 'Silence apprécié', color: '#6B7280' },
                { key: 'prefSmoking',   emoji: '🚬', label: 'Fumeur OK',         color: '#F59E0B' },
                { key: 'prefPets',      emoji: '🐾', label: 'Animaux OK',        color: '#10B981' },
                { key: 'prefAC',        emoji: '❄️', label: 'Clim disponible',   color: '#2196F3' },
                { key: 'prefTalkative', emoji: '💬', label: 'Bavard',            color: '#C1272D' },
              ].some(p => ride[p.key]) && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Préférences du conducteur</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { key: 'prefMusic',     emoji: '🎵', label: 'Musique OK',       color: '#8B5CF6' },
                      { key: 'prefSilence',   emoji: '🤫', label: 'Silence apprécié', color: '#6B7280' },
                      { key: 'prefSmoking',   emoji: '🚬', label: 'Fumeur OK',         color: '#F59E0B' },
                      { key: 'prefPets',      emoji: '🐾', label: 'Animaux OK',        color: '#10B981' },
                      { key: 'prefAC',        emoji: '❄️', label: 'Clim disponible',   color: '#2196F3' },
                      { key: 'prefTalkative', emoji: '💬', label: 'Bavard',            color: '#C1272D' },
                    ].filter(p => ride[p.key]).map(p => (
                      <span key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: `${p.color}12`, color: p.color, border: `1px solid ${p.color}30` }}>
                        {p.emoji} {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ride.description && (
                <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                  {ride.description}
                </p>
              )}
            </div>
          </div>

          {/* Map */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <RideMap from={ride.from} to={ride.to} stops={ride.stops || []} />
          </div>

          {/* Driver card */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, #C1272D, #D4890A)' }} />
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Conducteur</p>
              <Link to={`/profile/${driver.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', marginBottom: Object.keys(prefs).length > 0 ? 16 : 0 }}>
                {driver.photo
                  ? <img src={driver.photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                  : <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {driver.firstName?.[0]}
                    </div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{driver.firstName} {driver.lastName}</p>
                  <StarDisplay rating={driver.avgRating} count={driver.totalRatings} />
                  {driver.avgPunctuality > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
                        padding: '3px 9px', borderRadius: 99,
                        background: 'rgba(59,130,246,0.10)', color: '#3B82F6',
                        border: '1px solid rgba(59,130,246,0.25)',
                      }}>
                        <Clock size={10} /> Ponctualité {Number(driver.avgPunctuality).toFixed(1)}/5
                      </span>
                      {driver.avgPunctuality >= 4.5 && (
                        <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 600 }}>⏱ Toujours à l'heure</span>
                      )}
                    </div>
                  )}
                  {driver.bio && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{driver.bio}</p>}
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </Link>

              {Object.keys(prefs).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                  {[['smoking', 'Fumeur'], ['music', 'Musique'], ['pets', 'Animaux'], ['chat', 'Discussion']].map(([k, label]) => (
                    <PrefChip key={k} label={label} active={!!prefs[k]} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '18px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Avis · {reviews.length} évaluation{reviews.length > 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.slice(0, 5).map((r) => (
                  <div key={r.id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}
                    className="last:border-0 last:pb-0">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {r.reviewer?.photo
                        ? <img src={r.reviewer.photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>{r.reviewer?.firstName?.[0]}</div>
                      }
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reviewer?.firstName} {r.reviewer?.lastName}</p>
                        <StarDisplay rating={r.rating} size={11} />
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{
            borderRadius: 18, overflow: 'hidden',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
            <ZelligeStripe />
            <div style={{ padding: '20px 20px 24px' }}>

              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {Number(ride.price).toFixed(0)}
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 6 }}>DH</span>
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>par personne</p>
              </div>

              {/* Route summary in sidebar */}
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(193,39,45,0.06)', border: '1px solid rgba(193,39,45,0.12)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ride.from}</span>
                <ArrowRight size={13} style={{ color: '#C1272D', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{ride.to}</span>
              </div>

              {/* Booking form */}
              {!isOwn && ride.seatsAvailable > 0 && ride.status === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nombre de places</label>
                    <select value={seats} onChange={e => setSeats(Number(e.target.value))} className="input" style={{ fontSize: 13 }}>
                      {Array.from({ length: ride.seatsAvailable }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Message (optionnel)</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Présentez-vous au conducteur..."
                      className="input" style={{ fontSize: 13, resize: 'none' }} rows={3} />
                  </div>

                  {/* Payment method selector */}
                  {(ride.acceptCash || ride.acceptOnline) && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Mode de paiement</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {ride.acceptCash && (
                          <button type="button" onClick={() => setPaymentMethod('cash')}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '9px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                              background: paymentMethod === 'cash' ? 'rgba(0,98,51,0.12)' : 'var(--bg-700)',
                              color: paymentMethod === 'cash' ? '#006233' : 'var(--text-muted)',
                              border: `1.5px solid ${paymentMethod === 'cash' ? '#006233' : 'var(--border-color)'}`,
                            }}>
                            <Banknote size={13} /> Espèces
                          </button>
                        )}
                        {ride.acceptOnline && (
                          <button type="button" onClick={() => setPaymentMethod('online')}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '9px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                              background: paymentMethod === 'online' ? 'rgba(59,130,246,0.12)' : 'var(--bg-700)',
                              color: paymentMethod === 'online' ? '#3B82F6' : 'var(--text-muted)',
                              border: `1.5px solid ${paymentMethod === 'online' ? '#3B82F6' : 'var(--border-color)'}`,
                            }}>
                            <CreditCard size={13} /> En ligne
                          </button>
                        )}
                      </div>
                      {paymentMethod === 'cash' && (
                        <p style={{ fontSize: 11, color: '#D4890A', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                          💡 Paiement en espèces à remettre au conducteur au départ
                        </p>
                      )}
                    </div>
                  )}

                  {user?.referralCredits > 0 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: 'rgba(212,137,10,0.07)', border: '1px solid rgba(212,137,10,0.22)' }}>
                      <input type="checkbox" checked={useCredits} onChange={e => setUseCredits(e.target.checked)} style={{ accentColor: '#D4890A', width: 15, height: 15 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#D4890A', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Gift size={13} /> Crédits parrainage ({user.referralCredits} DH)
                      </span>
                    </label>
                  )}

                  {discount > 0 && (
                    <p style={{ fontSize: 12, color: '#22C55E', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <Check size={12} /> -{discount} DH appliqué · Total : {ride.price * seats - discount} DH
                    </p>
                  )}

                  {/* Politique d'annulation */}
                  {ride.departureDate && (() => {
                    const pol = getCancellationPolicy(ride.departureDate);
                    return (
                      <div style={{ padding: '10px 12px', borderRadius: 10, background: pol.bg, border: `1px solid ${pol.border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <ShieldCheck size={15} style={{ color: pol.color, flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 800, color: pol.color }}>{pol.label}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{pol.sub}</p>
                          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                            {[{ label: '+48h', pct: 100, active: pol.pct === 100 }, { label: '24-48h', pct: 50, active: pol.pct === 50 }, { label: '<24h', pct: 0, active: pol.pct === 0 }].map(t => (
                              <span key={t.label} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: t.active ? pol.color : 'var(--bg-700)', color: t.active ? '#fff' : 'var(--text-muted)', border: `1px solid ${t.active ? pol.color : 'var(--border-color)'}` }}>
                                {t.label} → {t.pct}%
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => paymentMethod === 'online' ? setShowPayment(true) : handleBook()}
                    disabled={booking} className="btn-primary"
                    style={{ width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 800 }}>
                    {booking ? 'Réservation...' : paymentMethod === 'cash'
                      ? <><Banknote size={15} /> Réserver (payer en espèces)</>
                      : ride.instantBooking
                        ? <><Zap size={15} fill="currentColor" /> Réserver instantanément</>
                        : 'Demander à réserver'}
                  </button>

                  <button onClick={handleMessage} style={{
                    width: '100%', height: 40, borderRadius: 10, border: '1px solid var(--border-color)',
                    background: 'var(--bg-700)', color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13, fontWeight: 700,
                  }}>
                    <MessageSquare size={14} /> Contacter le conducteur
                  </button>

                  <button onClick={handleWhatsApp} style={{
                    width: '100%', height: 40, borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(37,211,102,0.10)', color: '#25D366',
                    border: '1.5px solid rgba(37,211,102,0.25)', fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <Share2 size={13} /> Partager sur WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/track/${id}`;
                      navigator.clipboard.writeText(link).then(() => toast.success('Lien de suivi copié ! Envoyez-le à votre famille 📍'));
                    }}
                    style={{
                      width: '100%', height: 40, borderRadius: 10, cursor: 'pointer',
                      background: 'rgba(193,39,45,0.08)', color: '#C1272D',
                      border: '1.5px solid rgba(193,39,45,0.22)', fontWeight: 700, fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    }}>
                    <MapPin size={13} /> Partager le suivi à ma famille
                  </button>

                  {user && (
                    <button onClick={() => setShowReport(true)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', marginTop: 2,
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Flag size={11} /> Signaler ce conducteur
                    </button>
                  )}
                </div>
              )}

              {ride.status !== 'active' && (
                <div style={{ textAlign: 'center', padding: '14px', borderRadius: 10, background: 'var(--bg-700)', color: 'var(--text-muted)', fontSize: 13 }}>
                  Trajet non disponible
                </div>
              )}

              {ride.status === 'active' && ride.seatsAvailable === 0 && !isOwn && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: 'var(--bg-700)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>
                    Complet
                  </div>
                  {user && (
                    <button onClick={handleWaitlist} disabled={joiningWait} style={{
                      width: '100%', height: 42, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      background: inWaitlist ? 'rgba(239,68,68,0.10)' : 'rgba(59,130,246,0.10)',
                      color:      inWaitlist ? '#F87171' : '#60A5FA',
                      border:     `1.5px solid ${inWaitlist ? '#EF444440' : '#3B82F640'}`,
                    }}>
                      {joiningWait
                        ? <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        : inWaitlist ? <><X size={14} /> Quitter la liste d'attente</> : <><Bell size={14} /> Rejoindre la liste d'attente</>
                      }
                    </button>
                  )}
                </div>
              )}

              {isOwn && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: 'rgba(193,39,45,0.08)', color: '#C1272D', fontSize: 13, fontWeight: 700, border: '1px solid rgba(193,39,45,0.2)' }}>
                    Votre trajet
                  </div>
                  <GPSTracker rideId={ride.id} isDriver={true} />
                </div>
              )}

              {!isOwn && ride.status === 'active' && ride.seatsAvailable > 0 && (
                <GPSTracker rideId={ride.id} isDriver={false} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReport && ride?.driver && (
        <ReportModal
          reportedId={ride.driver.id}
          reportedName={`${ride.driver.firstName} ${ride.driver.lastName}`}
          rideId={ride.id}
          onClose={() => setShowReport(false)}
        />
      )}
      {showPayment && ride && (
        <PaymentModal
          amount={ride.price * seats}
          rideFrom={ride.from}
          rideTo={ride.to}
          onConfirm={handleBook}
          onClose={() => setShowPayment(false)}
        />
      )}

      <style>{`
        @media (max-width: 700px) {
          .ride-detail-grid { grid-template-columns: 1fr !important; }
          .ride-price-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
