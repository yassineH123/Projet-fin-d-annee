import { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
      {hasPrev && <button onClick={onPrev} className="absolute left-4 z-10 text-white/60 hover:text-white"><ChevronLeft size={36} /></button>}
      {hasNext && <button onClick={onNext} className="absolute right-4 z-10 text-white/60 hover:text-white"><ChevronRight size={36} /></button>}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/60 hover:text-white"><X size={24} /></button>

      <div className="relative max-w-sm w-full mx-4">
        {/* Progress bars */}
        <div className="flex gap-1 mb-3">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div className="h-full bg-white transition-all" style={{ width: i < idx ? '100%' : i === idx ? '50%' : '0%' }} />
            </div>
          ))}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          {group.user?.photo
            ? <img src={group.user.photo} className="w-8 h-8 rounded-full object-cover" alt="" />
            : <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-white">{group.user?.firstName?.[0]}</div>
          }
          <span className="text-white font-semibold text-sm">{group.user?.firstName} {group.user?.lastName}</span>
          <span className="text-white/50 text-xs ml-auto">{story.views} vues</span>
        </div>

        {/* Media */}
        {story.mediaType === 'video'
          ? <video src={story.mediaUrl} className="w-full rounded-2xl max-h-[70vh] object-contain" autoPlay muted />
          : <img src={story.mediaUrl} className="w-full rounded-2xl max-h-[70vh] object-contain" alt="" />
        }
        {story.caption && <p className="text-white text-sm text-center mt-3">{story.caption}</p>}
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const { user } = useAuth();
  const [groups,   setGroups]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [viewing,  setViewing]  = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pending,  setPending]  = useState(null); // { file, preview } waiting for caption
  const [caption,  setCaption]  = useState('');
  const fileRef = useRef(null);

  const load = () => api.get('/stories').then(({ data }) => setGroups(data.groups || [])).catch(() => setGroups([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPending({ file, preview });
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-6">Stories</h1>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {/* Add story */}
        {user && (
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center transition"
              style={{ borderColor: 'var(--border-color)', background: 'var(--bg-700)' }}>
              {uploading ? <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> : <Plus size={22} className="text-primary-400" />}
            </div>
            <span className="text-xs text-slate-400">Ajouter</span>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
          </button>
        )}

        {/* Story groups */}
        {groups.map((g, i) => (
          <button key={g.user?.id} onClick={() => setViewing(i)} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
              {g.user?.photo
                ? <img src={g.user.photo} className="w-full h-full rounded-full object-cover border-2 border-[var(--bg-card)]" alt="" />
                : <div className="w-full h-full rounded-full flex items-center justify-center text-lg font-black text-white border-2 border-[var(--bg-card)]"
                    style={{ background: '#C1272D' }}>{g.user?.firstName?.[0]}</div>
              }
            </div>
            <span className="text-xs text-slate-300 max-w-[64px] truncate">{g.user?.firstName}</span>
          </button>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="card text-center py-12 mt-4">
          <p className="text-slate-500">Aucune story pour l'instant. Soyez le premier !</p>
        </div>
      )}

      {/* Caption modal before upload */}
      {pending && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, width: '100%', maxWidth: 360, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: 15 }}>Publier une story</p>
            {pending.file.type.startsWith('image')
              ? <img src={pending.preview} alt="" style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover' }} />
              : <video src={pending.preview} style={{ width: '100%', borderRadius: 12, maxHeight: 200 }} muted />
            }
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Ajouter une légende (optionnel)"
              maxLength={150}
              style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setPending(null); setCaption(''); }}
                style={{ flex: 1, padding: 11, borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
                Annuler
              </button>
              <button onClick={handleUpload}
                style={{ flex: 1, padding: 11, borderRadius: 10, border: 'none', background: 'var(--primary-600, #C1272D)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 900 }}>
                Publier
              </button>
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
    </div>
  );
}
