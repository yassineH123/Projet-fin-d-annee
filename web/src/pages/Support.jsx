import { useState, useEffect } from 'react';
import { Headphones, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CATEGORIES = [
  { id: 'bug',      label: 'Bug / Problème technique' },
  { id: 'paiement', label: 'Paiement / Portefeuille'  },
  { id: 'compte',   label: 'Compte / Profil'           },
  { id: 'trajet',   label: 'Trajet / Réservation'      },
  { id: 'autre',    label: 'Autre'                     },
];

const STATUS_META = {
  open:        { icon: AlertCircle, color: '#F59E0B', label: 'Ouvert'       },
  in_progress: { icon: Clock,       color: '#3B82F6', label: 'En cours'     },
  resolved:    { icon: CheckCircle, color: '#10B981', label: 'Résolu'       },
  closed:      { icon: XCircle,     color: '#6B7280', label: 'Fermé'        },
};

export default function Support() {
  const [tickets, setTickets]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [form,    setForm]     = useState({ subject: '', category: 'autre', message: '' });
  const [saving,  setSaving]   = useState(false);
  const [open,    setOpen]     = useState(null);

  const load = () => api.get('/support/me').then(({ data }) => setTickets(data.tickets)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) { toast.error('Remplissez tous les champs'); return; }
    setSaving(true);
    try {
      await api.post('/support', form);
      toast.success('Ticket créé ! Notre équipe vous répondra dans les 24h.');
      setForm({ subject: '', category: 'autre', message: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Headphones size={22} className="text-blue-400" />
        <h1 className="text-2xl font-black text-white">Support & Aide</h1>
      </div>

      {/* New ticket */}
      <div className="card">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Plus size={15} className="text-green-400" /> Ouvrir un ticket</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input text-sm">
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="input" placeholder="Sujet de votre demande" required maxLength={120} />
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            className="input resize-none" rows={4} placeholder="Décrivez votre problème en détail..." required maxLength={2000} />
          <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>{form.message.length}/2000</p>
          <button type="submit" disabled={saving} className="btn-primary h-11">
            {saving ? 'Envoi...' : 'Envoyer le ticket'}
          </button>
        </form>
      </div>

      {/* My tickets */}
      <div>
        <h2 className="font-bold text-white mb-3">Mes tickets ({tickets.length})</h2>
        {loading ? <Spinner /> : tickets.length === 0 ? (
          <div className="card text-center py-8"><p className="text-slate-500 text-sm">Aucun ticket ouvert</p></div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map(t => {
              const sm = STATUS_META[t.status];
              const Icon = sm.icon;
              return (
                <div key={t.id} className="card cursor-pointer" onClick={() => setOpen(open === t.id ? null : t.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{t.subject}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {CATEGORIES.find(c => c.id === t.category)?.label} · {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Icon size={14} style={{ color: sm.color }} />
                      <span className="text-xs font-semibold" style={{ color: sm.color }}>{sm.label}</span>
                    </div>
                  </div>
                  {open === t.id && (
                    <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.message}</p>
                      {t.adminReply && (
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <p className="text-xs font-bold text-green-400 mb-1">Réponse de l'équipe AtlasWay</p>
                          <p className="text-sm text-green-200/80">{t.adminReply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
