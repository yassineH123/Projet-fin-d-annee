import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle, Share2, ArrowRight, Send, Trash2,
  Car, HelpCircle, FileText, Image, X as XIcon, Play,
  Bookmark, BookmarkCheck, Pin, Filter, Hash, ChevronDown, MapPin, Map
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const CITIES = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Meknès','Oujda','Tétouan','Laâyoune'];
const EMOJIS = ['❤️','🔥','😂','👍','😮','😢'];

const TYPE_CONFIG = {
  text:     { icon: FileText,   label: 'Post',     color: '#006233', bg: 'rgba(0,98,51,0.10)'   },
  trip:     { icon: Car,        label: 'Trajet',   color: '#C1272D', bg: 'rgba(193,39,45,0.10)' },
  question: { icon: HelpCircle, label: 'Question', color: '#D4890A', bg: 'rgba(212,137,10,0.10)'},
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)    return 'À l\'instant';
  if (s < 3600)  return `Il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `Il y a ${Math.floor(s/3600)}h`;
  return `Il y a ${Math.floor(s/86400)}j`;
}

function Avatar({ user, size = 40 }) {
  const src = user?.photo || user?.avatar;
  if (src) return <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: size * 0.38, flexShrink: 0 }}>
      {user?.firstName?.[0]}{user?.lastName?.[0]}
    </div>
  );
}

function parseHashtags(text) {
  return text.split(/(#\w+)/g).map((part, i) =>
    part.startsWith('#')
      ? <span key={i} style={{ color: '#C1272D', fontWeight: 700, cursor: 'pointer' }}>{part}</span>
      : part
  );
}

function ReactionBar({ reactions = [], myReaction, onReact }) {
  const [open, setOpen] = useState(false);
  const counts = EMOJIS.reduce((acc, e) => {
    acc[e] = reactions.filter(r => r.emoji === e).length;
    return acc;
  }, {});
  const total = reactions.length;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {/* Emoji picker */}
      {open && (
        <div style={{ position: 'absolute', bottom: '110%', left: 0, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '6px 10px', display: 'flex', gap: 4, zIndex: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { onReact(e); setOpen(false); }}
              style={{ fontSize: 22, background: myReaction === e ? 'rgba(193,39,45,0.1)' : 'transparent', border: 'none', borderRadius: 8, padding: '2px 4px', cursor: 'pointer', transform: myReaction === e ? 'scale(1.25)' : 'scale(1)', transition: 'transform 0.15s' }}>
              {e}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: myReaction ? '#C1272D' : 'var(--text-muted)', transition: 'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 16 }}>{myReaction || '❤️'}</span>
        {total > 0 ? total : "J'aime"}
      </button>
      {/* Top reactions summary */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: 2 }}>
          {EMOJIS.filter(e => counts[e] > 0).slice(0, 3).map(e => (
            <span key={e} style={{ fontSize: 13 }}>{e}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PostCard ── */
function PostCard({ post, currentUser, onReact, onComment, onDelete, onSave, onPin }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const cfg  = TYPE_CONFIG[post.type] || TYPE_CONFIG.text;
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
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden', border: post.pinned ? '1.5px solid #D4890A' : undefined }}>
      {post.pinned && (
        <div style={{ background: 'rgba(212,137,10,0.08)', padding: '4px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(212,137,10,0.2)' }}>
          <Pin size={12} style={{ color: '#D4890A' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#D4890A' }}>Post épinglé</span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to={`/profile/${post.User?.id}`}><Avatar user={post.User} size={42} /></Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-base)' }}>
              {post.User?.firstName} {post.User?.lastName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>
              <Icon size={11} /> {cfg.label}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(post.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {currentUser?.id === post.userId && (
            <button onClick={() => onPin(post.id)} title={post.pinned ? 'Désépingler' : 'Épingler'}
              style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: post.pinned ? '#D4890A' : 'var(--text-muted)' }}>
              <Pin size={14} />
            </button>
          )}
          {currentUser && (
            <button onClick={() => onSave(post.id)}
              style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: post.savedByMe ? '#C1272D' : 'var(--text-muted)' }}>
              {post.savedByMe ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          )}
          {currentUser?.id === post.userId && (
            <button onClick={() => onDelete(post.id)}
              style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#C1272D'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '0 16px 14px' }}>
        <p style={{ fontSize: 15, color: 'var(--text-base)', lineHeight: 1.6, margin: 0 }}>
          {parseHashtags(post.content)}
        </p>

        {/* Media */}
        {post.mediaUrl && post.mediaType === 'image' && (
          <div style={{ marginTop: 10, borderRadius: 14, overflow: 'hidden', maxHeight: 420 }}>
            <img src={post.mediaUrl} alt="" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        {post.mediaUrl && post.mediaType === 'video' && (
          <div style={{ marginTop: 10, borderRadius: 14, overflow: 'hidden', background: '#000' }}>
            <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: 420, display: 'block' }} />
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
      {(post.reactions?.length > 0 || post.PostComments?.length > 0) && (
        <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12 }}>
          <span>{post.reactions?.length > 0 && `${post.reactions.length} réaction${post.reactions.length > 1 ? 's' : ''}`}</span>
          {post.PostComments?.length > 0 && (
            <button onClick={() => setShowComments(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
              {post.PostComments.length} commentaire{post.PostComments.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', borderBottom: showComments ? '1px solid var(--border-color)' : 'none' }}>
        <ReactionBar reactions={post.reactions} myReaction={post.myReaction} onReact={(emoji) => onReact(post.id, emoji)} />
        <button onClick={() => setShowComments(s => !s)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: showComments ? '#006233' : 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <MessageCircle size={16} /> Commenter
        </button>
        <button onClick={() => { navigator.clipboard?.writeText(window.location.origin + '/feed'); toast.success('Lien copié !'); }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Share2 size={16} /> Partager
        </button>
      </div>

      {/* Commentaires */}
      {showComments && (
        <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {post.PostComments?.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Avatar user={c.User} size={32} />
              <div style={{ flex: 1, background: 'var(--bg-700)', borderRadius: 12, padding: '8px 12px' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-base)' }}>{c.User?.firstName} {c.User?.lastName}</span>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{parseHashtags(c.content)}</p>
              </div>
            </div>
          ))}
          {currentUser && (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <Avatar user={currentUser} size={32} />
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Écrire un commentaire… (#hashtag supporté)"
                className="input" style={{ flex: 1, padding: '8px 12px', borderRadius: 20, fontSize: 13 }} />
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

/* ── CreatePost ── */
function CreatePost({ user, onPost }) {
  const [open,         setOpen]         = useState(false);
  const [type,         setType]         = useState('text');
  const [content,      setContent]      = useState('');
  const [fromCity,     setFromCity]     = useState('');
  const [toCity,       setToCity]       = useState('');
  const [tripDate,     setTripDate]     = useState('');
  const [price,        setPrice]        = useState('');
  const [seats,        setSeats]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [mediaFile,    setMediaFile]    = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType,    setMediaType]    = useState(null);
  const fileRef = useRef(null);

  const reset = () => {
    setContent(''); setFromCity(''); setToCity(''); setTripDate('');
    setPrice(''); setSeats(''); setType('text'); setOpen(false);
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('content', content);
      if (fromCity)  formData.append('fromCity', fromCity);
      if (toCity)    formData.append('toCity', toCity);
      if (tripDate)  formData.append('tripDate', tripDate);
      if (price)     formData.append('price', price);
      if (seats)     formData.append('seats', seats);
      if (mediaFile) formData.append('media', mediaFile);
      const { data } = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onPost(data);
      toast.success('Post publié !');
      reset();
    } catch { toast.error('Erreur lors de la publication'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ marginBottom: 16, padding: 16 }}>
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar user={user} size={40} />
          <button onClick={() => setOpen(true)} className="input"
            style={{ flex: 1, textAlign: 'left', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500, padding: '10px 16px', borderRadius: 24 }}>
            Quoi de neuf, {user?.firstName} ? #hashtag supporté 📸
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Avatar user={user} size={38} />
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder={type === 'trip' ? 'Décrivez votre trajet… #Casablanca #Covoiturage' : type === 'question' ? 'Posez votre question… utilisez #hashtag pour catégoriser' : 'Partagez une expérience… #astuce #voyage'}
              className="input" rows={3} style={{ flex: 1, resize: 'none', borderRadius: 14, fontSize: 14 }} autoFocus />
          </div>

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
              {mediaType === 'image'
                ? <img src={mediaPreview} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 12 }} />
                : <video src={mediaPreview} controls style={{ width: '100%', maxHeight: 260, borderRadius: 12 }} />
              }
              <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <XIcon size={14} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 48 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${mediaFile ? '#006233' : 'var(--border-color)'}`, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: mediaFile ? '#006233' : 'var(--text-muted)' }}>
                {mediaType === 'video' ? <Play size={13} /> : <Image size={13} />}
                {mediaFile ? 'Média ajouté ✓' : 'Photo / Vidéo'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={reset} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>Annuler</button>
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

/* ── Barre de filtres ── */
function FilterBar({ filters, onChange }) {
  const [showCities, setShowCities] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Filter size={14} style={{ color: 'var(--text-muted)' }} />
      {[['all','Tout'],['text','Posts'],['trip','Trajets'],['question','Questions']].map(([val, label]) => (
        <button key={val} onClick={() => onChange({ ...filters, type: val, saved: false })}
          style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filters.type === val && !filters.saved ? '#C1272D' : 'var(--border-color)'}`, background: filters.type === val && !filters.saved ? 'rgba(193,39,45,0.08)' : 'transparent', color: filters.type === val && !filters.saved ? '#C1272D' : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          {label}
        </button>
      ))}
      <button onClick={() => onChange({ ...filters, saved: !filters.saved })}
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filters.saved ? '#C1272D' : 'var(--border-color)'}`, background: filters.saved ? 'rgba(193,39,45,0.08)' : 'transparent', color: filters.saved ? '#C1272D' : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
        <Bookmark size={12} /> Sauvegardés
      </button>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowCities(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${filters.city ? '#D4890A' : 'var(--border-color)'}`, background: filters.city ? 'rgba(212,137,10,0.08)' : 'transparent', color: filters.city ? '#D4890A' : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          <MapPin size={12} /> {filters.city || 'Ville'} <ChevronDown size={11} />
        </button>
        {showCities && (
          <div style={{ position: 'absolute', top: '110%', left: 0, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 6, zIndex: 20, minWidth: 150, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <button onClick={() => { onChange({ ...filters, city: '' }); setShowCities(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', borderRadius: 8 }}>Toutes les villes</button>
            {CITIES.map(c => (
              <button key={c} onClick={() => { onChange({ ...filters, city: c }); setShowCities(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', background: filters.city === c ? 'rgba(212,137,10,0.08)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: filters.city === c ? 700 : 400, color: filters.city === c ? '#D4890A' : 'var(--text-secondary)', borderRadius: 8 }}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      {filters.tag && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, background: 'rgba(193,39,45,0.08)', border: '1.5px solid rgba(193,39,45,0.3)' }}>
          <Hash size={11} style={{ color: '#C1272D' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#C1272D' }}>{filters.tag}</span>
          <button onClick={() => onChange({ ...filters, tag: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C1272D', display: 'flex', padding: 0 }}><XIcon size={11} /></button>
        </div>
      )}
    </div>
  );
}

/* ── PAGE FEED ── */
export default function Feed() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [posts,    setPosts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [filters,  setFilters] = useState({ type: 'all', city: '', tag: '', saved: false });
  const socketRef  = useRef(null);

  const fetchPosts = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.type && f.type !== 'all') params.set('type', f.type);
      if (f.city)  params.set('city', f.city);
      if (f.tag)   params.set('tag', f.tag);
      if (f.saved) params.set('saved', '1');
      const { data } = await api.get(`/posts?${params}`);
      setPosts(data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { fetchPosts(filters); }, [filters]); // eslint-disable-line

  /* Socket.io temps réel */
  useEffect(() => {
    const socket = io('http://localhost:4000', { query: { userId: user?.id || '' } });
    socketRef.current = socket;

    socket.on('post_reaction', ({ postId, reactions, myReaction, userId: uid }) => {
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, reactions, myReaction: uid === user?.id ? myReaction : p.myReaction }
        : p));
    });

    socket.on('new_comment', ({ postId, comment }) => {
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, PostComments: [...(p.PostComments || []), comment] }
        : p));
    });

    socket.on('post_pinned', ({ postId, pinned }) => {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, pinned } : p));
    });

    return () => socket.disconnect();
  }, [user?.id]);

  const handlePost   = (newPost) => setPosts(prev => [newPost, ...prev]);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce post ?')) return;
    try { await api.delete(`/posts/${id}`); setPosts(prev => prev.filter(p => p.id !== id)); toast.success('Post supprimé'); }
    catch { toast.error('Erreur'); }
  };

  const handleReact = async (postId, emoji) => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/posts/${postId}/react`, { emoji });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: data.reactions, myReaction: data.myReaction } : p));
    } catch { toast.error('Erreur'); }
  };

  const handleComment = async (postId, content) => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, PostComments: [...(p.PostComments || []), data] } : p));
    } catch { toast.error('Erreur'); }
  };

  const handleSave = async (postId) => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post(`/posts/${postId}/save`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, savedByMe: data.saved } : p));
      toast.success(data.saved ? 'Post sauvegardé !' : 'Sauvegarde retirée');
    } catch { toast.error('Erreur'); }
  };

  const handlePin = async (postId) => {
    try {
      const { data } = await api.patch(`/posts/${postId}/pin`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, pinned: data.pinned } : p)
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
      toast.success(data.pinned ? '📌 Post épinglé' : 'Post désépinglé');
    } catch { toast.error('Erreur'); }
  };

  const handleHashtagClick = (tag) => setFilters(f => ({ ...f, tag: tag.replace('#', '') }));

  const handleFilterChange = (newFilters) => { setFilters(newFilters); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-900)', paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-base)', margin: 0 }}>Fil d'actualité</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Trajets, expériences et questions de la communauté AtlasWay 🇲🇦</p>
        </div>

        {user
          ? <CreatePost user={user} onPost={handlePost} />
          : (
            <div className="card" style={{ marginBottom: 16, padding: 16, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 14 }}>Connectez-vous pour partager vos trajets</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Link to="/login"    className="btn-secondary" style={{ fontSize: 13, padding: '8px 18px' }}>Connexion</Link>
                <Link to="/register" className="btn-primary"   style={{ fontSize: 13, padding: '8px 18px' }}>S'inscrire</Link>
              </div>
            </div>
          )
        }

        <FilterBar filters={filters} onChange={handleFilterChange} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #C1272D', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            Chargement du fil…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : posts.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Map size={40} style={{ color: 'var(--text-muted)' }} /></div>
            <p style={{ fontWeight: 700, color: 'var(--text-base)', marginBottom: 6 }}>Aucun post pour l'instant</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {filters.saved ? 'Aucun post sauvegardé' : filters.tag ? `Aucun post avec #${filters.tag}` : 'Soyez le premier à partager !'}
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={user}
              onReact={handleReact} onComment={handleComment}
              onDelete={handleDelete} onSave={handleSave}
              onPin={handlePin} onHashtagClick={handleHashtagClick} />
          ))
        )}
      </div>
    </div>
  );
}
