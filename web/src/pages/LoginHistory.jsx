import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const DEVICE_ICON = { Mobile: Smartphone, Tablette: Tablet, Ordinateur: Monitor };

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/login-history').then(({ data }) => setHistory(data.history)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Historique des connexions</h1>
      <p className="text-slate-400 text-sm mb-6">Les 20 dernières tentatives de connexion à votre compte</p>

      <div className="card">
        {history.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Aucune connexion enregistrée</p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {history.map((h, i) => {
              const DevIcon = DEVICE_ICON[h.device] || Monitor;
              const isFirst = i === 0;
              return (
                <div key={h.id} className="flex items-center gap-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: h.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    <DevIcon size={17} style={{ color: h.success ? '#10B981' : '#EF4444' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{h.device || 'Appareil inconnu'}</p>
                      {isFirst && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      IP: {h.ip || 'Inconnue'} · {new Date(h.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {h.success
                      ? <CheckCircle size={16} className="text-green-400" />
                      : <XCircle   size={16} className="text-red-400"   />
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
