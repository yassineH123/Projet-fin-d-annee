import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, ArrowLeft, Send, Clock, Car, MessageCircle, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CRITERIA = [
  { key: 'punctuality',    label: 'Ponctualité',    icon: Clock,         color: '#3B82F6' },
  { key: 'driving',        label: 'Conduite',        icon: Car,           color: '#10B981' },
  { key: 'communication',  label: 'Communication',   icon: MessageCircle, color: '#8B5CF6' },
  { key: 'cleanliness',    label: 'Propreté / confort', icon: Sparkles,  color: '#F59E0B' },
];

const LABELS = ['', 'Très mauvais 😤', 'Mauvais 😕', 'Correct 😐', 'Bien 😊', 'Excellent 🤩'];

function StarRow({ value, onChange, color }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHov(n)}
          onMouseLeave={() => setHov(0)}
          className="transition-transform hover:scale-110 focus:outline-none">
          <Star size={22}
            style={{
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
  const navigate         = useNavigate();
  const [params]         = useSearchParams();
  const rideId           = params.get('rideId');
  const reviewedId       = params.get('reviewedId');
  const type             = params.get('type');

  const [reviewed, setReviewed]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);

  const [rating,    setRating]    = useState(0);
  const [hovGlobal, setHovGlobal] = useState(0);
  const [criteria,  setCriteria]  = useState({ punctuality: 0, driving: 0, communication: 0, cleanliness: 0 });
  const [comment,   setComment]   = useState('');

  useEffect(() => {
    if (!rideId || !reviewedId) { navigate('/bookings'); return; }
    api.get(`/users/${reviewedId}`)
      .then(({ data }) => setReviewed(data.user))
      .catch(() => navigate('/bookings'))
      .finally(() => setLoading(false));
  }, [reviewedId]);

  const setCrit = (key) => (val) => setCriteria(c => ({ ...c, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Veuillez sélectionner une note globale'); return; }
    setSaving(true);
    try {
      await api.post('/reviews', {
        reviewedId, rideId, rating, comment, type,
        punctuality:   criteria.punctuality   || null,
        driving:       criteria.driving       || null,
        communication: criteria.communication || null,
        cleanliness:   criteria.cleanliness   || null,
      });
      toast.success('Avis envoyé ! Merci pour votre retour.');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const isDriver = type === 'driver';

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate('/bookings')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Retour aux réservations
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Laisser un avis</h1>
        <p className="text-slate-400 text-sm">
          {isDriver ? 'Comment s\'est passé votre trajet ?' : 'Comment était ce passager ?'}
        </p>
      </div>

      <div className="card flex flex-col gap-6">

        {/* User card */}
        {reviewed && (
          <div className="flex items-center gap-4 pb-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
            {reviewed.photo
              ? <img src={reviewed.photo} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/30" />
              : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black text-primary-400"
                  style={{ background: 'rgba(193,39,45,0.12)' }}>
                  {reviewed.firstName?.[0]}
                </div>
              )
            }
            <div>
              <p className="text-white font-bold text-lg">{reviewed.firstName} {reviewed.lastName}</p>
              <p className="flex items-center gap-1.5 text-slate-400 text-sm">{isDriver ? <><Car size={14} /> Conducteur</> : <><User size={14} /> Passager</>}</p>
              {reviewed.avgRating > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-yellow-400 font-semibold">{reviewed.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({reviewed.totalRatings} avis)</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Note globale */}
          <div>
            <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--text-secondary)' }}>
              Note globale *
            </label>
            <div className="flex gap-2 justify-center mb-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovGlobal(n)}
                  onMouseLeave={() => setHovGlobal(0)}
                  className="transition-transform hover:scale-110">
                  <Star size={42}
                    style={{
                      color: n <= (hovGlobal || rating) ? '#FBBF24' : 'var(--border-color)',
                      fill:  n <= (hovGlobal || rating) ? '#FBBF24' : 'transparent',
                      filter: n <= (hovGlobal || rating) ? 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' : 'none',
                      transition: 'all 0.15s',
                    }} />
                </button>
              ))}
            </div>
            {(hovGlobal || rating) > 0 && (
              <p className="text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {LABELS[hovGlobal || rating]}
              </p>
            )}
          </div>

          {/* Critères détaillés (conducteur uniquement) */}
          {isDriver && (
            <div>
              <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                Critères détaillés <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>(optionnel)</span>
              </label>
              <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                {CRITERIA.map(({ key, label, icon: Icon, color }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-36 shrink-0">
                      <Icon size={14} style={{ color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <StarRow value={criteria[key]} onChange={setCrit(key)} color={color} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaire */}
          <div>
            <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Commentaire <span className="font-normal text-xs" style={{ color: 'var(--text-muted)' }}>(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={isDriver
                ? 'Ponctualité, ambiance, musique, conversation…'
                : 'Comportement, ponctualité, bagages…'}
              className="input resize-none text-sm"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>{comment.length}/500</p>
          </div>

          <button type="submit" disabled={saving || rating === 0}
            className="btn-primary h-12 flex items-center justify-center gap-2">
            {saving
              ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-5 w-5" />
              : <><Send size={16} /> Envoyer l'avis</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
