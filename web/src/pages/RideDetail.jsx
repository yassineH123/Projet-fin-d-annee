import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Zap, MessageSquare, Flag, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/StarRating';
import Spinner from '../components/Spinner';
import ReportModal from '../components/ReportModal';
import GPSTracker from '../components/GPSTracker';
import RideMap from '../components/RideMap';

export default function RideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide]       = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking,    setBooking]    = useState(false);
  const [seats,      setSeats]      = useState(1);
  const [message,    setMessage]    = useState('');
  const [useCredits, setUseCredits] = useState(false);
  const [showReport,   setShowReport]   = useState(false);
  const [inWaitlist,   setInWaitlist]   = useState(false);
  const [joiningWait,  setJoiningWait]  = useState(false);
  const [isFav,        setIsFav]        = useState(false);

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
    } finally {
      setBooking(false);
    }
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

  const handleMessage = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/messages', { receiverId: ride.driver.id, content: `Bonjour, je suis intéressé par votre trajet ${ride.from} → ${ride.to}`, rideId: id });
      navigate('/messages');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!ride)   return <div className="text-center py-20 text-slate-400">Trajet introuvable.</div>;

  const driver = ride.driver || {};
  const date   = new Date(ride.departureDate);
  const prefs  = driver.preferences || {};
  const isOwn  = user?.id === driver.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Route card */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              {user && !isOwn && (
                <button onClick={handleToggleFav}
                  className="ml-auto p-2 rounded-xl transition-all"
                  style={{ background: isFav ? 'rgba(239,68,68,0.12)' : 'var(--bg-700)', color: isFav ? '#F87171' : 'var(--text-muted)' }}
                  title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                  <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-primary-500 ring-4 ring-primary-500/20" />
                <div className="w-0.5 h-14 bg-dark-500" />
                <div className="w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-500/20" />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xl font-bold text-white">{ride.from}</p>
                  <p className="text-sm text-slate-400">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{ride.to}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-400 border-t border-dark-500 pt-4">
              <span className="flex items-center gap-1.5"><Clock size={15} className="text-primary-400" />
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5"><Users size={15} className="text-primary-400" />
                {ride.seatsAvailable} place{ride.seatsAvailable > 1 ? 's' : ''} disponible{ride.seatsAvailable > 1 ? 's' : ''}
              </span>
              {ride.instantBooking && (
                <span className="flex items-center gap-1.5 text-yellow-400"><Zap size={13} fill="currentColor" /> Réservation instantanée</span>
              )}
            </div>

            {ride.description && (
              <p className="mt-4 text-slate-400 text-sm leading-relaxed border-t border-dark-500 pt-4">{ride.description}</p>
            )}
          </div>

          {/* Map */}
          <RideMap from={ride.from} to={ride.to} stops={ride.stops || []} />

          {/* Driver */}
          <div className="card">
            <h3 className="font-bold text-white mb-4">Conducteur</h3>
            <Link to={`/profile/${driver.id}`} className="flex items-center gap-4 hover:opacity-80 transition">
              {driver.photo
                ? <img src={driver.photo} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-dark-500" />
                : <div className="w-14 h-14 rounded-full bg-primary-700 flex items-center justify-center text-xl font-black text-white">{driver.firstName?.[0]}</div>
              }
              <div>
                <p className="font-semibold text-white">{driver.firstName} {driver.lastName}</p>
                <StarDisplay rating={driver.avgRating} count={driver.totalRatings} />
                {driver.bio && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{driver.bio}</p>}
              </div>
            </Link>

            {/* Préférences */}
            {Object.keys(prefs).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3 border-t border-dark-500 pt-4">
                {[['smoking', 'Fumeur'], ['music', 'Musique'], ['pets', 'Animaux'], ['chat', 'Discussion']].map(([k, label]) => (
                  <span key={k} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${prefs[k] ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {prefs[k] ? <Check size={12} /> : <X size={12} />} {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-white mb-4">Avis sur le conducteur</h3>
              <div className="flex flex-col gap-4">
                {reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="border-b border-dark-500 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      {r.reviewer?.photo
                        ? <img src={r.reviewer.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-white">{r.reviewer?.firstName?.[0]}</div>
                      }
                      <div>
                        <p className="text-sm font-medium text-white">{r.reviewer?.firstName} {r.reviewer?.lastName}</p>
                        <StarDisplay rating={r.rating} size={12} />
                      </div>
                    </div>
                    {r.comment && <p className="text-slate-400 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="card sticky top-20">
            <p className="text-3xl font-black text-white mb-1">{Number(ride.price).toFixed(0)} <span className="text-lg text-slate-400 font-normal">MAD</span></p>
            <p className="text-slate-400 text-sm mb-5">par personne</p>

            {!isOwn && ride.seatsAvailable > 0 && ride.status === 'active' && (
              <>
                <div className="mb-3">
                  <label className="text-sm text-slate-400 mb-1.5 block">Nombre de places</label>
                  <select value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="input text-sm">
                    {Array.from({ length: ride.seatsAvailable }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message au conducteur (optionnel)"
                  className="input text-sm mb-3 resize-none"
                  rows={3}
                />
                {user?.referralCredits > 0 && (
                  <label className="flex items-center gap-2 mb-3 cursor-pointer p-2.5 rounded-xl"
                    style={{ background: 'rgba(212,137,10,0.08)', border: '1px solid rgba(212,137,10,0.25)' }}>
                    <input
                      type="checkbox"
                      checked={useCredits}
                      onChange={e => setUseCredits(e.target.checked)}
                      className="accent-yellow-500 w-4 h-4"
                    />
                    <span className="text-sm font-semibold" style={{ color: '#D4890A' }}>
                      🎁 Utiliser mes crédits parrainage ({user.referralCredits} DH)
                    </span>
                  </label>
                )}
                {useCredits && user?.referralCredits > 0 && (
                  <p className="text-xs mb-3 text-center" style={{ color: '#00875A' }}>
                    ✓ -{Math.min(user.referralCredits, ride.price * seats)} DH appliqué sur ce trajet
                  </p>
                )}
                <button onClick={handleBook} disabled={booking} className="btn-primary w-full mb-2">
                  {booking ? 'Réservation...' : ride.instantBooking ? '⚡ Réserver instantanément' : 'Demander à réserver'}
                </button>
                {!isOwn && (
                  <button onClick={handleMessage} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                    <MessageSquare size={15} /> Contacter
                  </button>
                )}
                {!isOwn && user && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium transition-colors mt-1"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Flag size={12} /> Signaler ce conducteur
                  </button>
                )}
              </>
            )}

            {ride.status !== 'active' && (
              <div className="text-center py-3 text-slate-400 text-sm bg-dark-700 rounded-xl">Trajet non disponible</div>
            )}
            {ride.status === 'active' && ride.seatsAvailable === 0 && !isOwn && (
              <div className="flex flex-col gap-2">
                <div className="text-center py-2 text-slate-400 text-sm bg-dark-700 rounded-xl">Complet</div>
                {user && (
                  <button onClick={handleWaitlist} disabled={joiningWait}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: inWaitlist ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                      color:      inWaitlist ? '#F87171' : '#60A5FA',
                      border:     `1.5px solid ${inWaitlist ? '#EF4444' : '#3B82F6'}40`,
                    }}>
                    {joiningWait
                      ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : inWaitlist ? '✕ Quitter la liste d\'attente' : '🔔 Rejoindre la liste d\'attente'
                    }
                  </button>
                )}
              </div>
            )}
            {isOwn && (
              <div className="flex flex-col gap-3">
                <div className="text-center py-3 text-slate-400 text-sm bg-dark-700 rounded-xl">Votre trajet</div>
                <GPSTracker rideId={ride.id} isDriver={true} />
              </div>
            )}
            {!isOwn && ride.status === 'active' && ride.seatsAvailable > 0 && (
              <GPSTracker rideId={ride.id} isDriver={false} />
            )}
          </div>
        </div>
      </div>

      {showReport && ride?.driver && (
        <ReportModal
          reportedId={ride.driver.id}
          reportedName={`${ride.driver.firstName} ${ride.driver.lastName}`}
          rideId={ride.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
