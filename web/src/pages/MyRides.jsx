import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, Users, Trash2, Edit, CheckCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';

export default function MyRides() {
  const navigate          = useNavigate();
  const [rides,   setRides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('active'); // active | completed | cancelled

  const fetchRides = () => {
    setLoading(true);
    api.get('/rides/mine')
      .then(({ data }) => setRides(data.rides))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRides(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler ce trajet ?')) return;
    try {
      await api.delete(`/rides/${id}`);
      toast.success('Trajet annulé');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Marquer ce trajet comme terminé ? Cette action est irréversible.')) return;
    try {
      await api.put(`/rides/${id}/complete`);
      toast.success('Trajet marqué comme terminé !');
      fetchRides();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const filtered = rides.filter((r) => {
    if (tab === 'active')    return r.status === 'active';
    if (tab === 'completed') return r.status === 'completed';
    if (tab === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const counts = {
    active:    rides.filter(r => r.status === 'active').length,
    completed: rides.filter(r => r.status === 'completed').length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
  };

  const TABS = [
    { key: 'active',    label: 'Actifs',    count: counts.active },
    { key: 'completed', label: 'Terminés',  count: counts.completed },
    { key: 'cancelled', label: 'Annulés',   count: counts.cancelled },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Mes trajets</h1>
        <Link to="/rides/publish" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Publier
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-dark-800 border border-dark-500 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
              ${tab === key ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {label}
            {count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-white/20' : 'bg-dark-600'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-16 card">
          {tab === 'active' ? (
            <>
              <MapPin size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium mb-5">Aucun trajet actif</p>
              <Link to="/rides/publish" className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus size={15} /> Publier mon premier trajet
              </Link>
            </>
          ) : tab === 'completed' ? (
            <>
              <History size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun trajet terminé pour l'instant</p>
            </>
          ) : (
            <>
              <MapPin size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun trajet annulé</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((ride) => {
            const date = new Date(ride.departureDate);
            return (
              <div key={ride.id} className="card hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">{ride.from}</span>
                      <span className="text-slate-500">→</span>
                      <span className="font-bold text-white">{ride.to}</span>
                      <BookingStatusBadge status={ride.status} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> {ride.seatsAvailable}/{ride.seats} places
                      </span>
                      <span className="font-semibold text-white">{Number(ride.price).toFixed(0)} MAD</span>
                    </div>
                  </div>

                  {ride.status === 'active' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/rides/${ride.id}/edit`)}
                        className="p-2 text-slate-400 hover:text-primary-400 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={17} />
                      </button>
                      <button
                        onClick={() => handleComplete(ride.id)}
                        className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                        title="Marquer comme terminé"
                      >
                        <CheckCircle size={17} />
                      </button>
                      <button
                        onClick={() => handleCancel(ride.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Annuler"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
