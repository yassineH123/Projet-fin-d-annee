import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function WriteReview() {
  const navigate           = useNavigate();
  const [params]           = useSearchParams();
  const rideId             = params.get('rideId');
  const reviewedId         = params.get('reviewedId');
  const type               = params.get('type'); // 'driver' | 'passenger'

  const [reviewed, setReviewed] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [comment,  setComment]  = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (!rideId || !reviewedId) { navigate('/bookings'); return; }
    api.get(`/users/${reviewedId}`)
      .then(({ data }) => setReviewed(data.user))
      .catch(() => navigate('/bookings'))
      .finally(() => setLoading(false));
  }, [reviewedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Veuillez sélectionner une note'); return; }
    setSaving(true);
    try {
      await api.post('/reviews', { reviewedId, rideId, rating, comment, type });
      toast.success('Avis envoyé avec succès !');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const ratingLabels = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Retour aux réservations
      </button>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white mb-2">Laisser un avis</h1>
        <p className="text-slate-400 text-sm">
          {type === 'driver' ? 'Notez votre conducteur' : 'Notez votre passager'}
        </p>
      </div>

      <div className="card">
        {/* Reviewed user info */}
        {reviewed && (
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-500">
            {reviewed.photo
              ? <img src={reviewed.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
              : (
                <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center text-xl font-black text-primary-400">
                  {reviewed.firstName?.[0]}
                </div>
              )
            }
            <div>
              <p className="text-white font-bold text-lg">{reviewed.firstName} {reviewed.lastName}</p>
              <p className="text-slate-400 text-sm">{type === 'driver' ? 'Conducteur' : 'Passager'}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Stars */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Note *</label>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      n <= (hovered || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-dark-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-center text-sm text-slate-400 mt-2">
                {ratingLabels[hovered || rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">
              Commentaire <span className="text-slate-500 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="input resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-slate-600 text-xs text-right mt-1">{comment.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={saving || rating === 0}
            className="btn-primary h-12 flex items-center justify-center gap-2"
          >
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
