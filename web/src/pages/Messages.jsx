import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, MessageSquare, Users, Smile, Search, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const SOCKET_URL = 'http://localhost:4000';
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function Avatar({ user, size = 40 }) {
  return user?.photo
    ? <img src={user.photo} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#C1272D,#D4890A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 900, color: '#fff',
      }}>
        {user?.firstName?.[0] || '?'}
      </div>;
}

function TimeStamp({ iso }) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return (
    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
      {isToday
        ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
    </span>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const withId    = searchParams.get('with');
  const withName  = searchParams.get('name')  || '';
  const withPhoto = searchParams.get('photo') || '';

  const [convs,       setConvs]       = useState([]);
  const [active,      setActive]      = useState(null);
  const [msgs,        setMsgs]        = useState([]);
  const [text,        setText]        = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [pending,     setPending]     = useState(null);
  const [typing,      setTyping]      = useState(false);
  const [emojiPicker, setEmojiPicker] = useState(null);
  const [search,      setSearch]      = useState('');
  const [mobileView,  setMobileView]  = useState('list'); // 'list' | 'chat'

  const bottomRef   = useRef();
  const activeIdRef = useRef(null);
  const socketRef   = useRef(null);
  const typingTimer = useRef(null);

  /* ── Socket.io ── */
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { query: { userId: user.id }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('new_message', ({ message, conversationId }) => {
      if (conversationId === activeIdRef.current) setMsgs(prev => [...prev, message]);
      setConvs(prev => prev.map(c =>
        c.id === conversationId ? { ...c, messages: [message], lastMessageAt: message.createdAt } : c
      ));
    });
    socket.on('message_reaction', ({ messageId, reactions }) => {
      setMsgs(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    });
    socket.on('user_typing',      ({ conversationId }) => { if (conversationId === activeIdRef.current) setTyping(true); });
    socket.on('user_stop_typing', ({ conversationId }) => { if (conversationId === activeIdRef.current) setTyping(false); });
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  useEffect(() => {
    if (!active || !socketRef.current) return;
    socketRef.current.emit('join_conversation', active.id);
    return () => socketRef.current?.emit('leave_conversation', active.id);
  }, [active?.id]);

  const loadConversations = useCallback(() =>
    api.get('/messages/conversations').then(({ data }) => data.conversations || []).catch(() => []), []);

  useEffect(() => {
    loadConversations().then(conversations => {
      const filtered = conversations.filter(c => c.participant1Id !== c.participant2Id || c.type === 'group');
      setConvs(filtered);
      if (withId) {
        const existing = conversations.find(c =>
          c.type === 'direct' && (c.participant1Id === withId || c.participant2Id === withId)
        );
        if (existing) { setActive(existing); setPending(null); }
        else           { setPending({ receiverId: withId, name: withName, photo: withPhoto }); setMsgs([]); }
      }
    }).finally(() => setLoading(false));
  }, []);

  const fetchMsgs = useCallback((convId) => {
    api.get(`/messages/conversations/${convId}`).then(({ data }) => setMsgs(data.messages || []));
  }, []);

  useEffect(() => {
    if (!active) { activeIdRef.current = null; return; }
    activeIdRef.current = active.id;
    fetchMsgs(active.id);
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const getOther = (conv) => conv.participant1Id === user.id ? conv.participant2 : conv.participant1;

  const getConvInfo = (conv) => {
    if (conv?.type === 'group') {
      return { name: conv.name || 'Groupe', photo: null, isGroup: true, members: conv.members?.map(m => m.user) || [] };
    }
    const other = getOther(conv);
    return { name: `${other?.firstName || ''} ${other?.lastName || ''}`.trim(), photo: other?.photo, isGroup: false, other };
  };

  const activeInfo = active ? getConvInfo(active)
    : pending ? { name: withName, photo: withPhoto, isGroup: false }
    : null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const body = pending
        ? { receiverId: pending.receiverId, content: text.trim() }
        : active?.type === 'group'
          ? { conversationId: active.id, content: text.trim() }
          : { receiverId: getOther(active).id, content: text.trim() };
      const { data } = await api.post('/messages', body);
      setText('');
      if (pending) {
        const convs2 = await loadConversations();
        setConvs(convs2.filter(c => c.participant1Id !== c.participant2Id || c.type === 'group'));
        const created = convs2.find(c => c.id === data.conversationId);
        if (created) { setActive(created); setPending(null); }
        fetchMsgs(data.conversationId);
      } else {
        setMsgs(prev => [...prev, data.message]);
      }
      clearTimeout(typingTimer.current);
      if (active && socketRef.current) socketRef.current.emit('stop_typing', { conversationId: active.id });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally { setSending(false); }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (active && socketRef.current) {
      socketRef.current.emit('typing', { conversationId: active.id, userId: user.id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() =>
        socketRef.current?.emit('stop_typing', { conversationId: active.id }), 1500);
    }
  };

  const reactToMessage = async (msgId, emoji) => {
    try { await api.post(`/messages/${msgId}/react`, { emoji }); }
    catch { toast.error('Erreur réaction'); }
    setEmojiPicker(null);
  };

  const groupedReactions = (reactions = []) =>
    reactions.reduce((acc, r) => ({ ...acc, [r.emoji]: (acc[r.emoji] || []).concat(r.userId) }), {});

  const filteredConvs = convs.filter(c => {
    if (!search) return true;
    const info = getConvInfo(c);
    return info.name.toLowerCase().includes(search.toLowerCase());
  });

  const openConv = (conv) => { setActive(conv); setPending(null); setMobileView('chat'); };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 16px', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>

      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(193,39,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={18} style={{ color: '#C1272D' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>Messages</p>
        </div>
        <Link to="/friends" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#C1272D', textDecoration: 'none', padding: '7px 14px', borderRadius: 10, background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.2)' }}>
          + Nouveau message
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0, overflow: 'hidden' }}>

        {/* ── Conversation list ── */}
        <div style={{
          width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0,
          background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Search bar */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…" style={{
                  width: '100%', paddingLeft: 32, paddingRight: 12, height: 36,
                  borderRadius: 10, background: 'var(--bg-700)', border: '1px solid var(--border-color)',
                  fontSize: 13, color: 'var(--text-base)', outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
            {pending && (
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', background: 'rgba(193,39,45,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {withPhoto ? <img src={withPhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#C1272D,#D4890A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 16 }}>{withName?.[0]}</div>}
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{withName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#C1272D' }}>Nouvelle conversation</p>
                  </div>
                </div>
              </div>
            )}

            {filteredConvs.length === 0 && !pending ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <MessageSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Aucune conversation</p>
                <Link to="/friends" style={{ fontSize: 12, color: '#C1272D', textDecoration: 'none', fontWeight: 600 }}>Trouver des amis →</Link>
              </div>
            ) : filteredConvs.map(conv => {
              const info    = getConvInfo(conv);
              const lastMsg = conv.messages?.[0];
              const isAct   = active?.id === conv.id;
              return (
                <button key={conv.id} onClick={() => openConv(conv)} style={{
                  width: '100%', padding: '12px 14px', border: 'none', cursor: 'pointer',
                  background: isAct ? 'rgba(193,39,45,0.08)' : 'transparent',
                  borderLeft: `3px solid ${isAct ? '#C1272D' : 'transparent'}`,
                  borderBottom: '1px solid var(--border-color)',
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = 'var(--bg-700)'; }}
                  onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = 'transparent'; }}>
                  {info.isGroup
                    ? <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(193,39,45,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Users size={18} style={{ color: '#C1272D' }} /></div>
                    : <Avatar user={{ firstName: info.name, photo: info.photo }} size={40} />
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{info.name}</p>
                      <TimeStamp iso={conv.lastMessageAt || lastMsg?.createdAt} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lastMsg?.content || (info.isGroup ? 'Groupe' : 'Nouvelle conversation')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', minWidth: 0 }}>
          {(active || pending) ? (
            <>
              {/* Header */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--bg-800)' }}>
                {activeInfo?.isGroup
                  ? <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(193,39,45,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={17} style={{ color: '#C1272D' }} /></div>
                  : <Avatar user={{ firstName: activeInfo?.name, photo: activeInfo?.photo }} size={38} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{activeInfo?.name}</p>
                  {activeInfo?.isGroup && activeInfo.members?.length > 0 && (
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{activeInfo.members.map(m => m.firstName).join(', ')}</p>
                  )}
                  {typing && <p style={{ margin: 0, fontSize: 11, color: '#22C55E', fontStyle: 'italic' }}>en train d'écrire…</p>}
                </div>
                {activeInfo?.other && (
                  <Link to={`/profile/${activeInfo.other.id}`} style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    Profil
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6, scrollbarWidth: 'thin' }}>
                {msgs.length === 0 && pending && (
                  <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <Avatar user={{ firstName: withName, photo: withPhoto }} size={56} />
                    <p style={{ marginTop: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{withName}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Envoyez votre premier message</p>
                  </div>
                )}
                {msgs.map(m => {
                  const mine = m.senderId === user.id;
                  const grouped = groupedReactions(m.reactions || []);
                  const showPicker = emojiPicker === m.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}
                      className="group">
                      {active?.type === 'group' && !mine && (
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, paddingLeft: 4 }}>{m.sender?.firstName}</p>
                      )}
                      <div style={{ position: 'relative', maxWidth: '72%' }}>
                        {/* Emoji trigger */}
                        <button onClick={() => setEmojiPicker(showPicker ? null : m.id)}
                          className="opacity-0 group-hover:opacity-100"
                          style={{ position: 'absolute', top: 6, [mine ? 'left' : 'right']: -26, background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'opacity 0.15s' }}>
                          <Smile size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>

                        {showPicker && (
                          <div style={{ position: 'absolute', zIndex: 20, display: 'flex', gap: 4, padding: '8px 10px', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', background: 'var(--card-bg)', border: '1px solid var(--border-color)', [mine ? 'right' : 'left']: 0, top: -46 }}>
                            {EMOJIS.map(e => (
                              <button key={e} onClick={() => reactToMessage(m.id, e)}
                                style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
                                onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.3)'}
                                onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}>
                                {e}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Bubble */}
                        <div style={{
                          padding: '10px 14px', borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                          background: mine ? 'linear-gradient(135deg, #C1272D, #9e1f24)' : 'var(--bg-700)',
                          color: mine ? '#fff' : 'var(--text-base)',
                          boxShadow: mine ? '0 2px 8px rgba(193,39,45,0.25)' : 'none',
                        }}>
                          {m.content}
                        </div>

                        {/* Timestamp + seen */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                          <TimeStamp iso={m.createdAt} />
                          {mine && <CheckCheck size={12} style={{ color: '#22C55E' }} />}
                        </div>

                        {/* Reactions */}
                        {Object.keys(grouped).length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                            {Object.entries(grouped).map(([emoji, uids]) => {
                              const myReaction = uids.includes(user.id);
                              return (
                                <button key={emoji} onClick={() => reactToMessage(m.id, emoji)} style={{
                                  fontSize: 11, padding: '2px 7px', borderRadius: 99, cursor: 'pointer',
                                  background: myReaction ? 'rgba(193,39,45,0.15)' : 'var(--bg-700)',
                                  border: `1px solid ${myReaction ? 'rgba(193,39,45,0.4)' : 'var(--border-color)'}`,
                                  color: 'var(--text-base)',
                                }}>
                                  {emoji}{uids.length > 1 ? ` ${uids.length}` : ''}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing dots */}
                {typing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '10px 14px', background: 'var(--bg-700)', borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s infinite', animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-800)', flexShrink: 0 }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={text} onChange={handleTextChange}
                    placeholder="Écrire un message…"
                    style={{
                      flex: 1, height: 42, paddingInline: 16, borderRadius: 24,
                      background: 'var(--bg-700)', border: '1px solid var(--border-color)',
                      fontSize: 13, color: 'var(--text-base)', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(193,39,45,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button type="submit" disabled={sending || !text.trim()} style={{
                    width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: text.trim() ? 'linear-gradient(135deg, #C1272D, #9e1f24)' : 'var(--bg-700)',
                    color: text.trim() ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0,
                    boxShadow: text.trim() ? '0 4px 14px rgba(193,39,45,0.35)' : 'none',
                  }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(193,39,45,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageSquare size={32} style={{ color: 'rgba(193,39,45,0.4)' }} />
                </div>
                <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Sélectionnez une conversation</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>ou commencez une nouvelle discussion</p>
                <Link to="/friends" style={{ fontSize: 13, color: '#C1272D', textDecoration: 'none', fontWeight: 700, padding: '8px 18px', borderRadius: 10, background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.2)' }}>
                  Trouver des amis →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
