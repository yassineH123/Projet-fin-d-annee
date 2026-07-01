import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, MapPin, Car, Search } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const REFRESH_MS = 24 * 60 * 60 * 1000;
const NIVEAU_COLOR = { fort: '#C1272D', moyen: '#D4890A', faible: '#6B7280' };
const NIVEAU_LABEL = { fort: 'Forte demande', moyen: 'Demande moyenne', faible: 'Demande faible' };

export default function PredictionBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/predictions')
      .then(({ data }) => setPredictions((data.predictions || []).filter((p) => p.niveau === 'fort').slice(0, 3)))
      .catch((err) => setError(err.response?.data?.message || 'Prédictions indisponibles pour le moment.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [user]);

  if (!user) return null;
  if (loading) return null;
  if (error || predictions.length === 0) return null;

  const goTo = (p) => {
    if (user.isDriver) navigate(`/rides/publish?from=${encodeURIComponent(p.villeDepart)}&to=${encodeURIComponent(p.villeArrivee)}`);
    else               navigate(`/rides/search?from=${encodeURIComponent(p.villeDepart)}&to=${encodeURIComponent(p.villeArrivee)}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} style={{ color: '#D4890A' }} />
        <p className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>
          Prédictions de demande IA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {predictions.map((p) => (
          <div key={p.id} className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderLeft: `3px solid ${NIVEAU_COLOR[p.niveau]}` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${NIVEAU_COLOR[p.niveau]}1A`, color: NIVEAU_COLOR[p.niveau] }}>
                {NIVEAU_LABEL[p.niveau]}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.datePrevue}</span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: 'var(--text-base)' }}>
              <MapPin size={13} style={{ color: '#D4890A' }} />
              {p.villeDepart} <span style={{ color: 'var(--text-muted)' }}>→</span> {p.villeArrivee}
            </div>

            {p.raison && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.raison}</p>
            )}

            <button
              onClick={() => goTo(p)}
              className="mt-auto flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all"
              style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.3)' }}
            >
              {user.isDriver ? <><Car size={13} /> Publier ce trajet</> : <><Search size={13} /> Rechercher ce trajet</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
