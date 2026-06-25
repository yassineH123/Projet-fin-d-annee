import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';

const DEVICE_ICON = { Mobile: Smartphone, Tablette: Tablet, Ordinateur: Monitor };

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/login-history').then(({ data }) => setHistory(data.history || [])).catch(() => setHistory([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Historique des connexions</h1>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)' }}>Les 20 dernières tentatives de connexion à votre compte</p>

      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        {history.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Aucune connexion enregistrée</p>
          </div>
        ) : (
          <div style={{ padding: '0 4px' }}>
            {history.map((h, i) => {
              const DevIcon = DEVICE_ICON[h.device] || Monitor;
              const isFirst = i === 0;
              const isLast  = i === history.length - 1;
              return (
                <div
                  key={h.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: isLast ? 'none' : '1px solid var(--border-color)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: h.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    <DevIcon size={17} style={{ color: h.success ? '#10B981' : '#EF4444' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{h.device || 'Appareil inconnu'}</p>
                      {isFirst && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      IP: {h.ip === '::1' || h.ip === '127.0.0.1' ? 'Localhost' : (h.ip || 'Inconnue')} · {new Date(h.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {h.success
                      ? <CheckCircle size={16} style={{ color: '#10B981' }} />
                      : <XCircle    size={16} style={{ color: '#EF4444' }} />}
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
