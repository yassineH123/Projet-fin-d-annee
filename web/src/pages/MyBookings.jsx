import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, Star, MessageSquare, Flag, ScanLine, CalendarDays, List, Ticket, Car, ArrowRight, ChevronRight, Banknote, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { SkeletonList } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import BookingStatusBadge from '../components/BookingStatusBadge';
import ReportModal from '../components/ReportModal';
import BookingQR from '../components/BookingQR';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending:   { border: '#F59E0B', bg: 'rgba(245,158,11,0.06)',  label: 'En attente' },
  accepted:  { border: '#10B981', bg: 'rgba(16,185,129,0.06)',  label: 'Acceptée'   },
  refused:   { border: '#EF4444', bg: 'rgba(239,68,68,0.06)',   label: 'Refusée'    },
  cancelled: { border: '#6B7280', bg: 'rgba(107,114,128,0.06)', label: 'Annulée'    },
};

function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.88 }} />
      ))}
    </div>
  );
}

function BookingCard({ b, tab, me, onAction, onQR, onReport, onCashConfirm }) {
  const ride   = b.ride || {};
  const other  = tab === 'passenger' ? ride.driver : b.passenger;
  const date   = ride.departureDate ? new Date(ride.departureDate) : null;
  const sc     = STATUS_COLORS[b.status] || STATUS_COLORS.cancelled;

  const canReview = () => {
    if (tab === 'passenger') return b.status === 'accepted' && ride.status === 'completed';
    if (tab === 'driver')    return ride.status === 'completed';
    return false;
  };

  const reviewUrl = () => {
    const reviewed = tab === 'passenger' ? ride.driver : b.passenger;
    const type     = tab === 'passenger' ? 'driver' : 'passenger';
    return `/reviews/write?rideId=${ride.id}&reviewedId=${reviewed?.id}&type=${type}`;
  };

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden', background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      transition: 'transform .15s, box-shadow .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${sc.border}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Status color stripe */}
      <div style={{ height: 3, background: sc.border }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Top row: route + status + price */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link to={`/rides/${ride.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{ride.from || '—'}</span>
                <ArrowRight size={13} style={{ color: '#C1272D', flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{ride.to || '—'}</span>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <BookingStatusBadge status={b.status} />
              {ride.status === 'completed' && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.10)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  Trajet terminé
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          {ride.price && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {Number(ride.price * (b.seats || 1)).toFixed(0)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>DH</p>
            </div>
          )}
        </div>

        {/* Meta row: date + person */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
          {date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
              <Clock size={12} style={{ color: '#C1272D' }} />
              {date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
          {other && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {other.photo
                ? <img src={other.photo} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>{other.firstName?.[0]}</div>
              }
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{other.firstName} {other.lastName}</span>
            </div>
          )}
          {b.seats > 1 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.seats} places</span>
          )}
        </div>

        {b.message && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-700)', borderLeft: `2px solid ${sc.border}` }}>
            "{b.message}"
          </p>
        )}

        {/* Cash payment status */}
        {b.paymentMethod === 'cash' && b.status === 'accepted' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            padding: '10px 12px', borderRadius: 10, marginBottom: 10,
            background: b.cashConfirmed ? 'rgba(16,185,129,0.08)' : 'rgba(212,137,10,0.08)',
            border: `1px solid ${b.cashConfirmed ? 'rgba(16,185,129,0.25)' : 'rgba(212,137,10,0.25)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Banknote size={14} style={{ color: b.cashConfirmed ? '#10B981' : '#D4890A' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: b.cashConfirmed ? '#10B981' : '#D4890A' }}>
                {b.cashConfirmed ? '✓ Paiement espèces confirmé' : 'Paiement en espèces en attente'}
              </span>
            </div>
            {!b.cashConfirmed && (
              <button onClick={() => onCashConfirm(b.id)}
                style={{
                  padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 800, background: '#D4890A', color: '#fff',
                }}>
                {tab === 'driver' ? 'Confirmer reçu' : 'Confirmer payé'}
              </button>
            )}
          </div>
        )}

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
          {/* Left: links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {tab === 'passenger' && b.status === 'accepted' && (
              <button onClick={() => onQR(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#60A5FA' }}>
                <ScanLine size={13} /> Billet QR
              </button>
            )}
            {tab === 'passenger' && b.status === 'accepted' && ride.id && (
              <button
                onClick={() => {
                  const link = `${window.location.origin}/track/${ride.id}`;
                  navigator.clipboard.writeText(link)
                    .then(() => toast.success('Lien de suivi copié ! Envoyez-le à votre famille 📍'));
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#C1272D' }}>
                <MapPin size={13} /> Partager le suivi
              </button>
            )}

            {canReview() && (
              <Link to={reviewUrl()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>
                <Star size={13} fill="currentColor" /> Laisser un avis
              </Link>
            )}

            {other && other.id !== me?.id && ['pending', 'accepted'].includes(b.status) && (
              <Link
                to={`/messages?with=${other.id}&name=${encodeURIComponent(`${other.firstName} ${other.lastName}`)}&photo=${encodeURIComponent(other.photo || '')}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#C1272D' }}
              >
                <MessageSquare size={13} />
                {tab === 'passenger' ? 'Conducteur' : 'Passager'}
              </Link>
            )}

            {tab === 'passenger' && b.status === 'accepted' && b.ride?.driver && (
              <button onClick={() => onReport({ id: b.ride.driver.id, name: `${b.ride.driver.firstName} ${b.ride.driver.lastName}`, rideId: b.ride?.id })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Flag size={12} /> Signaler
              </button>
            )}
          </div>

          {/* Right: accept/refuse/cancel */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'driver' && b.status === 'pending' && (
              <>
                <button onClick={() => onAction(b.id, 'accept')} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 800, background: 'rgba(16,185,129,0.12)', color: '#10B981',
                }}>
                  <Check size={13} /> Accepter
                </button>
                <button onClick={() => onAction(b.id, 'refuse')} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 800, background: 'rgba(239,68,68,0.10)', color: '#F87171',
                }}>
                  <X size={13} /> Refuser
                </button>
              </>
            )}
            {tab === 'passenger' && ['pending', 'accepted'].includes(b.status) && (
              <button onClick={() => onAction(b.id, 'cancel')} style={{
                padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)',
                cursor: 'pointer', fontSize: 12, fontWeight: 700, background: 'rgba(239,68,68,0.06)', color: '#F87171',
              }}>
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { user: me }             = useAuth();
  const [tab,      setTab]       = useState('passenger');
  const [bookings, setBookings]  = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [report,   setReport]    = useState(null);
  const [qrBooking,setQrBooking] = useState(null);
  const [viewMode, setViewMode]  = useState('list');

  const fetchBookings = (t = tab) => {
    setLoading(true);
    const url = t === 'passenger' ? '/bookings/me' : '/bookings/driver';
    api.get(url).then(({ data }) => setBookings(data.bookings)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [tab]);

  const handleCashConfirm = async (id) => {
    try {
      await api.put(`/bookings/${id}/confirm-cash`);
      toast.success('Paiement espèces confirmé !');
      setBookings(bs => bs.map(b => b.id === id ? { ...b, cashConfirmed: true } : b));
    } catch {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'cancel' && !window.confirm('Annuler cette réservation ?')) return;
    try {
      const { data } = await api.put(`/bookings/${id}/${action}`);
      toast.success(action === 'accept' ? 'Acceptée !' : action === 'refuse' ? 'Refusée' : (data?.message || 'Réservation annulée'));
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const counts = {
    accepted:  bookings.filter(b => b.status === 'accepted').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    total:     bookings.length,
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 48px' }}>

      {/* ── Header card ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 20 }}>
        <ZelligeStripe />
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Réservations</p>
            {!loading && counts.total > 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {counts.total} au total · {counts.accepted} confirmée{counts.accepted > 1 ? 's' : ''}
                {counts.pending > 0 && ` · ${counts.pending} en attente`}
              </p>
            )}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
            {[['list', <List size={15} />], ['calendar', <CalendarDays size={15} />]].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)} title={mode === 'list' ? 'Vue liste' : 'Vue agenda'}
                style={{
                  padding: '6px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  background: viewMode === mode ? 'var(--card-bg)' : 'transparent',
                  color: viewMode === mode ? '#C1272D' : 'var(--text-muted)',
                  transition: 'all .15s',
                }}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[['passenger', '🧳 Mes voyages'], ['driver', '🚗 Demandes reçues']].map(([v, label]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all .15s',
            background: tab === v ? '#C1272D' : 'transparent',
            color: tab === v ? '#fff' : 'var(--text-muted)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? <SkeletonList count={3} /> : bookings.length === 0 ? (
        <EmptyState
          icon={tab === 'passenger' ? <Ticket size={28} style={{ color: 'var(--text-muted)' }} /> : <Car size={28} style={{ color: 'var(--text-muted)' }} />}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <BookingCard
              key={b.id}
              b={b}
              tab={tab}
              me={me}
              onAction={handleAction}
              onQR={setQrBooking}
              onReport={setReport}
              onCashConfirm={handleCashConfirm}
            />
          ))}
        </div>
      )}

      {qrBooking && <BookingQR booking={qrBooking} onClose={() => setQrBooking(null)} />}
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
  const now  = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year,  setYear]  = useState(now.getFullYear());

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS   = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
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

  const SC = { pending: '#F59E0B', accepted: '#10B981', refused: '#EF4444', cancelled: '#6B7280' };

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
      <ZelligeStripe />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}
            style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>‹</button>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{MONTHS[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}
            style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {DAYS_HDR.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', paddingBottom: 4 }}>{d}</div>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const items   = byDay[day] || [];
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <div key={day} style={{
                minHeight: 52, borderRadius: 10, padding: '4px 3px', display: 'flex', flexDirection: 'column', gap: 2,
                background: isToday ? 'rgba(193,39,45,0.07)' : 'var(--bg-700)',
                border: `1px solid ${isToday ? 'rgba(193,39,45,0.35)' : 'var(--border-color)'}`,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', display: 'block', color: isToday ? '#C1272D' : 'var(--text-muted)' }}>{day}</span>
                {items.map(b => (
                  <div key={b.id} style={{ borderRadius: 4, fontSize: 9, fontWeight: 700, padding: '1px 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: `${SC[b.status] || '#6B7280'}22`, color: SC[b.status] || '#6B7280' }}>
                    {b.ride?.from?.slice(0,3)}→{b.ride?.to?.slice(0,3)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          {Object.values(byDay).flat().length} réservation{Object.values(byDay).flat().length > 1 ? 's' : ''} ce mois
        </p>
      </div>
    </div>
  );
}
