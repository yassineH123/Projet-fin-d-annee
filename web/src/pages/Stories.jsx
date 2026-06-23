import { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StoryViewer({ group, onClose, onNext, onPrev, hasNext, hasPrev }) {
  const [idx, setIdx] = useState(0);
  const story = group.stories[idx];
  useEffect(() => {
    api.post(`/stories/${story.id}/view`).catch(() => {});
    const t = setTimeout(() => {
      if (idx < group.stories.length - 1) setIdx(i => i + 1);
      else if (hasNext) onNext();
      else onClose();
    }, story.mediaType === 'video' ? 15000 : 5000);
    return () => clearTimeout(t);
  }, [idx, story.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {hasPrev && <button onClick={onPrev} style={{ position: 'absolute', left: 16, zIndex: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronLeft size={24} /></button>}
      {hasNext && <button onClick={onNext} style={{ position: 'absolute', right: 16, zIndex: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronRight size={24} /></button>}
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>

      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        {/* Progress bars */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {group.stories.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#fff', width: i < idx ? '100%' : i === idx ? '50%' : '0%', transition: 'width 0.3s' }} />
            </div>
          ))}
        </div>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          {group.user?.photo
            ? <img src={group.user.photo} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #C1272D' }} alt="" />
            : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff' }}>{group.user?.firstName?.[0]}</div>
          }
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{group.user?.firstName} {group.user?.lastName}</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginLeft: 'auto' }}>{story.views} vues</span>
        </div>

        {story.mediaType === 'video'
          ? <video src={story.mediaUrl} style={{ width: '100%', borderRadius: 18, maxHeight: '68vh', objectFit: 'contain' }} autoPlay muted />
          : <img src={story.mediaUrl} style={{ width: '100%', borderRadius: 18, maxHeight: '68vh', objectFit: 'contain' }} alt="" />
        }
        {story.caption && <p style={{ color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>{story.caption}</p>}
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const { user } = useAuth();
  const [groups,    setGroups]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [viewing,   setViewing]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pending,   setPending]   = useState(null);
  const [caption,   setCaption]   = useState('');
  const fileRef = useRef(null);

  const load = () => api.get('/stories').then(({ data }) => setGroups(data.groups || [])).catch(() => setGroups([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPending({ file, preview: URL.createObjectURL(file) });
    setCaption('');
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!pending) return;
    setUploading(true);
    setPending(null);
    try {
      const fd = new FormData();
      fd.append('media', pending.file);
      fd.append('caption', caption);
      await api.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Story publiée ! Elle expirera dans 24h.');
      load();
    } catch { toast.error('Erreur lors de la publication'); }
    finally { setUploading(false); setCaption(''); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* Header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, rgba(193,39,45,0.06) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} style={{ color: '#C1272D' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Stories</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Partagez vos moments de route · 24h</p>
            </div>
            {user && (
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12,
                background: 'linear-gradient(135deg, #C1272D, #a01f23)', border: 'none', color: '#fff',
                fontWeight: 800, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(193,39,45,0.3)',
              }}>
                {uploading
                  ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  : <Plus size={15} />}
                Ajouter
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>
        </div>
      </div>

      {/* Story bubbles */}
      {groups.length > 0 && (
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none', marginBottom: 8 }}>
          {groups.map((g, i) => (
            <button key={g.user?.id} onClick={() => setViewing(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              {/* Gradient ring */}
              <div style={{ width: 72, height: 72, borderRadius: '50%', padding: 3, background: 'linear-gradient(135deg, #C1272D 0%, #D4890A 50%, #006233 100%)', boxShadow: '0 4px 16px rgba(193,39,45,0.3)', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--card-bg)' }}>
                  {g.user?.photo
                    ? <img src={g.user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <div style={{ width: '100%', height: '100%', background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff' }}>{g.user?.firstName?.[0]}</div>
                  }
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {g.user?.firstName}
              </span>
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 && (
        <EmptyState
          icon={<Sparkles size={26} style={{ color: '#C1272D' }} />}
          title="Aucune story pour l'instant"
          description="Soyez le premier à partager un moment de route avec la communauté AtlasWay !"
          actionLabel="Publier une story"
          onAction={() => fileRef.current?.click()}
          color="#C1272D"
        />
      )}

      {/* Caption modal */}
      {pending && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, width: '100%', maxWidth: 360, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            <ZelligeStripe />
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: 15, margin: 0 }}>Publier une story</p>
              {pending.file.type.startsWith('image')
                ? <img src={pending.preview} alt="" style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover' }} />
                : <video src={pending.preview} style={{ width: '100%', borderRadius: 12, maxHeight: 200 }} muted />
              }
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Ajouter une légende (optionnel)" maxLength={150}
                className="input" style={{ fontSize: 14 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setPending(null); setCaption(''); }} style={{ flex: 1, padding: 11, borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                  Annuler
                </button>
                <button onClick={handleUpload} style={{ flex: 1, padding: 11, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C1272D,#a01f23)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 900, boxShadow: '0 4px 14px rgba(193,39,45,0.3)' }}>
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewing !== null && (
        <StoryViewer
          group={groups[viewing]}
          onClose={() => setViewing(null)}
          onNext={() => setViewing(v => Math.min(v + 1, groups.length - 1))}
          onPrev={() => setViewing(v => Math.max(v - 1, 0))}
          hasNext={viewing < groups.length - 1}
          hasPrev={viewing > 0}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
