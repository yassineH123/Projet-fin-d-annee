import { useState } from 'react';
import { X, Flag, AlertTriangle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const REASONS = [
  { id: 'conduite_dangereuse', label: 'Conduite dangereuse',  emoji: '⚠️', desc: 'Vitesse excessive, manœuvres risquées…' },
  { id: 'impolitesse',         label: 'Impolitesse / agressivité', emoji: '😠', desc: 'Comportement irrespectueux' },
  { id: 'no_show',             label: 'No-show',              emoji: '🚫', desc: 'N\'est pas venu au point de rendez-vous' },
  { id: 'escroquerie',         label: 'Escroquerie',          emoji: '💸', desc: 'Prix différent, fausse annonce' },
  { id: 'arnaque_prix',        label: 'Arnaque sur le prix',  emoji: '💰', desc: 'Surcharge imposée au moment du trajet' },
  { id: 'harcelement',         label: 'Harcèlement',          emoji: '🔴', desc: 'Propos ou gestes déplacés' },
  { id: 'autre',               label: 'Autre',                emoji: '📋', desc: 'Autre problème non listé' },
];

export default function ReportModal({ reportedId, reportedName, rideId, onClose }) {
  const [reason,      setReason]      = useState('');
  const [description, setDescription] = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { toast.error('Veuillez choisir un motif.'); return; }
    setLoading(true);
    try {
      await api.post('/reports', { reportedId, rideId, reason, description });
      toast.success('Signalement envoyé. Notre équipe va examiner le dossier.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Flag size={16} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Signaler un utilisateur</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{reportedName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={15} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300/80">
              Les faux signalements peuvent entraîner une suspension de votre compte. Utilisez cette fonctionnalité de manière responsable.
            </p>
          </div>

          {/* Reason picker */}
          <div>
            <label className="text-sm font-semibold mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
              Motif du signalement *
            </label>
            <div className="flex flex-col gap-2">
              {REASONS.map(({ id, label, emoji, desc }) => (
                <label key={id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: reason === id ? 'rgba(239,68,68,0.10)' : 'var(--bg-700)',
                    border: `1.5px solid ${reason === id ? '#EF4444' : 'var(--border-color)'}`,
                  }}>
                  <input type="radio" name="reason" value={id}
                    checked={reason === id} onChange={() => setReason(id)} className="sr-only" />
                  <span className="text-lg">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: reason === id ? '#FCA5A5' : 'var(--text-base)' }}>
                      {label}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${reason === id ? 'border-red-400' : 'border-slate-600'}`}>
                    {reason === id && <div className="w-2 h-2 rounded-full bg-red-400" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Détails <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez ce qui s'est passé…"
              className="input resize-none text-sm"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-right mt-1" style={{ color: 'var(--text-muted)' }}>
              {description.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-xl font-semibold text-sm transition"
              style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading || !reason}
              className="flex-1 h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
              style={{
                background: reason ? '#EF4444' : 'var(--bg-600)',
                color: reason ? 'white' : 'var(--text-muted)',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Flag size={14} /> Envoyer le signalement</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
