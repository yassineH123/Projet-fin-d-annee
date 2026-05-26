import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, Star, MessageSquare, Flag, ScanLine, CalendarDays, List } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { SkeletonList } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import BookingStatusBadge from '../components/BookingStatusBadge';
import ReportModal from '../components/ReportModal';
import BookingQR from '../components/BookingQR';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
  const { user: me }           = useAuth();
  const [tab, setTab]          = useState('passenger');
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [report,   setReport]   = useState(null);
  const [qrBooking, setQrBooking] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Réservations</h1>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
          <button onClick={() => setViewMode('list')} title="Vue liste"
            className="p-2 rounded-lg transition-all"
            style={{ background: viewMode === 'list' ? 'var(--card-bg)' : 'transparent', color: viewMode === 'list' ? '#C1272D' : 'var(--text-muted)' }}>
            <List size={16} />
          </button>
          <button onClick={() => setViewMode('calendar')} title="Vue agenda"
            className="p-2 rounded-lg transition-all"
            style={{ background: viewMode === 'calendar' ? 'var(--card-bg)' : 'transparent', color: viewMode === 'calendar' ? '#C1272D' : 'var(--text-muted)' }}>
            <CalendarDays size={16} />
          </button>
        </div>
      </div>

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

      {loading ? <SkeletonList count={3} /> : bookings.length === 0 ? (
        <EmptyState
          emoji={tab === 'passenger' ? '🎫' : '🚗'}
          title="Aucune réservation"
          description={tab === 'passenger'
            ? "Vous n'avez pas encore réservé de trajet. Trouvez votre prochain voyage !"
            : "Vous n'avez pas encore reçu de demandes de réservation."}
          actionLabel={tab === 'passenger' ? 'Rechercher un trajet' : 'Publier un trajet'}
          actionTo={tab === 'passenger' ? '/rides/search' : '/rides/publish'}
        />
      ) : viewMode === 'calendar' ? (
        <CalendarView bookings={bookings} />
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

                    {/* QR Code billet */}
                    {tab === 'passenger' && b.status === 'accepted' && (
                      <button
                        onClick={() => setQrBooking(b)}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-semibold mt-3 transition-colors"
                      >
                        <ScanLine size={14} /> Voir mon billet QR
                      </button>
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

                    {/* Signaler le conducteur */}
                    {tab === 'passenger' && b.status === 'accepted' && (() => {
                      const driver = b.ride?.driver;
                      if (!driver) return null;
                      return (
                        <button
                          onClick={() => setReport({ id: driver.id, name: `${driver.firstName} ${driver.lastName}`, rideId: b.ride?.id })}
                          className="inline-flex items-center gap-1.5 text-sm text-red-400/70 hover:text-red-400 font-medium mt-2 transition-colors"
                        >
                          <Flag size={13} /> Signaler le conducteur
                        </button>
                      );
                    })()}

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

      {/* Modal QR billet */}
      {qrBooking && <BookingQR booking={qrBooking} onClose={() => setQrBooking(null)} />}

      {/* Modal signalement */}
      {report && (
        <ReportModal
          reportedId={report.id}
          reportedName={report.name}
          rideId={report.rideId}
          onClose={() => setReport(null)}
        />
      )}
    </div>
  );
}

function CalendarView({ bookings }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year,  setYear]  = useState(now.getFullYear());

  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const DAYS_HDR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

  const byDay = {};
  bookings.forEach(b => {
    if (!b.ride?.departureDate) return;
    const d = new Date(b.ride.departureDate);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const key = d.getDate();
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(b);
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const STATUS_COLOR = { pending: '#F59E0B', accepted: '#10B981', refused: '#EF4444', cancelled: '#6B7280' };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}
          className="p-2 rounded-lg transition-all hover:bg-dark-700 text-slate-400">‹</button>
        <span className="font-bold text-white">{MONTHS[month]} {year}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}
          className="p-2 rounded-lg transition-all hover:bg-dark-700 text-slate-400">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_HDR.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const items = byDay[day] || [];
          const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          return (
            <div key={day} className="min-h-[52px] rounded-xl p-1 flex flex-col gap-0.5"
              style={{ background: isToday ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)', border: isToday ? '1.5px solid rgba(193,39,45,0.4)' : '1px solid var(--border-color)' }}>
              <span className="text-xs font-bold text-center block" style={{ color: isToday ? '#C1272D' : 'var(--text-muted)' }}>{day}</span>
              {items.map(b => (
                <div key={b.id} className="rounded text-[9px] font-semibold px-1 truncate"
                  style={{ background: `${STATUS_COLOR[b.status] || '#6B7280'}22`, color: STATUS_COLOR[b.status] || '#6B7280' }}>
                  {b.ride?.from?.slice(0,4)}→{b.ride?.to?.slice(0,4)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 text-center mt-3">
        {Object.values(byDay).flat().length} réservation{Object.values(byDay).flat().length > 1 ? 's' : ''} ce mois
      </p>
    </div>
  );
}
