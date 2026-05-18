import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Check, X, Star, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
  const navigate               = useNavigate();
  const { user: me }           = useAuth();
  const [tab, setTab]          = useState('passenger');
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchBookings = (t = tab) => {
    setLoading(true);
    const url = t === 'passenger' ? '/bookings/me' : '/bookings/driver';
    api.get(url).then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [tab]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/${action}`);
      toast.success(action === 'accept' ? 'Acceptée !' : action === 'refuse' ? 'Refusée' : 'Annulée');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const canReview = (b) => {
    const ride = b.ride || {};
    if (tab === 'passenger') return b.status === 'accepted' && ride.status === 'completed';
    if (tab === 'driver')    return ride.status === 'completed';
    return false;
  };

  const reviewUrl = (b) => {
    const ride     = b.ride || {};
    const reviewed = tab === 'passenger' ? ride.driver : b.passenger;
    const type     = tab === 'passenger' ? 'driver' : 'passenger';
    return `/reviews/write?rideId=${ride.id}&reviewedId=${reviewed?.id}&type=${type}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-6">Réservations</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-dark-800 border border-dark-500 rounded-xl p-1 w-fit">
        {[['passenger','Mes voyages'],['driver','Demandes reçues']].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === v ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : bookings.length === 0 ? (
        <div className="text-center py-16 card">
          <MapPin size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune réservation</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((b) => {
            const ride  = b.ride || {};
            const other = tab === 'passenger' ? ride.driver : b.passenger;
            const date  = ride.departureDate ? new Date(ride.departureDate) : null;

            return (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Link to={`/rides/${ride.id}`} className="font-bold text-white hover:text-primary-400 transition">
                        {ride.from} → {ride.to}
                      </Link>
                      <BookingStatusBadge status={b.status} />
                      {ride.status === 'completed' && (
                        <span className="badge-accepted">Trajet terminé</span>
                      )}
                    </div>

                    {date && (
                      <p className="text-sm text-slate-400 flex items-center gap-1 mb-2">
                        <Clock size={13} />
                        {date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}

                    {other && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        {other.photo
                          ? <img src={other.photo} alt="" className="w-6 h-6 rounded-full object-cover" />
                          : (
                            <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-white">
                              {other.firstName?.[0]}
                            </div>
                          )
                        }
                        {other.firstName} {other.lastName}
                      </div>
                    )}

                    {b.message && (
                      <p className="text-slate-500 text-sm mt-2 italic">"{b.message}"</p>
                    )}

                    {/* Laisser un avis */}
                    {canReview(b) && (
                      <Link
                        to={reviewUrl(b)}
                        className="inline-flex items-center gap-1.5 text-sm text-yellow-400 hover:text-yellow-300 font-semibold mt-3 transition-colors"
                      >
                        <Star size={14} fill="currentColor" /> Laisser un avis
                      </Link>
                    )}

                    {/* Contacter */}
                    {other && other.id !== me?.id && ['pending', 'accepted'].includes(b.status) && (
                      <Link
                        to={`/messages?with=${other.id}&name=${encodeURIComponent(`${other.firstName} ${other.lastName}`)}&photo=${encodeURIComponent(other.photo || '')}`}
                        className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 font-semibold mt-2 transition-colors"
                      >
                        <MessageSquare size={14} />
                        {tab === 'passenger' ? 'Contacter le conducteur' : 'Contacter le passager'}
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {tab === 'driver' && b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(b.id, 'accept')}
                          className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 font-semibold transition"
                        >
                          <Check size={15} /> Accepter
                        </button>
                        <button
                          onClick={() => handleAction(b.id, 'refuse')}
                          className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-semibold transition"
                        >
                          <X size={15} /> Refuser
                        </button>
                      </>
                    )}
                    {tab === 'passenger' && ['pending', 'accepted'].includes(b.status) && (
                      <button
                        onClick={() => handleAction(b.id, 'cancel')}
                        className="text-sm text-red-400 hover:text-red-300 font-semibold transition"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
