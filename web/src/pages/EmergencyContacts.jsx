import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', relation: '' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/emergency').then(({ data }) => setContacts(data.contacts || [])).catch(() => setContacts([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Nom et téléphone requis'); return; }
    setSaving(true);
    try {
      await api.post('/emergency', form);
      toast.success('Contact ajouté !');
      setForm({ name: '', phone: '', relation: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/emergency/${id}`);
    setContacts(c => c.filter(x => x.id !== id));
    toast.success('Contact supprimé');
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={20} style={{ color: '#EF4444' }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Contacts d'urgence</h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Alertés automatiquement en cas de SOS</p>
        </div>
      </div>

      {/* Bannière info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <Shield size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(239,68,68,0.85)', lineHeight: 1.5 }}>
          En cas d'urgence, appuyez sur le bouton SOS — vos contacts seront notifiés avec votre position GPS. Maximum 3 contacts.
        </p>
      </div>

      {/* Formulaire */}
      {contacts.length < 3 && (
        <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
          <ZelligeStripe />
          <div style={{ padding: '18px 20px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={15} style={{ color: '#006233' }} /> Ajouter un contact
            </p>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input" placeholder="Prénom et nom" required />
                <input value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                  className="input" placeholder="Relation (ex: Maman)" />
              </div>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input" placeholder="Numéro de téléphone (ex: 06XXXXXXXX)" required />
              <button
                type="submit" disabled={saving}
                style={{ height: 44, borderRadius: 12, border: 'none', background: saving ? 'var(--bg-700)' : 'linear-gradient(135deg, #C1272D, #9e1f24)', color: saving ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: saving ? 'none' : '0 4px 14px rgba(193,39,45,0.3)', transition: 'all 0.2s' }}>
                <Plus size={15} /> {saving ? 'Ajout...' : 'Ajouter le contact'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.length === 0 ? (
            <div style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '40px 20px', textAlign: 'center' }}>
              <Shield size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Aucun contact d'urgence configuré</p>
            </div>
          ) : contacts.map(c => (
            <div key={c.id} style={{ borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(239,68,68,0.12)' }}>
                  <Shield size={18} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                    <Phone size={11} /> {c.phone}
                    {c.relation && <span style={{ marginLeft: 6, fontSize: 12 }}>· {c.relation}</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, color: 'var(--text-muted)', transition: 'color 0.15s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
