import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import api from '../services/api';
import RideCard from '../components/RideCard';
import Spinner from '../components/Spinner';

export default function SearchRides() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rides,   setRides]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [from,    setFrom]    = useState(searchParams.get('from') || '');
  const [to,      setTo]      = useState(searchParams.get('to')   || '');
  const [date,    setDate]    = useState(searchParams.get('date') || '');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from)     params.from = from;
      if (to)       params.to   = to;
      if (date)     params.date = date;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await api.get('/rides/search', { params });
      setRides(data.rides);
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = {};
    if (from) p.from = from;
    if (to)   p.to   = to;
    if (date) p.date = date;
    setSearchParams(p);
    fetchRides();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-6">Rechercher un trajet</h1>

      {/* Filters */}
      <form onSubmit={handleSearch} className="card mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={16} />
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Départ" className="input pl-9 text-sm" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" size={16} />
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Arrivée" className="input pl-9 text-sm" />
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input text-sm text-slate-400" />
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Prix max (MAD)" className="input text-sm" min="0" />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2 text-sm h-12">
            <Search size={16} /> Rechercher
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <Spinner />
      ) : rides.length === 0 ? (
        <div className="text-center py-16">
          <SlidersHorizontal size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Aucun trajet trouvé</p>
          <p className="text-slate-600 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 text-sm mb-4">{rides.length} trajet{rides.length > 1 ? 's' : ''} trouvé{rides.length > 1 ? 's' : ''}</p>
          <div className="flex flex-col gap-4">
            {rides.map((ride) => <RideCard key={ride.id} ride={ride} />)}
          </div>
        </div>
      )}
    </div>
  );
}
