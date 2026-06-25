import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, Users, Trash2, Edit, CheckCircle, History, AlertTriangle } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BookingStatusBadge from '../components/BookingStatusBadge';

function ConfirmModal({ title, message, confirmLabel, confirmColor = '#EF4444', onConfirm, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--card-bg)', borderRadius: 20, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${confirmColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} style={{ color: confirmColor }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>{title}</p>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-700)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
            Annuler
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, borderRadius: 10, border: 'none', background: confirmColor, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 900 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyRides() {
  const navigate          = useNavigate();
  const [rides,   setRides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('active');
  const [modal,   setModal]   = useState(null); // { type: 'cancel'|'complete', id }

  const fetchRides = () => {
    setLoading(true);
    api.get('/rides/mine')
      .then(({ data }) => setRides(data.rides || []))
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRides(); }, []);

  const handleCancel = async (id) => {
    setModal({ type: 'cancel', id });
  };

  const handleComplete = async (id) => {
    setModal({ type: 'complete', id });
  };

  const confirmAction = async () => {
    const { type, id } = modal;
    setModal(null);
    try {
      if (type === 'cancel') {
        const { data } = await api.delete(`/rides/${id}`);
        toast.success(data.message || 'Trajet annulé');
      } else {
        await api.put(`/rides/${id}/complete`);
        toast.success('Trajet marqué comme terminé !');
      }
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
    <div style={{ maxWidth: 896, margin: '0 auto', padding: '32px 16px' }}>
      {modal && (
        <ConfirmModal
          title={modal.type === 'cancel' ? 'Annuler le trajet ?' : 'Marquer comme terminé ?'}
          message={modal.type === 'cancel'
            ? 'Les passagers seront notifiés et remboursés automatiquement. Cette action est irréversible.'
            : 'Le trajet sera marqué comme terminé. Les passagers pourront laisser un avis.'}
          confirmLabel={modal.type === 'cancel' ? 'Annuler le trajet' : 'Marquer terminé'}
          confirmColor={modal.type === 'cancel' ? '#EF4444' : '#10B981'}
          onConfirm={confirmAction}
          onClose={() => setModal(null)}
        />
      )}
      {/* ── Header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div style={{ height: 5, display: 'flex' }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
          ))}
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(212,137,10,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={22} style={{ color: '#D4890A' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4890A' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Mes trajets</h1>
              {!loading && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {counts.active} actif{counts.active > 1 ? 's' : ''} · {counts.completed} terminé{counts.completed > 1 ? 's' : ''}
              </p>}
            </div>
          </div>
          <Link to="/rides/publish" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <Plus size={16} /> Publier
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--bg-700)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, border: 'none', transition: 'all 0.15s',
              background: tab === key ? '#C1272D' : 'transparent',
              color: tab === key ? '#fff' : 'var(--text-muted)',
            }}
          >
            {label}
            {count > 0 && (
              <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 99, background: tab === key ? 'rgba(255,255,255,0.2)' : 'var(--bg-800)', color: tab === key ? '#fff' : 'var(--text-muted)' }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        tab === 'active' ? (
          <EmptyState
            icon={<MapPin size={26} style={{ color: '#D4890A' }} />}
            title="Aucun trajet actif"
            description="Publiez votre premier trajet et commencez à partager la route."
            actionLabel="Publier un trajet"
            actionTo="/rides/publish"
            color="#D4890A"
          />
        ) : tab === 'completed' ? (
          <EmptyState
            icon={<History size={26} style={{ color: '#006233' }} />}
            title="Aucun trajet terminé"
            description="Vos trajets complétés apparaîtront ici."
            color="#006233"
          />
        ) : (
          <EmptyState
            icon={<MapPin size={26} style={{ color: '#6B7280' }} />}
            title="Aucun trajet annulé"
            description="Bonne nouvelle — aucune annulation !"
            color="#6B7280"
          />
        )
      ) : (
        <div className="card-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((ride) => {
            const date = new Date(ride.departureDate);
            return (
              <div key={ride.id}
                style={{ borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '16px 18px', transition: 'all 0.18s', overflow: 'hidden', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(193,39,45,0.35)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(193,39,45,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{ride.from}</span>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>{ride.to}</span>
                      <BookingStatusBadge status={ride.status} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        {date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} /> {ride.seatsAvailable}/{ride.seats} places
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{Number(ride.price).toFixed(0)} MAD</span>
                    </div>
                  </div>

                  {ride.status === 'active' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => navigate(`/rides/${ride.id}/edit`)}
                        style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 8, transition: 'color 0.15s' }}
                        title="Modifier"
                        onMouseEnter={e => e.currentTarget.style.color = '#C1272D'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Edit size={17} />
                      </button>
                      <button
                        onClick={() => handleComplete(ride.id)}
                        style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 8, transition: 'color 0.15s' }}
                        title="Marquer comme terminé"
                        onMouseEnter={e => e.currentTarget.style.color = '#22C55E'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <CheckCircle size={17} />
                      </button>
                      <button
                        onClick={() => handleCancel(ride.id)}
                        style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 8, transition: 'color 0.15s' }}
                        title="Annuler"
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
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
