import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

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
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Shield size={22} className="text-red-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Contacts d'urgence</h1>
          <p className="text-sm text-slate-400">Alertés automatiquement en cas de SOS</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <Shield size={16} className="text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm text-red-300/80">
          En cas d'urgence, appuyez sur le bouton SOS — vos contacts seront notifiés avec votre position GPS. Maximum 3 contacts.
        </p>
      </div>

      {/* Form */}
      {contacts.length < 3 && (
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Plus size={15} className="text-green-400" /> Ajouter un contact</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input" placeholder="Prénom et nom" required />
              <input value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                className="input" placeholder="Relation (ex: Maman)" />
            </div>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input" placeholder="Numéro de téléphone (ex: 06XXXXXXXX)" required />
            <button type="submit" disabled={saving} className="btn-primary h-11 flex items-center justify-center gap-2">
              <Plus size={15} /> {saving ? 'Ajout...' : 'Ajouter le contact'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? <Spinner /> : (
        <div className="flex flex-col gap-3">
          {contacts.map(c => (
            <div key={c.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <Shield size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Phone size={11} /> {c.phone}
                    {c.relation && <span className="ml-2 text-xs">· {c.relation}</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-slate-500 hover:text-red-400 transition shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="card text-center py-10">
              <Shield size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucun contact d'urgence configuré</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
