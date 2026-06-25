import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan'];

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function RideAlerts() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ from: '', to: '', maxPrice: '', date: '' });
  const [adding,  setAdding]  = useState(false);

  const load = () => api.get('/ride-alerts').then(({ data }) => setAlerts(data.alerts || [])).catch(() => setAlerts([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to) { toast.error('Renseignez les villes'); return; }
    setAdding(true);
    try {
      await api.post('/ride-alerts', { ...form, maxPrice: form.maxPrice || undefined, date: form.date || undefined });
      toast.success("Alerte créée ! Vous serez notifié dès qu'un trajet correspond.");
      setForm({ from: '', to: '', maxPrice: '', date: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/ride-alerts/${id}`);
    setAlerts(a => a.filter(x => x.id !== id));
    toast.success('Alerte supprimée');
  };

  const handleToggle = async (id) => {
    const { data } = await api.patch(`/ride-alerts/${id}/toggle`);
    setAlerts(a => a.map(x => x.id === id ? data.alert : x));
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 5,
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={20} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Alertes trajets</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Soyez alerté dès qu'un trajet correspond à votre recherche</p>
        </div>
      </div>

      {/* Formulaire */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={15} style={{ color: '#006233' }} /> Nouvelle alerte
          </p>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Départ</label>
                <input value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                  className="input" placeholder="ex: Casablanca" list="alert-from" required />
                <datalist id="alert-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label style={labelStyle}>Arrivée</label>
                <input value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                  className="input" placeholder="ex: Rabat" list="alert-to" required />
                <datalist id="alert-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Prix max (optionnel)</label>
                <input type="number" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                  className="input" placeholder="ex: 100 DH" min="0" />
              </div>
              <div>
                <label style={labelStyle}>Date (optionnel)</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="input" />
              </div>
            </div>
            <button
              type="submit" disabled={adding}
              style={{ height: 44, borderRadius: 12, border: 'none', background: adding ? 'var(--bg-700)' : 'linear-gradient(135deg, #C1272D, #9e1f24)', color: adding ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 800, cursor: adding ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: adding ? 'none' : '0 4px 14px rgba(193,39,45,0.3)', transition: 'all 0.2s' }}>
              <Bell size={15} /> {adding ? 'Création...' : "Créer l'alerte"}
            </button>
          </form>
        </div>
      </div>

      {/* Liste */}
      {loading ? <Spinner /> : alerts.length === 0 ? (
        <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '40px 20px', textAlign: 'center' }}>
          <Bell size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Aucune alerte configurée</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(a => (
            <div key={a.id} style={{ borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <MapPin size={16} style={{ color: '#C1272D', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.from} → {a.to}
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                    {a.maxPrice && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max {a.maxPrice} DH</span>}
                    {a.date && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button onClick={() => handleToggle(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  {a.active
                    ? <ToggleRight size={26} style={{ color: '#22C55E' }} />
                    : <ToggleLeft  size={26} style={{ color: 'var(--text-muted)' }} />}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, color: 'var(--text-muted)', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
