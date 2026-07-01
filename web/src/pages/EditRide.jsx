import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, Zap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', flexShrink: 0 }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function EditRide() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get(`/rides/${id}`)
      .then(({ data }) => {
        const r = data.ride;
        setForm({
          from:           r.from,
          to:             r.to,
          departureDate:  r.departureDate?.slice(0, 16) ?? '',
          price:          r.price,
          seats:          r.seats,
          description:    r.description ?? '',
          instantBooking: r.instantBooking ?? false,
        });
      })
      .catch(() => { toast.error('Trajet introuvable'); navigate('/rides/mine'); })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/rides/${id}`, form);
      toast.success('Trajet modifié !');
      navigate('/rides/mine');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 64px' }}>

      <button
        onClick={() => navigate('/rides/mine')}
        style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 20, padding: '6px 0', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <ArrowLeft size={15} /> Retour à mes trajets
      </button>

      <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '22px 24px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Modifier le trajet</h1>
          <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)' }}>Mettez à jour les informations de votre trajet</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  <MapPin size={13} style={{ color: '#C1272D' }} /> Ville de départ
                </label>
                <input value={form.from} onChange={set('from')} placeholder="ex: Casablanca" className="input" required />
              </div>
              <div>
                <label style={labelStyle}>
                  <MapPin size={13} style={{ color: '#006233' }} /> Ville d'arrivée
                </label>
                <input value={form.to} onChange={set('to')} placeholder="ex: Rabat" className="input" required />
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                <Calendar size={13} style={{ color: '#C1272D' }} /> Date et heure de départ
              </label>
              <input type="datetime-local" value={form.departureDate} onChange={set('departureDate')} className="input" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  <DollarSign size={13} style={{ color: '#C1272D' }} /> Prix par place (MAD)
                </label>
                <input type="number" value={form.price} onChange={set('price')} className="input" min="0" step="0.5" required />
              </div>
              <div>
                <label style={labelStyle}>
                  <Users size={13} style={{ color: '#C1272D' }} /> Nombre de places
                </label>
                <select value={form.seats} onChange={set('seats')} className="input">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Description (optionnelle)</label>
              <textarea value={form.description} onChange={set('description')} placeholder="Infos utiles pour les passagers..." className="input" style={{ resize: 'none' }} rows={3} />
            </div>

            {/* Toggle réservation instantanée */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              padding: '14px 16px', background: 'var(--bg-700)', borderRadius: 14,
              border: `1px solid ${form.instantBooking ? 'rgba(193,39,45,0.4)' : 'var(--border-color)'}`,
              transition: 'all 0.2s',
            }}>
              <div
                onClick={() => setForm({ ...form, instantBooking: !form.instantBooking })}
                style={{ width: 48, height: 26, borderRadius: 99, background: form.instantBooking ? '#C1272D' : 'var(--border-color)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.instantBooking ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={15} style={{ color: '#FBBF24' }} /> Réservation instantanée
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Les passagers peuvent réserver sans confirmation</p>
              </div>
              <input type="checkbox" checked={form.instantBooking} onChange={set('instantBooking')} style={{ display: 'none' }} />
            </label>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button" onClick={() => navigate('/rides/mine')}
                style={{ flex: 1, height: 46, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Annuler
              </button>
              <button
                type="submit" disabled={saving}
                style={{ flex: 2, height: 46, borderRadius: 12, border: 'none', background: saving ? 'var(--bg-700)' : 'linear-gradient(135deg, #C1272D, #9e1f24)', color: saving ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(193,39,45,0.3)', transition: 'all 0.2s' }}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
