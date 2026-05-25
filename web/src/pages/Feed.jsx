import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Share2, ArrowRight,
  Send, Trash2, Car, HelpCircle, FileText,
  Image, X as XIcon, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune'];

const TYPE_CONFIG = {
  text:     { icon: FileText,    label: 'Post',          color: '#006233', bg: 'rgba(0,98,51,0.10)'  },
  trip:     { icon: Car,         label: 'Trajet',         color: '#C1272D', bg: 'rgba(193,39,45,0.10)' },
  question: { icon: HelpCircle,  label: 'Question',       color: '#D4890A', bg: 'rgba(212,137,10,0.10)' },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return 'À l\'instant';
  if (s < 3600) return `Il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `Il y a ${Math.floor(s/3600)}h`;
  return `Il y a ${Math.floor(s/86400)}j`;
}

function Avatar({ user, size = 40 }) {
  const src = user?.photo || user?.avatar;
  if (src) return <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: size * 0.38, flexShrink: 0 }}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  );
}

/* ── Composant Post ── */
function PostCard({ post, currentUser, onLike, onComment, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.text;
  const Icon = cfg.icon;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post.id, commentText.trim());
    setCommentText('');
    setSubmitting(false);
    setShowComments(true);
  };

  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to={`/profile/${post.User?.id}`}>
          <Avatar user={post.User} size={42} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-base)' }}>
              {post.User?.firstName} {post.User?.lastName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
              <Icon size={11} /> {cfg.label}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)}</span>
        </div>
        {currentUser?.id === post.userId && (
          <button onClick={() => onDelete(post.id)} style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#C1272D'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Contenu */}
      <div style={{ padding: '0 16px 14px' }}>
        <p style={{ fontSize: 15, color: 'var(--text-base)', lineHeight: 1.6, margin: 0 }}>{post.content}</p>

        {/* Media */}
        {post.mediaUrl && post.mediaType === 'image' && (
          <div style={{ marginTop: 10, borderRadius: 14, overflow: 'hidden', maxHeight: 420, background: 'var(--bg-700)' }}>
            <img src={post.mediaUrl} alt="" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        {post.mediaUrl && post.mediaType === 'video' && (
          <div style={{ marginTop: 10, borderRadius: 14, overflow: 'hidden', background: '#000' }}>
            <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: 420, display: 'block', borderRadius: 14 }} />
          </div>
        )}

        {/* Carte trajet */}
        {post.type === 'trip' && post.fromCity && post.toCity && (
          <div style={{ marginTop: 12, borderRadius: 14, border: '1.5px solid rgba(193,39,45,0.2)', overflow: 'hidden', background: 'rgba(193,39,45,0.03)' }}>
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#006233' }} />
                <span style={{ fontWeight: 800, color: 'var(--text-base)', fontSize: 15 }}>{post.fromCity}</span>
              </div>
              <ArrowRight size={14} style={{ color: '#C1272D' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C1272D' }} />
                <span style={{ fontWeight: 800, color: 'var(--text-base)', fontSize: 15 }}>{post.toCity}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(193,39,45,0.15)' }}>
              {post.tripDate && (
                <div style={{ flex: 1, padding: '8px 14px', borderRight: '1px solid rgba(193,39,45,0.15)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Date</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-base)' }}>{post.tripDate}</div>
                </div>
              )}
              {post.price && (
                <div style={{ flex: 1, padding: '8px 14px', borderRight: post.seats ? '1px solid rgba(193,39,45,0.15)' : 'none' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Prix</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#C1272D' }}>{post.price} DH</div>
                </div>
              )}
              {post.seats && (
                <div style={{ flex: 1, padding: '8px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Places</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-base)' }}>{post.seats} dispo</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {(post.likesCount > 0 || post.PostComments?.length > 0) && (
        <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12 }}>
          {post.likesCount > 0 && <span>❤️ {post.likesCount} j'aime{post.likesCount > 1 ? 's' : ''}</span>}
          {post.PostComments?.length > 0 && (
            <button onClick={() => setShowComments(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
              {post.PostComments.length} commentaire{post.PostComments.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', borderBottom: showComments ? '1px solid var(--border-color)' : 'none' }}>
        {[
          { icon: Heart, label: "J'aime", active: post.likedByMe, color: '#C1272D', action: () => onLike(post.id) },
          { icon: MessageCircle, label: 'Commenter', active: showComments, color: '#006233', action: () => setShowComments(s => !s) },
          { icon: Share2, label: 'Partager', active: false, color: '#D4890A', action: () => { navigator.clipboard?.writeText(window.location.origin + '/feed'); toast.success('Lien copié !'); } },
        ].map(({ icon: Ic, label, active, color, action }) => (
          <button key={label} onClick={action}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: active ? color : 'var(--text-muted)', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Ic size={16} style={{ fill: label === "J'aime" && active ? color : 'none' }} /> {label}
          </button>
        ))}
      </div>

      {/* Commentaires */}
      {showComments && (
        <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {post.PostComments?.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Avatar user={c.User} size={32} />
              <div style={{ flex: 1, background: 'var(--bg-700)', borderRadius: 12, padding: '8px 12px' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-base)' }}>
                  {c.User?.firstName} {c.User?.lastName}
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{c.content}</p>
              </div>
            </div>
          ))}

          {currentUser && (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <Avatar user={currentUser} size={32} />
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Écrire un commentaire…"
                className="input"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 20, fontSize: 13 }}
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                style={{ padding: '8px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#C1272D', color: '#fff', opacity: (!commentText.trim() || submitting) ? 0.5 : 1 }}>
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Composant CreatePost ── */
function CreatePost({ user, onPost }) {
  const [open,      setOpen]      = useState(false);
  const [type,      setType]      = useState('text');
  const [content,   setContent]   = useState('');
  const [fromCity,  setFromCity]  = useState('');
  const [toCity,    setToCity]    = useState('');
  const [tripDate,  setTripDate]  = useState('');
  const [price,     setPrice]     = useState('');
  const [seats,     setSeats]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const fileRef = useRef(null);

  const reset = () => {
    setContent(''); setFromCity(''); setToCity(''); setTripDate('');
    setPrice(''); setSeats(''); setType('text'); setOpen(false);
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('content', content);
      if (fromCity) formData.append('fromCity', fromCity);
      if (toCity)   formData.append('toCity', toCity);
      if (tripDate) formData.append('tripDate', tripDate);
      if (price)    formData.append('price', price);
      if (seats)    formData.append('seats', seats);
      if (mediaFile) formData.append('media', mediaFile);

      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onPost(data);
      toast.success('Post publié !');
      reset();
    } catch { toast.error('Erreur lors de la publication'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ marginBottom: 16, padding: 16 }}>
      {/* Trigger */}
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar user={user} size={40} />
          <button onClick={() => setOpen(true)}
            className="input"
            style={{ flex: 1, textAlign: 'left', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500, padding: '10px 16px', borderRadius: 24 }}>
            Quoi de neuf, {user?.firstName} ? Partagez votre trajet…
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Type selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const Ic = cfg.icon;
              return (
                <button key={key} type="button" onClick={() => setType(key)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 10, border: `1.5px solid ${type === key ? cfg.color : 'var(--border-color)'}`, background: type === key ? cfg.bg : 'transparent', color: type === key ? cfg.color : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <Ic size={14} /> {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Textarea */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Avatar user={user} size={38} />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                type === 'trip'     ? 'Décrivez votre trajet, votre véhicule, vos préférences…' :
                type === 'question' ? 'Posez votre question à la communauté…' :
                'Partagez une expérience, une astuce de voyage…'
              }
              className="input"
              rows={3}
              style={{ flex: 1, resize: 'none', borderRadius: 14, fontSize: 14 }}
              autoFocus
            />
          </div>

          {/* Champs trajet */}
          {type === 'trip' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, paddingLeft: 48 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#006233' }} />
                <input value={fromCity} onChange={e => setFromCity(e.target.value)} placeholder="Ville de départ" className="input" style={{ paddingLeft: 24, fontSize: 13 }} list="fc-list" />
                <datalist id="fc-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#C1272D' }} />
                <input value={toCity} onChange={e => setToCity(e.target.value)} placeholder="Ville d'arrivée" className="input" style={{ paddingLeft: 24, fontSize: 13 }} list="tc-list" />
                <datalist id="tc-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <input type="date" value={tripDate} onChange={e => setTripDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input" style={{ fontSize: 13 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Prix (DH)" className="input" style={{ flex: 1, fontSize: 13 }} min={0} />
                <input type="number" value={seats} onChange={e => setSeats(e.target.value)} placeholder="Places" className="input" style={{ width: 80, fontSize: 13 }} min={1} max={8} />
              </div>
            </div>
          )}

          {/* Preview media */}
          {mediaPreview && (
            <div style={{ position: 'relative', marginBottom: 12, paddingLeft: 48 }}>
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 12 }} />
              ) : (
                <video src={mediaPreview} controls style={{ width: '100%', maxHeight: 260, borderRadius: 12 }} />
              )}
              <button type="button" onClick={removeMedia}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <XIcon size={14} />
              </button>
            </div>
          )}

          {/* Actions barre */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 48 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: '1.5px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: mediaFile ? '#006233' : 'var(--text-muted)', borderColor: mediaFile ? '#006233' : 'var(--border-color)' }}>
                {mediaType === 'video' ? <Play size={13} /> : <Image size={13} />}
                {mediaFile ? 'Média ajouté ✓' : 'Photo / Vidéo'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={reset} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
                Annuler
              </button>
              <button type="submit" disabled={loading || !content.trim()} className="btn-primary"
                style={{ padding: '8px 18px', fontSize: 13, opacity: (!content.trim() || loading) ? 0.6 : 1 }}>
                {loading ? 'Publication…' : 'Publier'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── PAGE FEED ── */
export default function Feed() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts')
      .then(({ data }) => setPosts(data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handlePost   = (newPost) => setPosts(prev => [newPost, ...prev]);
  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce post ?')) return;
    try { await api.delete(`/posts/${id}`); setPosts(prev => prev.filter(p => p.id !== id)); toast.success('Post supprimé'); }
    catch { toast.error('Erreur'); }
  };
  const handleLike = async (id) => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/posts/${id}/like`);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, likesCount: data.likesCount, likedByMe: data.liked } : p));
    } catch { toast.error('Erreur'); }
  };
  const handleComment = async (postId, content) => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, PostComments: [...(p.PostComments || []), data] } : p));
    } catch { toast.error('Erreur'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-900)', paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-base)', margin: 0 }}>Fil d'actualité</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Trajets, expériences et questions de la communauté AtlasWay 🇲🇦</p>
        </div>

        {/* Créer un post */}
        {user
          ? <CreatePost user={user} onPost={handlePost} />
          : (
            <div className="card" style={{ marginBottom: 16, padding: 16, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 14 }}>Connectez-vous pour partager vos trajets avec la communauté</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Link to="/login"    className="btn-secondary" style={{ fontSize: 13, padding: '8px 18px' }}>Connexion</Link>
                <Link to="/register" className="btn-primary"   style={{ fontSize: 13, padding: '8px 18px' }}>S'inscrire</Link>
              </div>
            </div>
          )
        }

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #C1272D', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Chargement du fil…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
            <p style={{ fontWeight: 700, color: 'var(--text-base)', marginBottom: 6 }}>Aucun post pour l'instant</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Soyez le premier à partager un trajet !</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
