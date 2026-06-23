import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, ArrowLeft, Send, Clock, Car, MessageCircle, Sparkles, User, Luggage, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const DRIVER_CRITERIA = [
  { key: 'punctuality',   label: 'Ponctualité',        icon: Clock,         color: '#3B82F6' },
  { key: 'driving',       label: 'Conduite',            icon: Car,           color: '#10B981' },
  { key: 'communication', label: 'Communication',       icon: MessageCircle, color: '#8B5CF6' },
  { key: 'cleanliness',   label: 'Propreté / confort',  icon: Sparkles,      color: '#F59E0B' },
];

const PASSENGER_CRITERIA = [
  { key: 'punctuality',   label: 'Ponctualité',         icon: Clock,         color: '#3B82F6' },
  { key: 'communication', label: 'Communication',        icon: MessageCircle, color: '#8B5CF6' },
  { key: 'baggage',       label: 'Bagages raisonnables', icon: Luggage,       color: '#10B981' },
  { key: 'behavior',      label: 'Comportement',         icon: ThumbsUp,      color: '#F59E0B' },
];

const PASSENGER_TAGS = ['Ponctuel', 'Agréable', 'Propre', 'Peu de bagages', 'Respectueux', 'Discret', "À l'heure", 'Sympa'];
const LABELS = ['', 'Très mauvais 😤', 'Mauvais 😕', 'Correct 😐', 'Bien 😊', 'Excellent 🤩'];

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D', '#D4890A', '#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StarRow({ value, onChange, color }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHov(n)}
          onMouseLeave={() => setHov(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.15s' }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
        >
          <Star size={22} style={{
            color: n <= (hov || value) ? color : 'var(--border-color)',
            fill:  n <= (hov || value) ? color : 'transparent',
            transition: 'all 0.15s',
          }} />
        </button>
      ))}
    </div>
  );
}

export default function WriteReview() {
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const rideId     = params.get('rideId');
  const reviewedId = params.get('reviewedId');
  const type       = params.get('type');

  const [reviewed,  setReviewed]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [rating,    setRating]    = useState(0);
  const [hovGlobal, setHovGlobal] = useState(0);
  const [criteria,  setCriteria]  = useState({ punctuality: 0, driving: 0, communication: 0, cleanliness: 0, baggage: 0, behavior: 0 });
  const [tags,      setTags]      = useState([]);
  const [comment,   setComment]   = useState('');

  useEffect(() => {
    if (!rideId || !reviewedId) { navigate('/bookings'); return; }
    api.get(`/users/${reviewedId}`)
      .then(({ data }) => setReviewed(data.user))
      .catch(() => navigate('/bookings'))
      .finally(() => setLoading(false));
  }, [reviewedId]);

  const setCrit = (key) => (val) => setCriteria(c => ({ ...c, [key]: val }));
  const toggleTag = (t) => setTags(ts => ts.includes(t) ? ts.filter(x => x !== t) : [...ts, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Veuillez sélectionner une note globale'); return; }
    setSaving(true);
    try {
      await api.post('/reviews', {
        reviewedId, rideId, rating, comment, type, tags,
        punctuality:   criteria.punctuality   || null,
        driving:       criteria.driving       || null,
        communication: criteria.communication || null,
        cleanliness:   criteria.cleanliness   || null,
        baggage:       criteria.baggage       || null,
        behavior:      criteria.behavior      || null,
      });
      toast.success('Avis envoyé ! Merci pour votre retour.');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size="lg" /></div>;

  const isDriver = type === 'driver';

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* Back button */}
      <button onClick={() => navigate('/bookings')} style={{
        display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none',
        cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
        marginBottom: 20, padding: '6px 0', transition: 'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <ArrowLeft size={15} /> Retour aux réservations
      </button>

      {/* Header card */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 16 }}>
        <ZelligeStripe />
        <div style={{ padding: '20px 22px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, transparent 100%)' }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4890A' }}>✦ AtlasWay</p>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Laisser un avis</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {isDriver ? "Comment s'est passé votre trajet ?" : 'Comment était ce passager ?'}
          </p>
        </div>
      </div>

      {/* Main form card */}
      <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* User info */}
          {reviewed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
              {reviewed.photo
                ? <img src={reviewed.photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(193,39,45,0.2)', flexShrink: 0 }} />
                : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(193,39,45,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#C1272D', flexShrink: 0 }}>
                    {reviewed.firstName?.[0]}
                  </div>
                )
              }
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 17, color: 'var(--text-primary)' }}>{reviewed.firstName} {reviewed.lastName}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {isDriver ? <><Car size={13} /> Conducteur</> : <><User size={13} /> Passager</>}
                </p>
                {reviewed.avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Star size={11} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>{reviewed.avgRating.toFixed(1)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({reviewed.totalRatings} avis)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Note globale */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Note globale *</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovGlobal(n)}
                    onMouseLeave={() => setHovGlobal(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.15)'}
                  >
                    <Star size={40} style={{
                      color: n <= (hovGlobal || rating) ? '#FBBF24' : 'var(--border-color)',
                      fill:  n <= (hovGlobal || rating) ? '#FBBF24' : 'transparent',
                      filter: n <= (hovGlobal || rating) ? 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' : 'none',
                      transition: 'all 0.15s',
                    }} />
                  </button>
                ))}
              </div>
              {(hovGlobal || rating) > 0 && (
                <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
                  {LABELS[hovGlobal || rating]}
                </p>
              )}
            </div>

            {/* Critères détaillés */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Critères détaillés <span style={{ fontWeight: 500, fontSize: 10, textTransform: 'none' }}>(optionnel)</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                {(isDriver ? DRIVER_CRITERIA : PASSENGER_CRITERIA).map(({ key, label, icon: Icon, color }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 150, flexShrink: 0 }}>
                      <Icon size={14} style={{ color }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <StarRow value={criteria[key]} onChange={setCrit(key)} color={color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags passager */}
            {!isDriver && (
              <div>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Points positifs <span style={{ fontWeight: 500, fontSize: 10, textTransform: 'none' }}>(optionnel)</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PASSENGER_TAGS.map(t => {
                    const active = tags.includes(t);
                    return (
                      <button key={t} type="button" onClick={() => toggleTag(t)}
                        style={{
                          padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          border: `1.5px solid ${active ? '#10B981' : 'var(--border-color)'}`,
                          background: active ? 'rgba(16,185,129,0.12)' : 'var(--bg-700)',
                          color: active ? '#10B981' : 'var(--text-muted)', transition: 'all .15s',
                        }}>
                        {active ? '✓ ' : ''}{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Commentaire */}
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Commentaire <span style={{ fontWeight: 500, fontSize: 10, textTransform: 'none' }}>(optionnel)</span>
              </p>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={isDriver
                    ? 'Ponctualité, ambiance, musique, conversation…'
                    : 'Comportement, ponctualité, bagages…'}
                  className="input"
                  style={{ resize: 'none', fontSize: 13, lineHeight: 1.6 }}
                  rows={4}
                  maxLength={500}
                />
                <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{comment.length}/500</span>
              </div>
            </div>

            <button type="submit" disabled={saving || rating === 0}
              style={{
                height: 48, borderRadius: 12, border: 'none',
                background: saving || rating === 0
                  ? 'var(--bg-700)'
                  : 'linear-gradient(135deg, #C1272D, #9e1f24)',
                color: saving || rating === 0 ? 'var(--text-muted)' : '#fff',
                fontWeight: 900, fontSize: 14, cursor: saving || rating === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: saving || rating === 0 ? 'none' : '0 4px 16px rgba(193,39,45,0.35)',
                transition: 'all 0.15s',
              }}>
              {saving
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <><Send size={15} /> Envoyer l&apos;avis</>
              }
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
